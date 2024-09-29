import { catchError, of } from 'rxjs';

import { Component, inject } from '@angular/core';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../services/auth-service.service';
import { RegisterUserForm } from './register-user.structure';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogActions,
    MatDialogClose,
    MatSnackBarModule,
  ],
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss'],
})
export class RegisterUserComponent {
  private fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<RegisterUserComponent>);

  public form = this.fb.group<RegisterUserForm>({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    profile: ['', Validators.required],
  });

  public save(): void {
    if (this.form.valid) {
      const formData = this.form.getRawValue();

      this.authService
        .register(formData)
        .pipe(
          catchError(() => {
            this.snackBar.open('Erro ao cadastrar usuário', 'Fechar', {
              duration: 3000,
            });

            return of(null);
          })
        )
        .subscribe(() => {
          const snackBarRef = this.snackBar.open(
            'Usuário cadastrado com sucesso',
            'Fechar',
            {
              duration: 3000,
            }
          );

          snackBarRef.afterDismissed().subscribe(() => {
            this.dialogRef.close();
          });
        });
    } else {
      this.snackBar.open(
        'Formulário inválido. Por favor, preencha todos os campos corretamente.',
        'Fechar',
        {
          duration: 3000,
        }
      );
    }
  }
}
