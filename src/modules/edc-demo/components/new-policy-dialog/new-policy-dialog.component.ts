import {Component, Inject, OnInit} from '@angular/core';
import {PolicyDefinitionInput, PolicyInput} from "../../../mgmt-api-client/model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-new-policy-dialog',
  templateUrl: './new-policy-dialog.component.html',
  styleUrls: ['./new-policy-dialog.component.scss']
})
export class NewPolicyDialogComponent implements OnInit {
  editMode: boolean = false;
  policy: PolicyInput = {
    "@type": "set"
  };
  policyDefinition: PolicyDefinitionInput = {
    "policy": this.policy,
    "@id": ''
  };
  permissionsJson: string = '';
  prohibitionsJson: string = '';
  obligationsJson: string = '';

  constructor(private dialogRef: MatDialogRef<NewPolicyDialogComponent>) {
  }

  ngOnInit(): void {
    this.editMode = true;
  }

  onSave() {
    if (this.permissionsJson && this.permissionsJson !== '') {
      this.policy.permission = JSON.parse(this.permissionsJson);
    }

    if (this.prohibitionsJson && this.prohibitionsJson !== '') {
      this.policy.prohibition = JSON.parse(this.prohibitionsJson);
    }

    if (this.obligationsJson && this.obligationsJson !== '') {
      this.policy.obligation = JSON.parse(this.obligationsJson);
    }

    this.policy["@context"]="http://www.w3.org/ns/odrl.jsonld"


    this.dialogRef.close({

      policy : this.policyDefinition.policy,
      '@id': this.policyDefinition.id
    })
  }
}
