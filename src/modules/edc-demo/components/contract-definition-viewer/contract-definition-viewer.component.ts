import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {first, map, switchMap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {ContractDefinitionEditorDialog} from '../contract-definition-editor-dialog/contract-definition-editor-dialog.component';
import {ContractDefinitionDto, ContractDefinitionService} from "../../../edc-dmgmt-client";


@Component({
  selector: 'edc-demo-contract-definition-viewer',
  templateUrl: './contract-definition-viewer.component.html',
  styleUrls: ['./contract-definition-viewer.component.scss']
})
export class ContractDefinitionViewerComponent implements OnInit {

  filteredContractDefinitions$: Observable<ContractDefinitionDto[]> = of([]);
  searchText = '';
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

  onDelete(contractDefinition: ContractDefinitionDto) {
    this.contractDefinitionService.deleteContractDefinition(contractDefinition.id).subscribe(() => this.fetch$.next(null));
  }

  onCreate() {
    const dialogRef = this.dialog.open(ContractDefinitionEditorDialog);
    dialogRef.afterClosed().pipe(first()).subscribe((result: { contractDefinition?: ContractDefinitionDto }) => {
      const newContractDefinition = result?.contractDefinition;
      if (newContractDefinition) {
        this.contractDefinitionService.createContractDefinition(newContractDefinition).subscribe(() => this.fetch$.next(null));
      }
    });
  }

}
