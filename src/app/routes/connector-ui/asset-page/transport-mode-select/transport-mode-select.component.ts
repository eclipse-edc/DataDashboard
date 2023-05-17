import {Component, HostBinding, Input} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TRANSPORT_MODE_SELECT_DATA} from './transport-mode-select-data';
import {TransportModeSelectItem} from './transport-mode-select-item';

@Component({
  selector: 'transport-mode-select',
  templateUrl: 'transport-mode-select.component.html',
})
export class TransportModeSelectComponent {
  @Input()
  label!: string;

  @Input()
  control!: FormControl<TransportModeSelectItem | null>;

  @HostBinding('class.flex')
  @HostBinding('class.flex-row')
  cls = true;

  items = TRANSPORT_MODE_SELECT_DATA;

  compareWith(
    a: TransportModeSelectItem | null,
    b: TransportModeSelectItem | null,
  ): boolean {
    return a?.id === b?.id;
  }
}
