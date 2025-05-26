import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'lib-consumer-provider-switch',
  templateUrl: './consumer-provider-switch.component.html',
  imports: [NgClass],
})
export class ConsumerProviderSwitchComponent {
  @Input() initialType = 'CONSUMER';
  @Input() consumerTooltip?: string;
  @Input() providerTooltip?: string;
  @Output() changed = new EventEmitter<'CONSUMER' | 'PROVIDER'>();
}
