import {Component} from '@angular/core';
import data from '../../../../data.json';

@Component({
  selector: 'edc-demo-introduction',
  templateUrl: './catalog-browser-confirmation.component.html',
  styleUrls: ['./catalog-browser-confirmation.component.scss']
})

export class CatalogBrowserConfirmation {
  id = data[0].id;
  provider = data[0].provider;
  start = data[0].contractStart;
  consumer = data[0].consumer;
}
