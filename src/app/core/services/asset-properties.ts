/**
 * Asset Property Names
 *
 * SSOT for asset property string names
 */

export const AssetProperties = {
  // edc asset properties
  id: 'asset:prop:id', // needs to start with urn:artifact:
  name: 'asset:prop:name',
  contentType: 'asset:prop:contenttype',
  originator: 'asset:prop:originator',
  originatorOrganization: 'asset:prop:originatorOrganization',
  description: 'asset:prop:description',
  version: 'asset:prop:version',

  // our asset properties
  keywords: 'asset:prop:keywords',
  curatorOrganizationName: 'asset:prop:curatorOrganizationName',
  language: 'asset:prop:language',
  publisher: 'asset:prop:publisher',
  standardLicense: 'asset:prop:standardLicense',
  endpointDocumentation: 'asset:prop:endpointDocumentation',

  // mds specific asset properties
  dataCategory: 'http://w3id.org/mds#dataCategory',
  dataSubcategory: 'http://w3id.org/mds#dataSubcategory',
  dataModel: 'http://w3id.org/mds#dataModel', // guessed
  geoReferenceMethod: 'http://w3id.org/mds#geoReferenceMethod', // guessed
  transportMode: 'http://w3id.org/mds#transportMode',

  /**
   * @deprecated use {@link AssetProperties.curatorOrganizationName} instead
   */
  _legacyCuratorOrganizationName: 'asset:prop:originatorOrganization',
};
