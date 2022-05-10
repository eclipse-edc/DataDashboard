import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {first, map, switchMap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {ContractDefinitionEditorDialog} from '../contract-definition-editor-dialog/contract-definition-editor-dialog.component';
import {ContractDefinitionDto, ContractDefinitionService} from "../../../edc-dmgmt-client";


@Component({
  selector: 'contract-definition-viewer',
  templateUrl: './contract-definition-viewer.component.html',
  styleUrls: ['./contract-definition-viewer.component.scss']
})
export class ContractDefinitionViewerComponent implements OnInit {

  filteredContractDefinitions$: Observable<ContractDefinitionDto[]> = of([]);
  searchText = '';
  isTransfering = false;
  private fetch$ = new BehaviorSubject(null);

  constructor(private contractDefinitionService: ContractDefinitionService, private readonly dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.filteredContractDefinitions$ = this.fetch$
      .pipe(
        switchMap(() => {
          const contractDefinitions$ = this.contractDefinitionService.getAllContractDefinitions();
          return !!this.searchText ?
          contractDefinitions$.pipe(map(contractDefinitions => contractDefinitions.filter(contractDefinition => contractDefinition.id.toLowerCase().includes(this.searchText))))
            :
          contractDefinitions$;
        }));
  }

  onSearch() {
    this.fetch$.next(null);
  }

  onEdit(contractDefinition: ContractDefinitionDto) {
    const contractDefinitionClone: ContractDefinitionDto  = JSON.parse(JSON.stringify(contractDefinition));
    const dialogRef = this.dialog.open(ContractDefinitionEditorDialog, {
      data: contractDefinitionClone
    });

    dialogRef.afterClosed().pipe(first()).subscribe((result: { contractDefinition?: ContractDefinitionDto }) => {
      const updatedContractDefinition = result.contractDefinition;
      if (updatedContractDefinition) {
        this.contractDefinitionService.createContractDefinition(updatedContractDefinition).subscribe(() => this.fetch$.next(null));
        this.fetch$.next(null);
      }
    });
  }

  isBusy(assetId: string) {
    return this.isTransfering;
  }

  onCreate() {
    const dialogRef = this.dialog.open(ContractDefinitionEditorDialog);
    dialogRef.afterClosed().pipe(first()).subscribe((result: { contractDefinition?: ContractDefinitionDto }) => {
      const newContractDefinition = result?.contractDefinition;
      if (newContractDefinition) {
        this.contractDefinitionService.createContractDefinition(newContractDefinition).subscribe(() => this.fetch$.next(null));
        this.fetch$.next(null);
      }
    });
  }
}
