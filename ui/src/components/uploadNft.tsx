import { NftMarketAddress } from "@/config";
import { Card, CardBody, Input, Image, Button } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";

export default function UploadNft() {
  const { data: hash, isPending, writeContract } = useWriteContract();

  const [nftAddress, setNftAddress] = useState("" as `0x{string}`);
  const [tokenId, setTokenId] = useState("" as string);
  const [price, setPrice] = useState("");
  const [isListed, setIsListed] = useState(false);

  const tokenURI = useReadContract({
    address: nftAddress,
    abi: [
      {
        type: "function",
        name: "tokenURI",
        inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "view",
      },
    ],
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
  });

  const { data: listing } = useReadContract({
    address: NftMarketAddress,
    abi: [
      {
        type: "function",
        name: "getListing",
        inputs: [
          { name: "nftAddress", type: "address", internalType: "address" },
          { name: "tokenId", type: "uint256", internalType: "uint256" },
        ],
        outputs: [
          {
            name: "",
            type: "tuple",
            internalType: "struct NFTMarketplace.Listing",
            components: [
              { name: "price", type: "uint256", internalType: "uint256" },
              { name: "seller", type: "address", internalType: "address" },
            ],
          },
        ],
        stateMutability: "view",
      },
    ],
    functionName: "getListing",
    args: [nftAddress, BigInt(tokenId)],
  });

  const handleClick = async () => {
    if (!isListed) {
      writeContract({
        address: NftMarketAddress,
        abi: [
          {
            type: "function",
            name: "listItem",
            inputs: [
              { name: "nftAddress", type: "address", internalType: "address" },
              { name: "tokenId", type: "uint256", internalType: "uint256" },
              { name: "price", type: "uint256", internalType: "uint256" },
            ],
            outputs: [],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "listItem",
        args: [nftAddress, BigInt(tokenId), BigInt(price)],
      });
    } else {
      writeContract({
        address: NftMarketAddress,
        abi: [
          {
            type: "function",
            name: "updateListing",
            inputs: [
              { name: "nftAddress", type: "address", internalType: "address" },
              { name: "tokenId", type: "uint256", internalType: "uint256" },
              { name: "newPrice", type: "uint256", internalType: "uint256" },
            ],
            outputs: [],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "updateListing",
        args: [nftAddress, BigInt(tokenId), BigInt(price)],
      });
    }
  };

  useEffect(() => {
    if (listing?.price !== BigInt(0)) {
      setIsListed(true);
    } else {
      setIsListed(false);
    }
  });

  return (
    <div>
      <h1>Upload NFT</h1>
      <Input
        value={nftAddress}
        onChange={(e) => setNftAddress(e.target.value as `0x{String}`)}
        type="test"
        color="primary"
        placeholder="NFT Contract Address"
      />
      <Input
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        type="number"
        color="secondary"
        placeholder="NFT Token ID"
        disabled={nftAddress === undefined || nftAddress === null}
      />

      {nftAddress === ("" as `0x{String}`) || tokenId === "" ? (
        <div>Please input nft address and tokenId to search!</div>
      ) : (
        <div>
          <Card>
            <CardBody>
              <Image src={tokenURI.data} alt="NFT" />
            </CardBody>
          </Card>
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            color="primary"
            placeholder="Please input price"
          />
          <Button onClick={handleClick} isLoading={isPending}>
            Listing/Updating your NFT
          </Button>
          {hash ? <div>Transaction Hsah: {hash}</div> : <div></div>}
        </div>
      )}
    </div>
  );
}
