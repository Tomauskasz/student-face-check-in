
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
import { ArrowLeft, Edit, Trash2, Search, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { fetchStudents, toggleStudentAttendance, deleteStudent, updateStudent } from "@/lib/api";
import { motion } from "framer-motion";

interface Student {
  _id: string;
  first_name: string;
  last_name: string;
  marked_today: boolean;
}

const ViewAttendance = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState({ first_name: "", last_name: "" });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Animation variants for list items
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await fetchStudents();
      setStudents(data.students);
      setFilteredStudents(data.students);
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
    loadStudents();
  }, []);

  useEffect(() => {
    // Filter students based on search query
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = students.filter(
        student => 
          student.first_name.toLowerCase().includes(query) || 
          student.last_name.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

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
      setFilteredStudents(filteredStudents.map((student) => ({ ...student, marked_today: false })));

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

  const handleToggleAttendance = async (studentId: string, currentStatus: boolean) => {
    try {
      await toggleStudentAttendance(studentId, !currentStatus);
      
      // Update local state
      const updatedStudents = students.map(student => 
        student._id === studentId 
          ? { ...student, marked_today: !currentStatus } 
          : student
      );
      
      setStudents(updatedStudents);
      setFilteredStudents(
        filteredStudents.map(student => 
          student._id === studentId 
            ? { ...student, marked_today: !currentStatus } 
            : student
        )
      );

      toast({
        title: "Success",
        description: `Student marked as ${!currentStatus ? "present" : "absent"}.`,
      });
    } catch (error) {
      console.error("Error toggling attendance:", error);
      toast({
        title: "Error",
        description: "Failed to update attendance status.",
        variant: "destructive",
      });
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditFormData({ 
      first_name: student.first_name, 
      last_name: student.last_name
    });
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;
    
    try {
      await updateStudent(editingStudent._id, editFormData);
      
      // Update local state
      const updatedStudents = students.map(student => 
        student._id === editingStudent._id 
          ? { ...student, ...editFormData } 
          : student
      );
      
      setStudents(updatedStudents);
      setFilteredStudents(
        filteredStudents.map(student => 
          student._id === editingStudent._id 
            ? { ...student, ...editFormData } 
            : student
        )
      );
      
      setEditingStudent(null);
      toast({
        title: "Success",
        description: "Student information updated successfully.",
      });
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: "Failed to update student information.",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteStudent = (studentId: string) => {
    setStudentToDelete(studentId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    try {
      await deleteStudent(studentToDelete);
      
      // Update local state
      const updatedStudents = students.filter(student => student._id !== studentToDelete);
      setStudents(updatedStudents);
      setFilteredStudents(filteredStudents.filter(student => student._id !== studentToDelete));
      
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
      
      toast({
        title: "Success",
        description: "Student deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: "Failed to delete student.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div 
      key="view-attendance-root" 
      className="min-h-screen bg-gray-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <Link to="/">
              <Button variant="outline" className="mb-4 sm:mb-0 hover:bg-gray-100 transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>
          <Button 
            onClick={handleResetAttendance} 
            variant="outline" 
            className="bg-red-50 text-red-600 hover:bg-red-100 transition-all"
          >
            Reset All Attendance
          </Button>
        </div>

        <motion.div 
          className="bg-white shadow-md rounded-lg overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-800">Student Attendance</h1>
            <p className="text-gray-600">View and manage today's attendance records</p>
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search students by name..."
                className="pl-10 pr-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading attendance data...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              {searchQuery ? (
                <p className="text-gray-600">No students found matching your search.</p>
              ) : (
                <>
                  <p className="text-gray-600">No students registered yet.</p>
                  <Link to="/register-student">
                    <Button className="mt-4">Register a Student</Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Attendance Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <motion.div
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    component={React.Fragment}
                  >
                    {filteredStudents.map((student) => (
                      <motion.tr
                        key={student._id}
                        variants={itemVariants}
                        className="group hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="text-gray-500 font-mono">{student._id.slice(0, 8)}...</TableCell>
                        <TableCell>{student.first_name}</TableCell>
                        <TableCell>{student.last_name}</TableCell>
                        <TableCell>
                          <div 
                            className="flex items-center cursor-pointer"
                            onClick={() => handleToggleAttendance(student._id, student.marked_today)}
                          >
                            {student.marked_today ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors flex items-center">
                                <Check size={14} className="mr-1" /> Present
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 transition-colors flex items-center">
                                <X size={14} className="mr-1" /> Absent
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleEditStudent(student)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => confirmDeleteStudent(student._id)}
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </motion.div>
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(isOpen) => !isOpen && setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student Information</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="first_name" className="text-right">
                First Name
              </Label>
              <Input
                id="first_name"
                value={editFormData.first_name}
                onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="last_name" className="text-right">
                Last Name
              </Label>
              <Input
                id="last_name"
                value={editFormData.last_name}
                onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStudent(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStudent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete this student? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteStudent}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ViewAttendance;
