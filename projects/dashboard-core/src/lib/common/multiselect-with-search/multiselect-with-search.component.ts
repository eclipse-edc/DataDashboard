import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxFloatUiModule, NgxFloatUiPlacements, NgxFloatUiTriggers } from 'ngx-float-ui';

@Component({
  selector: 'lib-multiselect-with-search',
  imports: [FormsModule, NgxFloatUiModule, NgStyle],
  templateUrl: './multiselect-with-search.component.html',
  standalone: true,
})
export class MultiselectWithSearchComponent<T> implements OnChanges {
  @Input() items: T[] = [];
  @Input() preSelectedItems: T[] = [];
  @Input() displayFn: (item: T) => string = item => String(item);
  @Input() maxHeight = 200;

  @Output() selectedItemsChange = new EventEmitter<T[]>();

  filteredOptions: T[] = [];
  selectedOptions = new Set<T>();
  searchInput = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items']) {
      this.updateFilteredOptions();
    }
    if (changes['preSelectedItems']) {
      this.preSelectedItems.forEach(x => this.selectedOptions.add(x));
    }
  }

  updateFilteredOptions() {
    if (this.searchInput) {
      this.filteredOptions = this.items.filter(x =>
        this.displayFn(x).toLowerCase().includes(this.searchInput.toLowerCase()),
      );
    } else {
      this.filteredOptions = this.items;
    }
  }

  toggleItem(item: T) {
    if (this.selectedOptions.has(item)) {
      this.selectedOptions.delete(item);
    } else {
      this.selectedOptions.add(item);
    }
    this.selectedItemsChange.emit(Array.from(this.selectedOptions));
  }

  protected readonly NgxFloatUiPlacements = NgxFloatUiPlacements;
  protected readonly NgxFloatUiTriggers = NgxFloatUiTriggers;
}
