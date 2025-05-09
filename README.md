# Student Face Check-in System

A web application designed for efficient management of student registrations and tracking attendance using facial recognition technology.

## Features

-   **Student Registration:** Register new students with their first name, last name, and a face photograph.
-   **Attendance Marking:** Mark student attendance by verifying their identity through facial recognition against their registered photo.
-   **View Attendance:** Display a list of all registered students, their attendance status (`marked_today`), registration date, and last seen date.
-   **Update Student Details:** Modify student's first name, last name, or manually toggle their attendance status.
-   **Delete Students:** Remove students from the system, including their image from the server.
-   **Reset Daily Marks:** A utility to reset the `marked_today` status for all students (e.g., for a new day).
-   **Dark/Light Theme:** The frontend includes a theme toggle for user preference.
-   **Responsive Design:** The frontend is designed to be responsive for various screen sizes.

## Tech Stack

-   **Frontend:**
    -   React
    -   TypeScript
    -   Vite
    -   Tailwind CSS
    -   Shadcn/UI (for UI components)
    -   Framer Motion (for animations)
    -   React Router (for navigation)
    -   TanStack Query (for data fetching and state management)
-   **Backend:**
    -   Python 3.11
    -   FastAPI (for building APIs)
    -   DeepFace (for facial recognition - VGG-Face model)
    -   Pydantic (for data validation)
    -   Uvicorn (ASGI server)
-   **Database:**
    -   MongoDB
-   **Containerization:**
    -   Docker
    -   Docker Compose

## Project Structure

```
student-face-check-in/
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI application, API endpoints
│   │   └── images/         # Stores registered student images (mounted volume)
│   ├── Dockerfile          # Dockerfile for the backend service
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.tsx         # Main application component with routing
│   │   ├── Index.tsx       # Landing page component
│   │   ├── main.tsx        # React application entry point
│   │   ├── pages/          # Page components (ViewAttendance, RegisterStudent, etc.)
│   │   ├── components/     # Reusable UI components (likely Shadcn/UI)
│   │   └── index.css       # Global styles and Tailwind CSS setup
│   ├── Dockerfile          # Dockerfile for the frontend service (Nginx)
│   └── package.json        # Frontend dependencies
├── docker-compose.yml      # Docker Compose configuration for all services
└── README.md               # This file
```

## Setup and Installation

To run this project, you need Docker and Docker Compose installed on your system.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd student-face-check-in
    ```

2.  **Build and run the application using Docker Compose:**
    From the root directory of the project (`student-face-check-in/`), run:
    ```bash
    docker-compose up --build -d
    ```
    This command will build the Docker images for the frontend and backend services and start the containers along with the MongoDB service.

3.  **Access the application:**
    -   Frontend: Open your browser and navigate to `http://localhost:8080`
    -   Backend API: Accessible at `http://localhost:8000` (e.g., `http://localhost:8000/docs` for API documentation)

## API Endpoints

The backend FastAPI application exposes the following endpoints (defined in `backend/app/main.py`):

-   `POST /students/register`
    -   Registers a new student.
    -   Form data: `first_name` (str), `last_name` (str), `file` (UploadFile).
    -   Validates names to be in Lithuanian title case.
-   `POST /students/mark`
    -   Marks attendance for a student using facial verification.
    -   Form data: `first_name` (str), `last_name` (str), `file` (UploadFile).
-   `GET /students`
    -   Lists all registered students and their attendance status. Excludes image paths.
-   `POST /students/reset`
    -   Resets the `marked_today` status to `false` for all students.
-   `PUT /students/{student_id}`
    -   Updates a student's details (first name, last name, marked_today).
    -   Path parameter: `student_id` (str - MongoDB ObjectId).
    -   Request body: JSON with optional `first_name`, `last_name`, `marked_today`.
-   `DELETE /students/{student_id}`
    -   Deletes a student by their ID. Also attempts to delete their image file.
    -   Path parameter: `student_id` (str - MongoDB ObjectId).

## Frontend Pages

The React frontend provides the following pages/routes (defined in `frontend/src/App.tsx`):

-   `/` : **Landing Page** (`Index.tsx`)
    -   Displays an overview of the system and navigation links to other sections.
-   `/view-attendance` : **View Attendance** (`pages/ViewAttendance.tsx`)
    -   Shows a table of all students, their registration details, and current attendance status.
    -   Allows users to search, edit, and delete students.
-   `/register-student` : **Register Student** (`pages/RegisterStudent.tsx`)
    -   A form to register new students by providing their name, surname, and uploading a photo.
-   `/mark-attendance` : **Mark Attendance** (`pages/MarkAttendance.tsx`)
    -   A form to mark a student's attendance by providing their name, surname, and uploading a current photo for face verification.
-   `*` : **Not Found** (`pages/NotFound.tsx`)
    -   A generic 404 page for invalid routes.

## Notes

-   The backend stores student images in the `/app/images` directory within its container, which is mapped to `./backend/app/images` on the host via `docker-compose.yml`.
-   The DeepFace model (`VGG-Face`) is pre-loaded when the backend application starts to reduce latency on first use.
-   Input validation for names enforces Lithuanian title case (e.g., "Vardenis", "Pavardenis").
-   The frontend uses Nginx to serve the static build files. The Nginx configuration inside the frontend Dockerfile includes a `try_files` directive to support client-side routing for Single Page Applications (SPAs). 