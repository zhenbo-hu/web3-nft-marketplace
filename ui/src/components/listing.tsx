import { config, NativeCurrencyDecimals, NftMarketAddress } from "@/config";
import { useListingStore } from "@/store/listing";
import { Input } from "@nextui-org/input";
import { Card, CardBody, CardHeader, Image } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useReadContract } from "wagmi";

export default function Listing() {
  const currencySymbol = config.chains[0].nativeCurrency.symbol;
  const [address, setAddress] = useState("" as `0x{String}`);
  const [tokenId, setTokenId] = useState("");

  const { setIsSelling, setPrice } = useListingStore();

  const tokenURI = useReadContract({
    address: address,
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
    args: [address, BigInt(tokenId)],
  });

  useEffect(() => {
    if (
      listing === undefined ||
      listing.price !== undefined ||
      listing.price !== null ||
      listing.price !== 0
    ) {
      setIsSelling(true);
      setPrice(Number(listing?.price) / NativeCurrencyDecimals);
    }
  });

  return (
    <div>
      <Input
        value={address}
        onChange={(e) => setAddress(e.target.value as `0x{String}`)}
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
        disabled={address === undefined || address === null}
      />

      {address === ("" as `0x{String}`) || tokenId === "" ? (
        <div>Please input nft address and tokenId to search!</div>
      ) : (
        <Card>
          {listing === undefined ||
          listing.price === undefined ||
          listing.price === null ||
          listing.price === BigInt(0) ? (
            <div>Not in selling!</div>
          ) : (
            <div>
              <CardHeader>
                <p>
                  Price: {Number(listing.price) / NativeCurrencyDecimals}{" "}
                  {currencySymbol}
                </p>
              </CardHeader>
              <CardBody>
                <Image src={tokenURI.data} alt="NFT" />
              </CardBody>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
