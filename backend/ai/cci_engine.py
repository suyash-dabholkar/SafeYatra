"""
SafeYatra — CCI Engine  |  Person 2 (crowd side + AI)

Reuses the CrowdPulse pipeline (YOLOv8 -> density + movement -> CCI -> risk)
and turns each camera frame into ONE clean per-zone result dict:

    {"people", "density", "movement", "cci", "risk"}

Reused as-is from CrowdPulse: calculate_cci() and the trained RandomForest.
For the demo: one camera = one zone. In production: one engine per camera/zone.
"""
import pandas as pd
import joblib
from pathlib import Path
import cv2

try:
    from .cci_calculation import calculate_cci
except ImportError:
    from cci_calculation import calculate_cci


class CCIEngine:
    def __init__(self, model_path=None, weights="yolov8n.pt", area=4.0):
        base = Path(__file__).resolve().parent
        model_path = Path(model_path) if model_path else base / "risk_model.pkl"
        self.model = joblib.load(str(model_path))     # your CrowdPulse model

        # import here so importing this module doesn't require torch until needed
        from ultralytics import YOLO
        self.detector = YOLO(weights)                 # auto-downloads on first run

        self.area = area          # m^2 the camera covers (density = people / area)
        self.prev_center = None   # for frame-to-frame movement
        self.last_boxes = []

    def process_frame(self, frame):
        results = self.detector(frame, imgsz=320, stream=False, classes=[0], verbose=False)

        centers = []
        self.last_boxes = []

        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                self.last_boxes.append(
                    (int(x1), int(y1), int(x2), int(y2))
                )

                centers.append(
                    ((x1 + x2) / 2, (y1 + y2) / 2)
                )
        people = len(centers)

        # density — same definition as CrowdPulse (people per m^2, capped 0..5)
        density = max(0.0, min(people / self.area, 5.0))

        # movement — shift of the crowd's average center vs the last frame
        movement = 0.0
        if centers:
            cx = sum(c[0] for c in centers) / people
            cy = sum(c[1] for c in centers) / people
            if self.prev_center is not None:
                dx = cx - self.prev_center[0]
                dy = cy - self.prev_center[1]
                movement = (dx * dx + dy * dy) ** 0.5
                if movement < 3:      # dead-zone: ignore tiny jitter
                    movement = 0.0
            self.prev_center = (cx, cy)
        else:
            self.prev_center = None

        cci = calculate_cci(density, movement)          # your formula
        risk = self._predict(people, density, movement, cci)

        return {
            "people": people,
            "density": round(density, 2),
            "movement": round(movement, 2),
            "cci": cci,
            "risk": risk,
        }

    def _predict(self, people, density, movement, cci):
        # same logic as CrowdPulse ml_risk.predict_risk (kept here for a robust model path)
        if people <= 2:
            return "SAFE"

        if cci < 55:
            return "SAFE"
        elif cci <= 75:
            return "WARNING"
        else:
            return "HIGH RISK"
    
    def annotate_frame(self, frame, result):
        risk = result["risk"]

        # risk -> BGR colour
        risk_colors = {
            "SAFE": (80, 200, 120),      # green
            "WARNING": (0, 170, 255),    # orange
            "HIGH RISK": (60, 60, 235),  # red
        }
        color = risk_colors.get(risk, (200, 200, 200))
        h, w = frame.shape[:2]

        # text with a dark shadow -> readable on any background, no panel needed
        def text(txt, org, scale, col, thick=2):
            cv2.putText(frame, txt, (org[0] + 1, org[1] + 1),
                        cv2.FONT_HERSHEY_SIMPLEX, scale, (0, 0, 0), thick + 2, cv2.LINE_AA)
            cv2.putText(frame, txt, org,
                        cv2.FONT_HERSHEY_SIMPLEX, scale, col, thick, cv2.LINE_AA)

        # --- corner-bracket detection boxes (colour = risk) ---
        for x1, y1, x2, y2 in self.last_boxes:
            L = max(12, int((x2 - x1) * 0.2))   # length of each corner arm
            for (cx, cy, dx, dy) in [(x1, y1, 1, 1), (x2, y1, -1, 1),
                                     (x1, y2, 1, -1), (x2, y2, -1, -1)]:
                cv2.line(frame, (cx, cy), (cx + dx * L, cy), color, 2, cv2.LINE_AA)
                cv2.line(frame, (cx, cy), (cx, cy + dy * L), color, 2, cv2.LINE_AA)

        # --- risk pill (rounded) top-left ---
        pill_w, pill_h, x0, y0 = 190, 44, 15, 15
        r = pill_h // 2
        cv2.circle(frame, (x0 + r, y0 + r), r, color, -1, cv2.LINE_AA)
        cv2.circle(frame, (x0 + pill_w - r, y0 + r), r, color, -1, cv2.LINE_AA)
        cv2.rectangle(frame, (x0 + r, y0), (x0 + pill_w - r, y0 + pill_h), color, -1)
        text(risk, (x0 + 18, y0 + 30), 0.7, (255, 255, 255), 2)

        # --- metrics (shadowed text, no box) ---
        my = y0 + pill_h + 28
        text(f"CCI {result['cci']:.1f}",        (18, my),      0.7, (255, 255, 255), 2)
        text(f"People {result['people']}",      (18, my + 26), 0.6, (230, 230, 230), 2)
        text(f"Density {result['density']:.2f}", (18, my + 50), 0.6, (230, 230, 230), 2)
        text(f"Movement {result['movement']:.2f}", (18, my + 74), 0.6, (230, 230, 230), 2)

        # --- CCI meter bar along the bottom (optional; delete these 5 lines to remove) ---
        bx, by, bw, bh = 18, h - 34, w - 36, 14
        cv2.rectangle(frame, (bx, by), (bx + bw, by + bh), (60, 60, 60), -1)
        fill = int(bw * min(result["cci"], 100) / 100.0)
        cv2.rectangle(frame, (bx, by), (bx + fill, by + bh), color, -1)
        cv2.rectangle(frame, (bx, by), (bx + bw, by + bh), (255, 255, 255), 1)

        return frame