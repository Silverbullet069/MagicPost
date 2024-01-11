import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { SERVER_URL } from "../data";

import {
  useGlobalContext,
  getSessionStorage,
  setSessionStorage,
} from "../context/GlobalContext";

function Login() {
  const { user, setUser } = useGlobalContext();

  const goToDashboard = useNavigate();

  const usernameElement = useRef();
  const [error, setError] = useState({ show: false, msg: "" });
  const [credential, setCredential] = useState({
    username: getSessionStorage("username") || "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [loginImageUrls, setLoginImageUrls] = useState({
    bkg: "",
    logo: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(SERVER_URL + "/api/auth/images");
      const json = await res.json();

      if (json["status"] !== "success") {
        throw Error(json["data"]["msg"]);
      }

      setLoginImageUrls({
        ...loginImageUrls,
        bkg: SERVER_URL + json["data"]["imgs"]["bkg"],
        logo: SERVER_URL + json["data"]["imgs"]["logo"],
      });

      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  const changeHandler = (e) => {
    setError({ ...error, show: false, msg: "" });
    setCredential({ ...credential, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const url = SERVER_URL + "/api/auth/login";
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({
        username: credential.username,
        password: credential.password,
      }),
      credentials: "include", // ! very important, don't forget
    };

    fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        if (json["status"] === "fail") {
          setError({ show: true, msg: json["data"]["msg"] });
          return;
        }

        console.log(json["data"]);
        setUser(json["data"]["user"]);

        return json["data"]["user"];
      })
      .then((res) => goToDashboard("/dashboard"))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    // TODO: this is still bugging, handle later
    // if (user) {
    //   goToDashboard("/dashboard");
    // }

    fetchData();
    usernameElement.current.focus();
  }, []);

  useEffect(() => {
    setSessionStorage("username", credential.username);
  }, [credential.username]);

  // ! DO NOT do the same for password to prevent XSS

  // if (loading) {
  //   return <h1>Loading...</h1>;
  // }

  return (
    <div className="container">
      <div className="bkg-container">
        <img
          className="bkg-image"
          src={loginImageUrls.bkg}
          alt="login bkg image"
        />
      </div>

      <div className="login-panel">
        <p className="login-greetings">
          <strong>
            <em className="brand-name">MagicPost</em>
          </strong>
          , <em>The best delivery company in the world</em>
        </p>

        <img
          className="login-logo"
          src={loginImageUrls.logo}
          alt="login panel logo"
        />

        <p className="login-title">
          <strong>Login</strong>
        </p>

        <form method="post" className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            value={credential.username}
            placeholder="e.g. magic_post_01"
            ref={usernameElement}
            onChange={changeHandler}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={credential.password}
            placeholder="e.g. 12345678"
            onChange={changeHandler}
            required
          />

          <input type="submit" value="Delivery!" />
          {error.show && <p className="login-err">{error.msg}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;
