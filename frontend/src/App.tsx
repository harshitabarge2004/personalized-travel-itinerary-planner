// frontend/src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Builder from "./pages/Builder";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/builder" element={<Builder />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/itinerary" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      {/* Catch-all route redirects to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
