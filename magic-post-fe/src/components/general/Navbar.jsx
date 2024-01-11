import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useGlobalContext,
  clearSessionStorage,
} from "../../context/GlobalContext";
import { FaCircleUser, FaTruckFast } from "react-icons/fa6";
import { SERVER_URL } from "../../data";

function Navbar() {
  // ! nothing user-specific here beside username

  const { user, setUser } = useGlobalContext();
  const goToLogin = useNavigate();

  const handleLogout = (e) => {
    const url = SERVER_URL + "/api/auth/logout";
    const options = {
      method: "GET",
      credentials: "include",
    };

    fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        console.log(json); // debug

        setUser(null); // remove user
        clearSessionStorage();
        goToLogin("/");
        window.location.reload(); // clear all remaining state, ref, memo by reloading page
      });
  };

  return (
    <nav className="dashboard-nav">
      <Link to="/dashboard" className="dashboard-text-logo">
        <FaTruckFast className="dashboard-logo-truck" />
        <strong>MagicPost</strong>
      </Link>
      <div className="dashboard-user-container">
        <p className="dashboard-user-greetings">
          Welcome,
          <strong>
            <em className="dashboard-user-name">{user && user["name"]}</em>
          </strong>
        </p>
        <FaCircleUser className="dashboard-user-icon" />
        <button onClick={handleLogout} className="dashboard-logout-btn">
          Log Out
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
