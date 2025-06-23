import {Component} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {Title} from '@angular/platform-browser';
import {KeycloakService} from "keycloak-angular";
import {Ecosystem} from "./ecosystem.enum";
import {AppTitleService} from "../services/title.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  isHandset$!: Observable<boolean>;
  ecosystem: Ecosystem = Ecosystem.SEGITTUR;

  pageTitle$!: Observable<string>;
  currentLang = 'en';


  constructor(
    public titleService: AppTitleService,
    private breakpointObserver: BreakpointObserver,
    private keycloak: KeycloakService,
    private translate: TranslateService
  ) {
    document.body.classList.remove('theme-1', 'theme-2');
    this.pageTitle$ = this.titleService.pageTitle$;
    this.loadEcosystemClaim();
    this.currentLang = translate.currentLang || 'en';

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

  switchLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLang = lang;
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

  logout(): void {
    //TODO logout user, but what do we do after
    this.keycloak.logout(window.location.origin);
  }
}

