import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PolicyDefinitionInput, PolicyInput } from '../../../mgmt-api-client/model';

@Component({
  selector: 'app-new-policy-dialog',
  templateUrl: './new-policy-dialog.component.html',
  styleUrls: ['./new-policy-dialog.component.scss']
})
export class NewPolicyDialogComponent {
  policyName: string = '';
  accessOption: 'bpn' | 'public' = 'bpn';
  businessPartnerNumber: string = '';

  policy: PolicyInput = {
    "@type": "set"
  };
  policyDefinition: PolicyDefinitionInput = {
    "policy": this.policy,
    "@id": ''
  };

  constructor(private dialogRef: MatDialogRef<NewPolicyDialogComponent>) {}

  isGeneralValid(): boolean {
    if (!this.policyName.trim()) return false;
    return !(this.accessOption === 'bpn' && !this.businessPartnerNumber.trim());
  }

  onSave(): void {
    if (!this.isGeneralValid()) return;

    // Assign ID and fields
    this.policyDefinition['@id'] = this.policyName;
    this.policyDefinition.policy.assigner = this.accessOption === 'bpn' ? this.businessPartnerNumber.trim() : 'PUBLIC';

    this.policy["@context"]="http://www.w3.org/ns/odrl.jsonld"

    this.dialogRef.close(this.policyDefinition);
  }
}
