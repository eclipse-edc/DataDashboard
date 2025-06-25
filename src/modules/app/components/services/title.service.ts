import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AppTitleService {
  private pageTitleSubject = new BehaviorSubject<string>(''); // default
  public pageTitle$ = this.pageTitleSubject.asObservable();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private titleService: Title
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getDeepestChild(this.route)),
      switchMap(route => {
        const titleKey = route.snapshot.data['title'];
        return titleKey ? this.translate.get(titleKey) : [''];
      })
    ).subscribe(translatedTitle => {
      this.pageTitleSubject.next(translatedTitle);
      setTimeout(() => {
        this.titleService.setTitle(translatedTitle);
      }, 0);
    });
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}
