import { mount } from 'cypress/angular';
import { JsonldViewerComponent } from '@eclipse-edc/dashboard-core';
import { JsonLdObject } from '@think-it-labs/edc-connector-client';

describe('JsonldViewerComponent', () => {
  it('should display the correct titles for both sections', () => {
    mount(JsonldViewerComponent);

    cy.contains('Compacted JSON-LD').should('exist');
    cy.contains('Expanded JSON-LD').should('exist');
  });

  it('should display compacted and expanded JSON-LD when jsonLdObject is provided', () => {
    const testJsonLdObject: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'John Doe',
    };
    mount(JsonldViewerComponent, {
      componentProperties: {
        jsonLdObject: testJsonLdObject as JsonLdObject,
      },
    });
    // Test for the compacted JSON-LD output
    cy.get('.mockup-code').eq(0).find('pre').should('contain.text', '"@context": {'); // Check for compacted context structure
    cy.get('.mockup-code').eq(0).find('pre').should('contain.text', '"@vocab": "https://w3id.org/edc/v0.0.1/ns/"'); // Check for vocab
    cy.get('.mockup-code').eq(0).find('pre').should('contain.text', '"@type": "http://schema.org/Person"'); // Check for compacted type
    cy.get('.mockup-code').eq(0).find('pre').should('contain.text', '"http://schema.org/name": "John Doe"'); // Check for compacted name

    // Test for the input JSON-LD output
    cy.get('.mockup-code').eq(1).find('pre').should('contain.text', '"@context": "https://schema.org"'); // Check for context
    cy.get('.mockup-code').eq(1).find('pre').should('contain.text', '"@type": "Person"'); // Check for type
    cy.get('.mockup-code').eq(1).find('pre').should('contain.text', '"name": "John Doe"'); // Check for name
  });

  it('should render JSON-LD with line numbers', () => {
    const testJsonLdObject: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'John Doe',
    };
    mount(JsonldViewerComponent, {
      componentProperties: {
        jsonLdObject: testJsonLdObject as JsonLdObject,
      },
    });

    // Compacted object
    cy.get('.mockup-code')
      .eq(0)
      .find('pre')
      .should('have.length', 7)
      .each((element, index) => {
        cy.wrap(element).should('have.attr', 'data-prefix', index + 1);
      });

    // Input object
    cy.get('.mockup-code')
      .eq(1)
      .find('pre')
      .should('have.length', 5)
      .each((element, index) => {
        cy.wrap(element).should('have.attr', 'data-prefix', index + 1);
      });
  });
});
