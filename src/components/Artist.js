import React, { Component } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import AddSong from "./AddSong";
import SongDisplay from "./SongDisplay";
import "./Artist.scss";
import Web3 from "web3";

export class Artist extends Component {
  constructor(props) {
    super(props);
    this.web3 = new Web3(
      Web3.givenProvider || process.env.REACT_APP_GANACHECLI
    );
    this.state = {
      name: "",
      artistID: "",
      popularity: 0,
      songIDs: [],
      songs: [],
      query: "",
      form: false,
      audio: null,
      playing: false,
    };
  }

  componentDidMount() {
    this.loadArtistDetails().then(() => {
      this.loadSongDetails().then(() => {
        // toast.success(`Welcome ${this.state.name}! 🎤`);
      });
    });
  }

  loadArtistDetails = async () => {
    const contractInstance = await this.props.contract.deployed();
    const artistDetails = await contractInstance.getArtistDetails({
      from: this.props.account,
    });
    let songList = [];
    for (let i = 0; i < artistDetails[2].length; i++) {
      songList.push(artistDetails[2][i].toString());
    }
    this.setState({
      name: artistDetails[0].toString(),
      artistID: artistDetails[1].toString(),
      songIDs: songList,
    });
  };

  playAudio = (url) => {
    // let audioTag = <audio src={url} autoplay></audio>;
    window.open(url, "_blank");
    toast.success("Audio loaded");
  };

  // playAudio = async (cid) => {
  //   const client = this.props.web3storage;
  //   const res = await client.get(cid);
  //   console.log(`Got a response! [${res.status}] ${res.statusText}`);
  //   if (!res.ok) {
  //     throw new Error(
  //       `failed to get ${cid} - [${res.status}] ${res.statusText}`
  //     );
  //   }

  //   // unpack File objects from the response
  //   const files = await res.files();
  //   console.log(files);
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     let src = e.target.result;
  //     console.log(e.target);
  //     this.setState({ audio: new Audio(src) }, () => this.state.audio.play());
  //   };
  // reader.addEventListener("load", (event) => {
  //   // let src = event.target.result;
  //   let src = `http://${.cid}.ipfs.dweb.link`;
  //   console.log("src: ", src);
  // });
  // reader.readAsDataURL(file);
  // for (const file of files) {
  //   console.log(file);
  //   console.log(`http://${file.cid}.ipfs.dweb.link/${file.name}`);
  //   console.log(`${file.cid} -- ${file.path} -- ${file.size}`);
  // }
  // };

  loadSongDetails = async () => {
    const contractInstance = await this.props.contract.deployed();
    let songInfoList = [];
    for (let i = 0; i < this.state.songIDs.length; i++) {
      let songDetails = await contractInstance.getSongDetails(
        this.state.songIDs[i],
        { from: this.props.account }
      );
      songInfoList.push({
        name: songDetails[0],
        genre: songDetails[2],
        hash: songDetails[3],
        cost: songDetails[4].toString(),
        timesPurchased: songDetails[5].toString(),
      });
      this.state.popularity += parseInt(songDetails[5].toString());
    }
    // console.log(songInfoList);
    this.setState({ songs: songInfoList });
  };

  render() {
    return (
      <div id="artist" className="app d-flex flex-column container-fluid">
        <header className="d-flex justify-content-between align-items-center">
          <h1>Knack</h1>
          <p>
            <span>Popularity 💟: </span>
            <span>{this.state.popularity}</span>
          </p>
        </header>
        <main className="d-flex flex-grow-1">
          {/* <div className="col">
            <p>analytics</p>
          </div> */}
          <div className="col-8 d-flex flex-column align-items-center">
            <input
              type="search"
              name="query"
              id="query"
              className="form-control w-50 text-center mb-4"
              placeholder="Search a published song"
              onChange={(e) => this.setState({ query: e.target.value })}
            />

            {this.state.songs
              .filter((song) => {
                let name = song.name.toLowerCase();
                let query = this.state.query.toLowerCase();
                return name.includes(query);
              })
              .map((song) => (
                <div
                  class="card song w-75 bg-transparent mb-4 border-0 shadow overflow-hidden"
                  key={song.hash}
                >
                  <p
                    style={{ fontWeight: "bold", fontSize: "large" }}
                    class="card-header bg- "
                  >
                    {song.name}
                  </p>
                  <div class="card-body">
                    <p class="card-text">
                      <b>Genre: </b>
                      {song.genre}
                    </p>
                    <p class="card-text">
                      <b>Price: </b>
                      {this.web3.utils.fromWei(song.cost, "milliether")}
                    </p>
                    <p className="card-text">
                      <b>Times purchased: </b>
                      {song.timesPurchased}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        this.playAudio(`http://${song.hash}.ipfs.dweb.link`);
                      }}
                      class="btn btn-primary"
                    >
                      Play 🎶
                    </button>
                  </div>
                </div>
              ))}
          </div>
          <div className="col-3">
            <AddSong
              username={this.props.username}
              contract={this.props.contract}
              account={this.props.account}
              web3storage={this.props.web3storage}
              type={this.props.type}
            />
          </div>
        </main>
        <footer id="__play">
          <button
            className="btn"
            onClick={() => {
              {
                this.state.playing
                  ? this.state.audio.pause()
                  : this.state.audio.play();
              }
            }}
          >
            {this.state.playing ? "Pause" : "Play"}
          </button>
        </footer>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Artist);
