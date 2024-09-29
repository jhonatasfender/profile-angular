import { of, throwError } from 'rxjs';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { IUserModel } from '../models/user.model';
import { AuthService } from './auth-service.service';

function createAfAuthMock({
  signInWithEmailAndPasswordResult = Promise.resolve({}),
  createUserWithEmailAndPasswordResult = Promise.resolve<{
    user: {
      uid: string;
      email: string;
    } | null;
  }>({
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
  let service: AuthService;
  let afAuthMock: any;
  let firestoreMock: any;

  describe('User operations empty', () => {
    const setDocumentSpy = jasmine
      .createSpy('set')
      .and.returnValue(Promise.resolve());

    beforeEach(() => {
      afAuthMock = createAfAuthMock({
        createUserWithEmailAndPasswordResult: Promise.resolve({ user: null }),
      });
      firestoreMock = createFirestoreMock({ setFunction: setDocumentSpy });
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AngularFireAuth, useValue: afAuthMock },
          { provide: AngularFirestore, useValue: firestoreMock },
        ],
      });
      service = TestBed.inject(AuthService);
    });

    it('should create the AuthService instance', fakeAsync(() => {
      const newUser = {
        email: 'test@test.com',
        name: 'test',
        password: '123456',
        profile: 'user',
      };
      service.register(newUser).subscribe(() => {
        expect(setDocumentSpy).not.toHaveBeenCalledWith({
          uid: '123',
          ...newUser,
        });
      });
      flush();
    }));
  });

  describe('User operations', () => {
    const setDocumentSpy = jasmine
      .createSpy('set')
      .and.returnValue(Promise.resolve());

    beforeEach(() => {
      afAuthMock = createAfAuthMock();
      firestoreMock = createFirestoreMock({ setFunction: setDocumentSpy });
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

      expect(firestoreMock.collection().valueChanges).toHaveBeenCalledTimes(1);
    });

    it('should login with correct parameters and handle error', () => {
      const consoleErrorSpy = spyOn(console, 'error');

      service.login('test@test.com', '123456').subscribe();
      expect(afAuthMock.signInWithEmailAndPassword).toHaveBeenCalledWith(
        'test@test.com',
        '123456'
      );

      afAuthMock.signInWithEmailAndPassword.and.returnValue(
        throwError(() => new Error())
      );
      service.login('test@test.com', '123456').subscribe({
        error: () => {
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Erro ao fazer login:',
            jasmine.anything()
          );
        },
      });
    });

    it('should register a new user and save to Firestore', fakeAsync(() => {
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

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao cadastrar usuário:',
        { user: null }
      );
    }));

    it('should return null for user$ when there is no user', (done) => {
      service.user$.subscribe((data) => {
        expect(data).toBeNull();
        done();
      });
    });

    it('should logout and clear cached user', (done) => {
      service.logout().subscribe(() => {
        expect(service['cachedUser']).toBeNull();
        done();
      });
    });
  });

  describe('register user error', () => {
    const setDocumentSpy = jasmine
      .createSpy('set')
      .and.returnValue(Promise.resolve());

    beforeEach(() => {
      afAuthMock = createAfAuthMock({
        createUserWithEmailAndPasswordResult: Promise.reject(),
      });
      firestoreMock = createFirestoreMock();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AngularFireAuth, useValue: afAuthMock },
          { provide: AngularFirestore, useValue: firestoreMock },
        ],
      });
      service = TestBed.inject(AuthService);
    });

    it('should not save user if registration fails', fakeAsync(() => {
      const newUser = {
        email: 'test@test.com',
        name: 'test',
        password: '123456',
        profile: 'user',
      };
      service.register(newUser).subscribe();
      flush();
      expect(setDocumentSpy).not.toHaveBeenCalled();
    }));
  });

  describe('Logout operations', () => {
    describe('Error', () => {
      beforeEach(() => {
        afAuthMock = createAfAuthMock({ signOutResult: Promise.reject() });
        firestoreMock = createFirestoreMock();
        TestBed.configureTestingModule({
          providers: [
            AuthService,
            { provide: AngularFireAuth, useValue: afAuthMock },
            { provide: AngularFirestore, useValue: firestoreMock },
          ],
        });
        service = TestBed.inject(AuthService);
      });

      it('should handle logout error correctly', fakeAsync(() => {
        const consoleErrorSpy = spyOn(console, 'error');

        service.logout().subscribe({
          error: () => {
            expect(consoleErrorSpy).toHaveBeenCalled();
          },
        });

        flush();
      }));
    });
  });

  describe('Multiple user$ subscriptions', () => {
    beforeEach(() => {
      afAuthMock = createAfAuthMock({ idTokenResult: of('test') });
      firestoreMock = createFirestoreMock();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AngularFireAuth, useValue: afAuthMock },
          { provide: AngularFirestore, useValue: firestoreMock },
        ],
      });
      service = TestBed.inject(AuthService);
    });

    it('should emit user data for each subscription', (done) => {
      service.user$.subscribe((data) => {
        expect(data).toEqual({ uid: '123', email: 'test@test.com' } as any);

        service.user$.subscribe((secondData) => {
          expect(secondData).toEqual(data);
          done();
        });
      });
    });
  });

  describe('Id token errors', () => {
    beforeEach(() => {
      afAuthMock = createAfAuthMock({
        idTokenResult: throwError(() => 'test'),
      });
      firestoreMock = createFirestoreMock();
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
      service.user$.subscribe((data) => {
        expect(data).toBeNull();
        done();
      });
    });
  });
});
