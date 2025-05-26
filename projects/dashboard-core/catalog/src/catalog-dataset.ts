import { Dataset } from '@think-it-labs/edc-connector-client';
import { Policy } from '@think-it-labs/edc-connector-client/dist/src/entities/policy';

export interface CatalogDataset {
  id: string;
  participantId: string;
  assetId: string;
  dataset: Dataset;
  offers: Map<string, Policy>;
  originator: string;
}
