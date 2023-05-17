import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ActiveFeatureSet} from '../../../core/config/active-feature-set';
import {Policy} from '../../../core/services/api/legacy-managent-api-client';
import {Asset} from '../../../core/services/models/asset';
import {ContractAgreementCardMapped} from '../../../routes/connector-ui/contract-agreement-page/contract-agreement-cards/contract-agreement-card-mapped';
import {JsonDialogComponent} from '../../json-dialog/json-dialog/json-dialog.component';
import {JsonDialogData} from '../../json-dialog/json-dialog/json-dialog.data';
import {PropertyGridGroup} from '../../property-grid/property-grid-group/property-grid-group';
import {PropertyGridField} from '../../property-grid/property-grid/property-grid-field';
import {PropertyGridFieldService} from '../../property-grid/property-grid/property-grid-field.service';

@Injectable()
export class AssetPropertyGridGroupBuilder {
  constructor(
    private matDialog: MatDialog,
    private activeFeatureSet: ActiveFeatureSet,
    private propertyGridUtils: PropertyGridFieldService,
  ) {}

  buildPropertyGridGroups(
    asset: Asset,
    contractAgreement: ContractAgreementCardMapped | null,
    policy: Policy | null,
  ): PropertyGridGroup[] {
    let fieldGroups: PropertyGridGroup[];
    if (contractAgreement != null) {
      fieldGroups = [
        this.buildContractAgreementGroup(contractAgreement),
        this.buildPolicyGroup(asset, policy!!),
        this.buildAssetPropertiesGroup(asset, 'Assets'),
        this.buildAdditionalPropertiesGroup(asset),
      ];
    } else {
      fieldGroups = [
        this.buildAssetPropertiesGroup(asset, null),
        this.buildAdditionalPropertiesGroup(asset),
        this.buildPolicyGroup(asset, policy!!),
      ];
    }

    return fieldGroups.filter((it) => it.properties.length);
  }

  private buildAssetPropertiesGroup(
    asset: Asset,
    groupLabel: string | null,
  ): PropertyGridGroup {
    const fields: PropertyGridField[] = [
      {
        icon: 'category',
        label: 'ID',
        ...this.propertyGridUtils.guessValue(asset.id),
      },
      {
        icon: 'file_copy',
        label: 'Version',
        ...this.propertyGridUtils.guessValue(asset.version),
      },
      {
        icon: 'language',
        label: 'Language',
        ...this.propertyGridUtils.guessValue(asset.language?.label),
      },

      {
        icon: 'apartment',
        label: 'Publisher',
        ...this.propertyGridUtils.guessValue(asset.publisher),
      },
      {
        icon: 'bookmarks',
        label: 'Endpoint Documentation',
        ...this.propertyGridUtils.guessValue(asset.endpointDocumentation),
      },
      {
        icon: 'gavel',
        label: 'Standard License',
        ...this.propertyGridUtils.guessValue(asset.standardLicense),
      },
      {
        icon: 'link',
        label: 'Connector Endpoint',
        ...this.propertyGridUtils.guessValue(asset.originator),
      },
      {
        icon: 'account_circle',
        label: 'Organization',
        ...this.propertyGridUtils.guessValue(asset.originatorOrganization),
      },
      {
        icon: 'category',
        label: 'Content Type',
        ...this.propertyGridUtils.guessValue(asset.contentType),
      },
    ];

    if (this.activeFeatureSet.hasMdsFields()) {
      fields.push(...this.buildMdsProperties(asset, true));
    }

    return {
      groupLabel,
      properties: fields,
    };
  }

  private buildAdditionalPropertiesGroup(asset: Asset): PropertyGridGroup {
    const fields: PropertyGridField[] = [];

    if (!this.activeFeatureSet.hasMdsFields()) {
      fields.push(...this.buildMdsProperties(asset, false));
    }

    fields.push(
      ...asset.additionalProperties.map((prop) => {
        return {
          icon: 'category ',
          label: prop.key,
          ...this.propertyGridUtils.guessValue(prop.value),
        };
      }),
    );

    return {
      groupLabel: 'Additional Properties',
      properties: fields,
    };
  }

