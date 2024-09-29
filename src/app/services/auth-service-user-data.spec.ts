import { of } from 'rxjs';

import { TestBed } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { AuthService } from './auth-service.service';
import { IUserModel } from '../models/user.model';

const angularFireAuthMock = {
  signInWithEmailAndPassword: jasmine.createSpy('signInWithEmailAndPassword'),
  createUserWithEmailAndPassword: jasmine.createSpy(
    'createUserWithEmailAndPassword'
  ),
  signOut: jasmine.createSpy('signOut'),
  authState: of<Partial<IUserModel> | null>({ uid: '123' }),
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

  it('should return logged-in user data', (done) => {
    angularFireAuthMock.authState = of({ uid: '123' });

    firestoreMock
      .collection('users')
      .doc('123')
      .valueChanges.and.returnValue(of({ uid: '123', name: 'Test User' }));

    service.user$.subscribe((user: any) => {
      expect(user).toEqual({ uid: '123', name: 'Test User' });
      done();
    });
  });
});
