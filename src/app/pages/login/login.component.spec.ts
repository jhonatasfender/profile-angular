import { FirebaseError } from 'firebase/app';
import { of, throwError } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth-service.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
  let routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable login button if form is invalid', () => {
    component.form.controls.email.setValue('');
    component.form.controls.senha.setValue('');

    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBeTrue();
  });

  it('should call AuthService login method once on form submission', () => {
    authServiceSpy.login.calls.reset();

    component.form.controls.email.setValue('test@example.com');
    component.form.controls.senha.setValue('password123');

    authServiceSpy.login.and.returnValue(of({}));

    component.login();

    expect(authServiceSpy.login).toHaveBeenCalledTimes(1);
    expect(authServiceSpy.login).toHaveBeenCalledWith(
      'test@example.com',
      'password123'
    );
  });

  it('should navigate to the home page on successful login', () => {
    component.form.controls.email.setValue('test@example.com');
    component.form.controls.senha.setValue('password123');

    authServiceSpy.login.and.returnValue(of({}));

    component.login();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['']);
  });

  it('should set isLoading to false on login error', () => {
    authServiceSpy.login.calls.reset();

    component.form.controls.email.setValue('test@example.com');
    component.form.controls.senha.setValue('password123');

    const errorResponse: FirebaseError = {
      name: 'FirebaseError',
      message: 'auth/wrong-password',
      code: 'auth/wrong-password',
    } as FirebaseError;

    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));

    component.login();

    fixture.detectChanges();

    expect(component.isLoading).toBeFalse();
    expect(authServiceSpy.login).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple submissions properly', () => {
    authServiceSpy.login.calls.reset();

    component.form.controls.email.setValue('test@example.com');
    component.form.controls.senha.setValue('password123');

    authServiceSpy.login.and.returnValue(of({}));

    component.login();
    component.login();

    expect(authServiceSpy.login).toHaveBeenCalledTimes(2);
  });

  it('should not call AuthService login if form is invalid', () => {
    authServiceSpy.login.calls.reset();

    component.form.controls.email.setValue('');
    component.form.controls.senha.setValue('');

    component.login();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });
});
