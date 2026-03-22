"""
Cheating detection using YOLOv5 (persons, cell phones) and OpenCV (face presence).
All models are pretrained.
"""
import cv2
import numpy as np
from ultralytics import YOLO

# COCO class IDs: 0 = person, 67 = cell phone (if available in COCO)
# YOLOv5 COCO: person=0; cell phone might not be in COCO - we use 'cell phone' from common datasets
PERSON_CLASS = 0
CELL_PHONE_CLASS = 67  # COCO has cell phone

_model = None


def get_model():
    global _model
    if _model is None:
        # YOLOv8n (nano) - pretrained COCO, supports person + cell phone
        _model = YOLO("yolov8n.pt")
    return _model


def detect_objects(image: np.ndarray):
    """Run YOLO detection (YOLOv8 pretrained on COCO)."""
    model = get_model()
    results = model(image, verbose=False)
    return results


def has_face(image: np.ndarray) -> bool:
    """Check if a face is present using OpenCV Haar cascade (pretrained, no extra deps)."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    faces = cascade.detectMultiScale(gray, 1.1, 5, minSize=(30, 30))
    return len(faces) > 0


def analyze(image_base64: str) -> dict:
    """
    Analyze image for cheating indicators.
    Returns: { multiplePerson, mobileDetected, noFace, notFocusing }
    """
    import base64

    img_bytes = base64.b64decode(image_base64)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if image is None:
        return {
            "multiplePerson": False,
            "mobileDetected": False,
            "noFace": True,
            "notFocusing": True,
        }

    results = detect_objects(image)
    person_count = 0
    mobile_detected = False

    for r in results:
        if r.boxes is None:
            continue
        for box in r.boxes:
            cls_id = int(box.cls[0])
            if cls_id == PERSON_CLASS:
                person_count += 1
            elif cls_id == CELL_PHONE_CLASS:
                mobile_detected = True

    no_face = not has_face(image)
    # "Not focusing" = no face detected (simplified; full gaze would need extra model)
    not_focusing = no_face

    return {
        "multiplePerson": person_count > 1,
        "mobileDetected": mobile_detected,
        "noFace": no_face,
        "notFocusing": not_focusing,
    }
