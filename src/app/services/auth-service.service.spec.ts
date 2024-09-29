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

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AngularFireAuth, useValue: angularFireAuthMock },
        { provide: AngularFirestore, useValue: firestoreMock },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    angularFireAuthMock.signInWithEmailAndPassword.calls.reset();
    angularFireAuthMock.createUserWithEmailAndPassword.calls.reset();
    angularFireAuthMock.signOut.calls.reset();
    firestoreMock.collection.calls.reset();
  });

  it('should successfully login', (done) => {
    angularFireAuthMock.signInWithEmailAndPassword.and.returnValue(
      Promise.resolve({ user: { uid: '123' } })
    );

    service.login('test@test.com', 'password').subscribe((result: any) => {
      expect(result).toEqual({ user: { uid: '123' } });
      expect(
        angularFireAuthMock.signInWithEmailAndPassword
      ).toHaveBeenCalledWith('test@test.com', 'password');
      done();
    });
  });

  it('should return error on login failure', (done) => {
    angularFireAuthMock.signInWithEmailAndPassword.and.returnValue(
      Promise.reject('Error on login')
    );

    service.login('test@test.com', 'password').subscribe((result: any) => {
      expect(result).toBeNull();
      done();
    });
  });

  it('should successfully register a user', (done) => {
    const mockUserCredential = { user: { uid: '123', email: 'test@test.com' } };
    angularFireAuthMock.createUserWithEmailAndPassword.and.returnValue(
      Promise.resolve(mockUserCredential)
    );

    service
      .register('test@test.com', 'password', { name: 'Test User' })
      .subscribe(() => {
        expect(firestoreMock.collection).toHaveBeenCalledWith('users');
        expect(firestoreMock.collection('users').doc).toHaveBeenCalledWith(
          '123'
        );
        expect(
          firestoreMock.collection('users').doc('123').set
        ).toHaveBeenCalledWith({
          uid: '123',
          email: 'test@test.com',
          name: 'Test User',
        });
        done();
      });
  });

  it('should return error on registration failure', (done) => {
    angularFireAuthMock.createUserWithEmailAndPassword.and.returnValue(
      Promise.reject('Error on registration')
    );

    service
      .register('test@test.com', 'password', { name: 'Test User' })
      .subscribe((result: any) => {
        expect(result).toBeUndefined();
        done();
      });
  });

  it('should successfully logout', (done) => {
    angularFireAuthMock.signOut.and.returnValue(Promise.resolve());

    service.logout().subscribe(() => {
      expect(angularFireAuthMock.signOut).toHaveBeenCalled();
      done();
    });
  });

  it('should return error on logout failure', (done) => {
    angularFireAuthMock.signOut.and.returnValue(
      Promise.reject('Error on logout')
    );

    service.logout().subscribe((result: any) => {
      expect(result).toBeUndefined();
      done();
    });
  });

  it('should successfully list users', (done) => {
    firestoreMock
      .collection('users')
      .valueChanges.and.returnValue(of([{ uid: '123', name: 'Test User' }]));

    service.listUsers().subscribe((users: any) => {
      expect(users.length).toBe(1);
      expect(users[0].uid).toBe('123');
      done();
    });
  });
});
