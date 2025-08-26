import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import JobList from "./pages/JobList";
import Apply from "./pages/Apply";
import HRDashboard from "./pages/HRDashboard";

export default function App() {
  return (
    <div className="app-root">
      <header className="header">
        <div className="container">
          <h1 className="brand"><Link to="/">HR Portal</Link></h1>
          <nav>
            <Link to="/">Jobs</Link>
            <Link to="/hr" style={{ marginLeft: 12 }}>HR Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="container main">
        <Routes>
          <Route path="/" element={<JobList />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/hr" element={<HRDashboard />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container">Built with ❤️ — HR Portal Demo</div>
      </footer>
    </div>
  );
}
