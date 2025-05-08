
// API utilities for student operations

/**
 * Fetches all students from the API
 */
export const fetchStudents = async () => {
  const response = await fetch("http://localhost:8000/students");
  if (!response.ok) {
    throw new Error(`Failed to fetch students: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Marks a student as present or absent
 */
export const toggleStudentAttendance = async (studentId: string, isPresent: boolean) => {
  const response = await fetch(`http://localhost:8000/students/${studentId}/attendance`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ marked_today: isPresent }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update attendance: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Deletes a student from the database
 */
export const deleteStudent = async (studentId: string) => {
  const response = await fetch(`http://localhost:8000/students/${studentId}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete student: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Updates student information
 */
export const updateStudent = async (studentId: string, data: { first_name?: string; last_name?: string }) => {
  const response = await fetch(`http://localhost:8000/students/${studentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update student: ${response.statusText}`);
  }
  
  return response.json();
};
