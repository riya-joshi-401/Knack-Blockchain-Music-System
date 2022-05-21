import React, { Component } from "react";
import { connect } from "react-redux";
import Offline from "./components/Offline";
import Loading from "./components/Loading";
import artwork from "./assets/knack.png";
import contractMeta from "./contracts/Knack.json";
import Web3 from "web3";
import { Web3Storage } from "web3.storage";
import contract from "@truffle/contract";
import { toast } from "react-toastify";
import Listener from "./components/Listener";
import Artist from "./components/Artist";
import "./App.scss";

export class App extends Component {
  constructor(props) {
    super(props);

    this.web3 = new Web3(
      Web3.givenProvider || process.env.REACT_APP_GANACHECLI
    );
    this.contract = contract(contractMeta);
    this.contract.setProvider(this.web3.currentProvider);
    this.state = {
      loading: true,
      username: "",
      account: "",
      web3storage: "",
      type: "",
      choice: "1",
    };
  }

  componentDidMount() {
    this.loadBlockchain().then(() => {
      // toast.success("Blockchain loaded");
    });
    this.loadWeb3Storage().then(() => {
      // toast.success("Loaded Web3.Storage");
    });
    this.loginUser().then(() => {
      // console.log("loginUser");
    });
  }

  async loadBlockchain() {
    const accounts = await this.web3.eth.requestAccounts();
    // console.log(accounts);
    this.setState({ account: accounts[0] });
  }

  makeStorageClient = () => {
    return new Web3Storage({ token: process.env.REACT_APP_WEB3STORAGE_TOKEN });
  };

  async loadWeb3Storage() {
    const connection = this.makeStorageClient();
    this.setState({ web3storage: connection });
  }

  loginUser = async () => {
    let val = "0";
    const contractInstance = await this.contract.deployed();
    await contractInstance.checkUser({ from: this.state.account }).then((x) => {
      val = x.toString();
    });
    this.setState({ type: val, loading: false });
  };

  registerUser = async (e) => {
    e.preventDefault();
    // add checks
    toast.info("Registering");
    this.setState({ loading: true }, async () => {
      console.log(
        "register requested",
        this.state.account,
        this.state.username
      );
      const contractInstance = await this.contract.deployed();
      if (this.state.choice === "1")
        await contractInstance
          .addNewArtist(this.state.username, { from: this.state.account })
          .then(() => {
            console.log("register artist", this.state.account);
            this.loginUser();
          });
      if (this.state.choice === "2")
        await contractInstance
          .addNewListener(this.state.username, { from: this.state.account })
          .then(() => {
            console.log("register listener", this.state.account);
            this.loginUser();
          });
    });
  };

  render() {
    if (!navigator.onLine) {
      return <Offline />;
    }
    // if (true) {
    if (this.state.loading) {
      return <Loading />;
    }
    if (this.state.type === "0") {
      return (
        <div id="registration" className="app d-flex">
          <div className="col-0 col-md-7 d-flex justify-content-center align-items-center">
            <img src={artwork} alt="artwork" className="w-100" />
          </div>
          <form
            onSubmit={this.registerUser}
            className="col-12 col-md-5 offset-md- d-flex flex-column justify-content-center p-4"
          >
            <div className="mb-3 d-flex">
              <h1 className="text-white text-" id="knack__heading">
                Knack
              </h1>
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Username"
                onChange={(evt) =>
                  this.setState({ username: evt.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <select
                name="choice"
                id="choice"
                className="form-select"
                onChange={(e) => this.setState({ choice: e.target.value })}
              >
                <option selected value="1">
                  Artist
                </option>
                <option value="2">Listener</option>
              </select>
            </div>
            <div className="mb-3 d-flex justify-content-between">
              <button className="btn btn-dark">Register</button>
            </div>
          </form>
        </div>
      );
    } else if (this.state.type === "1") {
      return (
        <Artist
          username={this.state.username}
          contract={this.contract}
          account={this.state.account}
          web3storage={this.state.web3storage}
          type={this.state.type}
        />
      );
    } else {
      return (
        <Listener
          username={this.state.username}
          contract={this.contract}
          account={this.state.account}
          web3storage={this.state.web3storage}
          type={this.state.type}
        />
      );
    }
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(App);
