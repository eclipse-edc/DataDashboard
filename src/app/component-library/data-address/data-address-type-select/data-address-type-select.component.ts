import {
  Component,
  HostBinding,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DataAddressType} from './data-address-type';
import {dataAddressTypeSelectItems} from './data-address-type-select-items';
import {DataAddressTypeSelectMode} from './data-address-type-select-mode';

@Component({
  selector: 'data-address-type-select',
  templateUrl: 'data-address-type-select.component.html',
})
export class DataAddressTypeSelectComponent implements OnChanges {
  @Input()
  label!: string;

  @Input()
  control!: FormControl<DataAddressType | null>;

  @HostBinding('class.flex')
  @HostBinding('class.flex-row')
  cls = true;

  @Input()
  mode: DataAddressTypeSelectMode = 'Datasource';

  items = dataAddressTypeSelectItems(this.mode);
  ngOnChanges(changes: SimpleChanges) {
    if (changes.mode) {
      this.items = dataAddressTypeSelectItems(this.mode);
    }
  }
}
