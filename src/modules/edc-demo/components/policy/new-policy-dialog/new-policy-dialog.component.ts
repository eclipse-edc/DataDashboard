import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PolicyDefinitionInput, PolicyInput } from '../../../../mgmt-api-client/model';

@Component({
  selector: 'app-new-policy-dialog',
  templateUrl: './new-policy-dialog.component.html',
  styleUrls: ['./new-policy-dialog.component.scss']
})
export class NewPolicyDialogComponent {
  policyName: string = '';
  accessOption: 'bpn' | 'public' = 'bpn';
  businessPartnerNumber: string = '';

  policyDefinition: PolicyDefinitionInput = {
    policy: {
      "@type": "set",
      "@context": "http://www.w3.org/ns/odrl.jsonld",
      permission: []
    }
  };

  constructor(private dialogRef: MatDialogRef<NewPolicyDialogComponent>) {}

  isGeneralValid(): boolean {
    if (!this.policyName.trim()) return false;
    return !(this.accessOption === 'bpn' && !this.businessPartnerNumber.trim());
  }

  onSave(): void {
    if (!this.isGeneralValid()) return;

    const trimmedId = this.policyName.trim();
    const isRestricted = this.accessOption === 'bpn';

    // Build permission
    const permission: any = {
      action: "USE"
    };

    if (isRestricted) {
      permission.constraint = [
        {
          "@type": "Constraint",
          leftOperand: "BusinessPartnerNumber",
          operator: { "@id": "odrl:eq" },
          rightOperand: this.businessPartnerNumber.trim()
        }
      ];
    }

    // Build the final policy definition input
    this.policyDefinition = {
      "@id": trimmedId,
      id: trimmedId,
      policy: {
        "@context": "http://www.w3.org/ns/odrl.jsonld",
        "@type": "set",
        permission: [permission]
      }
    };

    this.dialogRef.close(this.policyDefinition);
  }
}
