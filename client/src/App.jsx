import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import Login from "./pages/Login";

const App = () => {
  const { token } = useSelector((state) => state.auth);
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {token ? (
          <Route path="/" element={<Home />} />
        ) : (
          <Route path="/login" element={<Login />} />
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
