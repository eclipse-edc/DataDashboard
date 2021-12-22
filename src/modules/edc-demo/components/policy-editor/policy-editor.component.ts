import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, first, switchMap } from 'rxjs/operators';
import { EdcDemoApiService } from '../../services/edc-demo-api.service';
import { MatDialog } from '@angular/material/dialog';
import { PolicyEditorDialog } from '../policy-editor-dialog/policy-editor-dialog.component';
import { ContractDefinition } from '../../models/api/contract-definition';


@Component({
  selector: 'edc-demo-policy-editor',
  templateUrl: './policy-editor.component.html',
  styleUrls: ['./policy-editor.component.scss']
})
export class PolicyEditorComponent implements OnInit {

  private fetch$ = new BehaviorSubject(null);
  filteredContractDefinitions$: Observable<ContractDefinition[]> = of([]);
  searchText = '';
  isTransfering = false;

  constructor(private apiService: EdcDemoApiService, private readonly dialog: MatDialog) { }

  ngOnInit(): void {
    this.filteredContractDefinitions$ = this.fetch$
      .pipe(
        switchMap(() => {
          const contractDefinitions$ = this.apiService.getContractDefinitions();
          return !!this.searchText ?
          contractDefinitions$.pipe(map(contractDefinitions => contractDefinitions.filter(contractDefinition => contractDefinition.id.toLowerCase().includes(this.searchText))))
            :
          contractDefinitions$;
        }));
  }

  onSearch() {
    this.fetch$.next(null);
  }

  onEdit(contractDefinition: ContractDefinition) {
    const contractDefinitionClone: ContractDefinition  = JSON.parse(JSON.stringify(contractDefinition));
    const dialogRef = this.dialog.open(PolicyEditorDialog, {
      data: contractDefinitionClone
    });

    dialogRef.afterClosed().pipe(first()).subscribe((result: { contractDefinition?: ContractDefinition }) => {
      const updatedContractDefinition = result.contractDefinition;
      if (updatedContractDefinition) {
        this.apiService.updateContractDefinition(updatedContractDefinition).subscribe(() => this.fetch$.next(null));
        this.fetch$.next(null);
      }
    });
  }

  isBusy(assetId: string) {
    return this.isTransfering && assetId === 'test-document-az_connector3';
  }

  onCreate() {
    const dialogRef = this.dialog.open(PolicyEditorDialog);
    dialogRef.afterClosed().pipe(first()).subscribe((result: { contractDefinition?: ContractDefinition }) => {
      const newContractDefinition = result.contractDefinition;
      if (newContractDefinition) {
          this.apiService.createContractDefinition(newContractDefinition).subscribe(() => this.fetch$.next(null));
          this.fetch$.next(null);
      }
    });
  }
}
