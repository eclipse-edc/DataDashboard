import {DataAddress} from "@think-it-labs/edc-connector-client";

export interface TransferRequest {
  '@context'?: {
    odrl: string;
  }
  managedResources?: boolean;
  transferType?: {
    contentType: string,
    isFinite: boolean
  },
  type?: string;
  assetId?: string;
  connectorAddress?: string;
  connectorId?: string;
  contractId?: string;
  dataDestination?: DataAddress;
  privateProperties?: {
    receiverHttpEndpoint: string | undefined;
  };
  /**
   * Deprecated as this field is not used anymore, please use privateProperties instead
   */
  properties?: { [key: string]: string; };
  protocol?: string;

}
