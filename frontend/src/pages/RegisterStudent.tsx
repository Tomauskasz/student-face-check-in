
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeProvider";

const RegisterStudent = () => {
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
        description: "Please upload a photo of the student.",
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

      const response = await fetch("http://localhost:8000/students/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to register student");
      }

      toast({
        title: "Success",
        description: "Student registered successfully!",
      });

      // Reset the form
      setFirstName("");
      setLastName("");
      setPhoto(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error("Error registering student:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground p-6 transition-colors duration-300"
    >
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <ThemeToggle />
        </div>

        <Card className="shadow-lg border border-border transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Register New Student</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name (Title Case)"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="bg-background border-input"
                    />
                    <p className="text-xs text-muted-foreground">Example: John</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name (Title Case)"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="bg-background border-input"
                    />
                    <p className="text-xs text-muted-foreground">Example: Smith</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Student Photo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/40 transition-colors">
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
                          <div className="bg-muted rounded-full p-3">
                            <Upload className="h-6 w-6 text-green-500" />
                          </div>
                          <span className="text-sm text-foreground">
                            Click to upload student photo
                          </span>
                          <span className="text-xs text-muted-foreground">
                            JPG, PNG or GIF up to 5MB
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <CardFooter className="flex justify-center mt-6">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Registering...
                    </div>
                  ) : (
                    "Register Student"
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default RegisterStudent;
