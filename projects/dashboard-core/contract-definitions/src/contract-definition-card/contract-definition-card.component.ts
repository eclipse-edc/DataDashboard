import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContractDefinition } from '@think-it-labs/edc-connector-client';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'lib-contract-definition-card',
  imports: [NgForOf, NgIf],
  templateUrl: './contract-definition-card.component.html',
  standalone: true,
  styleUrl: './contract-definition-card.component.css',
})
export class ContractDefinitionCardComponent {
  @Input() contractDefinition!: ContractDefinition;
  @Input() showButtons = true;

  @Output() openDetailsEvent = new EventEmitter<ContractDefinition>();
  @Output() editContractDefinitionEvent = new EventEmitter<ContractDefinition>();
  @Output() deleteContractDefinitionEvent = new EventEmitter<ContractDefinition>();
}
