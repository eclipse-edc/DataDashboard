import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './app-toolbar.component.html',
  styleUrls: ['./app-toolbar.component.scss']
})
export class AppToolbarComponent {
  @Output()
  searchPressed: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  onSearch: EventEmitter<SearchParams> = new EventEmitter<SearchParams>();
  labelSearchTerm: string = '';
  locationSearchTerm: string = '';

  @Input()
  hideSearch= false;

  doSearch() {
    this.onSearch.next({label: this.labelSearchTerm, location: this.locationSearchTerm})
  }
}

export interface SearchParams{
  label: string,
  location: string
}
