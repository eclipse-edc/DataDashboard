import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from as fromPromise, Observable, of, switchMap } from 'rxjs';
import { UserProfile } from '../../shared/user-profile';
import jwt_decode from 'jwt-decode';

interface DecodedToken {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  dataConnectorUrl: string;
  url: string;
}

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
                const decodedToken = jwt_decode<DecodedToken>(token);
                return <UserProfile>{
                  firstName: decodedToken.firstName,
                  lastName: decodedToken.lastName,
                  email: decodedToken.email,
                  username: decodedToken.username,
                  dataConnectorUrl: decodedToken.dataConnectorUrl,
                  url: decodedToken.url
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
