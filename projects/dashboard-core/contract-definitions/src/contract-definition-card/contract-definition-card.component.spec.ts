import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractDefinitionCardComponent } from './contract-definition-card.component';

describe('ContractDefinitionCardComponent', () => {
  let component: ContractDefinitionCardComponent;
  let fixture: ComponentFixture<ContractDefinitionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractDefinitionCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractDefinitionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
