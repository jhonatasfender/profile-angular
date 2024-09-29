import { of, throwError } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth-service.service';
import { RegisterUserComponent } from './register-user.component';

describe('RegisterUserComponent', () => {
  let component: RegisterUserComponent;
  let fixture: ComponentFixture<RegisterUserComponent>;

  let authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
  let snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
  let angularFireAuthStub = jasmine.createSpyObj('AngularFireAuth', [
    'signInWithEmailAndPassword',
    'signOut',
  ]);
  let dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegisterUserComponent,
        AngularFireModule.initializeApp(environment.firebase),
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: AngularFireAuth, useValue: angularFireAuthStub },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call save() when form is valid', () => {
    component.form.controls.name.setValue('Test User');
    component.form.controls.email.setValue('test@example.com');
    component.form.controls.password.setValue('password123');
    component.form.controls.profile.setValue('administrator');

    authServiceSpy.register.and.returnValue(of());

    spyOn(component, 'save').and.callThrough();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));

    expect(component.save).toHaveBeenCalled();
  });

  it('should not call salvar() when form is invalid', () => {
    spyOn(component, 'save').and.callThrough();

    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    button.click();

    expect(component.save).not.toHaveBeenCalled();
  });

  it('should call AuthService register method once on form submission', () => {
    authServiceSpy.register.calls.reset();

    component.form.controls.name.setValue('Test User');
    component.form.controls.email.setValue('test@example.com');
    component.form.controls.password.setValue('password123');
    component.form.controls.profile.setValue('administrator');

    authServiceSpy.register.and.returnValue(of());

    component.save();

    expect(authServiceSpy.register).toHaveBeenCalledTimes(1);
    expect(authServiceSpy.register).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
      { name: 'Test User', profile: 'administrator' }
    );
  });

  it('should show validation error when form is invalid', () => {
    const snackBarSpy = spyOn(component['snackBar'], 'open').and.callThrough();

    component.form.controls.name.setValue('');
    component.save();

    expect(snackBarSpy).toHaveBeenCalledWith(
      'Formulário inválido. Por favor, preencha todos os campos corretamente.',
      'Fechar',
      { duration: 3000 }
    );
  });

  it('should display success message and close dialog when user is successfully registered', () => {
    const snackBarSpy = spyOn(component['snackBar'], 'open').and.callThrough();

    component.form.controls.name.setValue('Test User');
    component.form.controls.email.setValue('test@example.com');
    component.form.controls.password.setValue('password123');
    component.form.controls.profile.setValue('administrator');

    authServiceSpy.register.and.returnValue(of({}));

    component.save();

    expect(snackBarSpy).toHaveBeenCalledWith(
      'Usuário cadastrado com sucesso',
      'Fechar',
      { duration: 3000 }
    );

    const snackBarRef = snackBarSpy.calls.mostRecent().returnValue;
    snackBarRef.afterDismissed().subscribe(() => {
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });

  it('should display error message when registration fails', () => {
    const snackBarSpy = spyOn(component['snackBar'], 'open').and.callThrough();

    component.form.controls.name.setValue('Test User');
    component.form.controls.email.setValue('test@example.com');
    component.form.controls.password.setValue('password123');
    component.form.controls.profile.setValue('administrator');

    authServiceSpy.register.and.returnValue(throwError(() => null));

    component.save();

    expect(snackBarSpy).toHaveBeenCalledWith(
      'Erro ao cadastrar usuário',
      'Fechar',
      { duration: 3000 }
    );
  });
});
