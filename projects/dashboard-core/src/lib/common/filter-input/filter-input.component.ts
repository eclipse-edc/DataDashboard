/*
 *  Copyright (c) 2025 Fraunhofer-Gesellschaft zur Förderung der angewandten Forschung e.V.
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 *
 *  Contributors:
 *       Fraunhofer-Gesellschaft zur Förderung der angewandten Forschung e.V. - initial API and implementation
 *
 */

import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'lib-filter-input',
  standalone: true,
  imports: [],
  templateUrl: './filter-input.component.html',
  styleUrl: './filter-input.component.css',
})
export class FilterInputComponent {
  @Input() placeholder?: string;
  @Input() focusShortcut?: string[];
  @Output() inputChange = new EventEmitter<string>();

  private currentKeyCombination = new Set<string>();

  @ViewChild('filterInput') inputRef!: ElementRef<HTMLInputElement>;

  onChange(event: Event): void {
    const inputElem = event.target as HTMLInputElement;
    this.inputChange.emit(inputElem.value);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    this.currentKeyCombination.add(event.key);
    this.checkFocusShortcut();
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent): void {
    this.currentKeyCombination.delete(event.key);
  }

  private checkFocusShortcut(): void {
    if (this.focusShortcut && this.focusShortcut.every(key => this.currentKeyCombination.has(key))) {
      this.inputRef.nativeElement.focus();
    }
  }
}
