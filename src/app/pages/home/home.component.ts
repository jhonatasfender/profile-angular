import { switchMap } from 'rxjs';

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';

import { RegisterUserComponent } from '../../components/dialogs/register-user/register-user.component';
import { IUserModel } from '../../models/user.model';
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  public readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  public displayedColumns = ['name', 'email', 'profile'];
  public dataSource: IUserModel[] = [];
  public userProfile?: string | null = null;
  public isAdmin = false;

  public ngOnInit(): void {
    this.loadUserProfile();
    this.loadUsersList();
  }

  private loadUserProfile(): void {
    this.authService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        console.log('===============>>>>>>>>>>>>>>>>>>>>>>>>>>', user);

        if (user) {
          this.userProfile = user.profile;
          this.isAdmin = user.profile === 'administrator';
        }
      });
  }

  private loadUsersList(): void {
    this.authService
      .listUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((users) => {
        this.dataSource = users;
      });
  }

  public openUserDialog(): void {
    this.dialog
      .open(RegisterUserComponent)
      .afterClosed()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => this.authService.listUsers())
      )
      .subscribe((users) => (this.dataSource = users));
  }

  public logout(): void {
    this.authService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.router.navigate(['/login']);
      });
  }

  public castProfile(profile: string): string {
    if (profile === 'administrator') {
      return 'Administrador';
    }

    if (profile === 'user') {
      return 'Usuário';
    }

    return 'Perfil não encontrado';
  }
}
