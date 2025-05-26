import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Asset } from '@think-it-labs/edc-connector-client';
import { NgIf } from '@angular/common';

@Component({
  selector: 'lib-asset-card',
  standalone: true,
  imports: [NgIf],
  templateUrl: './asset-card.component.html',
  styleUrl: './asset-card.component.css',
})
export class AssetCardComponent implements OnChanges {
  @Input() asset?: Asset;
  @Input() showButtons = true;

  @Output() detailsEvent = new EventEmitter<Asset>();
  @Output() editEvent = new EventEmitter<Asset>();
  @Output() deleteEvent = new EventEmitter<Asset>();

  name?: string;
  type?: string;
  contentType?: string;

  ngOnChanges() {
    this.name = this.asset?.properties.optionalValue('edc', 'name');
    this.contentType = this.asset?.properties.optionalValue('edc', 'contenttype');
    this.type = this.asset?.dataAddress.mandatoryValue('edc', 'type');
  }
}
