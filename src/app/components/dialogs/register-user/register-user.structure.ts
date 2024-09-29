import { AbstractControl, ValidationErrors } from '@angular/forms';

export interface RegisterUserForm {
  name: (string | ((control: AbstractControl) => ValidationErrors | null))[];
  email: (string | ((control: AbstractControl) => ValidationErrors | null)[])[];
  password: (
    | string
    | ((control: AbstractControl) => ValidationErrors | null)
  )[];
  profile: (string | ((control: AbstractControl) => ValidationErrors | null))[];
}
