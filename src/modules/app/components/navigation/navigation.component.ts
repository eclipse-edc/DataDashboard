import {Component} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {Title} from '@angular/platform-browser';
import {KeycloakService} from "keycloak-angular";
import {Ecosystem} from "./ecosystem.enum";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  isHandset$!: Observable<boolean>;
  ecosystem: Ecosystem = Ecosystem.SEGITTUR;

  constructor(
    public titleService: Title,
    private breakpointObserver: BreakpointObserver,
    private keycloak: KeycloakService
  ) {
    document.body.classList.remove('theme-1', 'theme-2');

    this.loadEcosystemClaim();

    if (this.ecosystem === Ecosystem.SEGITTUR) {
      document.body.classList.add('theme-1');
    } else if (this.ecosystem === Ecosystem.ASTURIAS) {
      document.body.classList.add('theme-2');
    }

    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(result => result.matches),
      shareReplay()
    );
  }

  private loadEcosystemClaim() {
    const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed;
    const raw = tokenParsed?.['ecosystem'] as string;

    if (raw === Ecosystem.ASTURIAS) {
      this.ecosystem = Ecosystem.ASTURIAS;
    } else {
      this.ecosystem = Ecosystem.SEGITTUR;
    }
  }
}

