
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          className="text-center mb-16"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Student Attendance System</h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Efficiently manage student registrations and track attendance with our modern, secure platform
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-xl transition-all duration-300 h-full border-t-4 border-t-blue-500">
              <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 shadow-inner">
                  <FileText className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">View Attendance</CardTitle>
                <CardDescription className="text-base">Check and manage student attendance records</CardDescription>
              </CardHeader>
              <CardContent className="text-center px-8">
                <p className="text-gray-500">Access the complete list of students, edit information, and track daily attendance status.</p>
              </CardContent>
              <CardFooter className="flex justify-center pb-8">
                <Link to="/view-attendance">
                  <Button className="bg-blue-600 hover:bg-blue-700 transition-colors px-6 py-6 h-auto text-lg">
                    View Records
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-xl transition-all duration-300 h-full border-t-4 border-t-green-500">
              <CardHeader className="text-center">
                <div className="mx-auto bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 shadow-inner">
                  <User className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Register Student</CardTitle>
                <CardDescription className="text-base">Add a new student to the system</CardDescription>
              </CardHeader>
              <CardContent className="text-center px-8">
                <p className="text-gray-500">Register a new student by providing their details and uploading their photo for attendance verification.</p>
              </CardContent>
              <CardFooter className="flex justify-center pb-8">
                <Link to="/register-student">
                  <Button className="bg-green-600 hover:bg-green-700 transition-colors px-6 py-6 h-auto text-lg">
                    Register New
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-xl transition-all duration-300 h-full border-t-4 border-t-purple-500">
              <CardHeader className="text-center">
                <div className="mx-auto bg-purple-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 shadow-inner">
                  <Calendar className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Mark Attendance</CardTitle>
                <CardDescription className="text-base">Record student attendance for today</CardDescription>
              </CardHeader>
              <CardContent className="text-center px-8">
                <p className="text-gray-500">Mark a student as present using facial recognition verification for secure attendance tracking.</p>
              </CardContent>
              <CardFooter className="flex justify-center pb-8">
                <Link to="/mark-attendance">
                  <Button className="bg-purple-600 hover:bg-purple-700 transition-colors px-6 py-6 h-auto text-lg">
                    Record Attendance
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Index;
