import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-4 tracking-tight">
            Student Attendance System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A modern platform designed to efficiently manage student registrations and track attendance with ease
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div variants={item}>
            <Card className="hover:shadow-xl transition-all duration-300 border-t-4 border-blue-500 h-full flex flex-col">
              <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                  <FileText className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">View Attendance</CardTitle>
                <CardDescription className="text-base mt-2">Check and manage student attendance records</CardDescription>
              </CardHeader>
              <CardContent className="text-center flex-grow">
                <p className="text-gray-600 mb-6">Access the complete list of students and their attendance status, with options to search, edit, and manage records.</p>
              </CardContent>
              <CardFooter className="flex justify-center pt-4">
                <Link to="/view-attendance">
                  <Button className="bg-blue-600 hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg text-lg px-6">
                    View Records
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="hover:shadow-xl transition-all duration-300 border-t-4 border-green-500 h-full flex flex-col">
              <CardHeader className="text-center">
                <div className="mx-auto bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                  <User className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Register Student</CardTitle>
                <CardDescription className="text-base mt-2">Add new students to the system</CardDescription>
              </CardHeader>
              <CardContent className="text-center flex-grow">
                <p className="text-gray-600 mb-6">Register a new student by providing their details and uploading a photo for facial recognition verification.</p>
              </CardContent>
              <CardFooter className="flex justify-center pt-4">
                <Link to="/register-student">
                  <Button className="bg-green-600 hover:bg-green-700 transition-colors shadow-md hover:shadow-lg text-lg px-6">
                    Register New
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="hover:shadow-xl transition-all duration-300 border-t-4 border-purple-500 h-full flex flex-col">
              <CardHeader className="text-center">
                <div className="mx-auto bg-purple-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                  <Calendar className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Mark Attendance</CardTitle>
                <CardDescription className="text-base mt-2">Record student presence with face verification</CardDescription>
              </CardHeader>
              <CardContent className="text-center flex-grow">
                <p className="text-gray-600 mb-6">Mark a student as present by verifying their identity with facial recognition technology.</p>
              </CardContent>
              <CardFooter className="flex justify-center pt-4">
                <Link to="/mark-attendance">
                  <Button className="bg-purple-600 hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg text-lg px-6">
                    Record Attendance
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-20 text-center text-gray-500 text-sm"
        >
          <p>&copy; {new Date().getFullYear()} Student Attendance System. All rights reserved.</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
