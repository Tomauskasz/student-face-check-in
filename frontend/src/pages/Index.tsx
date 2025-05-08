
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, FilePlus, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Student Attendance System</h1>
          <p className="text-gray-600 text-lg">Manage student registrations and track attendance efficiently</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>View Attendance</CardTitle>
              <CardDescription>Check which students are present today</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-500">Access the complete list of students and their attendance status for today.</p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link to="/view-attendance">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  View Records
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Register Student</CardTitle>
              <CardDescription>Add a new student to the system</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-500">Register a new student by providing their details and uploading their photo.</p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link to="/register-student">
                <Button className="bg-green-600 hover:bg-green-700">
                  Register New
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto bg-purple-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>Record student attendance for today</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-500">Mark a student as present by verifying their identity with a photo.</p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link to="/mark-attendance">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Record Attendance
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
