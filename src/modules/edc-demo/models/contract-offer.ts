import {DataService} from "./data-service";
import {PolicyInput} from "../../mgmt-api-client/model";

export interface ContractOffer {
  id: string;
  assetId: string;
  properties: any;
  "dcat:dataset": Array<any>;
  "dcat:service": DataService;
  policy: PolicyInput;
  originator: string;
}
