export interface NegotiationState {
    id: string
    correlationId: any
    counterPartyId: string
    counterPartyAddress: string
    protocol: string
    type: string
    state: number
    stateCount: number
    stateTimestamp: number
    errorDetail: any
    contractAgreement: ContractAgreement
    contractOffers: ContractOffer[]
    lastContractOffer: LastContractOffer
  }
  
  export interface ContractAgreement {
    id: string
    providerAgentId: string
    consumerAgentId: string
    contractSigningDate: number
    contractStartDate: number
    contractEndDate: number
    asset: Asset
    policy: Policy
  }
  
  export interface Asset {
    properties: Properties
  }
  
  export interface Properties {
    "asset:prop:id": string
  }
  
  export interface Policy {
    uid: string
    permissions: Permission[]
    prohibitions: any[]
    obligations: any[]
    extensibleProperties: ExtensibleProperties
    inheritsFrom: any
    assigner: any
    assignee: any
    target: any
    "@type": Type
  }
  
  export interface Permission {
    edctype: string
    uid: any
    target: string
    action: Action
    assignee: any
    assigner: any
    constraints: any[]
    duties: any[]
  }
  
  export interface Action {
    type: string
    includedIn: any
    constraint: any
  }
  
  export interface ExtensibleProperties {}
  
  export interface Type {
    "@policytype": string
  }
  
  export interface ContractOffer {
    id: string
    policy: Policy2
    asset: Asset2
    provider: any
    consumer: any
    offerStart: any
    offerEnd: any
    contractStart: any
    contractEnd: any
  }
  
  export interface Policy2 {
    uid: string
    permissions: Permission2[]
    prohibitions: any[]
    obligations: any[]
    extensibleProperties: ExtensibleProperties2
    inheritsFrom: any
    assigner: any
    assignee: any
    target: any
    "@type": Type2
  }
  
  export interface Permission2 {
    edctype: string
    uid: any
    target: string
    action: Action2
    assignee: any
    assigner: any
    constraints: any[]
    duties: any[]
  }
  
  export interface Action2 {
    type: string
    includedIn: any
    constraint: any
  }
  
  export interface ExtensibleProperties2 {}
  
  export interface Type2 {
    "@policytype": string
  }
  
  export interface Asset2 {
    properties: Properties2
  }
  
  export interface Properties2 {
    "asset:prop:name": string
    "asset:prop:contenttype": string
    "ids:byteSize": any
    "asset:prop:version": string
    "asset:prop:id": string
    type: string
    "ids:fileName": any
    "asset:prop:originator": string
  }
  
  export interface LastContractOffer {
    id: string
    policy: Policy3
    asset: Asset3
    provider: any
    consumer: any
    offerStart: any
    offerEnd: any
    contractStart: any
    contractEnd: any
  }
  
  export interface Policy3 {
    uid: string
    permissions: Permission3[]
    prohibitions: any[]
    obligations: any[]
    extensibleProperties: ExtensibleProperties3
    inheritsFrom: any
    assigner: any
    assignee: any
    target: any
    "@type": Type3
  }
  
  export interface Permission3 {
    edctype: string
    uid: any
    target: string
    action: Action3
    assignee: any
    assigner: any
    constraints: any[]
    duties: any[]
  }
  
  export interface Action3 {
    type: string
    includedIn: any
    constraint: any
  }
  
  export interface ExtensibleProperties3 {}
  
  export interface Type3 {
    "@policytype": string
  }
  
  export interface Asset3 {
    properties: Properties3
  }
  
  export interface Properties3 {
    "asset:prop:name": string
    "asset:prop:contenttype": string
    "ids:byteSize": any
    "asset:prop:version": string
    "asset:prop:id": string
    type: string
    "ids:fileName": any
    "asset:prop:originator": string
  }
  