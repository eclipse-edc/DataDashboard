import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject, debounceTime, Observable, of, skip} from 'rxjs';
import {CatalogBrowserService} from "../../services/catalog-browser.service";
import {ContractNegotiationDto} from "../../../edc-dmgmt-client";
import {TransferProcessStates} from "../../models/transfer-process-states";
import {ContractOffer} from "../../models/contract-offer";
import {NegotiationResult} from "../../models/negotiation-result";
import {Title} from "@angular/platform-browser";
import {AssetDetailsComponent} from "./asset-details/asset-details.component";

interface RunningTransferProcess {
  processId: string;
  assetId?: string;
  state: TransferProcessStates;
}

@Component({
  selector: 'edc-demo-catalog-browser',
  templateUrl: './catalog-browser.component.html',
  styleUrls: ['./catalog-browser.component.scss']
})
export class CatalogBrowserComponent implements OnInit {

  filteredContractOffers$: Observable<ContractOffer[]> = of([]);
  runningTransferProcesses: RunningTransferProcess[] = [];
  runningNegotiations: Map<string, NegotiationResult> = new Map<string, NegotiationResult>(); // contractOfferId, NegotiationResult
  finishedNegotiations: Map<string, ContractNegotiationDto> = new Map<string, ContractNegotiationDto>(); // contractOfferId, contractAgreementId
  private fetch$ = new BehaviorSubject<string>('');

  constructor(private apiService: CatalogBrowserService,
              public dialog: MatDialog,
              public titleService: Title) {
  }

  ngOnInit(): void {
    this.filteredContractOffers$ = this.apiService.getContractOffers();

    this.fetch$
      .pipe(debounceTime(300), skip(1))
      .subscribe((searchTerm) => this.filteredContractOffers$ = this.apiService.getFilteredContractOffers(searchTerm));
  }

  onSearch(event: string) {
    this.fetch$.next(event);
  }


  isBusy(contractOffer: ContractOffer) {
    return this.runningNegotiations.get(contractOffer.id) !== undefined || !!this.runningTransferProcesses.find(tp => tp.assetId === contractOffer.asset.id);
  }

  getState(contractOffer: ContractOffer): string {
    const transferProcess = this.runningTransferProcesses.find(tp => tp.assetId === contractOffer.asset.id);
    if (transferProcess) {
      return TransferProcessStates[transferProcess.state];
    }

    const negotiation = this.runningNegotiations.get(contractOffer.id);
    if (negotiation) {
      return 'negotiating';
    }

    return '';
  }

  isNegotiated(contractOffer: ContractOffer) {
    return this.finishedNegotiations.get(contractOffer.id) !== undefined;
  }

  openDetails(contractOffer: ContractOffer) {
    this.dialog.open(AssetDetailsComponent, {
      data: contractOffer,
      height: '80%',
      width: '50%',
      minWidth: '1000px'
    })
  }
}
