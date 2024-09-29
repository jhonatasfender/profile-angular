import { of, throwError } from 'rxjs';

import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { IUserModel } from '../models/user.model';
import { AuthService } from './auth-service.service';

function createAfAuthMock({
  signInWithEmailAndPasswordResult = Promise.resolve({}),
  createUserWithEmailAndPasswordResult = Promise.resolve({
    user: { uid: '123', email: 'test@test.com' },
  }),
  signOutResult = Promise.resolve(),
  idTokenResult = of<string | null>(null),
  authStateResult = of({ uid: '123' }),
  setPersistenceResult = Promise.resolve(),
} = {}) {
  return {
    signInWithEmailAndPassword: jasmine
      .createSpy('signInWithEmailAndPassword')
      .and.returnValue(signInWithEmailAndPasswordResult),
    createUserWithEmailAndPassword: jasmine
      .createSpy('createUserWithEmailAndPassword')
      .and.returnValue(createUserWithEmailAndPasswordResult),
    signOut: jasmine.createSpy('signOut').and.returnValue(signOutResult),
    idToken: idTokenResult,
    authState: authStateResult,
    setPersistence: jasmine
      .createSpy('setPersistence')
      .and.returnValue(setPersistenceResult),
  };
}

function createFirestoreMock({
  docValueChangesResult = of({ uid: '123', email: 'test@test.com' }),
  collectionValueChangesResult = jasmine
    .createSpy('valueChanges')
    .and.returnValue(of([{ uid: '123', email: 'test@test.com' }])),
  setFunction = jasmine.createSpy('set').and.returnValue(Promise.resolve()),
} = {}) {
  return {
    collection: jasmine.createSpy('collection').and.returnValue({
      doc: jasmine.createSpy('doc').and.returnValue({
        valueChanges: jasmine
          .createSpy('valueChanges')
          .and.returnValue(docValueChangesResult),
        set: setFunction,
      }),
      valueChanges: collectionValueChangesResult,
    }),
  };
}

