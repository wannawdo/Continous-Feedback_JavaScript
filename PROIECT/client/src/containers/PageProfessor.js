import React, { Component } from "react";
import history from "./../history";
import axios from "axios";
import { toast } from "react-toastify";

class PageProfessor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activities: [],
    };
    this.processList = this.processList.bind(this);
    this.goAddActivity = this.goAddActivity.bind(this);
    this.logout = this.logout.bind(this);

    if (localStorage.loggedIn == "1") {
      history.push("/reaction");
    } else if (!localStorage.loggedIn || localStorage.loggedIn == "0") {
      history.push("/auth");
    }
  }

  processList(param) {
    console.log(param);
    let myList = param;
    let parsedList = myList
      .sort((a, b) => b.status - a.status)
      .map((item) => ({
        accessCode: item.accessCode,
        status: item.status == 0 ? "Inactiv" : "Activ",
        description: item.description,
        goodReactions: item.reactions.filter((el) => el.emoticon === 0).length,
        badReactions: item.reactions.filter((el) => el.emoticon === 1).length,
        neutralReactions: item.reactions.filter((el) => el.emoticon === 2)
          .length,
        surprisedReactions: item.reactions.filter((el) => el.emoticon === 3)
          .length,
      }));

    return parsedList;
  }

  goAddActivity() {
    history.push("/add");
  }

  logout() {
    axios
      .get(`http://localhost:8081/logout`, { withCredentials: true })
      .then((res) => {
        toast.dismiss();
        toast.success(res.data.message);
        localStorage.loggedIn = "0";
        history.push("/");
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response.data.message);

        console.log(error.response);
      });
  }

  componentDidMount() {
    axios
      .get(`http://localhost:8081/activities`, { withCredentials: true })
      .then((res) => {
        this.setState({ activities: this.processList(res.data) });
        toast.success(res.data.message);

        console.log(res.data);
      })
      .catch((error) => {
        toast.error(error.response.data.message);

        console.log(error.response);
      });
  }
  render() {
    return (
      <div className="column justify-content-center align-items-center mt-3">
        <h5 className="text-center">Activitati</h5>
        <div className="row justify-content-between">
          <button onClick={this.goAddActivity} className="btn btn-info">
            Adauga activitate
          </button>

          <button onClick={this.logout} className="btn btn-info">
            Logout
          </button>
        </div>

        {this.state.activities.map((el) => (
          <div key={el.accessCode} className="activity">
            <p>Cod: {el.accessCode} </p>
            <p>Status: {el.status}</p>
            <p>Descriere: {el.description}</p>
            <div className="row justify-content-around">
              <div className="column justify-content-center">
                <img
                  src="img/good.jpg"
                  alt="good"
                  name="smiley_face"
                  width="50px"
                  height="50px"
                />
                <p>{el.goodReactions} reactii</p>
              </div>

              <div>
                <img
                  src="img/bad.jpg"
                  alt="bad"
                  name="frowny_face"
                  width="50px"
                  height="50px"
                />
                <p>{el.badReactions} reactii</p>
              </div>
              <div>
                <img
                  src="img/surprised.jpg"
                  alt="surprised"
                  name="surprised_face"
                  width="50px"
                  height="50px"
                />
                <p>{el.surprisedReactions} reactii</p>
              </div>
              <div>
                <img
                  src="img/indecisive.jpg"
                  alt="indecisive"
                  name="confused_face"
                  width="50px"
                  height="50px"
                />
                <p>{el.neutralReactions} reactii</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
export default PageProfessor;
