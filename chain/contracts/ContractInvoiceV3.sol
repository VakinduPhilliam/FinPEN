// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract ContractInvoiceV3 {

    AggregatorV3Interface internal contractFeed;
    int public storedContract;


    /**
     * Network: Rinkeby
     * Aggregator: ETH/USD
     * Address: 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
     */
    constructor() {
        contractFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
    }

    /**
     * Returns the latest contract
     */
    function getLatestContract() public view returns (int) {
        (
            /*uint80 roundID*/,
            int contract,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = contractFeed.latestRoundData();
        return contract;
    }

    function storeLatestContract() external {
        storedContract = getLatestContract();
    }
}

