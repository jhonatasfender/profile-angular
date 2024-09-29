import { Observable, of } from 'rxjs';

import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { AuthService } from '../services/auth-service.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const executeGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => TestBed.runInInjectionContext(() => authGuard(route, state));

  beforeEach(() => {
    const authServiceMock = jasmine.createSpyObj('AuthService', ['user$']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should allow navigation if user is authenticated', (done) => {
    authServiceSpy.user$ = of({ uid: '123', email: 'test@test.com' });

    const routeMock = {} as ActivatedRouteSnapshot;
    const stateMock = {} as RouterStateSnapshot;

    const result = executeGuard(routeMock, stateMock) as Observable<boolean>;

    result.subscribe((canActivate) => {
      expect(canActivate).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should navigate to /login if user is not authenticated', (done) => {
    routerSpy.navigate.calls.reset();

    authServiceSpy.user$ = of(null);

    const routeMock = {} as ActivatedRouteSnapshot;
    const stateMock = {} as RouterStateSnapshot;

    const result = executeGuard(routeMock, stateMock) as Observable<boolean>;

    result.subscribe((canActivate) => {
      expect(canActivate).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: undefined },
      });

      done();
    });
  });
});
