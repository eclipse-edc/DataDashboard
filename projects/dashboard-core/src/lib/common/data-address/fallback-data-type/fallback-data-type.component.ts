import { Component } from '@angular/core';
import { DataTypeInputComponent } from '../data-type-input/data-type-input.component';
import { JsonObjectInputComponent } from '../../json-object-input/json-object-input.component';
import { JsonValue } from '@angular-devkit/core';

@Component({
  selector: 'lib-fallback-data-type',
  templateUrl: './fallback-data-type.component.html',
  imports: [JsonObjectInputComponent],
})
export class FallbackDataTypeComponent extends DataTypeInputComponent {
  constructor() {
    super();
  }

  dataAddressChange(address: Record<string, JsonValue>): void {
    this.changed.emit({ ...address, type: this.type! });
  }
}
