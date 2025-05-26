import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { DashboardStateService, EdcConfig, ModalAndAlertService } from '@eclipse-edc/dashboard-core';
import { FormsModule } from '@angular/forms';
import { CatalogRequest } from '@think-it-labs/edc-connector-client/dist/src/entities/catalog';
import { AsyncPipe, NgClass } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CatalogRequestFormComponent } from '../catalog-request-form/catalog-request-form.component';

@Component({
  selector: 'lib-catalog-request',
  standalone: true,
  imports: [FormsModule, AsyncPipe, NgClass],
  templateUrl: './catalog-request.component.html',
})
export class CatalogRequestComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @ViewChild('connectorSelect', { static: false }) connectorSelect?: ElementRef;

  @Input() showSearchTooltip = false;
  @Input() federatedCatalog = false;
  @Output() catalogRequested = new EventEmitter<CatalogRequest>();

  protocol = 'dataspace-protocol-http';
  selectedConnector?: EdcConfig;

  constructor(
    public readonly stateService: DashboardStateService,
    private readonly modalAndAlertService: ModalAndAlertService,
  ) {
    this.stateService.currentEdcConfig$.pipe(takeUntil(this.destroy$)).subscribe(this.resetSelector.bind(this));
  }

  getCatalog() {
    (document.activeElement as HTMLElement)?.blur();
    if (this.selectedConnector) {
      const request: CatalogRequest = {
        counterPartyAddress: this.selectedConnector.protocolUrl,
      };
      if (this.selectedConnector.did) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (request as any).counterPartyId = this.selectedConnector.did;
      }
      this.catalogRequested.emit(request);
    }
  }

  openRequestForm() {
    this.modalAndAlertService.openModal(CatalogRequestFormComponent, undefined, {
      request: (request: CatalogRequest) => {
        this.modalAndAlertService.closeModal();
        this.getUnknownCatalog(request);
      },
    });
  }

  getUnknownCatalog(request: CatalogRequest): void {
    this.resetSelector();
    this.catalogRequested.emit(request);
  }

  private resetSelector() {
    this.selectedConnector = undefined;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
