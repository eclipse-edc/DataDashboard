import { Component, Inject, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Asset } from '../../models/asset';
import { EdcDemoApiService } from '../../services/edc-demo-api.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContractDefinition } from '../../models/api/contract-definition';
import { Criterion } from '../../models/api/criterion';
import { Policy } from '../../models/api/policy';


@Component({
  selector: 'edc-demo-policy-editor-dialog',
  templateUrl: './policy-editor-dialog.component.html',
  styleUrls: ['./policy-editor-dialog.component.scss']
})
export class PolicyEditorDialog implements OnInit {

  policies: Policy[] = [];
  name: string = '';
  editMode = false;
  accessPolicy?: Policy;
  contractPolicy?: Policy;
  contractDefinition: ContractDefinition = {
    id: '',
    selectorExpression: {
      criteria: [
        {
          left: '',
          right: '',
          op: ''
        }
      ]
    },
    accessPolicy: undefined!,
    contractPolicy: undefined!
  };

  constructor(private apiService: EdcDemoApiService, 
    private dialogRef: MatDialogRef<PolicyEditorDialog>,
    @Inject(MAT_DIALOG_DATA) contractDefinition?: ContractDefinition) { 
      if (contractDefinition) {
        this.contractDefinition = contractDefinition;
        this.editMode = true;
      }
    }

  ngOnInit(): void {
    this.apiService.getPolicies().subscribe(polices => {
      this.policies = polices;
      this.accessPolicy = this.policies.find(policy => policy.uid === this.contractDefinition.accessPolicy?.uid);
      this.contractPolicy = this.policies.find(policy => policy.uid === this.contractDefinition.contractPolicy?.uid);
    });
  }

  onRemoveCriteria(criterion: Criterion) {
    this.contractDefinition.selectorExpression.criteria = this.contractDefinition?.selectorExpression.criteria.filter(c => c !== criterion);
  }

  onAddCriterion() {
    this.contractDefinition.selectorExpression.criteria = [...this.contractDefinition.selectorExpression.criteria, {
      left: '',
      op: '',
      right: ''
    }];
  }

  onSave() {
    this.contractDefinition.accessPolicy = this.accessPolicy!;
    this.contractDefinition.contractPolicy = this.contractPolicy!;

    this.dialogRef.close({
      "contractDefinition": this.contractDefinition
    });
  }
}
