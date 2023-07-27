import { Component } from '@angular/core';
import { CatalogBrowserService } from '../../services/catalog-browser.service';

@Component({
  selector: 'app-your-component',
  templateUrl: './catalog-browser-confirmation.component.html',
  styleUrls: ['./catalog-browser-confirmation.component.scss']
})

export class CatalogBrowserConfirmation {
  contractOffers: any = [];

  constructor(private catalogBrowserService: CatalogBrowserService) { }

  ngOnInit() {
    this.fetchContractOffers();
  }
  
  fetchContractOffers() {
    this.catalogBrowserService.getContractOffers().subscribe(
      (contractOffers) => {
        this.contractOffers = contractOffers;
        console.log(contractOffers)
      },
      (error) => {
        console.error('Error fetching contract offers:', error);
      }
    );
  }
}
