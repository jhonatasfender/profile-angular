import { catchError, from, Observable, of, switchMap } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { IUserModel, IUserWithPasswordModel } from '../models/user.model';

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
    userData: Omit<IUserWithPasswordModel, 'uid'>
  ): Observable<void> {
    return from(
      this.angularFireAuth.createUserWithEmailAndPassword(
        userData.email,
        userData.password
      )
    ).pipe(
      switchMap(({ user }) =>
        user
          ? from(
              this.firestore
                .collection(this.USERS_COLLECTION)
                .doc(user.uid)
                .set({ uid: user.uid, ...userData })
            )
          : of()
      ),
      catchError((error) => {
        console.error('Erro ao cadastrar usuário:', error);
        return of();
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
      .collection<IUserModel>(this.USERS_COLLECTION)
      .valueChanges();
  }

  private getLoggedInUserData(): Observable<IUserModel | null> {
    return this.angularFireAuth.idToken.pipe(
      switchMap((token) =>
        !token ? of(null) : this.angularFireAuth.authState
      ),
      switchMap((user) => {
        if (!user) {
          return of(null);
        }

        if (this.cachedUser) {
          return of(this.cachedUser);
        }

        return this.firestore
          .collection(this.USERS_COLLECTION)
          .doc<IUserModel>(user.uid)
          .valueChanges()
          .pipe(
            tap((userData) => {
              if (userData && userData !== this.cachedUser) {
                this.cachedUser = userData;
              }
            }),
            map(() => this.cachedUser)
          );
      }),
      catchError(() => of(this.cachedUser))
    );
  }
}
