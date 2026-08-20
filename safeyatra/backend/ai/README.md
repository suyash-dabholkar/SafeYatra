# CCI / AI (Person C) — REUSE, don't rebuild

Bring the trained CrowdPulse pipeline here: YOLOv8 person detection → CCI
(patented) → RandomForest → risk score per zone.

Your job = **integration**: feed the risk score into the zone-status pipeline
(PRD 5.3), so a rising CCI pushes warning/danger to the crowd bands.

Do NOT commit large YOLO weights (*.pt) — gitignored. Share separately / Git LFS.
