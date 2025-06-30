import { mount } from 'cypress/angular';
import { FormGroup } from '@angular/forms';
import { DataTypeInputComponent } from '@eclipse-edc/dashboard-core';

it('should add the form control on ngOnChanges', () => {
  const parentForm = new FormGroup({});
  mount(DataTypeInputComponent, {
    componentProperties: { parentForm },
  });
  expect(parentForm.get('dataTypeForm')).to.exist;
});

it('should remove the form control on ngOnDestroy', () => {
  const parentForm = new FormGroup({});
  mount(DataTypeInputComponent, {
    componentProperties: { parentForm },
  }).then(wrapper => {
    wrapper.component.ngOnDestroy();
    expect(parentForm.get('dataTypeForm')).to.be.null;
  });
});
