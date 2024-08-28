// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script} from "forge-std/Script.sol";
import {SpongeBobToken} from "../src/ERC721.sol";
import {NFTMarketplace} from "../src/NFTMarketplace.sol";

contract NFTMarketplaceScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint(
            "PRIVATE_KEY" // only for local deploy
        );
        vm.startBroadcast(deployerPrivateKey);

        SpongeBobToken spongeBobToken = new SpongeBobToken();
        spongeBobToken.safeMint(
            address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266),
            "0"
        );
        spongeBobToken.safeMint(
            address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266),
            "1"
        );

        new NFTMarketplace();

        vm.stopBroadcast();
    }
}
