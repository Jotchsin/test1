import React from "react";
import { Routes, Route } from "react-router-dom";

import NavBar from "./Components/Landing/NavBar";
import Home from "./Components/Landing/Home";
import Benefits from "./Components/Landing/Benefits";
import About from "./Components/Landing/About";
import Features from "./Components/Landing/Features";
import Contacts from "./Components/Landing/Contacts";
import Footer from "./Components/Landing/Footer";

const App = () => {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <NavBar />
              <Home />
              <Benefits />
              <About />
              <Features />
              <Contacts />
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
