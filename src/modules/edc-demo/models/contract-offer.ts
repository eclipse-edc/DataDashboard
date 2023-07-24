import { Asset } from "./asset";
import {Policy} from "../../mgmt-api-client";
import {DataService} from "./data-service";

export interface ContractOffer {
  id: string;
  contractOffers: Array<string>;
  "dcat:dataset": Array<any>;
  "dcat:service": DataService;
  asset: Asset;
  policy: Policy;
  "edc:originator": string;
}
