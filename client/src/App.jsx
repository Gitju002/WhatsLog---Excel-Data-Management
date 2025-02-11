import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import { useGetProfileQuery } from "./redux/slices/authApiSlice";
import Login from "./pages/Login";

const App = () => {
  const { data } = useGetProfileQuery();
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route
          path="/login"
          element={data ? <Navigate to="/" /> : <Login />}
        />
        <Route path="/" element={data ? <Home /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
