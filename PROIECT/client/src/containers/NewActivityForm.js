import React, { Component } from "react";
import history from "./../history";
import axios from "axios";
import { toast } from "react-toastify";

import "../Style/activityForm.css";
class NewActivityForm extends Component {
  constructor(props) {
    super();
    this.state = {
      id: 0,
      subject: "Tehnologii Web",
      subjectList: [
        { id: 0, name: "Tehnologii Web" },
        { id: 1, name: "Poo" },
        { id: 2, name: "Bazele Statisticii" },
      ],
      description: "Curs",
      duration: 1,
      status: 0,
    };

    this.handleChangeSubject = this.handleChangeSubject.bind(this);
    this.handleChangeDescription = this.handleChangeDescription.bind(this);
    this.handleChangeDuration = this.handleChangeDuration.bind(this);
    this.sendForm = this.sendForm.bind(this);
    this.goPageProf = this.goPageProf.bind(this);
    if (localStorage.loggedIn == "1") {
      history.push("/reaction");
    } else if (!localStorage.loggedIn || localStorage.loggedIn == "0") {
      history.push("/auth");
    }
  }
  handleChangeSubject(event) {
    this.setState({ subject: event.target.value });
  }
  handleChangeDescription(event) {
    this.setState({ description: event.target.value });
  }
  handleChangeDuration(event) {
    this.setState({ duration: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  goPageProf() {
    history.push("/professor");
  }

  sendForm() {
    console.log(this.state.subject);
    console.log(this.state.description);
    console.log(this.state.duration);

    if (!this.state.subject || !this.state.description || !this.state.duration)
      console.log("Materia, Descrierea si Durata nu pot fi goale!");
    else {
      let newActivity = {
        description: this.state.subject + " - " + this.state.description,
        duration: this.state.duration.toString(),
      };

      axios
        .post(`http://localhost:8081/activities`, newActivity, {
          withCredentials: true,
        })
        .then((res) => {
          console.log(res.data);
          toast.dismiss();
          toast.success(res.data.message);

          history.push("/professor");
        })
        .catch((error) => {
          toast.dismiss();
          error.response.data.errors.forEach((item) => {
            toast.error(item);
          });

          console.log(error.response);
        });
    }
  }

  render() {
    return (
      <div>
        <br />
        <p>Introduceti o activitate noua:</p>

        <form className="formActivity" onSubmit={this.handleSubmit}>
          <div className="d-inline-flex p-2 align-items-center">
            <label className="label1">Materie*</label>
            <select
              className="form-control"
              id="exampleFormControlSelect1"
              onChange={this.handleChangeSubject}
            >
              {this.state.subjectList.map((el) => (
                <option key={el.id}>{el.name}</option>
              ))}
            </select>

            <br />
          </div>

          <div>
            <label className="label1">Descriere*</label>
            <input
              onChange={this.handleChangeDescription}
              type="text"
              name="descriere"
              maxLength="200"
              value={this.state.description}
            />
            <br />
          </div>
          <div className="d-inline-flex p-2 align-items-center ">
            <label className="label1">Durata activitate*</label>
            <input
              onChange={this.handleChangeDuration}
              type="number"
              name="durata"
              min="1"
              max="120"
              value={this.state.duration}
            />
            <p className="ml-3">min</p>
            <br />
          </div>

          <button className="bgenerare btn btn-info" onClick={this.sendForm}>
            Creeaza activitate
          </button>

          <button className="bgenerare btn btn-info" onClick={this.goPageProf}>
            Inapoi
          </button>
        </form>
      </div>
    );
  }
}
export default NewActivityForm;
