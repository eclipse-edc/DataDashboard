import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from as fromPromise, Observable, of, switchMap } from 'rxjs';
import { UserProfile } from '../../shared/user-profile';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  public isAuthenticated$: Observable<boolean>;
  public userProfile$: Observable<UserProfile | null>;

  constructor(private keycloakService: KeycloakService) {
    this.isAuthenticated$ = fromPromise(this.keycloakService.isLoggedIn());

    this.userProfile$ = this.isAuthenticated$.pipe(
      switchMap(isAuthenticated =>
        isAuthenticated
          ? fromPromise(
              this.keycloakService.loadUserProfile().then(keycloakProfile => {
                return <UserProfile>{
                  firstName: keycloakProfile.firstName,
                  lastName: keycloakProfile.lastName,
                  email: keycloakProfile.email,
                  username: keycloakProfile.username,
                };
              })
            )
          : of(null)
      )
    );
  }

  public login(): void {
    this.keycloakService.login();
  }

  public logout(redirectUri: string = window.location.origin): void {
    this.keycloakService.logout(redirectUri);
  }
}
