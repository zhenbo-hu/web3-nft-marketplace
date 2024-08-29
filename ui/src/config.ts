import { http, createConfig } from 'wagmi'
import { mainnet, polygon, polygonAmoy } from 'wagmi/chains'

export const config = createConfig({
    chains: [polygonAmoy, mainnet, polygon],
    transports: {
        [polygonAmoy.id]: http(),
        [mainnet.id]: http(),
        [polygon.id]: http(),
    },
})

declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}

export interface Listing {
    price: number;
    seller: string;
}

export const NftMarketAddress = "0x02aD8896536dA9eB7E35BbB50F97B6e5E0d5c39C" as `0x{string}`;
export const NativeCurrencyDecimals = 1e9;