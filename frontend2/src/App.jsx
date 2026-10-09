import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./auth/AuthProvider";
import { AIChatProvider } from "./context/AIChatContext";
import AIAssistantDrawer from "./components/chat/AIAssistantDrawer";


import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import AdminRoute from "./routes/AdminRoute";


import PublicLayout from "./layouts/PublicLayout";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";


import Home from "./pages/public/Home";
import Events from "./pages/public/Events";
import EventDetails from "./pages/public/EventDetails";
import About from "./pages/public/About";


import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";


import UserDashboard from "./pages/user/Dashboard";
import Profile from "./pages/user/Profile";
import MyEvents from "./pages/user/MyEvents";


import AdminDashboard from "./pages/admin/Dashboard";
import AdminEvents from "./pages/admin/Events";
import AdminRegistrations from "./pages/admin/Registrations";
import AdminUsers from "./pages/admin/Users";
import AdminVenues from "./pages/admin/Venues";
import AdminFeedback from "./pages/admin/Feedback";
import AdminPayments from "./pages/admin/Payments";
import AIAssistant from "./pages/admin/AIAssistant";
import AgentActivity from "./pages/admin/AgentActivity";


import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <AIChatProvider>
        <Toaster position="top-right" richColors />
        <AIAssistantDrawer />
        <BrowserRouter>
        <Routes>
          
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:eventId" element={<EventDetails />} />
            <Route path="/about" element={<About />} />

            
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />
          </Route>

          
          <Route
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-events" element={<MyEvents />} />
          </Route>

          
          <Route
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/registrations" element={<AdminRegistrations />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/venues" element={<AdminVenues />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/ai-chat" element={<AIAssistant />} />
            <Route path="/admin/agent-activity" element={<AgentActivity />} />
          </Route>

          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AIChatProvider>
    </AuthProvider>
  );
}
