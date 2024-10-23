import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

const Register = () => {
  const [focusedInput, setFocusedInput] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const navigateTo = useNavigate();

  const handleFocus = (inputName) => {
    setFocusedInput(inputName);
  };

  const handleBlur = (inputName) => {
    if (inputName === "username" && username === "") {
      setFocusedInput("");
    }
    if (inputName === "email" && email === "") {
      setFocusedInput("");
    }
    if (inputName === "password" && password === "") {
      setFocusedInput("");
    }
    if (inputName === "phone" && phone === "") {
      setFocusedInput("");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/api/auth/register", {
        username,
        email,
        password,
        phone,
      });

      if (response.data.status === "success") {
        setConfirmation({ status: "success" });
        alert("Registered successfully, Redirecting...");
        navigateTo("/signin");
      } else {
        setConfirmation({ status: "fail", message: response.data.message });
      }

      setUsername("");
      setEmail("");
      setPassword("");
      setPhone("");
      setFocusedInput("");
    } catch (err) {
      setUsername("");
      setEmail("");
      setPassword("");
      setPhone("");
      setFocusedInput("");
      setConfirmation({
        status: "fail",
        message:
          err.response?.data?.message || "An error occurred. Please try again.",
      });

      alert("Something went wrong...");
    }
  };

  return (
    <div className="flex font-poppins items-center justify-center min-h-screen bg-gray-100">
      <div className="m-[5vw] w-full max-w-md p-8 space-y-10 bg-white rounded-2xl shadow-md">
        <h2 className="text-3xl font-medium text-center">Register for NewsSquad</h2>

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="relative mb-4">
            <input
              type="text"
              id="username"
              required
              placeholder=" "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => handleFocus("username")}
              onBlur={() => handleBlur("username")}
              className={`block mb-6 w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500`}
            />
            <label
              htmlFor="username"
              className={`absolute left-4 transition-all duration-200 ${
                focusedInput === "username" || username
                  ? "-top-4 text-blue-500 text-xs"
                  : "top-3 text-gray-500"
              }`}
            >
              Username
            </label>
          </div>

          <div className="relative mb-4">
            <input
              type="email"
              id="email"
              required
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => handleFocus("email")}
              onBlur={() => handleBlur("email")}
              className={`block mb-6 w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500`}
            />
            <label
              htmlFor="email"
              className={`absolute left-4 transition-all duration-200 ${
                focusedInput === "email" || email
                  ? "-top-4 text-blue-500 text-xs"
                  : "top-3 text-gray-500"
              }`}
            >
              Email
            </label>
          </div>

          <div className="relative mb-4">
            <input
              type="text"
              id="phone"
              required
              placeholder=" "
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => handleFocus("phone")}
              onBlur={() => handleBlur("phone")}
              className={`block mb-6 w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500`}
            />
            <label
              htmlFor="phone"
              className={`absolute left-4 transition-all duration-200 ${
                focusedInput === "phone" || phone
                  ? "-top-4 text-blue-500 text-xs"
                  : "top-3 text-gray-500"
              }`}
            >
              Phone Number
            </label>
          </div>

          <div className="relative mb-4">
            <input
              type="password"
              id="password"
              required
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => handleFocus("password")}
              onBlur={() => handleBlur("password")}
              className={`block w-full mb-5 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-600`}
            />
            <label
              htmlFor="password"
              className={`absolute left-4 transition-all duration-200 ${
                focusedInput === "password" || password
                  ? "-top-5 text-blue-500 text-sm"
                  : "top-3 text-gray-500"
              }`}
            >
              Password
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4 text-white bg-blue-800 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Register
          </button>
        </form>

        {confirmation && confirmation.status === "success" && (
          <p className="mt-4 text-sm text-center text-green-600">
            Registration successful! Please sign in.
          </p>
        )}
        {confirmation && confirmation.status === "fail" && (
          <p className="mt-4 text-sm text-center text-red-600">
            {confirmation.message}
          </p>
        )}

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-semibold text-lg text-blue-600 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;