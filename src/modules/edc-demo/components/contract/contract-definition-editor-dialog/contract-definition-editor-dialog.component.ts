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
    this.policyService.queryAllPolicies().subscribe(policyDefinitions => {
      this.policies = policyDefinitions;
      this.accessPolicy = this.policies.find(policy => policy['@id'] === this.contractDefinition.accessPolicyId);
      this.contractPolicy = this.policies.find(policy => policy['@id'] === this.contractDefinition.contractPolicyId);
    });
    this.assetService.requestAssets().subscribe(assets => {
      this.availableAssets = assets;
      // preselection
      if (this.contractDefinition) {
        const assetIds = this.contractDefinition.assetsSelector.map(c => c.operandRight?.toString());
        this.assets = this.availableAssets.filter(asset => assetIds.includes(asset.id));
      }
    })
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
    const selectedAsset = Array.isArray(this.assets) ? this.assets[0] : this.assets;

    const contractDefinition = {
      "@id": this.contractDefinition["@id"]?.trim(),
      "@context": {},
      "@type": "ContractDefinition",
      accessPolicyId: this.accessPolicy!['@id'],
      contractPolicyId: this.contractPolicy!['@id'],
      assetsSelector: [
        {
          "@type": "CriterionDto",
          operandLeft: "https://w3id.org/edc/v0.0.1/ns/id",
          operator: "=",
          operandRight: selectedAsset.id,
        },
      ],
    };

    this.dialogRef.close({
      contractDefinition,
      publishToMarketplace: this.publishToMarketplace,
    });
  }

}
