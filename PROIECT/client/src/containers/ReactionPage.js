import React, { Component } from "react";
import history from "../history";
import axios from "axios";
import { toast } from "react-toastify";

class ReactionPage extends Component {
  constructor(props) {
    super();
    this.state = {
      isReactionGiven: false,
      activity: {
        id: 0,
        duration: 0,
        description: "N/A",
      },
      accessCode: 0,
    };

    this.reactionChange = this.reactionChange.bind(this);
    this.logout = this.logout.bind(this);

    this.millisToMinutesAndSeconds = this.millisToMinutesAndSeconds.bind(this);
    if (localStorage.loggedIn == "2") {
      history.push("/professor");
    } else if (!localStorage.loggedIn || localStorage.loggedIn == "0") {
      history.push("/student");
    }
  }

  componentDidMount() {
    if (localStorage.activity)
      this.setState({ activity: JSON.parse(localStorage.activity) });
  }

  logout() {
    axios
      .get(`http://localhost:8081/logout`, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
        localStorage.loggedIn = "0";
        history.push("/");
      })
      .catch((error) => {
        toast.error(error.response.data.message);

        console.log(error.response);
      });
  }

  millisToMinutesAndSeconds(activity) {
    const millis =
      activity.duration * 60 * 1000 -
      Date.now() +
      Date.parse(activity.createdAt);
    if (millis < 0) return "Expirat";
    let minutes = Math.floor(millis / 60000);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }

  reactionChange(event) {
    let emoticon = 0;
    switch (event.target.alt) {
      case "good":
        emoticon = 0;
        break;
      case "bad":
        emoticon = 1;
        break;
      case "indecisive":
        emoticon = 2;
        break;
      case "surprised":
        emoticon = 3;
        break;
    }

    const newReaction = {
      activityId: this.state.activity.id,
      emoticon: emoticon,
    };

    axios
      .post(`http://localhost:8081/reaction`, newReaction, {
        withCredentials: true,
      })
      .then((res) => {
        this.forceUpdate();
        console.log(res.data);
        toast.dismiss();
        toast.success(res.data.message);
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response.data.message);

        console.log(error.response);
      });
  }

  render() {
    const isReactionGiven = this.state.isReactionGiven;
    let alert;
    if (isReactionGiven) {
      alert = (
        <div className="alert alert-primary" role="alert">
          This is a primary alert—check it out!
        </div>
      );
    }
    return (
      <div className="reactions-page">
        <p>Descriere activitate: {this.state.activity.description}</p>
        <p>Timp ramas: {this.millisToMinutesAndSeconds(this.state.activity)}</p>

        <div>
          <div id="images" align="center">
            <img
              onClick={this.reactionChange}
              className="button"
              id="good"
              pointerEvents="all"
              src="img/good.jpg"
              alt="good"
              name="smiley_face"
              width="150px"
              height="150px"
            />

            <img
              onClick={this.reactionChange}
              className="button"
              src="img/bad.jpg"
              alt="bad"
              name="frowny_face"
              width="150px"
              height="150px"
            />
          </div>
          <div id="images" align="center">
            <img
              onClick={this.reactionChange}
              className="button"
              src="img/surprised.jpg"
              alt="surprised"
              name="surprised_face"
              width="150px"
              height="150px"
            />

            <img
              onClick={this.reactionChange}
              className="button"
              src="img/indecisive.jpg"
              alt="indecisive"
              name="confused_face"
              width="150px"
              height="150px"
            />
          </div>
        </div>
        <button onClick={this.logout} className="btn btn-info">
          Logout
        </button>

        {alert}
      </div>
    );
  }
}
export default ReactionPage;
