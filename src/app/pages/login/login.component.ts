import { FirebaseError } from 'firebase/app';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service.service';
import { LoginFormValues } from './login.structure';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public form = this.fb.group<LoginFormValues>({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  public isLoading = false;

  public login(): void {
    if (this.form.invalid) {
      return;
    }

    const { email, senha } = this.form.getRawValue();

    this.isLoading = true;

    this.authService.login(email, senha).subscribe({
      next: this.handleLoginSuccess.bind(this),
      error: this.handleLoginError.bind(this),
    });
  }

  private handleLoginError(err: FirebaseError): void {
    this.isLoading = false;
    console.error(err);
  }

  private handleLoginSuccess(): void {
    this.isLoading = false;
    this.router.navigate(['']);
  }
}
