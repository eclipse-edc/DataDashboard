import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { CatalogDataset } from '../catalog-dataset';

@Component({
  selector: 'lib-catalog-card',
  standalone: true,
  imports: [NgIf],
  templateUrl: './catalog-card.component.html',
  styleUrl: './catalog-card.component.css',
})
export class CatalogCardComponent implements OnInit {
  @Input() catalogDataset?: CatalogDataset;
  @Input() showButtons = true;

  @Output() detailsEvent = new EventEmitter<CatalogDataset>();
  @Output() negotiateEvent = new EventEmitter<CatalogDataset>();

  name?: string;
  version?: string;
  contentType?: string;
  participantId?: string;

  ngOnInit() {
    this.name = this.catalogDataset?.assetId;
    this.version = this.catalogDataset?.dataset?.['asset:prop:version']?.[0]?.['@value'];
    this.contentType = this.catalogDataset?.dataset.mandatoryValue('edc', 'contenttype');
    this.participantId = this.catalogDataset?.participantId;
  }
}
