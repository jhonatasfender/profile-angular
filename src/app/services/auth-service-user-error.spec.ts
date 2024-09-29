import { of } from 'rxjs';

import { TestBed } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { IUserModel } from '../models/user.model';
import { AuthService } from './auth-service.service';

const angularFireAuthMock = {
  signInWithEmailAndPassword: jasmine.createSpy('signInWithEmailAndPassword'),
  createUserWithEmailAndPassword: jasmine.createSpy(
    'createUserWithEmailAndPassword'
  ),
  signOut: jasmine.createSpy('signOut'),
  authState: of<Partial<IUserModel> | null>(null),
  setPersistence: jasmine.createSpy('setPersistence'),
  idToken: of('teste'),
};

const firestoreMock = {
  collection: jasmine.createSpy('collection').and.returnValue({
    doc: jasmine.createSpy('doc').and.returnValue({
      set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
      valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of(null)),
    }),
    valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of([])),
  }),
};

describe('AuthService - Error Handling', () => {
  let service: AuthService;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AngularFireAuth, useValue: angularFireAuthMock },
        { provide: AngularFirestore, useValue: firestoreMock },
      ],
    });

    service = TestBed.inject(AuthService);
    consoleErrorSpy = spyOn(console, 'error');
  });

  afterEach(() => {
    angularFireAuthMock.signInWithEmailAndPassword.calls.reset();
    angularFireAuthMock.createUserWithEmailAndPassword.calls.reset();
    angularFireAuthMock.signOut.calls.reset();
    firestoreMock.collection.calls.reset();
    consoleErrorSpy.calls.reset();
  });

  it('should return undefined if registration fails with an error', (done) => {
    angularFireAuthMock.createUserWithEmailAndPassword.and.returnValue(
      Promise.reject(new Error('Registration failed'))
    );

    service
      .register('test@test.com', 'password123', { name: 'Test User' })
      .subscribe({
        next: (result: any) => {
          expect(result).toBeUndefined();
          done();
        },
        error: (err) => {
          done.fail(err);
        },
      });
  });

  it('should return undefined if logout fails', (done) => {
    angularFireAuthMock.signOut.and.returnValue(
      Promise.reject(new Error('Logout failed'))
    );

    service.logout().subscribe({
      next: (result: any) => {
        expect(result).toBeUndefined();
        done();
      },
      error: (err) => {
        done.fail(err);
      },
    });
  });

  it('should return null if no user is logged in', (done) => {
    angularFireAuthMock.authState = of(null);

    service.user$.subscribe({
      next: (user: any) => {
        expect(user).toBeNull();
        done();
      },
      error: (err) => {
        done.fail(err);
      },
    });
  });

  it('should return undefined if user is null after registration', (done) => {
    angularFireAuthMock.createUserWithEmailAndPassword.and.returnValue(
      Promise.resolve({ user: null })
    );

    service
      .register('test@test.com', 'password123', { name: 'Test User' })
      .subscribe((result: any) => {
        expect(result).toBeUndefined();
        done();
      });
  });

  it('should return undefined if logout fails with an error', (done) => {
    angularFireAuthMock.signOut.and.returnValue(
      Promise.reject(new Error('Logout failed'))
    );

    service.logout().subscribe((result: any) => {
      expect(result).toBeUndefined();
      done();
    });
  });
});
