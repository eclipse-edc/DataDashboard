import { Component, OnInit } from '@angular/core';
import { DashboardAppComponent, EdcConfig } from '@eclipse-edc/dashboard-core';
import { menuItems } from './app.routes';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [DashboardAppComponent],
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'tmp';
  protected readonly menuItems = menuItems;
  protected readonly themes = [
    'light',
    'dark',
    'dim',
    'aqua',
    'nord',
    'synthwave',
    'forest',
    'dracula',
    'night',
    'coffee',
    'emerald',
  ];
  protected readonly healthCheckInterval = 30;
  edcConfigs?: Promise<EdcConfig[]>;

  constructor(private readonly http: HttpClient) {}

  ngOnInit() {
    this.edcConfigs = firstValueFrom(this.http.get<EdcConfig[]>('config/edc-connector-config.json'));
  }
}
