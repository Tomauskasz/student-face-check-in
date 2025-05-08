from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from deepface import DeepFace
import os
import uuid
import shutil
import tempfile
import re

app = FastAPI()

# CORS Middleware Configuration
origins = [
    "http://localhost:8080",  # Allow your frontend origin
    # You can add other origins here, e.g., your deployed frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Pre-load DeepFace model
DeepFace.build_model("VGG-Face")

# MongoDB prisijungimas
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/attendance")
client = MongoClient(MONGO_URI)
db = client.get_default_database()
students_coll = db.students

# Aplankas, kur saugosime visų studentų nuotraukas
IMAGES_DIR = "/app/images"
os.makedirs(IMAGES_DIR, exist_ok=True)

LITHUANIAN_TITLE_CASE_REGEX = r"^[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]*$"


def save_uploaded_file(upload_file: UploadFile, target_dir: str) -> str:
    """Išsaugo įkeltą failą į target_dir ir grąžina pilną kelią."""
    ext = os.path.splitext(upload_file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(target_dir, filename)
    with open(path, "wb") as buf:
        shutil.copyfileobj(upload_file.file, buf)
    return path


@app.post("/students/register")
async def register_student(
    first_name: str = Form(...),
    last_name: str = Form(...),
    file: UploadFile = File(...),
):
    # Validate input
    if not re.match(LITHUANIAN_TITLE_CASE_REGEX, first_name):
        raise HTTPException(
            status_code=400,
            detail="First name must be in Title Case and can include Lithuanian characters (e.g., 'John', 'Ąžuolas').",
        )
    if not re.match(LITHUANIAN_TITLE_CASE_REGEX, last_name):
        raise HTTPException(
            status_code=400,
            detail="Last name must be in Title Case and can include Lithuanian characters (e.g., 'Doe', 'Kazlauskas').",
        )

    # 1. Išsaugome nuotrauką
    img_path = save_uploaded_file(file, IMAGES_DIR)

    # 2. Įrašome studentą į Mongo
    student_doc = {
        "first_name": first_name.strip(),
        "last_name": last_name.strip(),
        "image_path": img_path,
        "marked_today": False,
    }
    result = students_coll.insert_one(student_doc)
    return JSONResponse(
        status_code=201,
        content={
            "message": "Student registered",
            "student_id": str(result.inserted_id),
        },
    )


@app.post("/students/mark")
async def mark_attendance(
    first_name: str = Form(...),
    last_name: str = Form(...),
    file: UploadFile = File(...),
):
    # Validate input
    if not re.match(LITHUANIAN_TITLE_CASE_REGEX, first_name):
        raise HTTPException(
            status_code=400,
            detail="First name must be in Title Case and can include Lithuanian characters (e.g., 'John', 'Ąžuolas').",
        )
    if not re.match(LITHUANIAN_TITLE_CASE_REGEX, last_name):
        raise HTTPException(
            status_code=400,
            detail="Last name must be in Title Case and can include Lithuanian characters (e.g., 'Doe', 'Kazlauskas').",
        )

    # 1. Randame studentą pagal vardą ir pavardę
    student = students_coll.find_one(
        {"first_name": first_name.strip(), "last_name": last_name.strip()}
    )
    if not student:
        raise HTTPException(404, "Student not found")

    # 2. Išsaugome naują nuotrauką laikinai
    with tempfile.TemporaryDirectory() as tmpdir:
        new_img_path = save_uploaded_file(file, tmpdir)

        # 3. Paleidžiame DeepFace.verify
        try:
            result = DeepFace.verify(
                img1_path=student["image_path"],
                img2_path=new_img_path,
                enforce_detection=False,
            )
        except Exception as e:
            raise HTTPException(400, f"Face verification failed: {e}")

        # 4. Patikriname atsakymą
        if result.get("verified"):
            # atnaujiname attendance flag
            students_coll.update_one(
                {"_id": student["_id"]}, {"$set": {"marked_today": True}}
            )
            return {"message": "Attendance marked"}
        else:
            raise HTTPException(401, "Face did not match")


@app.get("/students")
def list_students():
    """Grąžina visus studentus su jų šiandienos attendance būsena."""
    docs = list(students_coll.find({}, {"image_path": 0}))
    for d in docs:
        d["_id"] = str(d["_id"])
    return {"students": docs}


@app.post("/students/reset")
def reset_marks():
    """Atstatome visiems marked_today = False (tarkime kasdien)."""
    students_coll.update_many({}, {"$set": {"marked_today": False}})
    return {"message": "All marks reset"}
