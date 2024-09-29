import { catchError, from, Observable, of, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';

import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { IUserModel } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly USERS_COLLECTION = 'users';

  private readonly angularFireAuth = inject(AngularFireAuth);
  private readonly firestore = inject(AngularFirestore);

  private cachedUser: IUserModel | null = null;

  public user$: Observable<IUserModel | null | undefined>;

  constructor() {
    this.angularFireAuth.setPersistence('session');

    this.user$ = this.getLoggedInUserData();
  }

  public login(email: string, password: string): Observable<any> {
    return from(
      this.angularFireAuth.signInWithEmailAndPassword(email, password)
    ).pipe(
      catchError((error) => {
        console.error('Erro ao fazer login:', error);
        return of(null);
      })
    );
  }

  public register(
    email: string,
    password: string,
    profileData: Partial<IUserModel>
  ): Observable<void> {
    return from(
      this.angularFireAuth.createUserWithEmailAndPassword(email, password)
    ).pipe(
      switchMap(({ user }) => {
        if (user) {
          return from(
            this.firestore
              .collection(this.USERS_COLLECTION)
              .doc(user.uid)
              .set({
                uid: user.uid,
                email: user.email,
                ...profileData,
              })
          );
        }
        return of(undefined);
      }),
      catchError((error) => {
        console.error('Erro ao cadastrar usuário:', error);
        return of(undefined);
      })
    );
  }

  public logout(): Observable<void> {
    return from(this.angularFireAuth.signOut()).pipe(
      tap(() => {
        this.cachedUser = null;
      }),
      catchError((error) => {
        console.error('Erro ao fazer logout:', error);
        return of(undefined);
      })
    );
  }

  public listUsers(): Observable<IUserModel[]> {
    return this.firestore
      .collection(this.USERS_COLLECTION)
      .valueChanges() as Observable<IUserModel[]>;
  }

  private getLoggedInUserData(): Observable<IUserModel | null | undefined> {
    if (this.cachedUser) {
      return of(this.cachedUser);
    }

    return this.angularFireAuth.idToken.pipe(
      switchMap((token) => {
        if (!token) {
          return of(null);
        } 

        return this.angularFireAuth.authState.pipe(
          switchMap((user) => {
            if (this.cachedUser) {
              return of(this.cachedUser);
            }

            if (user) {
              return this.firestore
                .collection(this.USERS_COLLECTION)
                .doc<IUserModel>(user.uid)
                .valueChanges()
                .pipe(
                  tap((userData) => {
                    if (userData) {
                      this.cachedUser = userData;
                    }
                  }),
                  switchMap((user) => {
                    if (this.cachedUser) {
                      return of(this.cachedUser);
                    }

                    return of(user);
                  })
                );
            }

            return of(null);
          })
        );
      })
    );
  }
}
