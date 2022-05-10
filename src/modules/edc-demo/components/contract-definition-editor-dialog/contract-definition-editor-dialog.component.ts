import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ContractDefinitionDto, Criterion, Policy, PolicyService} from "../../../edc-dmgmt-client";


@Component({
  selector: 'edc-demo-contract-definition-editor-dialog',
  templateUrl: './contract-definition-editor-dialog.component.html',
  styleUrls: ['./contract-definition-editor-dialog.component.scss']
})
export class ContractDefinitionEditorDialog implements OnInit {

  policies: Policy[] = [];
  name: string = '';
  editMode = false;
  accessPolicy?: Policy;
  contractPolicy?: Policy;
  contractDefinition: ContractDefinitionDto = {
    id: '',
    criteria: [
      {
        left: '',
        right: '',
        op: ''
      }
    ],
    accessPolicyId: undefined!,
    contractPolicyId: undefined!
  };

  constructor(private policyService: PolicyService,
              private dialogRef: MatDialogRef<ContractDefinitionEditorDialog>,
              @Inject(MAT_DIALOG_DATA) contractDefinition?: ContractDefinitionDto) {
    if (contractDefinition) {
      this.contractDefinition = contractDefinition;
      this.editMode = true;
    }
  }

  ngOnInit(): void {
    this.policyService.getAllPolicies().subscribe(polices => {
      this.policies = polices;
      this.accessPolicy = this.policies.find(policy => policy.uid === this.contractDefinition.accessPolicyId);
      this.contractPolicy = this.policies.find(policy => policy.uid === this.contractDefinition.contractPolicyId);
    });
  }

  onRemoveCriteria(criterion: Criterion) {
    this.contractDefinition.criteria = this.contractDefinition?.criteria.filter(c => c !== criterion);
  }

  onAddCriterion() {
    this.contractDefinition.criteria = [...this.contractDefinition.criteria, {
      left: '',
      op: '',
      right: ''
    }];
  }

  onSave() {
    this.contractDefinition.accessPolicyId = this.accessPolicy!.uid;
    this.contractDefinition.contractPolicyId = this.contractPolicy!.uid;

    this.dialogRef.close({
      "contractDefinition": this.contractDefinition
    });
  }
}
