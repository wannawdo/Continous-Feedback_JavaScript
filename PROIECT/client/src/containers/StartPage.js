import React, { Component } from "react";
import history from "../history";


import "../Style/activityForm.css";

class Index extends Component {
  constructor(props) {
    super();

    if (localStorage.loggedIn == "1") {
      history.push("/student");
    } else if (localStorage.loggedIn == "2") {
      history.push("/professor");
    }
  }

  render() {
    return (
      <div className="pag1">
        <h5>Intra in aplicatie ca: </h5>

        <button
          id="buton1"
          className="btn btn-info"
          onClick={() => history.push("/student")}
        >
          STUDENT
        </button>

        <button
          id="buton2"
          className="btn btn-info"
          onClick={() => history.push("/auth")}
        >
          PROFESOR
        </button>
      </div>
    );
  }
}
export default Index;
