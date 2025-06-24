import {Component, OnInit} from '@angular/core';
import {PolicyService} from "../../../../mgmt-api-client";
import {BehaviorSubject, Observable, Observer, of} from "rxjs";
import {first, map, switchMap} from "rxjs/operators";
import {MatDialog} from "@angular/material/dialog";
import {NewPolicyDialogComponent} from "../new-policy-dialog/new-policy-dialog.component";
import {NotificationService} from "../../../services/notification.service";
import {ConfirmationDialogComponent, ConfirmDialogModel} from "../../confirmation-dialog/confirmation-dialog.component";
import {PolicyDefinition, PolicyDefinitionInput, IdResponse, Asset} from "../../../../mgmt-api-client/model";
import {PolicyDetailsDialogComponent} from "../policy-details-dialog/policy-details-dialog.component";
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-policy-view',
  templateUrl: './policy-view.component.html',
  styleUrls: ['./policy-view.component.scss']
})
export class PolicyViewComponent implements OnInit {

  filteredPolicies$: Observable<PolicyDefinition[]> = of([]);
  searchText: string = '';
  private fetch$ = new BehaviorSubject(null);
  private readonly errorOrUpdateSubscriber: Observer<IdResponse>;

  constructor(private policyService: PolicyService,
              private notificationService: NotificationService,
              private readonly dialog: MatDialog) {

    this.errorOrUpdateSubscriber = {
      next: x => this.fetch$.next(null),
      error: err => this.showError(err, "An error occurred."),
      complete: () => {
        this.notificationService.showInfo("Successfully completed")
      },
    }

  }

  ngOnInit(): void {
    this.filteredPolicies$ = this.fetch$.pipe(
      switchMap(() => {
        const policyDefinitions = this.policyService.queryAllPolicies().pipe(
          tap(policies => console.log('Fetched policy definitions:', policies))
        );
        return !!this.searchText ?
          policyDefinitions.pipe(map(policies => policies.filter(policy => this.isFiltered(policy, this.searchText))))
          :
          policyDefinitions;
      }));
  }

  openPolicyDialog(policy: PolicyDefinition): void {
    const mergedPolicy = {
      '@id': policy['@id'],
      "@context": policy['@context'],
      'edc:createdAt': policy.createdAt,
      ...policy['edc:policy']
    };

    this.dialog.open(PolicyDetailsDialogComponent, {
      data: { policy: mergedPolicy }
    }).afterClosed().subscribe(result => {
      if (result?.delete) {
        this.delete(policy);
      }
    });
  }


  onSearch() {
    this.fetch$.next(null);
  }

  onCreate() {
    const dialogRef = this.dialog.open(NewPolicyDialogComponent);
    dialogRef.afterClosed().pipe(first()).subscribe({ next: (newPolicyDefinition: PolicyDefinitionInput) => {
        if (newPolicyDefinition) {
          this.policyService.createPolicy(newPolicyDefinition).subscribe(
            {
              next: (response: IdResponse) => this.errorOrUpdateSubscriber.next(response),
              error: (error: Error) => this.showError(error, "An error occurred while creating the policy.")
            }
          );
        }
      }
    });
  }

  /**
   * simple full-text search - serialize to JSON and see if "searchText"
   * is contained
   */
  private isFiltered(policy: PolicyDefinition, searchText: string) {
    return JSON.stringify(policy).includes(searchText);
  }

  delete(policy: PolicyDefinition) {

    let policyId = policy['@id']!;
    const dialogData = ConfirmDialogModel.forDelete("policy", policyId);

    const ref = this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: 'auto',
      height: 'auto',
      data: dialogData
    });

    ref.afterClosed().subscribe({

      next: (res: any) => {
        if (res) {
          this.policyService.deletePolicy(policyId).subscribe(
            {
              next: (response: IdResponse) => this.errorOrUpdateSubscriber.next(response),
              error: (error: Error) => this.showError(error, "An error occurred while deleting the policy.")
            }
          );
        }
      }
    });
  }

  getBpnConstraint(policy: PolicyDefinition): string | null {
    const edcPolicy = policy['edc:policy'];
    if (!edcPolicy) return null;

    const permission = edcPolicy['odrl:permission'];
    if (!permission) return null;
    const constraint = permission['odrl:constraint'];
    if (!constraint) return null;

    const leftOperandValue = constraint['odrl:leftOperand'];
    if (!leftOperandValue) return null;
    const rightOperandValue = constraint['odrl:rightOperand'];
    if (!rightOperandValue) return null;

    const isBpn = leftOperandValue?.toString().includes('BusinessPartnerNumber');

    return isBpn && rightOperandValue ? `BPN: ${rightOperandValue}` : null;
  }



  private showError(error: Error, errorMessage: string) {
    console.error(error);
    this.notificationService.showError(errorMessage);
  }
}
