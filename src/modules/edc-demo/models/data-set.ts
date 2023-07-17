import {Policy} from "../../mgmt-api-client";

export interface DataSet {
  id: string;
  offers: { [key: string]: Policy; },
  distributions?: { [key: string]: string; };
  properties?: { [key: string]: string; };
}
