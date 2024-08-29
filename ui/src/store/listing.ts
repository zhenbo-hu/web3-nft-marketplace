import { createStore } from "hox";
import { useState } from "react";

export const [useListingStore, ListingStoreProvider] = createStore(() => {
    const [isSelling, setIsSelling] = useState(false);
    const [price, setPrice] = useState(0);

    return {
        isSelling,
        setIsSelling,
        price,
        setPrice,
    }
})