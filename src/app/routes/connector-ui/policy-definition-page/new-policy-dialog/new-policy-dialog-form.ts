import {Injectable} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {switchDisabledControls} from '../../../../core/utils/form-group-utils';
import {dateRangeRequired} from '../../../../core/validators/date-range-required';
import {noWhitespaceValidator} from '../../../../core/validators/no-whitespace-validator';
import {
  NewPolicyDialogFormModel,
  NewPolicyDialogFormValue,
  PolicyType,
} from './new-policy-dialog-form-model';

/**
 * Handles AngularForms for NewPolicyDialog
 */
@Injectable()
export class NewPolicyDialogForm {
  group = this.buildFormGroup();

  /**
   * Quick access to full value
   */

  get value(): NewPolicyDialogFormValue {
    return this.group.value;
  }

  get policyType(): PolicyType {
    return this.group.controls.policyType.value;
  }

  constructor(private formBuilder: FormBuilder) {}

  buildFormGroup(): FormGroup {
    return this.formBuilder.nonNullable.group({
      policyDefinitionId: ['', [Validators.required, noWhitespaceValidator]],
      policyType: [
        'Connector-Restricted-Usage' as PolicyType,
        Validators.required,
      ],
      uiPolicyDto: this.formBuilder.group({
        constraints: this.formBuilder.array([this.buildConstraintForm()]),
      }),
    });
  }

  buildConstraintForm(): FormGroup {
    return this.formBuilder.group({
      policyDefinitionId: true,
      policyType: true,
      left: ['', Validators.required],
      operator: ['', Validators.required],
      right: this.formBuilder.group({}),
    });
  }
}
