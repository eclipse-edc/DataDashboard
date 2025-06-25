import { QuerySpec } from ".";
import { JsonLdId } from "./jsonld";

export interface CatalogRequest {
  providerUrl: string;
  // counterPartyAddress: string;
  // counterPartyId?: string;
  querySpec?: QuerySpec;
}

export interface DatasetRequest {
  "@id": string,
  counterPartyAddress: string;
  querySpec?: QuerySpec;
}

export class Catalog extends JsonLdId {

  get datasets(): Dataset[] {
    return this.arrayOf(() => new Dataset(), 'dcat', 'dataset');
  }
}

export class Dataset extends JsonLdId {

  get offers(): Offer[] {
    return this.arrayOf(() => new Offer(), 'http://www.w3.org/ns/odrl/2', 'hasPolicy');
  }

  get title(): string | undefined {
    return this.optionalValue('dct', 'title');
  }
}

export class Offer extends JsonLdId {

  get assetId(): string {
    return this.target;
  }

  get target(): string {
    return this.mandatoryValue('odrl', 'target');
  }
}
