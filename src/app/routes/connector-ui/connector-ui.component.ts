import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Component, Inject, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {APP_CONFIG, AppConfig} from '../../core/config/app-config';
import {TitleUtilsService} from '../../core/services/title-utils.service';
import {routes} from './connector-ui-routing.module';

@Component({
  selector: 'connector-ui-page-layout',
  templateUrl: './connector-ui.component.html',
  styleUrls: ['./connector-ui.component.scss'],
})
export class ConnectorUiComponent implements OnInit {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay(),
    );

  routes = routes;

  constructor(
    @Inject(APP_CONFIG) public config: AppConfig,
    public titleUtilsService: TitleUtilsService,
    public titleService: Title,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit() {
    this.titleUtilsService.startUpdatingTitleFromRouteData();
  }
}
