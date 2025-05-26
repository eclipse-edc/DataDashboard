import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContractAgreement, ContractNegotiation } from '@think-it-labs/edc-connector-client';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'lib-contract-agreement-card',
  standalone: true,
  imports: [DatePipe, NgClass],
  templateUrl: './contract-agreement-card.component.html',
  styleUrl: './contract-agreement-card.component.css',
})
export class ContractAgreementCardComponent {
  @Input() agreement!: ContractAgreement;
  @Input() negotiation!: ContractNegotiation;
  @Input() showButtons = true;
  @Input() disableTransfer = false;

  @Output() detailsEvent = new EventEmitter<ContractAgreement>();
  @Output() transferEvent = new EventEmitter<ContractAgreement>();
}
