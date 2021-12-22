import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AssetEntry } from '../../models/api/asset-entry';
import { StorageType } from '../../models/api/storage-type';
import { Asset } from '../../models/asset';
import { EdcDemoApiService } from '../../services/edc-demo-api.service';

@Component({
  selector: 'edc-demo-asset-publisher',
  templateUrl: './asset-publisher.component.html',
  styleUrls: ['./asset-publisher.component.scss']
})
export class AssetPublisherComponent implements OnInit {

  storageTypes$: Observable<StorageType[]> = of([]); 
  id: string = '';
  version: string = '';
  name: string = '';
  address: string = '';
  storageTypeId: string = '';

  constructor(private apiService: EdcDemoApiService) { }

  ngOnInit(): void {
    this.storageTypes$ = this.apiService.getStorageTypes();
  }

  clearForm() {
    this.id = '';
    this.version = '';
    this.name = '';
    this.address = '';
  }

  onPublish() {
    const assetEntry: AssetEntry = {
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
        type: this.storageTypeId
      }
    };

    console.log(assetEntry);
    this.apiService.createAssetEntry(assetEntry).subscribe(() => this.clearForm());
  }
}
