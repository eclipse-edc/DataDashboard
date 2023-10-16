import {Policy} from "../../mgmt-api-client";
import {DataService} from "./data-service";

export interface ContractOffer {
  id: string;
  assetId: string;
  properties: any;
  "dcat:dataset": Array<any>;
  "dcat:service": DataService;
  policy: Policy;
  originator: string;
}
