import './index.css';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./Index";
import NotFound from "./pages/NotFound";
import ViewAttendance from "./pages/ViewAttendance";
import RegisterStudent from "./pages/RegisterStudent";
import MarkAttendance from "./pages/MarkAttendance";

import { ThemeProvider } from "@/components/ui/ThemeProvider";

const queryClient = new QueryClient();

const AppContent = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/view-attendance" element={<ViewAttendance />} />
          <Route path="/register-student" element={<RegisterStudent />} />
          <Route path="/mark-attendance" element={<MarkAttendance />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
