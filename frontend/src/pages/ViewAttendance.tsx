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
import { ArrowLeft, Edit, Search, Trash2, UserCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ui/ThemeProvider";

interface Student {
  _id: string;
  first_name: string;
  last_name: string;
  marked_today: boolean;
  last_seen_date?: string | null;
}

const ViewAttendance = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [editStudent, setEditStudent] = useState<{ id: string; firstName: string; lastName: string } | null>(null);
  const { toast } = useToast();

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) {
      return "Never";
    }
    try {
      const date = new Date(dateString);
      const datePart = date.toLocaleDateString();
      const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${datePart} ${timePart}`;
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Invalid Date";
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/students");
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
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
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) =>
          student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.last_name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleToggleAttendance = async (student: Student) => {
    const newMarkedStatus = !student.marked_today;
    try {
      const response = await fetch(`http://localhost:8000/students/${student._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ marked_today: newMarkedStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to update attendance status." }));
        throw new Error(errorData.detail || "Failed to update attendance status.");
      }

      await fetchStudents();

      toast({
        title: "Attendance Updated",
        description: `${student.first_name}'s attendance has been ${newMarkedStatus ? "marked as Present" : "marked as Absent"}.`,
      });
    } catch (error) {
      console.error("Error toggling attendance:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update attendance status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/students/${studentToDelete._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to delete student." }));
        throw new Error(errorData.detail || "Failed to delete student.");
      }

      setIsDeleteDialogOpen(false);
      const deletedStudentName = `${studentToDelete.first_name} ${studentToDelete.last_name}`;
      setStudentToDelete(null);
      await fetchStudents();

      toast({
        title: "Student Deleted",
        description: `${deletedStudentName} has been removed from the system.`,
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete student. Please try again.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (student: Student) => {
    setEditStudent({
      id: student._id,
      firstName: student.first_name,
      lastName: student.last_name,
    });
    setIsEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!editStudent) return;

    try {
      const response = await fetch(`http://localhost:8000/students/${editStudent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: editStudent.firstName,
          last_name: editStudent.lastName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to update student information." }));
        throw new Error(errorData.detail || "Failed to update student information.");
      }

      setIsEditDialogOpen(false);
      setEditStudent(null);
      await fetchStudents();

      toast({
        title: "Student Updated",
        description: "Student information has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update student information. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      key="view-attendance-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground p-6 transition-colors duration-300"
    >
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0 flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" className="mb-4 sm:mb-0">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
            <ThemeToggle />
          </div>
          <Button
            onClick={handleResetAttendance}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
          >
            Reset All Attendance
          </Button>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-card text-card-foreground shadow-md rounded-lg overflow-hidden border border-border transition-colors duration-300"
        >
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-semibold">Student Attendance</h1>
            <p className="text-muted-foreground">View and manage today's attendance records</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading attendance data...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No students registered yet.</p>
              <Link to="/register-student">
                <Button className="mt-4">Register a Student</Button>
              </Link>
            </div>
          ) : (
            <div>
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 max-w-md bg-background"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">First Name</TableHead>
                      <TableHead className="text-center">Last Name</TableHead>
                      <TableHead className="text-center">Attendance Status</TableHead>
                      <TableHead className="text-center">Last Seen</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, index) => (
                      <motion.tr
                        key={student._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <TableCell className="text-center">{student.first_name}</TableCell>
                        <TableCell className="text-center">{student.last_name}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            onClick={() => handleToggleAttendance(student)}
                            className={`cursor-pointer transition-all duration-300 ${student.marked_today
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-50 text-red-600 border-red-300 hover:bg-red-100"
                              }`}
                          >
                            {student.marked_today ? "Present" : "Absent"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDate(student.last_seen_date)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(student)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(student)}
                              className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleAttendance(student)}
                              className="h-8 w-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                            >
                              {student.marked_today ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {studentToDelete?.first_name} {studentToDelete?.last_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="firstName" className="text-right">
                First Name
              </label>
              <Input
                id="firstName"
                value={editStudent?.firstName || ""}
                onChange={(e) => setEditStudent(editStudent ? { ...editStudent, firstName: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="lastName" className="text-right">
                Last Name
              </label>
              <Input
                id="lastName"
                value={editStudent?.lastName || ""}
                onChange={(e) => setEditStudent(editStudent ? { ...editStudent, lastName: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ViewAttendance;
