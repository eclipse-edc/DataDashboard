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

  permissionsJson: string = '';
  prohibitionsJson: string = '';
  obligationsJson: string = '';

  policy: PolicyInput = {
    '@type': 'set',
    '@context': 'http://www.w3.org/ns/odrl.jsonld'
  };

  policyDefinition: PolicyDefinitionInput = {
    '@id': '',
    policy: this.policy
  };

  constructor(private dialogRef: MatDialogRef<NewPolicyDialogComponent>) {}

  isGeneralValid(): boolean {
    if (!this.policyName.trim()) return false;
    if (this.accessOption === 'bpn' && !this.businessPartnerNumber.trim()) return false;
    return true;
  }

  onSave(): void {
    if (!this.isGeneralValid()) return;

    // Assign ID and fields
    this.policyDefinition['@id'] = this.policyName;
    this.policyDefinition.policy.assigner = this.accessOption === 'bpn' ? this.businessPartnerNumber.trim() : 'PUBLIC';

    if (this.permissionsJson.trim()) {
      this.policy.permission = JSON.parse(this.permissionsJson);
    }
    if (this.prohibitionsJson.trim()) {
      this.policy.prohibition = JSON.parse(this.prohibitionsJson);
    }
    if (this.obligationsJson.trim()) {
      this.policy.obligation = JSON.parse(this.obligationsJson);
    }

    this.dialogRef.close(this.policyDefinition);
  }
}
