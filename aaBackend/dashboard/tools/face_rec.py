import face_recognition
import cv2
import os
import pickle
from datetime import date
from aaBackend import settings
from dashboard.models import Staffs, StaffImages, Attendance
from django.utils import timezone
import numpy as np
from sklearn.neighbors import KNeighborsClassifier

ENCODING_DIR = os.path.join(settings.MEDIA_ROOT, 'face_encodings')
ENCODINGS_PICKLE_PATH = os.path.join(settings.MEDIA_ROOT, 'face_encodings.pkl')
CLASSIFIER_PICKLE_PATH = os.path.join(settings.MEDIA_ROOT, 'face_classifier.pkl')


def extract_face_encodings():
    encodings = []
    labels = []
    
    dataset_path = os.path.join(settings.MEDIA_ROOT, 'dataset/staffs')
    
    for staff_folder in os.listdir(dataset_path):
        staff_path = os.path.join(dataset_path, staff_folder)
        
        if os.path.isdir(staff_path):
            for img_name in os.listdir(staff_path):
                img_path = os.path.join(staff_path, img_name)
                
                # Load the image
                image = face_recognition.load_image_file(img_path)
                
                # Get the face encodings for each face in the image
                face_encodings_in_image = face_recognition.face_encodings(image)
                
                # If faces are found, process them
                if face_encodings_in_image:
                    encodings.append(face_encodings_in_image[0])  # Take the first face encoding if multiple are found
                    staff_id = staff_folder.split('_')[0]  
                    labels.append(staff_id)

    return encodings, labels


def save_encodings_and_classifier(encodings, labels):
    classifier = KNeighborsClassifier(n_neighbors=1)  # 1-NN classifier for face recognition
    classifier.fit(encodings, labels)  # Train the classifier
    
    # Save the classifier and encodings to pickle files
    with open(CLASSIFIER_PICKLE_PATH, 'wb') as clf_file:
        pickle.dump(classifier, clf_file)

    with open(ENCODINGS_PICKLE_PATH, 'wb') as enc_file:
        pickle.dump((encodings, labels), enc_file)




def recognize_and_mark():
    video_capture = cv2.VideoCapture(0)  # 0 is typically the default for built-in webcams
    
    if not video_capture.isOpened():
        return {
            "success": False,
            "message": "Failed to open webcam. Make sure no other application is using it."
        }
    
    video_capture.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    video_capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    video_capture.set(cv2.CAP_PROP_BRIGHTNESS, 150)  # Adjust brightness if needed
    
    # Wait a moment for the camera to adjust
    import time
    time.sleep(0.5)
    
    
    for _ in range(3):  # Capture 3 frames
        ret, frame = video_capture.read()
        if not ret:
            break
        time.sleep(0.1)  # Short delay between captures
    
    video_capture.release()  
    
    if not ret or frame is None:
        return {
            "success": False,
            "message": "Failed to capture webcam image. Check webcam permissions."
        }
    
    
    frame = cv2.resize(frame, (0, 0), fx=0.75, fy=0.75)
    
    # Convert the frame from BGR (OpenCV default) to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Verify the frame is in the correct format
    if rgb_frame.shape[2] != 3 or rgb_frame.dtype != np.uint8:
        return {
            "success": False,
            "message": "Invalid image format. Please try again."
        }
    
    # Detect faces in the image
    try:
        face_locations = face_recognition.face_locations(rgb_frame, model="hog")
        
        if not face_locations:
            face_locations = face_recognition.face_locations(rgb_frame, model="cnn")
    except Exception as e:
        print(f"Error detecting faces: {e}")
        return {
            "success": False,
            "message": "Error detecting faces. Please try again."
        }
    
    if not face_locations:
        return {
            "success": False,
            "message": "No face detected. Try adjusting your position or lighting."
        }
    
    try:
        # Try with different numbers of jitters for more reliable encoding
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations, num_jitters=1)
        
        if not face_encodings:
            # Try again with more jitters if first attempt failed
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations, num_jitters=3)
        
        
        if not face_encodings:
            return {
                "success": False,
                "message": "Failed to encode facial features. Please try again with better lighting."
            }
    except TypeError as e:
        print(f"Type error in face encoding: {e}")
        try:
            import dlib
            detector = dlib.get_frontal_face_detector()
            predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")
            
            # Convert face_locations to dlib rectangles
            dlib_rects = [dlib.rectangle(left=loc[3], top=loc[0], right=loc[1], bottom=loc[2]) for loc in face_locations]
            
            # Get face landmarks
            face_landmarks = [predictor(rgb_frame, rect) for rect in dlib_rects]
            
            # Try encoding with explicit landmarks
            face_recognition_model = dlib.face_recognition_model_v1("dlib_face_recognition_resnet_model_v1.dat")
            face_encodings = [np.array(face_recognition_model.compute_face_descriptor(rgb_frame, landmark)) for landmark in face_landmarks]
            
            if not face_encodings:
                return {
                    "success": False,
                    "message": "Failed to encode face using fallback method. Please try again."
                }
        except Exception as e2:
            print(f"Fallback encoding also failed: {e2}")
            return {
                "success": False,
                "message": "Error processing facial features. Try adjusting lighting or position."
            }
    except Exception as e:
        print(f"Error encoding faces: {e}")
        return {
            "success": False,
            "message": "Unexpected error when processing face. Please try again."
        }
    
    # Check if the classifier and encodings pickle file exist
    if not os.path.exists(CLASSIFIER_PICKLE_PATH) or not os.path.exists(ENCODINGS_PICKLE_PATH):
        return {
            "success": False,
            "message": "Model not trained. Please train the model first."
        }
    
    # Load the trained classifier
    try:
        with open(CLASSIFIER_PICKLE_PATH, 'rb') as clf_file:
            clf = pickle.load(clf_file)
    except Exception as e:
        print(f"Error loading classifier: {e}")
        return {
            "success": False,
            "message": "Error loading face recognition model. Please contact administrator."
        }
    
    for encoding in face_encodings:
        try:
            predicted_label = clf.predict([encoding])
            staff_id = predicted_label[0]
            
            try:
                staff = Staffs.objects.get(staff_id=staff_id)
                
                # Mark attendance for the detected staff
                attendance, created = Attendance.objects.get_or_create(
                    staff=staff,
                    date=date.today(),
                    defaults={"status": "P", "timestamp": timezone.now()}
                )
                if not created:
                    attendance.status = "P"  # Mark as present again if the attendance already exists
                    attendance.timestamp = timezone.now()
                    attendance.save()
                
                return {
                    "success": True,
                    "staff_id": staff.staff_id,
                    "name": staff.name,
                    "message": "Attendance marked"
                }
            
            except Staffs.DoesNotExist:
                return {
                    "success": False,
                    "message": f"Staff with ID {staff_id} not found in DB."
                }
        except Exception as e:
            print(f"Error identifying face: {e}")
            return {
                "success": False,
                "message": "Error identifying face. Please try again."
            }
    
    return {
        "success": False,
        "message": "No match found."
    }