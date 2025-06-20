import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { routes } from '../../app-routing.module';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  isHandset$!: Observable<boolean>; // declare it

  routes = routes;

  constructor(
    public titleService: Title,
    private breakpointObserver: BreakpointObserver
  ) {
    document.body.classList.remove('theme-1', 'theme-2');
    document.body.classList.add('theme-1');

    // now breakpointObserver is initialized, so it's safe to use
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(result => result.matches),
      shareReplay()
    );
  }
}

