import { Injectable } from '@angular/core';
import {Ecosystem} from "../navigation/ecosystem.enum";

@Injectable({ providedIn: 'root' })
export class EcosystemService {
  ecosystem: Ecosystem = Ecosystem.SEGITTUR;

  applyEcosystemSettings(): void {
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;

    // Remove existing theme classes
    document.body.classList.remove('theme-1', 'theme-2');

    if (this.ecosystem === Ecosystem.ASTURIAS) {
      document.body.classList.add('theme-2');
      if (favicon) favicon.href = 'assets/favicon-asturias.ico';
    } else {
      document.body.classList.add('theme-1');
      if (favicon) favicon.href = 'assets/favicon-segittur.ico';
    }
  }
}

