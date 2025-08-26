import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import JobList from "./pages/JobList";
import Apply from "./pages/Apply";
import HRDashboard from "./pages/HRDashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";

export default function App() {
  return (
    <div className="app-root">
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public route - Login page */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <div className="container mx-auto px-4 py-8">
                  <JobList />
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/apply" 
            element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <div className="container mx-auto px-4 py-8">
                  <Apply />
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/hr" 
            element={
              <ProtectedRoute allowedRoles={['hr']}>
                <div className="container mx-auto px-4 py-8">
                  <HRDashboard />
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect root to login if not authenticated */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          Built with ❤️ — HR Portal Demo
        </div>
      </footer>
    </div>
  );
}
