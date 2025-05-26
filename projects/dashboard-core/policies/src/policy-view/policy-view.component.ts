import { Component, OnDestroy, OnInit } from '@angular/core';
import { PolicyService } from '../policy.service';
import { AsyncPipe } from '@angular/common';
import { IdResponse, PolicyDefinition } from '@think-it-labs/edc-connector-client';
import { from, map, Observable, of, Subject, takeUntil } from 'rxjs';
import {
  DashboardStateService,
  DeleteConfirmComponent,
  FilterInputComponent,
  ItemCountSelectorComponent,
  JsonldViewerComponent,
  ModalAndAlertService,
  PaginationComponent,
} from '@eclipse-edc/dashboard-core';
import { PolicyCreateComponent } from '../policy-create/policy-create.component';
import { PolicyCardComponent } from '../policy-card/policy-card.component';

@Component({
  selector: 'lib-policy-view',
  standalone: true,
  imports: [AsyncPipe, FilterInputComponent, PaginationComponent, PolicyCardComponent, ItemCountSelectorComponent],
  templateUrl: './policy-view.component.html',
  styleUrl: './policy-view.component.css',
})
export class PolicyViewComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  policies$: Observable<PolicyDefinition[]> = of([]);
  filteredPolicies$: Observable<PolicyDefinition[]> = of([]);
  pagePolicies$: Observable<PolicyDefinition[]> = of([]);
  fetched = false;
  pageItemCount = 15;

  constructor(
    public policyService: PolicyService,
    private readonly modalAndAlertService: ModalAndAlertService,
    private readonly stateService: DashboardStateService,
  ) {
    this.stateService.currentEdcConfig$.pipe(takeUntil(this.destroy$)).subscribe(this.fetchPolicies.bind(this));
  }

  async ngOnInit() {
    this.fetchPolicies();
  }

  async openDetails(policy: PolicyDefinition) {
    this.modalAndAlertService.openModal(JsonldViewerComponent, { jsonLdObject: policy });
  }

  filter(searchText: string) {
    if (searchText) {
      const lower = searchText.toLowerCase();
      this.filteredPolicies$ = this.policies$.pipe(
        map(policies => policies.filter(policy => policy.id.includes(lower))),
      );
    } else {
      this.filteredPolicies$ = this.policies$;
    }
  }

  paginationEvent(pageItems: PolicyDefinition[]) {
    this.pagePolicies$ = of(pageItems);
  }

  createPolicy() {
    const callbacks = {
      created: (id: IdResponse) => {
        this.modalAndAlertService.closeModal();
        this.modalAndAlertService.showAlert(`Policy with ID '${id['@id']}'`, 'Created Successfully', 'success', 5);
        this.fetchPolicies();
      },
    };
    this.modalAndAlertService.openModal(PolicyCreateComponent, undefined, callbacks);
  }

  async editPolicy(policyDefinition: PolicyDefinition) {
    const callbacks = {
      updated: () => {
        this.modalAndAlertService.closeModal();
        this.modalAndAlertService.showAlert(
          `Policy with ID '${policyDefinition.id}'`,
          'updated successfully',
          'success',
          5,
        );
        this.fetchPolicies();
      },
    };
    this.modalAndAlertService.openModal(PolicyCreateComponent, { policyDefinition: policyDefinition }, callbacks);
  }

  deletePolicy(policy: PolicyDefinition) {
    this.modalAndAlertService.openModal(
      DeleteConfirmComponent,
      {
        customText: 'Do you really want to delete this Policy?',
        componentType: PolicyCardComponent,
        componentInputs: { policyDefinition: policy, showButtons: false },
      },
      {
        canceled: () => this.modalAndAlertService.closeModal(),
        confirm: () => {
          this.modalAndAlertService.closeModal();
          this.policyService
            .deletePolicy(policy.id)
            .then(() => {
              const msg = `Policy '${policy.id}' deleted successfully`;
              this.modalAndAlertService.showAlert(msg, undefined, 'success', 5);
              this.policies$ = this.filteredPolicies$ = from(this.policyService.getAllPolicies());
            })
            .catch(error => {
              console.error(error);
              const msg = `Deletion of asset '${policy.id}' failed`;
              this.modalAndAlertService.showAlert(msg, undefined, 'error', 5);
            });
        },
      },
    );
  }

  private fetchPolicies() {
    this.fetched = false;
    this.policies$ = this.filteredPolicies$ = of([]);
    this.policies$ = this.filteredPolicies$ = from(
      this.policyService.getAllPolicies().finally(() => (this.fetched = true)),
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
