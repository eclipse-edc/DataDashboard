import { AssetSelectorExpression } from "./asset-selector-expression";
import { Policy } from "./policy";

export interface ContractDefinition {
    id: string;
    selectorExpression: AssetSelectorExpression;
    accessPolicy: Policy;
    contractPolicy: Policy;
}