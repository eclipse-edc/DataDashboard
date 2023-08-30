import {FormControl, ɵFormGroupValue} from '@angular/forms';
import {UiPolicyCreateRequest} from '@sovity.de/edc-client';

/**
 * Form Value Type
 */
export type NewPolicyDialogFormValue =
  ɵFormGroupValue<NewPolicyDialogFormModel>;

/**
 * Form Group Template Type
 */
export interface NewPolicyDialogFormModel {
  id: FormControl<string>;
  policy: FormControl<UiPolicyCreateRequest>;
}
