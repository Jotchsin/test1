import { Routes, Route, Outlet } from "react-router-dom";
import NavBar from "./Components/landing/NavBar";
import FirstPart from "./Components/landing/FirstPart";
import Benefits from "./Components/landing/Benefits";
import About from "./Components/landing/About";
import Features from "./Components/landing/Features";
import Contacts from "./Components/landing/Contacts";
import Footer from "./Components/landing/Footer";
import Login from "./Components/LogSign/Login";
import Signup from "./Components/LogSign/Signup";
import Dashboard from "./Components/Dashboard/dashboard";
import CreateEvent from "./Components/Dashboard/Create";
import DashboardNavbar from "./Components/Dashboard/NavbarInside";
import ManageEvent from "./Components/Dashboard/manage";
import TrackEvent from "./Components/Dashboard/track";
import ScannerEvent from "./Components/Dashboard/qrscanner"

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <div className="px-8 py-6">
        <Outlet />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <NavBar />
              <FirstPart />
              <Benefits />
              <About />
              <Features />
              <Contacts />
              <Footer />
            </>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/manage" element={<ManageEvent />} />
          <Route path="/track" element={<TrackEvent />} />
          <Route path="/qrscanner" element={<ScannerEvent />} />
          
      </Routes>
    </div>
  );
};

export default App;
