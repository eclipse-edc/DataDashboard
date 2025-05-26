import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { JsonPipe, NgForOf, NgIf } from '@angular/common';
import { JsonValue } from '@angular-devkit/core';

@Component({
  selector: 'lib-json-object-table',
  standalone: true,
  imports: [NgIf, NgForOf, JsonPipe],
  templateUrl: './json-object-table.component.html',
  styleUrl: './json-object-table.component.css',
})
export class JsonObjectTableComponent implements OnChanges {
  @Input() object!: Record<string, JsonValue>;
  @Input() excludeKeys: string[] = [];
  @Input() deleteButton = false;
  @Output() delete = new EventEmitter<string>();

  keys: string[] = [];

  ngOnChanges() {
    this.keys = Object.keys(this.object).filter(key => !this.excludeKeys.includes(key));
  }
}
