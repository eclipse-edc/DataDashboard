import {Component, OnDestroy} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {finalize, takeUntil} from 'rxjs/operators';
import {PolicyService} from '../../../../core/services/api/legacy-managent-api-client';
import {AssetEntryBuilder} from '../../../../core/services/asset-entry-builder';
import {NotificationService} from '../../../../core/services/notification.service';
import {PolicyDefinitionBuilder} from '../../../../core/services/policy-definition-builder';
import {ValidationMessages} from '../../../../core/validators/validation-messages';
import {NewPolicyDialogForm} from './new-policy-dialog-form';
import {NewPolicyDialogResult} from './new-policy-dialog-result';

@Component({
  selector: 'new-policy-dialog',
  templateUrl: './new-policy-dialog.component.html',
  providers: [NewPolicyDialogForm, AssetEntryBuilder],
})
export class NewPolicyDialogComponent implements OnDestroy {
  loading = false;

  constructor(
    public form: NewPolicyDialogForm,
    private notificationService: NotificationService,
    private policyService: PolicyService,
    private dialogRef: MatDialogRef<NewPolicyDialogComponent>,
    public validationMessages: ValidationMessages,
    private policyDefinitionBuilder: PolicyDefinitionBuilder,
  ) {}

  onSave() {
    const formValue = this.form.value;
    const policyDefinition =
      this.policyDefinitionBuilder.buildPolicyDefinition(formValue);

    this.form.group.disable();
    this.loading = true;
    this.policyService
      .createPolicy(policyDefinition)
      .pipe(
        takeUntil(this.ngOnDestroy$),
        finalize(() => {
          this.form.group.enable();
          this.loading = false;
        }),
      )
      .subscribe({
        complete: () => {
          this.notificationService.showInfo('Successfully created policy.');
          this.close({refreshList: true});
        },
        error: (error) => {
          console.error('Failed creating asset!', error);
          this.notificationService.showError('Failed creating policy!');
        },
      });
  }

  private close(params: NewPolicyDialogResult) {
    this.dialogRef.close(params);
  }

  ngOnDestroy$ = new Subject();

  ngOnDestroy(): void {
    this.ngOnDestroy$.next(null);
    this.ngOnDestroy$.complete();
  }
}
