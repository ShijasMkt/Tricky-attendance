import os
import time
import cv2
import pickle
from datetime import date
from django.utils import timezone
from django.conf import settings
from dashboard.models import Staffs, Attendance
from sklearn.neighbors import KNeighborsClassifier
import logging

logger = logging.getLogger(__name__)

# Paths
DATASET_DIR = os.path.join(settings.MEDIA_ROOT, 'dataset/staffs')
ENCODINGS_PICKLE_PATH = os.path.join(settings.MEDIA_ROOT, 'face_encodings.pkl')
CLASSIFIER_PICKLE_PATH = os.path.join(settings.MEDIA_ROOT, 'face_classifier.pkl')

def extract_face_encodings():
    from deepface import DeepFace
    encodings = []
    labels = []

    dataset_path = os.path.join(settings.MEDIA_ROOT, 'dataset/staffs')

    for staff_folder in os.listdir(dataset_path):
        staff_path = os.path.join(dataset_path, staff_folder)

        if os.path.isdir(staff_path):
            for img_name in os.listdir(staff_path):
                img_path = os.path.join(staff_path, img_name)

                try:
                    # DeepFace returns a list of representations for faces detected in the image
                    representations = DeepFace.represent(img_path=img_path, model_name="Facenet512", enforce_detection=True)
                    
                    if representations:
                        embedding = representations[0]["embedding"]
                        encodings.append(embedding)

                        staff_id = staff_folder.split('_')[0]  
                        labels.append(staff_id)
                except Exception as e:
                    logger.warning(f"Failed to process {img_path}: {e}")

    return encodings, labels


def save_encodings_and_classifier(encodings, labels):
    classifier = KNeighborsClassifier(n_neighbors=1)  # 1-NN classifier for face recognition
    classifier.fit(encodings, labels)  # Train the classifier
    
    # Save the classifier and encodings to pickle files
    with open(CLASSIFIER_PICKLE_PATH, 'wb') as clf_file:
        pickle.dump(classifier, clf_file)

    with open(ENCODINGS_PICKLE_PATH, 'wb') as enc_file:
        pickle.dump((encodings, labels), enc_file)

def format_response(success=False, message="", **kwargs):
    return {"success": success, "message": message, **kwargs}




def convert_bgr_to_rgb(frame):
    resized = cv2.resize(frame, (0, 0), fx=0.75, fy=0.75)
    return cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)


def get_face_encodings(image):
    from deepface import DeepFace
    try:
        representations = DeepFace.represent(img_path=image, model_name="Facenet512", enforce_detection=True)

        if not representations:
            return [], "No face detected. Try better lighting or position."

        encodings = [rep["embedding"] for rep in representations]

        return encodings, "Success"
    except Exception as e:
        logger.exception("Face encoding error")
        return [], f"Face encoding error: {str(e)}"


def load_classifier():
    if not os.path.exists(CLASSIFIER_PICKLE_PATH):
        raise FileNotFoundError("Classifier not found. Train the model first.")

    with open(CLASSIFIER_PICKLE_PATH, 'rb') as f:
        return pickle.load(f)


def predict_staff_id(encodings, classifier):
    for encoding in encodings:
        try:
            return classifier.predict([encoding])[0]
        except Exception as e:
            logger.warning(f"Prediction failed: {e}")
    return None


def mark_attendance(staff_id):
    try:
        staff = Staffs.objects.get(staff_id=staff_id)

        attendance, created = Attendance.objects.get_or_create(
            staff=staff,
            date=date.today(),
            defaults={"status": "P", "timestamp": timezone.now()}
        )

        if not created:
            attendance.status = "P"
            attendance.timestamp = timezone.now()
            attendance.save()

        return staff.name
    except Staffs.DoesNotExist:
        raise ValueError(f"Staff with ID {staff_id} not found")


def recognize_and_mark(frame):
    try:
        rgb_frame = convert_bgr_to_rgb(frame)

        encodings, msg = get_face_encodings(rgb_frame)
        if not encodings:
            return format_response(False, msg)

        classifier = load_classifier()
        staff_id = predict_staff_id(encodings, classifier)

        if not staff_id:
            return format_response(False, "Face not recognized. No match found.")

        name = mark_attendance(staff_id)

        return format_response(True, "Attendance marked", name=name, staff_id=staff_id)

    except Exception as e:
        logger.exception("Recognition error")
        return format_response(False, str(e))