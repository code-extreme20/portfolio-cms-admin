import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import AdminLayout from "./layouts/AdminLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Skills from "./pages/Skills";
import Projects from "./pages/Projects";
import Experience from "./pages/Experience";
import Services from "./pages/Services";
import Testimonials from "./pages/Testimonials";
import Blogs from "./pages/Blogs";
import Media from "./pages/Media";
import Messages from "./pages/Messages";

const ProtectedLayout = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <AdminLayout />;
};

const App = () => {
  return (
    <Routes>
      {/* LOGIN */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* PROTECTED ADMIN */}
      <Route element={<ProtectedLayout />}>
        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* ABOUT */}
        <Route
          path="/about"
          element={<About />}
        />

        {/* SKILLS */}
        <Route
          path="/skills"
          element={<Skills />}
        />

        {/* PROJECTS */}
        <Route
          path="/projects"
          element={<Projects />}
        />

        {/* EXPERIENCE */}
        <Route
          path="/experience"
          element={<Experience />}
        />

        {/* SERVICES */}
        <Route
          path="/services"
          element={<Services />}
        />

        {/* TESTIMONIALS */}
        <Route
          path="/testimonials"
          element={<Testimonials />}
        />

        {/* BLOGS */}
        <Route
          path="/blogs"
          element={<Blogs />}
        />

        {/* MEDIA */}
        <Route
          path="/media"
          element={<Media />}
        />

        {/* MESSAGES */}
        <Route
          path="/messages"
          element={<Messages />}
        />
      </Route>

      {/* ROOT */}
      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* UNKNOWN URL */}
      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
};

export default App;