  private buildMdsProperties(
    asset: Asset,
    includeEmpty: boolean,
  ): PropertyGridField[] {
    const fields: PropertyGridField[] = [];
    if (includeEmpty || asset.transportMode) {
      fields.push({
        icon: 'commute',
        label: 'Transport Mode',
        ...this.propertyGridUtils.guessValue(asset.transportMode?.label),
      });
    }
    if (includeEmpty || asset.dataCategory) {
      fields.push({
        icon: 'commute',
        label: 'Data Category',
        ...this.propertyGridUtils.guessValue(asset.dataCategory?.label),
      });
    }
    if (includeEmpty || asset.dataSubcategory) {
      fields.push({
        icon: 'commute',
        label: 'Data Subcategory',
        ...this.propertyGridUtils.guessValue(asset.dataSubcategory?.label),
      });
    }
    if (includeEmpty || asset.dataModel) {
      fields.push({
        icon: 'category',
        label: 'Data Model',
        ...this.propertyGridUtils.guessValue(asset.dataModel),
      });
    }
    if (includeEmpty || asset.geoReferenceMethod) {
      fields.push({
        icon: 'commute',
        label: 'Geo Reference Method',
        ...this.propertyGridUtils.guessValue(asset.geoReferenceMethod),
      });
    }
    return fields;
  }

  private onShowPolicyDetailsClick(
    asset: Asset,
    policyDetails: Policy,
    title: string,
  ) {
    const data: JsonDialogData = {
      title,
      subtitle: asset.name,
      icon: 'policy',
      objectForJson: policyDetails,
    };
    this.matDialog.open(JsonDialogComponent, {data});
  }

  private buildPolicyGroup(asset: Asset, contractPolicy: Policy | null) {
    let properties: PropertyGridField[] = [];
    if (contractPolicy) {
      properties.push({
        icon: 'policy',
        label: 'Contract Policy',
        text: 'Show Policy Details',
        onclick: () =>
          this.onShowPolicyDetailsClick(
            asset,
            contractPolicy,
            'Contract Policy',
          ),
      });
    }
    return {groupLabel: 'Policies', properties};
  }

  private buildContractAgreementGroup(
    contractAgreement: ContractAgreementCardMapped,
  ) {
    return {
      groupLabel: 'Contract Agreement',
      properties: [
        {
          icon: 'category',
          label: 'Signed',
          ...this.propertyGridUtils.guessValue(
            this.propertyGridUtils.formatDate(
              contractAgreement.contractSigningDate,
            ),
          ),
        },
        {
          icon: 'category',
          label: 'Valid From',
          ...this.propertyGridUtils.guessValue(
            this.propertyGridUtils.formatDate(
              contractAgreement.contractStartDate,
            ),
          ),
        },
        {
          icon: 'category',
          label: 'Valid To',
          ...this.propertyGridUtils.guessValue(
            this.propertyGridUtils.formatDate(
              contractAgreement.contractEndDate,
            ),
          ),
        },
        {
          icon: 'policy',
          label: 'Direction',
          ...this.propertyGridUtils.guessValue(contractAgreement.direction),
        },
        {
          icon: 'link',
          label: 'Other Connector Endpoint',
          ...this.propertyGridUtils.guessValue(
            contractAgreement.counterPartyAddress,
          ),
        },
        {
          icon: 'link',
          label: 'Other Connector ID',
          ...this.propertyGridUtils.guessValue(
            contractAgreement.counterPartyId,
          ),
        },
        {
          icon: 'category',
          label: 'Contract Agreement ID',
          ...this.propertyGridUtils.guessValue(
            contractAgreement.contractAgreementId,
          ),
        },
      ],
    };
  }
}
