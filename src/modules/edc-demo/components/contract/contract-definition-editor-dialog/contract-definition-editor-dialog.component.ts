import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {
  AssetService, PolicyService
} from "../../../../mgmt-api-client";
import { Asset, ContractDefinitionInput, PolicyDefinition } from "../../../../mgmt-api-client/model"

@Component({
  selector: 'edc-demo-contract-definition-editor-dialog',
  templateUrl: './contract-definition-editor-dialog.component.html',
  styleUrls: ['./contract-definition-editor-dialog.component.scss']
})
export class ContractDefinitionEditorDialog implements OnInit {
  policies: Array<PolicyDefinition> = [];
  availableAssets: Asset[] = [];
  accessPolicy?: PolicyDefinition;
  contractPolicy?: PolicyDefinition;
  assets: Asset | Asset[] = [];
  publishToMarketplace = false;

  contractDefinition: ContractDefinitionInput = {
    "@id": '',
    assetsSelector: [],
    accessPolicyId: undefined!,
    contractPolicyId: undefined!
  };

  constructor(private policyService: PolicyService,
              private assetService: AssetService,
              private dialogRef: MatDialogRef<ContractDefinitionEditorDialog>,
              @Inject(MAT_DIALOG_DATA) contractDefinition?: ContractDefinitionInput) {
    if (contractDefinition) {
      this.contractDefinition = contractDefinition;
    }
  }

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
    const hasAsset = Array.isArray(this.assets)
      ? this.assets.length > 0
      : !!this.assets;

    return !!this.contractDefinition['@id']?.trim()
      && !!this.accessPolicy
      && !!this.contractPolicy
      && hasAsset;
  }


  onSave(): void {
    this.contractDefinition.accessPolicyId = this.accessPolicy!['@id']!;
    this.contractDefinition.contractPolicyId = this.usagePolicy!['@id']!;


    const selectedAssets = Array.isArray(this.assets) ? this.assets : [this.assets];

    const ids = selectedAssets.map(asset => asset.id);

    this.contractDefinition.assetsSelector = [
      ...this.contractDefinition.assetsSelector,
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
