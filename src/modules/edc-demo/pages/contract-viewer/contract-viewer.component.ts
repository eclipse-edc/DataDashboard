import {Component, OnInit} from '@angular/core';
import {
  AssetService,
  ContractAgreementDto,
  ContractAgreementService,
  TransferId,
  TransferProcessService,
  TransferRequestDto
} from "../../../edc-dmgmt-client";
import { from, Observable, of} from "rxjs";
import {Asset} from "../../models/asset";
import {filter, first, map, switchMap, tap} from "rxjs/operators";
import {NotificationService} from "../../services/notification.service";
import {
  CatalogBrowserTransferDialog
} from "../../components/catalog-browser-transfer-dialog/catalog-browser-transfer-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {CatalogBrowserService} from "../../services/catalog-browser.service";
import {Router} from "@angular/router";
import {TransferProcessStates} from "../../models/transfer-process-states";
import {Title} from "@angular/platform-browser";
import { AuthenticationService } from 'src/modules/app/core/authentication/authentication.service';
import { HttpClient } from '@angular/common/http';

interface RunningTransferProcess {
  processId: string;
  contractId: string;
  state: TransferProcessStates;
}

@Component({
  selector: 'app-contract-viewer',
  templateUrl: './contract-viewer.component.html',
  styleUrls: ['./contract-viewer.component.scss']
})
export class ContractViewerComponent implements OnInit {

  contracts$: Observable<ContractAgreementDto[]> = of([]);
  private runningTransfers: RunningTransferProcess[] = [];
  private pollingHandleTransfer?: any;
  public userName: string = "";
  public dataConnectorUrl: string = "";

  constructor(private contractAgreementService: ContractAgreementService,
              private assetService: AssetService,
              public dialog: MatDialog,
              private transferService: TransferProcessService,
              private catalogService: CatalogBrowserService,
              private router: Router,
              private notificationService: NotificationService,
              private authenticationService: AuthenticationService,
              protected httpClient: HttpClient,
              public titleService: Title) {
  }

  private static isFinishedState(state: string): boolean {
    return [
      "COMPLETED",
      "ERROR",
      "ENDED"].includes(state);
  }

  ngOnInit(): void {
    // Filter contracts only to where the current user's connector is the consumer. This should be done without checking the assetId once
    // consumers and provider IDs are properly set during the contract agreement.
    this.contracts$ = this.contractAgreementService.getAllAgreements()
      .pipe(map(a => a.filter(b=> b.assetId.includes("urn:artifact"))));

      this.authenticationService.userProfile$.subscribe(userProfile => {
        if (!userProfile) {
          throw new Error('UserProfile is null or undefined.');
        }
        this.dataConnectorUrl = userProfile.dataConnectorUrl;
        })
  }

  asDate(epochSeconds?: number): string {
    if (epochSeconds) {
      const d = new Date(0);
      d.setUTCSeconds(epochSeconds);
      return d.toLocaleDateString();
    }
    return '';
  }

  getAsset(assetId?: string): Observable<Asset> {
    return assetId ? this.assetService.getAsset(assetId).pipe(map(a => new Asset(a.properties))) : of();
  }

  onTransferClicked(contract: ContractAgreementDto) {
    const dialogRef = this.dialog.open(CatalogBrowserTransferDialog, {width: "30em"});

    dialogRef.afterClosed().pipe(first()).subscribe(result => {
      if (!result) {
        return;
      }
      this.createTransferRequest(contract, result)
        .pipe(switchMap(trq => this.transferService.initiateTransfer(trq)))
        .subscribe(transferId => {
          this.startPolling(transferId, contract.id!);
        }, error => {
          console.error(error);
          this.notificationService.showError("Error initiating transfer");
        });
    });
  }

  isTransferInProgress(contractId: string): boolean {
    return !!this.runningTransfers.find(rt => rt.contractId === contractId);
  }


  private createTransferRequest(contract: ContractAgreementDto, storageProperties: any): Observable<TransferRequestDto> {

    return this.getOfferedAssetForId(contract.assetId!).pipe(map(offeredAsset => {
      return {
        assetId: offeredAsset.id,
        contractId: contract.id,
        connectorId: "consumer", //doesn't matter, but cannot be null
        dataDestination: {
          properties: {
            ...storageProperties,
            type: "AmazonS3",
            region: "us-east-1"
          }
        },
        managedResources: true,
        transferType: {isFinite: true}, //must be there, otherwise NPE on backend
        connectorAddress: offeredAsset.originator,
        protocol: 'ids-multipart'
      };
    }));

  }

  /**
   * This method is used to obtain that URL of the connector that is offering a particular asset from the catalog.
   * This is a bit of a hack, because currently there is no "clean" way to get the counter-party's URL for a ContractAgreement.
   *
   * @param assetId Asset ID of the asset that is associated with the contract.
   */
  private getOfferedAssetForId(assetId: string): Observable<Asset> {
    return this.catalogService.getContractOffers()
      .pipe(
        map(offers => offers.find(o => `urn:artifact:${o.asset.id}` === assetId)),
        map(o => {
          if (o) return o.asset;
          else throw new Error(`No offer found for asset ID ${assetId}`);
        }))
  }

  private startPolling(transferProcessId: TransferId, contractId: string) {
    // track this transfer process
    this.runningTransfers.push({
      processId: transferProcessId.id!,
      state: TransferProcessStates.REQUESTED,
      contractId: contractId
    });

    if (!this.pollingHandleTransfer) {
      this.pollingHandleTransfer = setInterval(this.pollRunningTransfers(), 1000);
    }

  }

  private pollRunningTransfers() {
    return () => {
      from(this.runningTransfers) //create from array
        .pipe(switchMap(t => this.catalogService.getTransferProcessesById(t.processId)), // fetch from API
          filter(tpDto => ContractViewerComponent.isFinishedState(tpDto.state)), // only use finished ones
          tap(tpDto => {
            // remove from in-progress
            this.runningTransfers = this.runningTransfers.filter(rtp => rtp.processId !== tpDto.id)
            this.notificationService.showInfo(`Der Transfer [${tpDto.id}] wurde abgeschlossen!`, "Zu meinen Downloads", () => {
              this.router.navigate(['/transfer-history'])
            })
          }),
        ).subscribe(() => {
        // clear interval if necessary
        if (this.runningTransfers.length === 0) {
          clearInterval(this.pollingHandleTransfer);
          this.pollingHandleTransfer = undefined;
        }
      }, error => this.notificationService.showError(error))
    }

  }
}
