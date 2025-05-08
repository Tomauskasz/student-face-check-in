import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Student {
  _id: string;
  first_name: string;
  last_name: string;
  marked_today: boolean;
}

const ViewAttendance = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:8000/students");
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
      setStudents(data.students);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load student data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleResetAttendance = async () => {
    try {
      const response = await fetch("http://localhost:8000/students/reset", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reset attendance");
      }

      // Update the local state after successful reset
      setStudents(students.map((student) => ({ ...student, marked_today: false })));

      toast({
        title: "Success",
        description: "All attendance marks have been reset.",
      });
    } catch (error) {
      console.error("Error resetting attendance:", error);
      toast({
        title: "Error",
        description: "Failed to reset attendance. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div key="view-attendance-root" className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <Link to="/">
              <Button variant="outline" className="mb-4 sm:mb-0">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>
          <Button onClick={handleResetAttendance} variant="outline" className="bg-red-50 text-red-600 hover:bg-red-100">
            Reset All Attendance
          </Button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-800">Student Attendance</h1>
            <p className="text-gray-600">View and manage today's attendance records</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading attendance data...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No students registered yet.</p>
              <Link to="/register-student">
                <Button className="mt-4">Register a Student</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Attendance Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="text-gray-500 font-mono">{student._id.slice(0, 8)}...</TableCell>
                      <TableCell>{student.first_name}</TableCell>
                      <TableCell>{student.last_name}</TableCell>
                      <TableCell>
                        {student.marked_today ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Present</Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">Absent</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAttendance;
