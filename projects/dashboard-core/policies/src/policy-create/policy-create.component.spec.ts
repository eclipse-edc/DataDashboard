import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyCreateComponent } from './policy-create.component';

describe('PolicyCreateComponent', () => {
  let component: PolicyCreateComponent;
  let fixture: ComponentFixture<PolicyCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyCreateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
