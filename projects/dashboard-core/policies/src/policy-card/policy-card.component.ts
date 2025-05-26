import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Policy, PolicyDefinition } from '@think-it-labs/edc-connector-client';
import { NgIf } from '@angular/common';

@Component({
  selector: 'lib-policy-card',
  standalone: true,
  imports: [NgIf],
  templateUrl: './policy-card.component.html',
  styleUrl: './policy-card.component.css',
})
export class PolicyCardComponent implements OnChanges {
  @Input() policyDefinition?: PolicyDefinition;
  @Input() showButtons = true;

  @Output() detailsEvent = new EventEmitter<PolicyDefinition>();
  @Output() editEvent = new EventEmitter<PolicyDefinition>();
  @Output() deleteEvent = new EventEmitter<PolicyDefinition>();

  id?: string;
  policy?: Policy;
  policyType?: string;
  hasPermissions = false;
  hasProhibitions = false;
  hasObligations = false;

  ngOnChanges() {
    this.id = this.policyDefinition?.id;
    this.policy = this.policyDefinition?.policy;

    // Extract the last part of the policy type URL
    const types = this.policy!.types();
    if (types && types.length > 0) {
      this.policyType = types[0].split('/').pop(); // Get the last element after the last '/'
    }

    if (this.policy && this.policy.permissions.length > 0) {
      this.hasPermissions = true;
    }
    if (this.policy && this.policy.prohibitions.length > 0) {
      this.hasProhibitions = true;
    }
    if (this.policy && this.policy.obligations.length > 0) {
      this.hasObligations = true;
    }
  }
}
