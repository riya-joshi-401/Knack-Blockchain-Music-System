![image](https://user-images.githubusercontent.com/53979947/160265717-e63fbf2b-bdf6-47d2-90ad-38a4635b42e7.png)
## Problem Statement:
Music is known to be effective for mood improvement. It has the power to change ones overall frame of mind. Music also plays a very big role in changing the atmosphere and influencing the ambience of any place. Seeing how much of a great impact music has on everyone’s lives we need a stable service to fulfil a few requirements that would make listening to music a better experience.
## Motivation:
The music industry has grown exponentially in the past few years with the success of digital music streaming services. However, the major music streaming platforms are centralized, and as a result, the artists lack control over their content. A technology that can improve the transparency and provide more control to the artists over the money they make can revolutionize the industry. The direct interaction between consumers and artists would also eliminate the need for intermediateries from the revenue stream.
## Our Solution:
A blockchain-based decentralized music streaming platform to connect music enthusiasts directly to independent music artists. The artists can use this platform to share their music with greater freedom while ensuring ownership and avoiding duplication of their music. People can listen to their favourite songs and support the artists by making micropayments through our custom crypto tokens.
## Architecture:
![Untitled design](https://user-images.githubusercontent.com/53979947/160265658-1ced9b83-712c-40b0-ba4e-d75be6b9ff8c.png)
## Features implemented:
1. Recommendation of music (if a user searches ‘gaye’, results should be udd gaye and other songs with ‘Gaye’ in their names) (youtube music)
2. Identification of music (via smart contracts/NFTs)
3. Streaming the music uploaded by the artist
4. Artist revenue generation
## Technology Stack:
1. React.js
2. Node.js
3. Web3.Storage
4. Solidity
5. Truffle
6. Ganache
7. Metamask
## Setup:
- Install and setup Ganache, Truffle and Metamask (chrome extension)
- Clone the repository
``` 
git clone https://github.com/riya-joshi-401/Knack-Blockchain-Music-System.git
```
- Setup a workspace of knack on Ganache
- Connect Metamask to the Ganache workspace
- Migrate the Contracts
```
truffle migrate
```
- Start the React App
```
npm start
```
