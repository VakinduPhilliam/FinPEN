
# Fin PEN (Financial Payment Elevation Network):

Fin PEN is an AI powered blockchain DApp built to convert real-world business contracts into tamper-proof smart contracts. 

You can call FinPEN the "Poor person's contract Lawyer."

<br/>

## System Design:

A client takes a photo of a real-world business contract and uploads it to the app. The app's image processing AI captures the contract's data and the data captured is added to Chainlink's blockchain as a smart contract. 

<br/>

_Fin PEN System Design Architecture:_

![Fin PEN System Design Architecture](/docs/system_design.png)

<br/>

_Fin PEN User Interface:_

![Fin PEN User Interface](/docs/FinPIN_UI.png)

<br/>

_Fin PEN Graph User Interface:_

![Fin PEN Graph User Interface](/docs/Header.png)

<br/>

## Fin PEN Installation:

Install the following applications on your PC before installing Fin PEN.

- [Node.JS](https://nodejs.org/en/download/current/), v16.9.1 

- Redis (For Linux Users), v7.21.1

- [Memurai](https://www.memurai.com/get-memurai) (For Windows Users), v2.0.3.

- Python3 (And install python dependencies, OpenCV (CV2) and PyTesseract).

- Pip8 or greater (for managing python dependency installations).

- [Tesseract](https://github.com/tesseract-ocr/tesseract/wiki) (used for image text extraction). Also go to your ‘routes/analyzer.py’ file and update the ‘pytesseract’ configuration variable `pytesseract.pytesseract.tesseract_cmd` to reflect where the tesseract files are installed and located on your PC.

- [Metamask](https://metamask.io/)

</br>

### Download Fin PEN:

First, download or clone Fin PEN from Github:

Go to https://github.com/VakinduPhilliam/FinPEN and download or clone Fin PEN.

Then install Node.JS project dependency.

</br>

### Install Backend 'chain' NPM dependencies:

Unzip the downloand and Go to the 'chain' folder by entering 'cd chain' in the projects CLI terminal.

Install dependencies.

</br>

_cd chain_

</br>

_npm install_

</br>

To compile contracts:

</br>

_npx hardhat compile_

</br>

To deploy contracts:

</br>

npx hardhat run --network rinkeby scripts/deploy.js

</br>


### Install Frontend NPM dependencies:

Go back to the project's main folder and install the app's frontend npm dependency modules. 

</br>

_npm install_

</br>

Then install python dependencies (Make sure to have pip8 or greater installed).

</br>

_npm run pyinstall_

</br>

## Running Fin PEN:

You can now run the Fin PEN app by executing the CLI command below.

_npm start_

</br>

If the run was successful, you should see the message "Fin PEN started successfully on Port 6006" in your console.

Open your browser and visit 'http://localhost:6006'. 

The Fin PEN User Interface will look like below.

<br/>

_Fin PEN User Interface:_

![Fin PEN User Interface](/docs/FinPIN_UI.png)

</br>

## Uploading a Business Contract:

Now let’s analyze a business contract.

Take a photo of an business contract, (or use one of these [demo receipts](/demos/)) and upload it to Fin PEN for analysis.

Fin PEN will start processing the contract (this could take several minutes).

The Fin PEN app will capture the contract's data, analyse the results and plot a graph displaying the results of the analysis.

The Fin PEN Graph of the analysis will look like below.

<br/>

_Fin PEN User Interface with Analyzed Data Graph:_

![Fin PEN Data Graph](/docs/FinPIN_Graph.png)

