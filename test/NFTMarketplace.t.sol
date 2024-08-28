// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {IERC721Receiver} from "openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";
import {NFTMarketplace} from "../src/NFTMarketplace.sol";
import {SpongeBobToken} from "../src/ERC721.sol";

contract NFTMarketplaceTest is Test, IERC721Receiver {
    SpongeBobToken public spongeBobToken;
    NFTMarketplace public nftMarketplace;

    event ERC721Received(
        address indexed operator,
        address indexed from,
        uint256 indexed tokenId,
        bytes data
    );

    function setUp() public {
        spongeBobToken = new SpongeBobToken();
        nftMarketplace = new NFTMarketplace();
    }

    function testListItemSuccessful() public {
        spongeBobToken.safeMint(address(this), "");
        spongeBobToken.approve(address(nftMarketplace), 0);

        vm.expectEmit(true, true, true, true, address(nftMarketplace));
        emit NFTMarketplace.ItemListed(
            address(this),
            address(spongeBobToken),
            0,
            1 ether
        );

        nftMarketplace.listItem(address(spongeBobToken), 0, 1 ether);

        NFTMarketplace.Listing memory listedItem = nftMarketplace.getListing(
            address(spongeBobToken),
            0
        );

        assertEq(listedItem.price, 1 ether);
        assertEq(listedItem.seller, address(this));
    }

    function testListItemWithPriceMustAboveZero() public {
        spongeBobToken.safeMint(address(this), "");
        spongeBobToken.approve(address(nftMarketplace), 0);

        vm.expectRevert(NFTMarketplace.PriceMustAboveZero.selector);

        nftMarketplace.listItem(address(spongeBobToken), 0, 0);
    }

    function testListItemWithAlreadyListedRevert() public {
        spongeBobToken.safeMint(address(this), "");
        spongeBobToken.approve(address(nftMarketplace), 0);

        nftMarketplace.listItem(address(spongeBobToken), 0, 1 ether);

        vm.expectRevert(
            abi.encodeWithSelector(
                NFTMarketplace.AlreadyListed.selector,
                address(spongeBobToken),
                0
            )
        );

        nftMarketplace.listItem(address(spongeBobToken), 0, 2 ether);
    }

    function testListItemWithNotOwnerRevert() public {
        spongeBobToken.safeMint(
            address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266),
            ""
        );
        vm.prank(address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266));
        spongeBobToken.approve(address(nftMarketplace), 0);

        vm.expectRevert(NFTMarketplace.notOwner.selector);

        nftMarketplace.listItem(address(spongeBobToken), 0, 1 ether);
    }

    function testCancelListingSuccessful() public {
        spongeBobToken.safeMint(address(this), "");
        spongeBobToken.approve(address(nftMarketplace), 0);

        nftMarketplace.listItem(address(spongeBobToken), 0, 1 ether);

        vm.expectEmit(true, true, true, false, address(nftMarketplace));
        emit NFTMarketplace.ItemCanceled(
            address(this),
            address(spongeBobToken),
            0
        );

        nftMarketplace.cancelListing(address(spongeBobToken), 0);
    }

    function testBuyItemSuccessful() public {
        spongeBobToken.safeMint(
            address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266),
            ""
        );
        vm.prank(address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266));
        spongeBobToken.approve(address(nftMarketplace), 0);
        vm.prank(address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266));
        nftMarketplace.listItem(address(spongeBobToken), 0, 1 ether);

        nftMarketplace.buyItem{value: 1 ether}(address(spongeBobToken), 0);

        assertEq(spongeBobToken.ownerOf(0), address(this));
    }

    function testBuyItemWithPriceNotMetRevert() public {
        spongeBobToken.safeMint(
            address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266),
            ""
        );
        vm.prank(address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266));
        spongeBobToken.approve(address(nftMarketplace), 0);
        vm.prank(address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266));
        nftMarketplace.listItem(address(spongeBobToken), 0, 1 ether);

        vm.expectRevert(
            abi.encodeWithSelector(
                NFTMarketplace.PriceNotMet.selector,
                address(spongeBobToken),
                0,
                1 ether
            )
        );
        nftMarketplace.buyItem{value: 0.5 ether}(address(spongeBobToken), 0);
    }

    function testUpdateListingSuccessful() public {
        spongeBobToken.safeMint(address(this), "");
        spongeBobToken.approve(address(nftMarketplace), 0);

        nftMarketplace.listItem(address(spongeBobToken), 0, 1 ether);

        vm.expectEmit(true, true, true, true, address(nftMarketplace));
        emit NFTMarketplace.ItemListed(
            address(this),
            address(spongeBobToken),
            0,
            2 ether
        );

        nftMarketplace.updateListing(address(spongeBobToken), 0, 2 ether);
    }

    function testWithdrawProceedsSuccessful() public {
        spongeBobToken.safeMint(
            address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266),
            ""
        );
        vm.prank(address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266));
        spongeBobToken.approve(address(nftMarketplace), 0);
        vm.prank(address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266));
        nftMarketplace.listItem(address(spongeBobToken), 0, 1 ether);

        nftMarketplace.buyItem{value: 1 ether}(address(spongeBobToken), 0);

        assertEq(
            nftMarketplace.getProceeds(
                address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
            ),
            1 ether
        );

        vm.prank(address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266));
        nftMarketplace.withdrawProceeds();

        assertEq(
            nftMarketplace.getProceeds(
                address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
            ),
            0
        );
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        emit ERC721Received(operator, from, tokenId, data);
        return IERC721Receiver.onERC721Received.selector;
    }
}
