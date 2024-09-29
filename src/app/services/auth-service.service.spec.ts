import { of, throwError } from 'rxjs';

import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { IUserModel } from '../models/user.model';
import { AuthService } from './auth-service.service';

describe('AuthService', () => {
  describe('test', () => {
    let service: AuthService;
    let afAuthMock: any;
    let firestoreMock: any;

    let test = jasmine.createSpy('set').and.returnValue(Promise.resolve());
    const test5 = jasmine
      .createSpy('valueChanges')
      .and.returnValue(of([{ uid: '123', email: 'test@test.com' }]));

    beforeEach(() => {
      afAuthMock = {
        signInWithEmailAndPassword: jasmine
          .createSpy('signInWithEmailAndPassword')
          .and.returnValue(Promise.resolve({})),
        createUserWithEmailAndPassword: jasmine
          .createSpy('createUserWithEmailAndPassword')
          .and.returnValue(
            Promise.resolve({ user: { uid: '123', email: 'test@test.com' } })
          ),
        signOut: jasmine
          .createSpy('signOut')
          .and.returnValue(Promise.resolve()),
        idToken: of(null),
        authState: of({ uid: '123' }),
        setPersistence: jasmine
          .createSpy('setPersistence')
          .and.returnValue(Promise.resolve()),
      };

      firestoreMock = {
        collection: jasmine.createSpy('collection').and.returnValue({
          doc: jasmine.createSpy('doc').and.returnValue({
            valueChanges: jasmine
              .createSpy('valueChanges')
              .and.returnValue(of({ uid: '123', email: 'test@test.com' })),
            set: test,
          }),
          valueChanges: test5,
        }),
      };

      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AngularFireAuth, useValue: afAuthMock },
          { provide: AngularFirestore, useValue: firestoreMock },
        ],
      });

      service = TestBed.inject(AuthService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('test', (done) => {
      service.listUsers().subscribe((data: Partial<IUserModel>[]) => {
        expect(data).toEqual([{ uid: '123', email: 'test@test.com' }]);
        done();
      });

      expect(test5).toHaveBeenCalledTimes(1);
    });

    it('test', () => {
      const test = spyOn(console, 'error');

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

      test.calls.reset();
    });

    it('etst', fakeAsync(() => {
      const test01 = {
        email: 'test@test.com',
        name: 'test',
        password: '123456',
        profile: 'user',
      };

      service.register(test01).subscribe();

      flush();

      expect(test).toHaveBeenCalledWith({ uid: '123', ...test01 });
    }));

    it('etst', fakeAsync(() => {
      test.calls.reset();
      afAuthMock.createUserWithEmailAndPassword.and.returnValue(
        of({ user: null })
      );

      const test01 = {
        email: 'test@test.com',
        name: 'test',
        password: '123456',
        profile: 'user',
      };

      service.register(test01).subscribe();

      flush();

      expect(test).not.toHaveBeenCalledWith({ uid: '123', ...test01 });
    }));

    it('etst', fakeAsync(() => {
      const test = spyOn(console, 'error');
      afAuthMock.createUserWithEmailAndPassword.and.returnValue(
        throwError(() => ({ user: null }))
      );

      const test01 = {
        email: 'test@test.com',
        name: 'test',
        password: '123456',
        profile: 'user',
      };

      service.register(test01).subscribe();

      flush();

      expect(test).not.toHaveBeenCalledWith({ uid: '123', ...test01 });
      expect(console.error).toHaveBeenCalledWith('Erro ao cadastrar usuário:', {
        user: null,
      });

      test.calls.reset();
    }));

    it('test', (done) => {
      service.user$.subscribe((data) => {
        expect(data).toBeNull();

        done();
      });
    });
  });

  describe('test', () => {
    let service: AuthService;
    let afAuthMock: any;
    let firestoreMock: any;

    let test = jasmine.createSpy('set').and.returnValue(Promise.resolve());

    beforeEach(() => {
      afAuthMock = {
        signInWithEmailAndPassword: jasmine
          .createSpy('signInWithEmailAndPassword')
          .and.returnValue(Promise.resolve({})),
        createUserWithEmailAndPassword: jasmine
          .createSpy('createUserWithEmailAndPassword')
          .and.returnValue(
            Promise.resolve({ user: { uid: '123', email: 'test@test.com' } })
          ),
        signOut: jasmine.createSpy('signOut').and.returnValue(Promise.reject()),
        idToken: of('test'),
        authState: of({ uid: '123' }),
        setPersistence: jasmine
          .createSpy('setPersistence')
          .and.returnValue(Promise.resolve()),
      };

      firestoreMock = {
        collection: jasmine.createSpy('collection').and.returnValue({
          doc: jasmine.createSpy('doc').and.returnValue({
            valueChanges: jasmine
              .createSpy('valueChanges')
              .and.returnValue(of({ uid: '123', email: 'test@test.com' })),
            set: test,
          }),
          valueChanges: jasmine
            .createSpy('valueChanges')
            .and.returnValue(of([{ uid: '123', email: 'test@test.com' }])),
        }),
      };

      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AngularFireAuth, useValue: afAuthMock },
          { provide: AngularFirestore, useValue: firestoreMock },
        ],
      });

      service = TestBed.inject(AuthService);
    });

    it('test', (done) => {
      service.user$.subscribe((data?: Partial<IUserModel> | null) => {
        expect(data).toEqual({ uid: '123', email: 'test@test.com' });

        service.logout().subscribe(() => {
          expect<Partial<IUserModel> | null>(service['cachedUser']).toEqual({
            uid: '123',
            email: 'test@test.com',
          });
          done();
        });
      });
    });
  });

  describe('test', () => {
    let service: AuthService;
    let afAuthMock: any;
    let firestoreMock: any;

    let test = jasmine.createSpy('set').and.returnValue(Promise.resolve());

    beforeEach(() => {
      afAuthMock = {
        signInWithEmailAndPassword: jasmine
          .createSpy('signInWithEmailAndPassword')
          .and.returnValue(Promise.resolve({})),
        createUserWithEmailAndPassword: jasmine
          .createSpy('createUserWithEmailAndPassword')
          .and.returnValue(
            Promise.resolve({ user: { uid: '123', email: 'test@test.com' } })
          ),
        signOut: jasmine
          .createSpy('signOut')
          .and.returnValue(Promise.resolve()),
        idToken: of('test'),
        authState: of({ uid: '123' }),
        setPersistence: jasmine
          .createSpy('setPersistence')
          .and.returnValue(Promise.resolve()),
      };

      firestoreMock = {
        collection: jasmine.createSpy('collection').and.returnValue({
          doc: jasmine.createSpy('doc').and.returnValue({
            valueChanges: jasmine
              .createSpy('valueChanges')
              .and.returnValue(of({ uid: '123', email: 'test@test.com' })),
            set: test,
          }),
          valueChanges: jasmine
            .createSpy('valueChanges')
            .and.returnValue(of([{ uid: '123', email: 'test@test.com' }])),
        }),
      };

      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AngularFireAuth, useValue: afAuthMock },
          { provide: AngularFirestore, useValue: firestoreMock },
        ],
      });

      service = TestBed.inject(AuthService);
    });

    it('test', (done) => {
      service.user$.subscribe((data?: Partial<IUserModel> | null) => {
        expect(data).toEqual({ uid: '123', email: 'test@test.com' });

        service.user$.subscribe((data?: Partial<IUserModel> | null) => {
          expect(data).toEqual({ uid: '123', email: 'test@test.com' });

          done();
        });
      });
    });

    it('test', (done) => {
      service.user$.subscribe((data?: Partial<IUserModel> | null) => {
        expect(data).toEqual({ uid: '123', email: 'test@test.com' });

        service.logout().subscribe(() => {
          expect(service['cachedUser']).toBeNull();
          done();
        });
      });
    });
  });

  describe('test', () => {
    let service: AuthService;
    let afAuthMock: any;
    let firestoreMock: any;

    let test = jasmine.createSpy('set').and.returnValue(Promise.resolve());

    beforeEach(() => {
      afAuthMock = {
        signInWithEmailAndPassword: jasmine
          .createSpy('signInWithEmailAndPassword')
          .and.returnValue(Promise.resolve({})),
        createUserWithEmailAndPassword: jasmine
          .createSpy('createUserWithEmailAndPassword')
          .and.returnValue(
            Promise.resolve({ user: { uid: '123', email: 'test@test.com' } })
          ),
        signOut: jasmine
          .createSpy('signOut')
          .and.returnValue(Promise.resolve()),
        idToken: throwError(() => 'test'),
        authState: of({ uid: '123' }),
        setPersistence: jasmine
          .createSpy('setPersistence')
          .and.returnValue(Promise.resolve()),
      };

      firestoreMock = {
        collection: jasmine.createSpy('collection').and.returnValue({
          doc: jasmine.createSpy('doc').and.returnValue({
            valueChanges: jasmine
              .createSpy('valueChanges')
              .and.returnValue(of({ uid: '123', email: 'test@test.com' })),
            set: test,
          }),
          valueChanges: jasmine
            .createSpy('valueChanges')
            .and.returnValue(of([{ uid: '123', email: 'test@test.com' }])),
        }),
      };

      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: AngularFireAuth, useValue: afAuthMock },
          { provide: AngularFirestore, useValue: firestoreMock },
        ],
      });

      service = TestBed.inject(AuthService);
    });

    it('test', (done) => {
      service.user$.subscribe((data?: Partial<IUserModel> | null) => {
        expect(data).toBeNull();

        done();
      });
    });
  });
});
