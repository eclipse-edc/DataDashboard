import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-item-count-selector',
  templateUrl: './item-count-selector.component.html',
  imports: [FormsModule],
})
export class ItemCountSelectorComponent {
  @Input() currentItemCount = 10;
  @Output() itemCountChanged = new EventEmitter<number>();

  change(event: Event) {
    this.itemCountChanged.emit(Number((event.target as HTMLInputElement).value));
    (document.activeElement as HTMLElement)?.blur();
  }
}
