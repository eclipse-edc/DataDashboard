import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { take } from 'rxjs/operators';
import { routes } from '../../app-routing.module';
import { UserProfile } from '../../shared/user-profile';
import { AuthenticationService } from '../../core/authentication/authentication.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  routes = routes;
  public profile: UserProfile | null = null;
  public isMenuOpen = true;

  @Output() public toggleMenuEvent = new EventEmitter<number>();

  constructor(private authenticationService: AuthenticationService) {
    this.authenticationService.userProfile$.subscribe(userProfile => {
      this.profile = userProfile
      if (!userProfile) {
        throw new Error('UserProfile is null or undefined.');
      }})
  }

  public ngOnInit(): void {
    this.authenticationService.userProfile$.pipe(take(1)).subscribe(profile => (this.profile = profile));
  }

  public logout(): void {
    this.authenticationService.logout();
  }

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.toggleMenuEvent.emit(this.isMenuOpen ? 295 : 75);
  }

  getGroupLogoSource(): string {
    if (this.profile?.group === 'LMIS') {
      return '/assets/theme/company-logos/lmis-ag-logo-ohne-slogan-default.svg';
    } else if (this.profile?.group === 'HSOS') {
      return '/assets/theme/company-logos/lmis-ag-logos-forschungspartner-hochschule-osnabrueck-default.svg';
    } else if (this.profile?.group === 'AgBRAIN') {
      return '/assets/theme/company-logos/lmis-ag-logos-forschungspartner-agbrain-default.svg';
    } else {
      return '/assets/theme/company-logos/default-logo.svg';
    }
  }
  
}
