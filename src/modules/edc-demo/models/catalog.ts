import { ContractOffer } from './contract-offer';
import { DataService } from "./data-service";

export interface Catalog {
    id?: string;
    contractOffers?: Array<ContractOffer>;
    "dcat:dataset": Array<any>;
    "dcat:service": DataService;
    "edc:originator": string;
}
