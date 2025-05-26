import { Component, Input, OnChanges } from '@angular/core';
import { compact, JsonLdObject } from '@think-it-labs/edc-connector-client';
import { AsyncPipe, NgForOf } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'lib-jsonld-viewer',
  standalone: true,
  imports: [NgForOf, AsyncPipe],
  templateUrl: './jsonld-viewer.component.html',
  styleUrl: './jsonld-viewer.component.css',
})
export class JsonldViewerComponent implements OnChanges {
  @Input() jsonLdObject?: JsonLdObject;
  expanded = new BehaviorSubject<string[]>(['']);
  compacted = new BehaviorSubject<string[]>(['']);

  async ngOnChanges() {
    const expanded = JSON.stringify(this.jsonLdObject, null, 2).split('\n');
    let compacted = await compact(this.jsonLdObject);
    compacted = JSON.stringify(compacted, null, 2).split('\n');

    this.expanded.next(expanded);
    this.compacted.next(compacted);
  }
}
