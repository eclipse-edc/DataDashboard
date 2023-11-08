import {Component, OnInit} from '@angular/core';
import { ContractAgreement, ContractDefinition, PolicyDefinition } from '@think-it-labs/edc-connector-client';
import { Asset } from '@think-it-labs/edc-connector-client/dist/src/entities/asset';
import { Observable, map, of } from 'rxjs';
import { AssetService, ContractAgreementService, ContractDefinitionService, PolicyService } from 'src/modules/mgmt-api-client';

@Component({
  selector: 'edc-demo-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.scss']
})
export class IntroductionComponent implements OnInit{


  dataOfferingCount$: Observable<number> = of(0);
  assetCount$: Observable<number> = of(0);
  policyCount$: Observable<number> = of(0);
  preconfiguredCatalogCount: number =0;
  contractAgreementCount$: Observable<number> = of(0);

  constructor(private assetService:AssetService, private policyService:PolicyService,
     private contractDefinitionService:ContractDefinitionService, private contractAgreementService:ContractAgreementService){
  }

  ngOnInit(): void {

   this.assetCount$ = this.assetService.requestAssets().pipe(
      map((assetArray: Asset[])=>{
        return assetArray.length;
      })
    )

    this.policyCount$ = this.policyService.getAllPolicies().pipe(
      map((policies:PolicyDefinition[])=>{
        return policies.length;
      })
    )

    this.dataOfferingCount$ = this.contractDefinitionService.getAllContractDefinitions().pipe(
      map((contractDefinitions: ContractDefinition[])=>{
        return contractDefinitions.length;
      })
    )

    this.contractAgreementCount$ = this.contractAgreementService.queryAllAgreements().pipe(
      map((contractAgreements: ContractAgreement[])=>{
        return contractAgreements.length;
      })
    )



  }



}
