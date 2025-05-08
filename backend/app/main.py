from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson.objectid import ObjectId
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
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


class StudentUpdate(BaseModel):
    first_name: Optional[str] = Field(None, pattern=LITHUANIAN_TITLE_CASE_REGEX)
    last_name: Optional[str] = Field(None, pattern=LITHUANIAN_TITLE_CASE_REGEX)
    marked_today: Optional[bool] = None


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
        "registration_date": datetime.now(timezone.utc),
        "last_seen_date": None,
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
            current_time_utc = datetime.now(timezone.utc)
            students_coll.update_one(
                {"_id": student["_id"]},
                {"$set": {"marked_today": True, "last_seen_date": current_time_utc}},
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


@app.put("/students/{student_id}")
async def update_student_details(student_id: str, student_update: StudentUpdate):
    if not ObjectId.is_valid(student_id):
        raise HTTPException(status_code=400, detail="Invalid student ID format")

    update_data = student_update.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")

    # Validate names if provided
    if "first_name" in update_data and not re.match(
        LITHUANIAN_TITLE_CASE_REGEX, update_data["first_name"]
    ):
        raise HTTPException(
            status_code=400,
            detail="First name must be in Title Case and can include Lithuanian characters.",
        )
    if "last_name" in update_data and not re.match(
        LITHUANIAN_TITLE_CASE_REGEX, update_data["last_name"]
    ):
        raise HTTPException(
            status_code=400,
            detail="Last name must be in Title Case and can include Lithuanian characters.",
        )

    update_fields = {}
    if "first_name" in update_data:
        update_fields["first_name"] = update_data["first_name"]
    if "last_name" in update_data:
        update_fields["last_name"] = update_data["last_name"]
    if "marked_today" in update_data:
        update_fields["marked_today"] = update_data["marked_today"]
        if update_data["marked_today"] is True:
            update_fields["last_seen_date"] = datetime.now(timezone.utc)
        # If marked_today is set to False, last_seen_date is not changed

    if not update_fields:
        raise HTTPException(status_code=400, detail="No valid update fields provided")

    result = students_coll.update_one(
        {"_id": ObjectId(student_id)}, {"$set": update_fields}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")

    updated_student_doc = students_coll.find_one({"_id": ObjectId(student_id)})
    if updated_student_doc:
        updated_student_doc["_id"] = str(updated_student_doc["_id"])
        # Ensure image_path is not sent if it exists, unless specifically requested
        if "image_path" in updated_student_doc:
            del updated_student_doc["image_path"]
        return updated_student_doc
    else:  # Should not happen if matched_count > 0 and update was successful
        raise HTTPException(
            status_code=500, detail="Failed to retrieve updated student"
        )


@app.delete("/students/{student_id}")
async def delete_student_by_id(student_id: str):
    if not ObjectId.is_valid(student_id):
        raise HTTPException(status_code=400, detail="Invalid student ID format")

    student_to_delete = students_coll.find_one({"_id": ObjectId(student_id)})
    if not student_to_delete:
        raise HTTPException(status_code=404, detail="Student not found")

    # Optional: Delete student's image from the filesystem
    image_path_to_delete = student_to_delete.get("image_path")
    if image_path_to_delete and os.path.exists(image_path_to_delete):
        try:
            os.remove(image_path_to_delete)
        except OSError as e:
            # Log this error, but don't let it block student deletion from DB
            print(f"Error deleting image file {image_path_to_delete}: {e}")

    result = students_coll.delete_one({"_id": ObjectId(student_id)})

    if result.deleted_count == 0:
        # This case should ideally be caught by the find_one check above,
        # but as a safeguard:
        raise HTTPException(
            status_code=404, detail="Student not found or already deleted"
        )

    return JSONResponse(
        status_code=200, content={"message": "Student deleted successfully"}
    )
