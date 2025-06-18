import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-policy-details-dialog',
  templateUrl: './policy-details-dialog.component.html',
  styleUrls: ['./policy-details-dialog.component.scss']
})
export class PolicyDetailsDialogComponent {
  cleaned = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PolicyDetailsDialogComponent>
  ) {}

  get displayedJson(): any {
    if (!this.cleaned) {
      return this.data.policy;
    }

    const { ['@context']: context, ...rest } = this.data.policy;
    return {
      ...rest,
      ...(context ? { '@context': context } : {})
    };
  }


  delete(): void {
    // pass back the policy ID?
    this.dialogRef.close({ delete: true });
  }
}
