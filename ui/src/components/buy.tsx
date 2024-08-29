import React from "react";
import { useListingStore } from "@/store/listing";
import { Button } from "@nextui-org/react";

export default function BuyItem() {
  const { isSelling, price } = useListingStore();

  const buyNft = () => {};

  return (
    <Button disabled={!isSelling || price === 0} onClick={buyNft}>
      Buy NFT
    </Button>
  );
}
