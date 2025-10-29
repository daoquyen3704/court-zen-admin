import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import Courts from "./pages/admin/Courts";
import Bookings from "./pages/admin/Bookings";
import Maintenance from "./pages/admin/Maintenance";
import Home from "./pages/user/Home";
import CategoryCourts from "./pages/user/CategoryCourts";
import CourtDetail from "./pages/user/CourtDetail";
import MyBookings from "./pages/user/MyBookings";
import NotFound from "./pages/NotFound";
import 'leaflet/dist/leaflet.css';



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/category/:slug" element={<CategoryCourts />} />
          <Route path="/court/:id" element={<CourtDetail />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/auth" element={<Auth />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courts"
            element={
              <ProtectedRoute>
                <Courts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/maintenance"
            element={
              <ProtectedRoute>
                <Maintenance />
              </ProtectedRoute>
            }
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
