import React, { Component } from "react";
import { connect } from "react-redux";
import Loading from "./Loading";
import SongDisplay from "./SongDisplay";
import Web3 from "web3";
import { toast } from "react-toastify";
import "./Listener.scss";

export class Listener extends Component {
  constructor(props) {
    super(props);
    this.web3 = new Web3(
      Web3.givenProvider || process.env.REACT_APP_GANACHECLI
    );
    this.state = {
      name: "",
      listenerID: "",
      store: [],
      library: [],
      songsMapping: {},
      query: "",
      supportArtistUsername: "",
      donation: "",
      loading: true,
      view: "Library",
    };
  }

  buySong = async (id, cost) => {
    const contractInstance = await this.props.contract.deployed();
    await contractInstance.buySong(id, {
      from: this.props.account,
      value: cost,
    });
  };

  playAudio = (url) => {
    // let audioTag = <audio src={url} autoplay></audio>;
    window.open(url, "_blank");
    toast.success("Audio loaded");
  };

  componentDidMount() {
    this.loadStore().then(() => {
      this.loadListenerDetails().then(() => {
        this.loadSongDetails().then(() => {
          this.setState({ loading: false }, () => {
            toast.success("Fetched listener's data");
          });
        });
      });
    });
  }

  loadStore = async () => {
    const contractInstance = await this.props.contract.deployed();
    const count = await contractInstance.getNumSongs({
      from: this.props.account,
    });
    let mapping = {};
    for (let i = 1; i < parseInt(count.toString()) + 1; i++) {
      mapping[i] = 0;
    }
    this.setState({ songsMapping: mapping });
  };

  loadListenerDetails = async () => {
    const contractInstance = await this.props.contract.deployed();
    const listenerDetails = await contractInstance.getListenerDetails({
      from: this.props.account,
    });
    let mapping = this.state.songsMapping;
    for (let i = 0; i < listenerDetails[2].length; i++) {
      mapping[parseInt(listenerDetails[2][i].toString())] = 1;
    }
    this.setState({
      name: listenerDetails[0].toString(),
      listenerID: listenerDetails[1].toString(),
      songsMapping: mapping,
    });
  };

  loadSongDetails = async () => {
    const contractInstance = await this.props.contract.deployed();
    let n = Object.keys(this.state.songsMapping).length;
    let newSongs = [];
    let purchasedSongs = [];

    for (let i = 1; i < n + 1; i++) {
      let songDetails = await contractInstance.getSongDetails(i, {
        from: this.props.account,
      });
      if (this.state.songsMapping[i] === 1) {
        purchasedSongs.push({
          name: songDetails[0],
          artist: songDetails[1],
          genre: songDetails[2],
          hash: songDetails[3],
          cost: songDetails[4].toString(),
          songID: i,
        });
      } else {
        newSongs.push({
          name: songDetails[0],
          artist: songDetails[1],
          genre: songDetails[2],
          hash: songDetails[3],
          cost: songDetails[4].toString(),
          songID: i,
        });
      }
    }

    this.setState({
      library: purchasedSongs,
      store: newSongs,
    });
  };

  onSubmitClick = async (event) => {
    event.preventDefault();
    if (this.state.supportArtistUsername) {
      const contractInstance = await this.props.contract.deployed();
      await contractInstance
        .donateArtist(this.state.supportArtistUsername, {
          from: this.props.account,
          value: this.web3.utils.toWei(this.state.donation, "milliether"),
        })
        .then(() => {
          window.location.reload();
        });
    }
    toast("Published");
  };

  render() {
    if (this.state.ID === "") {
      return <Loading />;
    } else {
      return (
        <div id="listener" className="app d-flex flex-column container-fluid">
          <header className="d-flex justify-content-between align-items-center">
            <h1>Knack</h1>
            <p>
              <b
                className="btn btn-link"
                onClick={() => {
                  if (this.state.view === "Library") {
                    this.setState({ view: "Store" });
                  } else {
                    this.setState({ view: "Library" });
                  }
                }}
              >
                View:{" "}
              </b>
              {this.state.view === "Library" ? "Library" : "Store"}
            </p>
            <p>
              <span>Songs owned 🎧: </span>
              <span>
                {/* {this.state.songsMapping && this.state.songsMapping.length} */}
              </span>
            </p>
          </header>
          <main className="d-flex flex-grow-1">
            <div className="col-8 d-flex flex-column align-items-center">
              <input
                type="search"
                name="query"
                id="query"
                className="form-control w-50 text-center mb-4"
                placeholder="Search a published song"
                onChange={(e) => this.setState({ query: e.target.value })}
              />
              {this.state.view === "Library" ? (
                <div>
                  {this.state.library
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
                            <b>Artist: </b>
                            {song.artist}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              console.log("buy");
                            }}
                            class="btn btn-primary"
                          >
                            Play
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div>
                  {this.state.store
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
                            <b>Artist: </b>
                            {song.artist}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              this.buySong(song.songID, song.cost);
                              console.log(song.songID);
                            }}
                            class="btn btn-primary"
                          >
                            Buy 💰
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <form>
              <div>
                <h3 className="mb-3">Sponsor Artist</h3>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Artist Username"
                  value={this.state.supportArtistUsername}
                  required
                  onChange={(x) => {
                    this.setState({ supportArtistUsername: x.target.value });
                  }}
                />
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Amount in mETH"
                  value={this.state.donation}
                  required
                  onChange={(x) => {
                    this.setState({ donation: x.target.value });
                  }}
                />
                <input
                  type="submit"
                  onClick={this.onSubmitClick}
                  value="Donate"
                  className="btn btn-success"
                />
              </div>
            </form>
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
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Listener);
