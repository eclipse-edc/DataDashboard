import {IdResponseDto, PolicyDefinitionDto} from '@sovity.de/edc-client';
import {PolicyDefinitionCreateRequest} from '@sovity.de/edc-client/dist/generated/models/PolicyDefinitionCreateRequest';
import {UiPolicyDto} from '@sovity.de/edc-client/dist/generated/models/UiPolicyDto';

export let policyDefinitions: PolicyDefinitionDto[] = [
  {
    policyDefinitionId: 'test-policy-definition-1',
    uiPolicyDto: {
      policyJsonLd: 'test-policy-json-ld-1',
      constraints: [
        {
          left: 'test-left-1',
          operator: 'EQ',
          right: {type: 'STRING', value: 'test-asset-1'},
        },
      ],
      errors: ['test-error-1'],
    },
  },
];

export const policyDefinitionPage = (): PolicyDefinitionDto[] => {
  return policyDefinitions;
};

export const createPolicyDefinition = (
  request: PolicyDefinitionCreateRequest,
): IdResponseDto => {
  policyDefinitions.push({
    policyDefinitionId: request.policyDefinitionId!,
    uiPolicyDto: request.uiPolicyDto! as UiPolicyDto,
  });

  return {
    id: request.policyDefinitionId,
    lastUpdatedDate: new Date(),
  };
};

export const deletePolicyDefinition = (id: string): IdResponseDto => {
  policyDefinitions = policyDefinitions.filter(
    (it) => it.policyDefinitionId !== id,
  );
  return {id, lastUpdatedDate: new Date()};
};
