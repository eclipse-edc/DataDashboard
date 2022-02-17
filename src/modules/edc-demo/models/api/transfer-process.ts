export interface TransferProcess {
    id: string;
    type: string;
    state: number;
    stateTimestamp: string;
    errorDetail: string;
    connectorAddress: string;
    protocol: string;
    connectorId: string;
    assetId: string;
    contractId: string;
    dataDestinationType: string;
    destinationAddress: string;
}