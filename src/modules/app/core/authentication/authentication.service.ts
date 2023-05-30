import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from as fromPromise, Observable, of, switchMap } from 'rxjs';
import { UserProfile } from '../../shared/user-profile';
import jwt_decode from 'jwt-decode';

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
              this.keycloakService.getToken().then(token => {
                const userProfile = jwt_decode<UserProfile>(token);
                return <UserProfile>{
                  firstName: userProfile.firstName,
                  lastName: userProfile.lastName,
                  email: userProfile.email,
                  preferred_username: userProfile.preferred_username,
                  dataConnectorUrl: userProfile.dataConnectorUrl,
                  url: userProfile.url,
                  storageEndpoint: userProfile.storageEndpoint,
                  group: userProfile.group
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
