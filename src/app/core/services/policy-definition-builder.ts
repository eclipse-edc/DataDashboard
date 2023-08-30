import {Injectable} from '@angular/core';
import {PolicyDefinitionCreateRequest} from '@sovity.de/edc-client/dist/generated/models/PolicyDefinitionCreateRequest';
import {NewPolicyDialogFormValue} from '../../routes/connector-ui/policy-definition-page/new-policy-dialog/new-policy-dialog-form-model';
import {PolicyDefinition} from './api/legacy-managent-api-client';

@Injectable({
  providedIn: 'root',
})
export class PolicyDefinitionBuilder {
  /**
   * Build {@link PolicyDefinition} from {@link NewPolicyDialogFormValue}
   *
   * @param formValue {@link NewPolicyDialogFormValue}
   */

  buildPolicyDefinition(
    formValue: NewPolicyDialogFormValue,
  ): PolicyDefinitionCreateRequest {
    const policyConstraints = formValue.policy?.constraints;

    const constraints = policyConstraints
      ? policyConstraints.map((constraint) => ({
          left: constraint.left,
          operator: constraint.operator,
          right: constraint.right,
        }))
      : [];

    return {
      policyDefinitionId: formValue.id?.trim() || '',
      uiPolicyDto: {
        constraints: constraints,
      },
    };
  }
}
