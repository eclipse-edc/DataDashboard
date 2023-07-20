import { Asset } from "./asset";
import {Policy} from "../../mgmt-api-client";
import {DataService} from "./data-service";

export interface ContractOffer {
  id: string;
  contractOffers: Array<string>;
  datasets: Array<any>;
  dataServices: Array<DataService>;
  properties?: { [key: string]: string; };
  asset: Asset;
  policy: Policy;
  originator: string;
}
