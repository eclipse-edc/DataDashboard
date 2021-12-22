import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Asset } from '../../models/asset';
import { EdcDemoApiService } from '../../services/edc-demo-api.service';

@Component({
  selector: 'edc-demo-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.scss']
})
export class IntroductionComponent {
}
