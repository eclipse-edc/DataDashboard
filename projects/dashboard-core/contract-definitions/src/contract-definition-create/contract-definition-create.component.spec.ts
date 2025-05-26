import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractDefinitionCreateComponent } from './contract-definition-create.component';

describe('ContractDefinitionCreateComponent', () => {
  let component: ContractDefinitionCreateComponent;
  let fixture: ComponentFixture<ContractDefinitionCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractDefinitionCreateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractDefinitionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
