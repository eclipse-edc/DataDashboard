import {
  AfterViewInit,
  Component,
  ComponentRef,
  EventEmitter,
  Input,
  Output,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Component({
  selector: 'lib-delete-confirm',
  templateUrl: './deletion-confirm.component.html',
  styleUrl: './deletion-confirm.component.css',
  standalone: true,
})
export class DeleteConfirmComponent<C> implements AfterViewInit {
  @Output() canceled = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  @Input() customText?: string;
  @Input() componentType?: Type<C>;
  @Input() componentInputs?: Partial<Record<keyof C, any>>;

  @ViewChild('componentCard', { read: ViewContainerRef, static: true })
  private readonly componentCard!: ViewContainerRef;

  ngAfterViewInit() {
    if (this.componentType) {
      const ref = this.componentCard.createComponent(this.componentType);
      this.setInputs(ref, this.componentInputs);
    }
  }

  private setInputs<C>(component: ComponentRef<C>, inputs?: Partial<Record<keyof C, any>>): void {
    if (inputs) {
      for (const key in inputs) {
        component.setInput(key, inputs[key]);
      }
    }
  }
}
