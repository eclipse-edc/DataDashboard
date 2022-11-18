import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ContractOffer} from "../../../models/contract-offer";
import {ContractNegotiationDto, NegotiationInitiateRequestDto} from "../../../../edc-dmgmt-client";
import {CatalogBrowserService} from "../../../services/catalog-browser.service";
import {NegotiationResult} from "../../../models/negotiation-result";
import {NotificationService} from "../../../services/notification.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.scss']
})
export class AssetDetailsComponent implements OnInit {

  runningNegotiation?: NegotiationResult;
  finishedNegotiation?: ContractNegotiationDto;
  private pollingHandleNegotiation?: any;

  constructor(@Inject(MAT_DIALOG_DATA) public contractOffer: ContractOffer,
              private apiService: CatalogBrowserService,
              private notificationService: NotificationService,
              private router: Router,
              public dialog: MatDialogRef<AssetDetailsComponent>) {
    console.log(contractOffer)
  }

  ngOnInit(): void {
  }


  onNegotiateClicked(contractOffer: ContractOffer) {
    const initiateRequest: NegotiationInitiateRequestDto = {
      connectorAddress: contractOffer.asset.originator,

      offer: {
        offerId: contractOffer.id,
        assetId: contractOffer.asset.id,
        policy: contractOffer.policy,
      },
      connectorId: 'connector-id',
      protocol: 'ids-multipart'
    };

    const finishedNegotiationStates = [
      "CONFIRMED",
      "DECLINED",
      "ERROR"];

    this.apiService.initiateNegotiation(initiateRequest).subscribe(negotiationId => {
      this.runningNegotiation = {
        id: negotiationId,
        offerId: initiateRequest.offer.offerId
      };

      if (!this.pollingHandleNegotiation) {
        // there are no active negotiations
        this.pollingHandleNegotiation = setInterval(() => {
          // const finishedNegotiations: NegotiationResult[] = [];

          this.apiService.getNegotiationState(this.runningNegotiation!.id).subscribe(updatedNegotiation => {
            if (finishedNegotiationStates.includes(updatedNegotiation.state)) {
              let offerId = this.runningNegotiation!.offerId;
              delete this.runningNegotiation;

              if (updatedNegotiation.state === "CONFIRMED") {
                this.finishedNegotiation = updatedNegotiation;
                this.notificationService.showInfo("Purchase complete!", "Show me!", () => {
                  this.router.navigate(['/contracts'])
                })
              }
            }

            if (!this.runningNegotiation) {
              clearInterval(this.pollingHandleNegotiation);
              this.pollingHandleNegotiation = undefined;
            }
          });
        }, 1000);
      }
    }, error => {
      console.error(error);
      this.notificationService.showError("Error starting negotiation");
    });
  }

  isBusy(contractOffer: ContractOffer) {
    return this.runningNegotiation !== undefined;
  }


  isNegotiated(contractOffer: ContractOffer) {
    return false
  }
}
