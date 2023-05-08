import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-context-switcher',
  templateUrl: './context-switcher.component.html',
  styleUrls: ['./context-switcher.component.scss']
})
export class ContextSwitcherComponent implements OnInit {


  platformForm = new FormControl();

  constructor() {
  }

  ngOnInit(): void {

  }
}
