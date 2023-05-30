import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { take } from 'rxjs/operators';
import { routes } from '../../app-routing.module';
import { UserProfile } from '../../shared/user-profile';
import { AuthenticationService } from '../../core/authentication/authentication.service';

enum Group {
  LMIS = 'LMIS',
  HSOS = 'HSOS',
  AgBRAIN = 'AgBRAIN'
}

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

  constructor(private authenticationService: AuthenticationService) {}

  public ngOnInit(): void {
    this.authenticationService.userProfile$.subscribe(userProfile => {
      if (!userProfile) {
        throw new Error('UserProfile is null or undefined.');
      }
      this.profile = userProfile
      })
  }

  public logout(): void {
    this.authenticationService.logout();
  }

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.toggleMenuEvent.emit(this.isMenuOpen ? 295 : 75);
  }
  
  getGroupLogoSource(): string {
    let logoDir = "/assets/theme/company-logos/"
    switch (this.profile?.group) {
      case Group.LMIS:
        return logoDir + "lmis.svg"
      case Group.HSOS:
        return logoDir + "hsos.svg"
      case Group.AgBRAIN:
        return logoDir + "agbrain.svg"
      default:
        throw new Error("Could not determine groupLogoPath.");
    }
  }

}
