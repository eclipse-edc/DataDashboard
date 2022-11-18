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
  onSearch: EventEmitter<string> = new EventEmitter<string>();
  searchTerm: string = '';

  @Input()
  hideSearch= false;
}
