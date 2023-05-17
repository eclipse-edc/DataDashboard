import {Injectable} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {switchDisabledControlsByField} from '../../../../core/utils/form-group-utils';
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

  buildFormGroup(): FormGroup<NewPolicyDialogFormModel> {
    const formGroup: FormGroup<NewPolicyDialogFormModel> =
      this.formBuilder.nonNullable.group({
        id: ['', [Validators.required, noWhitespaceValidator]],
        policyType: [
          'Connector-Restricted-Usage' as PolicyType,
          Validators.required,
        ],
        range: this.formBuilder.group(
          {
            start: null as Date | null,
            end: null as Date | null,
          },
          {validators: dateRangeRequired},
        ),
        connectorId: ['', Validators.required],
      });

    // Switch validation depending on selected policy type
    switchDisabledControlsByField({
      formGroup,
      switchCtrl: formGroup.controls.policyType,
      enabledControlsByValue: {
        'Connector-Restricted-Usage': ['connectorId'],
        'Time-Period-Restricted': ['range'],
      },
    });

    return formGroup;
  }
}
