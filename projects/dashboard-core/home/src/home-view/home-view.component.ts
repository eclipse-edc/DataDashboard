import { Component } from '@angular/core';
import { DashboardStateService } from '@eclipse-edc/dashboard-core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-home-view',
  imports: [AsyncPipe],
  templateUrl: './home-view.component.html',
})
export class HomeViewComponent {
  constructor(
    public readonly stateService: DashboardStateService,
    private readonly router: Router,
  ) {}

  async navigate(path: string) {
    await this.router.navigate([path]);
  }
}
