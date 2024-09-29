import { of } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { RegisterUserComponent } from '../../components/dialogs/register-user/register-user.component';
import { AuthService } from '../../services/auth-service.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', [
      'user$',
      'listUsers',
      'logout',
    ]);
    router = jasmine.createSpyObj('Router', ['navigate']);

    authService.user$ = of({ profile: 'administrator' });
    authService.listUsers.and.returnValue(
      of([{ name: 'User Test', email: 'test@example.com', profile: 'user' }])
    );
    authService.logout.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load user profile and set admin status', () => {
    expect(component.userProfile).toBe('administrator');
    expect(component.isAdmin).toBe(true);
  });

  it('should load the users list on init', () => {
    expect(component.dataSource).toEqual([
      { name: 'User Test', email: 'test@example.com', profile: 'user' },
    ]);
  });

  it('should open user dialog and refresh the user list', () => {
    spyOn(component.dialog, 'open').and.returnValue({
      afterClosed: () => of(true),
    } as MatDialogRef<typeof component>);

    component.openUserDialog();

    fixture.detectChanges();

    expect(component.dialog.open).toHaveBeenCalledWith(RegisterUserComponent);
    expect(authService.listUsers).toHaveBeenCalledTimes(2);
    expect(component.dataSource).toEqual([
      { name: 'User Test', email: 'test@example.com', profile: 'user' },
    ]);
  });

  it('should log out and navigate to login page', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should cast profile correctly', () => {
    expect(component.castProfile('administrator')).toBe('Administrador');
    expect(component.castProfile('user')).toBe('Usuário');
    expect(component.castProfile('unknown')).toBe('Perfil não encontrado');
  });

  it('should display the correct table columns', () => {
    const headers = fixture.debugElement
      .queryAll(By.css('th'))
      .map((el) => el.nativeElement.textContent.trim());
    expect(headers).toEqual(['Nome', 'Email', 'Perfil']);
  });
});