describe('AuthService', () => {
  describe('AuthService with successful user operations', () => {
    const setDocumentSpy = jasmine.createSpy('set').and.returnValue(Promise.resolve());
    const collectionValueChangesSpy = jasmine
      .createSpy('valueChanges')
      .and.returnValue(of([{ uid: '123', email: 'test@test.com' }]));

    let service: AuthService;
    const afAuthMock = createAfAuthMock({ idTokenResult: of(null) });
    const firestoreMock = createFirestoreMock({
      collectionValueChangesResult: collectionValueChangesSpy,
      setFunction: setDocumentSpy,
    });

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AngularFireAuth, useValue: afAuthMock },
          { provide: AngularFirestore, useValue: firestoreMock },
        ],
      });

      service = TestBed.inject(AuthService);
    });

    it('should create the AuthService instance', () => {
      expect(service).toBeTruthy();
    });

    it('should list users correctly', (done) => {
      service.listUsers().subscribe((data: Partial<IUserModel>[]) => {
        expect(data).toEqual([{ uid: '123', email: 'test@test.com' }]);
        done();
      });

      expect(collectionValueChangesSpy).toHaveBeenCalledTimes(1);
    });

    it('should call login with correct parameters and handle error', () => {
      const setDocumentSpy = spyOn(console, 'error');

      service.login('test@test.com', '123456').subscribe();

      expect(afAuthMock.signInWithEmailAndPassword).toHaveBeenCalledWith(
        'test@test.com',
        '123456'
      );

      afAuthMock.signInWithEmailAndPassword.and.returnValue(
        throwError(() => new Error())
      );

      service.login('test@test.com', '123456').subscribe();

      expect(console.error).toHaveBeenCalledWith(
        'Erro ao fazer login:',
        jasmine.anything()
      );

      setDocumentSpy.calls.reset();
    });

    it('should register a new user and save to Firestore', fakeAsync(() => {
      setDocumentSpy.calls.reset();

      const newUser = {
        email: 'test@test.com',
        name: 'test',
        password: '123456',
        profile: 'user',
      };

      service.register(newUser).subscribe(() => {
        expect(setDocumentSpy).toHaveBeenCalledWith({ uid: '123', ...newUser });
      });

      flush();
    }));

    it('should not save user if registration fails', fakeAsync(() => {
      setDocumentSpy.calls.reset();
      afAuthMock.createUserWithEmailAndPassword.and.returnValue(
        of({ user: null })
      );

      const newUser = {
        email: 'test@test.com',
        name: 'test',
        password: '123456',
        profile: 'user',
      };

      service.register(newUser).subscribe();

      flush();

      expect(setDocumentSpy).not.toHaveBeenCalledWith({ uid: '123', ...newUser });
    }));

    it('should log error when registration fails', fakeAsync(() => {
      const consoleErrorSpy = spyOn(console, 'error');
      afAuthMock.createUserWithEmailAndPassword.and.returnValue(
        throwError(() => ({ user: null }))
      );

      const newUser = {
        email: 'test@test.com',
        name: 'test',
        password: '123456',
        profile: 'user',
      };

      service.register(newUser).subscribe();

      flush();

      expect(consoleErrorSpy).not.toHaveBeenCalledWith({ uid: '123', ...newUser });
      expect(console.error).toHaveBeenCalledWith('Erro ao cadastrar usuário:', {
        user: null,
      });

      consoleErrorSpy.calls.reset();
    }));

    it('should return null for user$ when there is no user', (done) => {
      service.user$.subscribe((data) => {
        expect(data).toBeNull();

        done();
      });
    });
  });

  describe('AuthService with logout errors', () => {
    let service: AuthService;

    const afAuthMock = createAfAuthMock({ signOutResult: Promise.reject() });
    const firestoreMock = createFirestoreMock();

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AngularFireAuth, useValue: afAuthMock },
          { provide: AngularFirestore, useValue: firestoreMock },
        ],
      });

      service = TestBed.inject(AuthService);
    });

    it('should handle logout error correctly', (done) => {
      const consoleErrorSpy = spyOn(console, 'error');

      service.user$.subscribe((data?: Partial<IUserModel> | null) => {
        expect(data).toBeNull();

        service.logout().subscribe({
          next: jasmine.createSpy(),
          error: () => {
            expect<Partial<IUserModel> | null>(
              service['cachedUser']
            ).toBeNull();

            expect(consoleErrorSpy).toHaveBeenCalledWith();
            done();
          },
        });
      });
    });
  });

  describe('AuthService with successful user logout', () => {
    let service: AuthService;

    const afAuthMock = createAfAuthMock({ idTokenResult: of('test') });
    const firestoreMock = createFirestoreMock();

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AngularFireAuth, useValue: afAuthMock },
          { provide: AngularFirestore, useValue: firestoreMock },
        ],
      });

      service = TestBed.inject(AuthService);
    });

    it('should logout and clear cached user after user$ is emitted', (done) => {
      service.user$.subscribe((data?: Partial<IUserModel> | null) => {
        expect(data).toEqual({ uid: '123', email: 'test@test.com' });

        service.logout().subscribe(() => {
          expect<Partial<IUserModel> | null>(service['cachedUser']).toBeNull();
          done();
        });
      });
    });
  });

  describe('AuthService handling multiple user$ subscriptions', () => {
    let service: AuthService;

    const afAuthMock = createAfAuthMock({ idTokenResult: of('test') });
    const firestoreMock = createFirestoreMock();

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AngularFireAuth, useValue: afAuthMock },
          { provide: AngularFirestore, useValue: firestoreMock },
        ],
      });

      service = TestBed.inject(AuthService);
    });

    it('should emit user data twice when user$ is subscribed to twice', (done) => {
      service.user$.subscribe((data?: Partial<IUserModel> | null) => {
        expect(data).toEqual({ uid: '123', email: 'test@test.com' });

        service.user$.subscribe((data?: Partial<IUserModel> | null) => {
          expect(data).toEqual({ uid: '123', email: 'test@test.com' });

          done();
        });
      });
    });

    it('should logout and clear cached user after second user$ subscription', (done) => {
      service.user$.subscribe((data?: Partial<IUserModel> | null) => {
        expect(data).toEqual({ uid: '123', email: 'test@test.com' });

        service.logout().subscribe(() => {
          expect(service['cachedUser']).toBeNull();
          done();
        });
      });
    });
  });

  describe('AuthService with id token errors', () => {
    let service: AuthService;

    const afAuthMock = createAfAuthMock({
      idTokenResult: throwError(() => 'test'),
    });
    const firestoreMock = createFirestoreMock();

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AngularFireAuth, useValue: afAuthMock },
          { provide: AngularFirestore, useValue: firestoreMock },
        ],
      });

      service = TestBed.inject(AuthService);
    });

    it('should return null for user$ when token throws an error', (done) => {
      service.user$.subscribe((data?: Partial<IUserModel> | null) => {
        expect(data).toBeNull();

        done();
      });
    });
  });
});
