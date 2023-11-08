import { Component, OnInit } from '@angular/core';
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
export class NavigationComponent{

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  routes = routes;
  panelOpenState = false;
  consumerRoutes:any[]=[];
  providerRoutes:any[] =[];
  dashboardRoute:any;

  constructor(
    public titleService: Title,
    private breakpointObserver: BreakpointObserver) {
      routes.slice(0,-1).forEach((route:any)=>{
        
        if (route?.path === "dashboard"){
          this.dashboardRoute = route;
        }else if(route?.data?.isConsumerMode){
          this.consumerRoutes.push(route);
        }else{
          this.providerRoutes.push(route)
        }
      })
  }
}
