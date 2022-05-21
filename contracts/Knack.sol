// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Knack {
    // defining trackers
    uint256 listenerIDTracker;
    uint256 artistIDTracker;
    uint256 songIDTracker;

    // usertypes
    enum UserType {
        UNDEFINED,
        ARTIST,
        LISTENER
    }

    // defining users
    struct Artist {
        string name;
        uint256 artistID;
        uint256[] songsPublished;
    }

    struct Listener {
        string name;
        uint256 listenerID;
        uint256[] songsPurchased;
        mapping(uint256 => bool) isSongPurchased;
    }

    // defining song struct
    struct Song {
        string songName;
        string artistName;
        string genre;
        string hash;
        uint256 songID;
        uint256 price;
        address payable artistAddress;
    }

    // mappings
    mapping(address => UserType) identifyUser;
    mapping(address => Artist) allArtists;
    mapping(address => Listener) allListeners;
    mapping(uint256 => Song) allSongs;
    mapping(uint256 => uint256) timesSongPurchased;
    mapping(string => bool) songHashUsed;
    mapping(string => address payable) getArtistAddress;

    // methods
    constructor() {
        songIDTracker = 0;
        artistIDTracker = 0;
        listenerIDTracker = 0;
    }

    function getNumSongs() public view returns (uint256) {
        return songIDTracker;
    }

    function checkUser() public view returns (UserType) {
        return identifyUser[msg.sender];
    }

    // create users
    function addNewListener(string memory _name) public {
        listenerIDTracker += 1;

        Listener storage newListener = allListeners[msg.sender];
        newListener.name = _name;
        newListener.listenerID = listenerIDTracker;

        identifyUser[msg.sender] = UserType.LISTENER;
    }

    function addNewArtist(string memory _name) public {
        artistIDTracker += 1;

        Artist memory newArtist;
        newArtist.name = _name;
        newArtist.artistID = artistIDTracker;
        getArtistAddress[_name] = payable(msg.sender);

        allArtists[msg.sender] = newArtist;
        identifyUser[msg.sender] = UserType.ARTIST;
    }

    // fetch user details
    function getListenerDetails()
        public
        view
        returns (
            string memory,
            uint256,
            uint256[] memory
        )
    {
        return (
            allListeners[msg.sender].name,
            allListeners[msg.sender].listenerID,
            allListeners[msg.sender].songsPurchased
        );
    }

    function getArtistDetails()
        public
        view
        returns (
            string memory,
            uint256,
            uint256[] memory
        )
    {
        return (
            allArtists[msg.sender].name,
            allArtists[msg.sender].artistID,
            allArtists[msg.sender].songsPublished
        );
    }

    // create song
    event songAdded(
        uint256 songID,
        string songName,
        string artistName,
        uint256 price
    );

    function addSong(
        string memory _name,
        string memory _genre,
        string memory _hash,
        uint256 _price
    ) public {
        require(identifyUser[msg.sender] == UserType.ARTIST, "Not an artist.");
        require(!songHashUsed[_hash], "Duplicate hash has been detected.");

        songIDTracker += 1;

        Song memory newSong;
        newSong.songID = songIDTracker;
        newSong.songName = _name;
        newSong.artistName = allArtists[msg.sender].name;
        newSong.genre = _genre;
        newSong.hash = _hash;
        newSong.price = _price;
        newSong.artistAddress = payable(msg.sender);

        timesSongPurchased[songIDTracker] = 0;

        allSongs[songIDTracker] = newSong;
        allArtists[msg.sender].songsPublished.push(songIDTracker);
        songHashUsed[_hash] = true;

        emit songAdded(
            newSong.songID,
            newSong.songName,
            newSong.artistName,
            newSong.price
        );
    }

    // buy song
    event songPurchased(
        uint256 songID,
        string songName,
        string listenerName,
        uint256 price
    );

    function buySong(uint256 _songID) public payable {
        require(
            identifyUser[msg.sender] == UserType.LISTENER,
            "Not a listener profile."
        );
        require(
            !allListeners[msg.sender].isSongPurchased[_songID],
            "Song already purchased."
        );

        Song memory curSong = allSongs[_songID];

        require(
            msg.value == (curSong.price * 1 wei),
            "Amount payed does not match price of the song."
        );
        require(
            msg.sender.balance > msg.value,
            "Insufficient balance to proceed."
        );

        curSong.artistAddress.transfer(msg.value);
        timesSongPurchased[_songID] += 1;

        allListeners[msg.sender].songsPurchased.push(_songID);
        allListeners[msg.sender].isSongPurchased[_songID] = true;

        emit songPurchased(
            curSong.songID,
            curSong.songName,
            allListeners[msg.sender].name,
            msg.value
        );
    }

    // support artist by donation
    event artistDonated(string artistName, string listenerName, uint256 amount);

    function donateArtist(string memory artistName) public payable {
        require(
            identifyUser[msg.sender] == UserType.LISTENER,
            "Not a listener profile."
        );
        require(
            msg.sender.balance > msg.value,
            "Insufficient balance to proceed."
        );

        getArtistAddress[artistName].transfer(msg.value);

        emit artistDonated(
            artistName,
            allListeners[msg.sender].name,
            msg.value
        );
    }

    // fetch song details
    function getSongDetails(uint256 _songID)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            uint256,
            uint256
        )
    {
        return (
            allSongs[_songID].songName,
            allSongs[_songID].artistName,
            allSongs[_songID].genre,
            allSongs[_songID].hash,
            allSongs[_songID].price,
            timesSongPurchased[_songID]
        );
    }
}
