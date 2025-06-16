import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Asset, ContractDefinitionInput, PolicyDefinition } from '../../../mgmt-api-client/model';

@Component({
  selector: 'edc-demo-contract-definition-editor-dialog',
  templateUrl: './contract-definition-editor-dialog.component.html',
  styleUrls: ['./contract-definition-editor-dialog.component.scss']
})
export class ContractDefinitionEditorDialog implements OnInit {
  policies: Array<PolicyDefinition> = [];
  availableAssets: Asset[] = [];

  accessPolicy: PolicyDefinition | undefined;
  usagePolicy: PolicyDefinition | undefined;
  assets: Asset[] = [];
  publishToMarketplace = false;

  contractDefinition: ContractDefinitionInput = {
    "@id": '',
    assetsSelector: [],
    accessPolicyId: undefined!,
    contractPolicyId: undefined!
  };

  constructor(private dialogRef: MatDialogRef<ContractDefinitionEditorDialog>) {}

  ngOnInit(): void {
    // Mock policies
    (this.policies as any) = [
      { '@id': 'policy-1' },
      { '@id': 'policy-2' },
      { '@id': 'policy-3' }
    ];

    // Mock assets
    (this.availableAssets as any) = [
      { id: 'asset-1' },
      { id: 'asset-2' },
      { id: 'asset-3' }
    ];

  }

  get isFormValid(): boolean {
    return !!this.contractDefinition['@id']?.trim()
      && !!this.accessPolicy
      && !!this.usagePolicy
      && this.assets.length > 0;
  }


  onSave(): void {
    this.contractDefinition.accessPolicyId = this.accessPolicy!['@id']!;
    this.contractDefinition.contractPolicyId = this.usagePolicy!['@id']!;

    const ids = this.assets.map(asset => asset.id);
    this.contractDefinition.assetsSelector = [
      {
        operandLeft: 'https://w3id.org/edc/v0.0.1/ns/id',
        operator: 'in',
        operandRight: ids,
      }
    ];

    this.dialogRef.close({
      contractDefinition: this.contractDefinition,
      publishToMarketplace: this.publishToMarketplace
    });
  }
}
