import React, { Component } from "react";
import history from "./../history";
import axios from "axios";
import { toast } from "react-toastify";

import "../Style/activityForm.css";

class LoginStudent extends Component {
  constructor(props) {
    super();
    this.state = {
      accessCode: "",
      emailStudent: "",
    };

    this.handleChange = this.handleChange.bind(this);
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

  executeLogin() {
    const existingUser = {
      accessCode: this.state.accessCode,
      email: this.state.emailStudent,
    };
    axios
      .post(`http://localhost:8081/student`, existingUser, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.data);
        localStorage.accessCode = this.state.accessCode;

        localStorage.loggedIn = "1";
        localStorage.activity = JSON.stringify(res.data.activity);
        toast.dismiss();
        toast.success(res.data.message);
        history.push("/reaction");
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
        <form>
          <label>Introduceti codul de acces: </label>
          <input
            onChange={this.handleChange}
            id="accessCode"
            type="text"
            maxLength="7"
            name="cod"
          />

          <label>Email: </label>
          <input
            onChange={this.handleChange}
            id="emailStudent"
            type="email"
            name="email"
          />

          <br />
        </form>
        <button className="btn btn-info" onClick={this.executeLogin}>
          Acceseaza curs
        </button>{" "}
        <button className="btn btn-info" onClick={() => history.push("/")}>
          Inapoi
        </button>
      </div>
    );
  }
}

export default LoginStudent;
