export interface DataRequest {
    id: string;
    edctype: string;
    connectorAddress: string;
    protocol: string;
    connectorId: string;
    dataEntry: {
        id: string;
        policyId: string;
    };
    dataDestination: {
        type: string;
    };
    managedResources: boolean;
    transferType: {
        contentType: string;
        isFinite: boolean;
    }
}