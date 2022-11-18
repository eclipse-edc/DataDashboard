import {Component, OnInit} from '@angular/core';
import {AppConfigService, AppConfig} from "../../../app-config.service";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-current-user',
  templateUrl: './current-user.component.html',
  styleUrls: ['./current-user.component.scss']
})
export class CurrentUserComponent implements OnInit {

  currentConfig: AppConfig;

  constructor(private conf: AppConfigService) {
    this.currentConfig = conf.getConfig()!;
  }

  ngOnInit(): void {

  }

}
