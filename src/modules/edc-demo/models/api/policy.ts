export interface Policy {
    uid:                  string;
    permissions:          Permission[];
    prohibitions:         Prohibition[];
    obligations:          Duty[];
    extensibleProperties: ExtensibleProperties;
    inheritsFrom:         string;
    assigner:             string;
    assignee:             string;
    target:               string;
    "@type":              Type;
}

export interface Type {
    "@policytype": string;
}

export interface ExtensibleProperties {
    [key: string] : string;
}

export interface Permission {
    edctype:     string;
    uid:         string;
    target:      string;
    action:      Action;
    assignee:    string;
    assigner:    string;
    constraints: Constraint[];
    duties:      Duty[];
}

export interface Prohibition {
}

export interface Duty {
}

export interface Action {
    type:       string;
    includedIn: null;
    constraint: null;
}

export interface Constraint {
    edctype:         string;
    leftExpression:  Expression;
    rightExpression: Expression;
    operator:        string;
}

export interface Expression {
    edctype: string;
    value:   string;
}