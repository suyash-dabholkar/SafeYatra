import argparse
import time
import threading

import cv2
import requests

try:
    from .cci_engine import CCIEngine
except ImportError:
    from cci_engine import CCIEngine


def main():
    ap = argparse.ArgumentParser()

    ap.add_argument(
        "--source",
        default="0",
        help="webcam index (0) or path to a video file"
    )

    ap.add_argument(
        "--zone",
        default="zone-A",
        help="zone id this camera covers"
    )

    ap.add_argument(
        "--backend",
        default="http://localhost:5000",
        help="backend base url"
    )

    ap.add_argument(
        "--post-every",
        type=float,
        default=1.0,
        help="seconds between backend posts"
    )

    ap.add_argument(
        "--show",
        action="store_true",
        help="show annotated preview window"
    )

    args = ap.parse_args()

    source = int(args.source) if args.source.isdigit() else args.source

    cap = cv2.VideoCapture(source)

    # Limit webcam resolution
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    if not cap.isOpened():
        raise SystemExit(
            f"Could not open source: {args.source}"
        )

    engine = CCIEngine()

    print(
        f"[cci] zone={args.zone} "
        f"source={args.source} -> {args.backend}/cci"
    )

    # Shared state between camera and YOLO thread
    latest_result = {
        "people": 0,
        "density": 0.0,
        "movement": 0.0,
        "cci": 0.0,
        "risk": "SAFE",
        "zone_id": args.zone,
        "timestamp": time.time()
    }

    latest_boxes = []

    lock = threading.Lock()
    running = True

    def inference_worker():
        nonlocal latest_result, latest_boxes

        while running:

            # Get the latest frame
            with lock:
                if current_frame[0] is None:
                    continue

                frame_for_ai = current_frame[0].copy()

            try:
                result = engine.process_frame(frame_for_ai)

                # Copy boxes so display thread can use them
                boxes = list(engine.last_boxes)

                result["zone_id"] = args.zone
                result["timestamp"] = time.time()

                with lock:
                    latest_result = result
                    latest_boxes = boxes

            except Exception as e:
                print(f"[AI ERROR] {e}")

    # Current camera frame
    current_frame = [None]

    # Start YOLO in background
    worker = threading.Thread(
        target=inference_worker,
        daemon=True
    )

    worker.start()

    last_post = 0.0
    last_print = 0.0

    try:

        while True:

            ok, frame = cap.read()

            if not ok:
                break

            # Always update latest camera frame
            with lock:
                current_frame[0] = frame.copy()

                result = latest_result.copy()
                boxes = list(latest_boxes)

            # Put boxes into engine for annotation
            engine.last_boxes = boxes

            # Backend posting
            now = time.time()

            if now - last_post >= args.post_every:

                print(
                    f"[{args.zone}] "
                    f"people={result['people']:3d} "
                    f"density={result['density']:.2f} "
                    f"move={result['movement']:.1f} "
                    f"CCI={result['cci']:6.1f} "
                    f"-> {result['risk']}"
                )

                try:
                    requests.post(
                        f"{args.backend}/cci",
                        json=result,
                        timeout=1.0
                    )

                except requests.RequestException:
                    pass

                last_post = now

            # Display
            if args.show:

                display_frame = engine.annotate_frame(
                    frame,
                    result
                )

                cv2.imshow(
                    "SafeYatra CCI",
                    display_frame
                )

                # q = quit
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break

    finally:

        running = False

        cap.release()

        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()