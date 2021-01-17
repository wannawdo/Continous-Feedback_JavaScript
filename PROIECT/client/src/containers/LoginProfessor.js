import React, { Component } from "react";
import history from "./../history";
import axios from "axios";

import "../Style/activityForm.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class LoginProfessor extends Component {
  constructor(props) {
    super();
    this.state = {
      isLogin: true,
      passLogin: "",
      emailLogin: "",
      firstNameRegister: "",
      lastNameRegister: "",
      passRegister: "",
      emailRegister: "",
    };

    this.handleChange = this.handleChange.bind(this);
    this.goRegister = this.goRegister.bind(this);
    this.goLogin = this.goLogin.bind(this);
    this.executeRegister = this.executeRegister.bind(this);
    this.executeLogin = this.executeLogin.bind(this);

    if (localStorage.loggedIn == "1") {
      history.push("/reaction");
    } else if (localStorage.loggedIn == "2") {
      history.push("/professor");
    }
  }

  handleChange(event) {
    const id = event.target.id;
    let newObject = {};
    newObject[id] = event.target.value;
    this.setState(newObject);
  }

  goRegister() {
    this.setState({ isLogin: false });
  }
  goLogin() {
    this.setState({ isLogin: true });
  }
  executeRegister() {
    const newUser = {
      firstName: this.state.firstNameRegister,
      lastName: this.state.lastNameRegister,
      password: this.state.passRegister,
      email: this.state.emailRegister,
    };
    axios
      .post(`http://localhost:8081/professors`, newUser, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.data);
        toast.dismiss();
        toast.success(res.data.message);

        this.goLogin();
      })
      .catch((error) => {
        toast.dismiss();
        error.response.data.errors.forEach((item) => {
          toast.error(item);
        });

        console.log(error.response);
      });
  }
  executeLogin() {
    const existingUser = {
      password: this.state.passLogin,
      email: this.state.emailLogin,
    };
    axios
      .post(`http://localhost:8081/login`, existingUser, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.data);
        toast.dismiss();
        localStorage.loggedIn = "2";
        toast.success(res.data.message);
        history.push("/professor");
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response.data.message);
        console.log(error.response);
      });
  }

  render() {
    return (
      <div>
        {!this.state.isLogin ? (
          <div className="div-register">
            <div className="row justify-content-center align-items-center">
              <label className="label1">First Name</label>
              <input
                id="firstNameRegister"
                type="text"
                minLength="2"
                maxLength="50"
                onChange={this.handleChange}
              />
            </div>

            <div className="row justify-content-center align-items-center">
              <label>Last Name</label>
              <input
                id="lastNameRegister"
                type="text"
                minLength="2"
                maxLength="50"
                onChange={this.handleChange}
              />
            </div>

            <div className="row justify-content-center align-items-center">
              <label>Email address</label>
              <input
                onChange={this.handleChange}
                id="emailRegister"
                type="email"
              />
            </div>

            <div className="row justify-content-center align-items-center">
              <label>Password</label>
              <input
                onChange={this.handleChange}
                id="passRegister"
                type="password"
              />
            </div>
            <button className="btn btn-info" onClick={this.executeRegister}>
              Inregistreaza-te
            </button>
            <button className="btn btn-info" onClick={this.goLogin}>
              Inapoi
            </button>
          </div>
        ) : (
          <div className="div-log-in">
            <div className="row justify-content-center align-items-center">
              <label>Email address</label>
              <input
                onChange={this.handleChange}
                id="emailLogin"
                type="email"
              />
            </div>
            <div className="row justify-content-center align-items-center">
              <label>Password</label>
              <input
                onChange={this.handleChange}
                id="passLogin"
                type="password"
              />
            </div>
            <button className="btn btn-info" onClick={this.executeLogin}>
              Logheaza-te
            </button>{" "}
            <button className="btn btn-info" onClick={this.goRegister}>
              Inregistreaza-te
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default LoginProfessor;
