import {Component, Inject, OnInit} from '@angular/core';
import {StorageType} from '../../models/storage-type';
import {AssetEntryDto, AssetService} from "../../../edc-dmgmt-client";

@Component({
  selector: 'edc-demo-asset-publisher',
  templateUrl: './asset-publisher.component.html',
  styleUrls: ['./asset-publisher.component.scss']
})
export class AssetPublisherComponent implements OnInit {

  id: string = '';
  version: string = '';
  name: string = '';
  address: string = '';
  storageTypeId: string = '';

  constructor(private assetService: AssetService, @Inject('STORAGE_TYPES') public storageTypes: StorageType[]) {
  }

  ngOnInit(): void {
  }

  clearForm() {
    this.id = '';
    this.version = '';
    this.name = '';
    this.address = '';
  }

  onPublish() {
    const assetEntry: AssetEntryDto = {
      asset: {
        properties: {
          "asset:prop:name": this.name,
          "asset:prop:version": this.version,
          "asset:prop:id": this.id
        }
      },
      dataAddress: {
        properties: {
          "address": this.address,
          "type": this.storageTypeId
        },
      }
    };

    this.assetService.createAsset(assetEntry).subscribe(() => this.clearForm());
  }
}
