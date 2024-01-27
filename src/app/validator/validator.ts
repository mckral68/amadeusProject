import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function compareSameCode(from: string, to: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const _from = formGroup.get(from);
    const _to = formGroup.get(to);
    if (!_from || !_to) {
      return null;
    }
    if (
      _from.value.length > 0 &&
      _to.value.length > 0 &&
      _from.value == _to.value
    ) {
      _to.setErrors({
        error: 'Departure and arrival airports cannot be the same.',
      });
    } else {
      _to.setErrors(null);
    }
    return null;
  };
}
export function dateCheck(
  departure_date: string,
  return_time: string
): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const _d_date = formGroup.get(departure_date);
    const _r_date = formGroup.get(return_time);

    if (!_d_date || !_r_date) {
      return null;
    }
    if (
      _d_date.value.length > 0 &&
      _r_date.value.length > 0 &&
      _d_date.value > _r_date.value
    ) {
      _r_date.setErrors({
        error: 'Departure date cannot be later than return date.',
      });
    } else {
      _r_date.setErrors(null);
    }
    return null;
  };
}
