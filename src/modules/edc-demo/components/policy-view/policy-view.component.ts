import {Component, OnInit} from '@angular/core';
import {Policy, PolicyService} from "../../../edc-dmgmt-client";
import {BehaviorSubject, Observable, Observer, of, Subscriber} from "rxjs";
import {first, map, switchMap} from "rxjs/operators";
import {MatDialog} from "@angular/material/dialog";
import {NewPolicyDialogComponent} from "../new-policy-dialog/new-policy-dialog.component";
import {NotificationService} from "../../services/notification.service";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-policy-view',
  templateUrl: './policy-view.component.html',
  styleUrls: ['./policy-view.component.scss']
})
export class PolicyViewComponent implements OnInit {

  filteredPolicies$: Observable<Policy[]> = of([]);
  searchText: string = '';
  private fetch$ = new BehaviorSubject(null);
  private readonly errorOrUpdateSubscriber: Observer<string>;

  constructor(private policyService: PolicyService,
              private notificationService: NotificationService,
              private readonly dialog: MatDialog) {

    this.errorOrUpdateSubscriber = {
      next: x => this.fetch$.next(null),
      error: err => this.showError(err),
      complete: () => {
        this.notificationService.showInfo("Successfully completed")
      },
    }
  }

  ngOnInit(): void {
    this.filteredPolicies$ = this.fetch$.pipe(
      switchMap(() => {
        const contractDefinitions$ = this.policyService.getAllPolicies();
        return !!this.searchText ?
          contractDefinitions$.pipe(map(policies => policies.filter(policy => this.isFiltered(policy, this.searchText))))
          :
          contractDefinitions$;
      }));
  }

  onSearch() {
    this.fetch$.next(null);
  }

  onCreate() {
    const dialogRef = this.dialog.open(NewPolicyDialogComponent)
    dialogRef.afterClosed().pipe(first()).subscribe((result: { policy?: Policy }) => {
      const newPolicy = result?.policy;
      if (newPolicy) {
        this.policyService.createPolicy(newPolicy).subscribe(this.errorOrUpdateSubscriber);
      }
    })
  }

  /**
   * simple full-text search - serialize to JSON and see if "searchText"
   * is contained
   */
  private isFiltered(policy: Policy, searchText: string) {
    return JSON.stringify(policy).includes(searchText);
  }

  delete(policy: Policy) {
    this.policyService.deletePolicy(policy.uid).subscribe(this.errorOrUpdateSubscriber);
  }

  private showError(error: Error) {
    console.error(error)
    this.notificationService.showError('This policy cannot be deleted');
  }
}
