import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {DateRange} from '@angular/material/datepicker';

/**
 * Validates date range is set.
 * @param control control
 */
export const dateRangeRequired: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value: DateRange<Date> = control.value;
  if (!value?.start || !value?.end || value.start > value.end) {
    return {required: true};
  }
  return null;
};
