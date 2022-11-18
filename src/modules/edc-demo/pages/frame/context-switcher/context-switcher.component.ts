import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {AppConfig, AppConfigService} from "../../../../app/app-config.service";

@Component({
  selector: 'app-context-switcher',
  templateUrl: './context-switcher.component.html',
  styleUrls: ['./context-switcher.component.scss']
})
export class ContextSwitcherComponent implements OnInit {

  appConfigs!: AppConfig[];
  currentConfig!: AppConfig

  platformForm = new FormControl();

  constructor(private configService: AppConfigService) {
  }

  ngOnInit(): void {
    this.configService.getAllConfigs().subscribe(configs => {
      this.appConfigs = configs;
      this.currentConfig = this.configService.getConfig()!;
      this.platformForm.patchValue(this.currentConfig!.id);
      this.platformForm.valueChanges.subscribe((v: string) => {
        this.configService.setCurId(v)
      })
    });
  }
}
