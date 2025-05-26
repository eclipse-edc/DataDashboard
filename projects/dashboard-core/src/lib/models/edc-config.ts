export interface EdcConfig {
  connectorName: string;
  managementUrl: string;
  defaultUrl: string;
  protocolUrl: string;
  apiToken?: string;
  controlUrl?: string;
  federatedCatalogEnabled: boolean;
  federatedCatalogUrl?: string;
  did?: string;
}
