import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {first, map, switchMap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {AssetEntryDto, AssetService,} from "../../../edc-dmgmt-client";
import {AssetEditorDialog} from "../asset-editor-dialog/asset-editor-dialog.component";
import {Asset} from "../../models/asset";

@Component({
  selector: 'edc-demo-asset-viewer',
  templateUrl: './asset-viewer.component.html',
  styleUrls: ['./asset-viewer.component.scss']
})
export class AssetViewerComponent implements OnInit {

  filteredAssets$: Observable<Asset[]> = of([]);
  searchText = '';
  isTransfering = false;
  private fetch$ = new BehaviorSubject(null);

  constructor(private assetService: AssetService, private readonly dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.filteredAssets$ = this.fetch$
      .pipe(
        switchMap(() => {
          const assets$ = this.assetService.getAllAssets().pipe(map(assets => assets.map(asset => new Asset(asset.properties))));
          return !!this.searchText ?
            assets$.pipe(map(assets => assets.filter(asset => asset.name.includes(this.searchText))))
            :
            assets$;
        }));
  }

  isBusy() {
    return this.isTransfering;
  }

  onSearch() {
    this.fetch$.next(null);
  }

  onDelete(asset: Asset) {
    this.assetService.removeAsset(asset.id)
      .subscribe(() => this.fetch$.next(null));
  }

  onCreate() {
    const dialogRef = this.dialog.open(AssetEditorDialog);
    dialogRef.afterClosed().pipe(first()).subscribe((result: { assetEntryDto?: AssetEntryDto }) => {
      const newAsset = result?.assetEntryDto;
      if (newAsset) {
        this.assetService.createAsset(newAsset).subscribe(() => this.fetch$.next(null));
      }
    });
  }
}
