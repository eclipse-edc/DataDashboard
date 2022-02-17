import { Asset } from "../asset";
import { Policy } from "./policy";

export interface ContractOffer {
    id: string;
    policy: Policy;
    provider: string;
    consumer: string;
    asset: Asset;
}
