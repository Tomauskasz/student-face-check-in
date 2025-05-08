import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Upload } from "lucide-react";

const MarkAttendance = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Revoke previous preview URL to avoid memory leaks
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const isFormValid = () => {
    // Check if first name is Title Case and allows Lithuanian characters
    if (!firstName || !/^[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]*$/.test(firstName)) {
      toast({
        title: "Invalid First Name",
        description: "First name must be in Title Case (e.g., 'John', 'Ąžuolas').",
        variant: "destructive",
      });
      return false;
    }
    // Check if last name is Title Case and allows Lithuanian characters
    if (!lastName || !/^[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]*$/.test(lastName)) {
      toast({
        title: "Invalid Last Name",
        description: "Last name must be in Title Case (e.g., 'Doe', 'Kazlauskas').",
        variant: "destructive",
      });
      return false;
    }
    // Check if photo is selected
    if (!photo) {
      toast({
        title: "Missing Photo",
        description: "Please upload a photo for face verification.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      if (photo) {
        formData.append("file", photo);
      }

      const response = await fetch("http://localhost:8000/students/mark", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to mark attendance");
      }

      toast({
        title: "Success",
        description: "Attendance marked successfully!",
      });

      // Reset the form
      setFirstName("");
      setLastName("");
      setPhoto(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error("Error marking attendance:", error);
      let errorMessage = "Failed to mark attendance. Please try again.";

      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes("Student not found")) {
          errorMessage = "Student not found. Please check name spelling or register the student.";
        } else if (error.message.includes("Face did not match")) {
          errorMessage = "Face verification failed. Either this is not the right student or the photo is not clear. Please try again with a clearer photo.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Attendance Marking Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-2xl">
        <Link to="/">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Mark Student Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name (Title Case)"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">Example: John</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name (Title Case)"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">Example: Smith</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Student Photo for Verification</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    id="photo"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  <label
                    htmlFor="photo"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-40 h-40 object-cover rounded-lg mx-auto"
                      />
                    ) : (
                      <>
                        <div className="bg-gray-100 rounded-full p-3">
                          <Upload className="h-6 w-6 text-purple-500" />
                        </div>
                        <span className="text-sm text-gray-600">
                          Click to upload current photo
                        </span>
                        <span className="text-xs text-gray-500">
                          The system will verify this with the registered photo
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    "Mark Attendance"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarkAttendance;
