export interface AssetEntry {
    asset: Asset;
    dataAddress: DataAddress;
}

interface Asset {
    properties: AssetProperties;
}

interface AssetProperties {
    "asset:prop:name": string;
    "asset:prop:version": string;
    "asset:prop:id": string;
}

interface DataAddress {
    properties?: DataAddressProperties;
    type: string;
    keyName?: string;
}

interface DataAddressProperties {
    [key: string]: string;
}
