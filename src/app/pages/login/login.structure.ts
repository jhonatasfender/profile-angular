import { AbstractControl, ValidationErrors } from '@angular/forms';

export interface LoginFormValues {
  email: (string | ((control: AbstractControl) => ValidationErrors | null)[])[];
  senha: (string | ((control: AbstractControl) => ValidationErrors | null))[];
}