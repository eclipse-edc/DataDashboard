import { createOutputSpy, mount } from 'cypress/angular';
import { FallbackDataTypeComponent } from '@eclipse-edc/dashboard-core';

it('should change the data address', () => {
  mount(FallbackDataTypeComponent, {
    componentProperties: {
      changed: createOutputSpy('changed'),
    },
  }).then(wrapper => {
    wrapper.component.dataAddressChange({ key: 'value' });
    cy.get('@changed').should('have.been.calledOnce');
  });
});
