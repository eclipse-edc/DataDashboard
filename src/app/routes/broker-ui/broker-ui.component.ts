import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Component, Inject} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {APP_CONFIG, AppConfig} from '../../core/config/app-config';
import {TitleUtilsService} from '../../core/services/title-utils.service';
import {routes} from './broker-ui-routing.module';

@Component({
  selector: 'broker-ui-page-layout',
  templateUrl: './broker-ui.component.html',
  styleUrls: ['./broker-ui.component.scss'],
})
export class BrokerUiComponent {
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
