import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'lib-pagination',
  standalone: true,
  imports: [NgForOf],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent<T> implements OnInit, OnChanges {
  @Input() items!: T[] | null;
  @Input() pageItemCount!: number;
  @Output() pageItems = new EventEmitter<T[]>();

  totalPages = 0;
  currentPage = 0;

  ngOnInit() {
    this.calcPages();
  }

  ngOnChanges() {
    this.calcPages();
  }

  calcPages() {
    if (this.items && this.pageItemCount > 0) {
      this.totalPages = Math.max(0, Math.ceil(this.items.length / this.pageItemCount) - 1);
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
      this.emitCurrentPageItems();
    }
  }

  emitCurrentPageItems() {
    const start = this.currentPage * this.pageItemCount;
    const end = start + this.pageItemCount;
    this.pageItems.emit(this.items!.slice(start, end));
  }

  forward() {
    this.currentPage += 1;
    this.emitCurrentPageItems();
  }

  backward() {
    this.currentPage -= 1;
    this.emitCurrentPageItems();
  }

  jump(page: number) {
    if (page >= 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.emitCurrentPageItems();
    }
  }
}
