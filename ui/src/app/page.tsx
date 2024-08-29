"use client";

import Listing from "@/components/listing";
import Header from "@/components/header";
import { ListingStoreProvider } from "@/store/listing";
import BuyItem from "@/components/buy";

function App() {
  return (
    <div>
      <Header />
      <ListingStoreProvider>
        <Listing />
        <BuyItem />
      </ListingStoreProvider>
    </div>
  );
}

export default App;
