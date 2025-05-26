import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { IdResponse, TransferProcessStates } from '@think-it-labs/edc-connector-client';
import { NgClass } from '@angular/common';
import { CatalogService } from '../catalog.service';
import { ModalAndAlertService } from '@eclipse-edc/dashboard-core';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-negotiation-progress',
  templateUrl: './negotiation-progress.component.html',
  imports: [NgClass],
})
export class NegotiationProgressComponent implements OnChanges, OnDestroy {
  @Input() negotiationId!: IdResponse;
  @Input() pullIntervalMs = 500;

  polling = true;
  currentState?: string;
  stateHistory: string[] = [];
  happyPathStates: string[] = ['INITIAL', 'REQUESTED', 'OFFERED', 'ACCEPTED', 'AGREED', 'VERIFIED', 'FINALIZED'];
  happyPath = true;
  exceptionStates: string[] = ['TERMINATED'];

  errorMsg?: string;

  private statusJob?: ReturnType<typeof setInterval>;

  constructor(
    private readonly catalogService: CatalogService,
    private readonly modalAndAlertService: ModalAndAlertService,
    private readonly router: Router,
  ) {}

  async ngOnChanges() {
    if (this.negotiationId.id) {
      this.currentState = (await this.catalogService.getNegotiationState(this.negotiationId.id)).state;
      if (this.stateHistory.length === 0) {
        this.stateHistory.push(this.currentState);
      }
      this.stopStatusJob();
      this.startStatusJob();
    }
  }

  startStatusJob(): void {
    this.statusJob = setInterval(this.pullStatus.bind(this), this.pullIntervalMs);
    this.polling = true;
  }

  stopStatusJob(): void {
    if (this.statusJob) {
      clearInterval(this.statusJob);
      this.statusJob = undefined;
      this.polling = false;
    }
  }

  navigateToContracts(): void {
    this.modalAndAlertService.closeModal();
    this.router.navigate(['/contracts']);
  }

  private async pullStatus() {
    try {
      this.currentState = (await this.catalogService.getNegotiationState(this.negotiationId.id)).state;
      if (this.stateHistory.length === 0 || this.stateHistory[this.stateHistory.length - 1] !== this.currentState) {
        this.stateHistory.push(this.currentState);
      } else {
        return;
      }
      if (this.happyPath) {
        // Non-normal path
        if (this.exceptionStates.includes(this.currentState)) {
          this.happyPath = false;
          this.stopStatusJob();
        } else {
          // Include missed states due to pull mechanism
          this.stateHistory = this.happyPathStates.slice(0, this.happyPathStates.indexOf(this.currentState) + 1);
        }
      }
      if (this.currentState === 'FINALIZED') {
        this.stopStatusJob();
      }
    } catch (error) {
      console.error('Error fetching transfer process status:', error);
    }
  }

  ngOnDestroy(): void {
    this.stopStatusJob();
  }

  protected readonly TransferProcessStates = TransferProcessStates;
}
