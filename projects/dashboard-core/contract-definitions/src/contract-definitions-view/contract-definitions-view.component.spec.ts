import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractDefinitionsViewComponent } from './contract-definitions-view.component';

describe('ContractDefinitionsViewComponent', () => {
  let component: ContractDefinitionsViewComponent;
  let fixture: ComponentFixture<ContractDefinitionsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractDefinitionsViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractDefinitionsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
