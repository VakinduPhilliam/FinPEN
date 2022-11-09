// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';
import '@chainlink/contracts/src/v0.8/ChainlinkClient.sol';

contract ContractInvoiceV3 is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    AggregatorV3Interface internal contractFeed;
    uint256 public storedContract;
    uint256 public results;
    bytes32 private jobId;
    uint256 private fee;

    event RequestContract(
        bytes32 indexed requestId,
        uint256 results
    );

    /**
     * Network: Rinkeby
     * Aggregator: ETH/USD
     * Address: 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
     */
    constructor() ConfirmedOwner(msg.sender) {
        contractFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
        setChainlinkToken(0xaa65AEf544822ba7Ce6F26Dd1627d02b258749B8);
        setChainlinkOracle(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
        jobId = '7d80a6486ef543a3abb52887f6707e3b';
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    /**
     * Returns the latest contract
     */
    function getLatestContract() public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        // Set the URL to perform the GET request on
        req.add('get', 'http://localhost:6006/graph');
        return sendChainlinkRequest(req, fee);
    }

    /**
    * Receive the response in the form of uint256
    */
    function fulfill( bytes32 _requestId, uint256 _results ) public recordChainlinkFulfillment(_requestId) {
        emit RequestContract(_requestId, _results);
        results = _results;
    }

    function storeLatestContract() external {
        storedContract = results;
    }
}

