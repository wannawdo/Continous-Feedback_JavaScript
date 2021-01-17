import {
  Component,
  Switch,
  Router,
  Route,
  Link,
  useRouteMatch,
  useParams,
} from "react-router-dom";
import history from "./history";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StartPage from "./containers/StartPage";
import NewActivityForm from "./containers/NewActivityForm";
import LoginStudent from "./containers/LoginStudent";
import ReactionPage from "./containers/ReactionPage";
import PageProfessor from "./containers/PageProfessor";
import LoginProfessor from "./containers/LoginProfessor";

function App() {
  return (
    <Router history={history}>
      <div className="App">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <header className="App-header"></header>
        <Route path="/" exact component={StartPage} />
        <Route path="/add" component={NewActivityForm} />
        <Route path="/student" component={LoginStudent} />
        <Route path="/reaction" component={ReactionPage} />
        <Route path="/professor" component={PageProfessor} />
        <Route path="/auth" component={LoginProfessor} />
      </div>
    </Router>
  );
}

export default App;
