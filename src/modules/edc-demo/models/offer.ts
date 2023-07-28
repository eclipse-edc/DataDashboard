export interface Offer {
  permissions: { [key: string]: object; };
  prohibitions: { [key: string]: object; };
  obligations: { [key: string]: object; };
  extensibleProperties?: object;
  inheritsFrom?: object;
  assigner?: object;
  assignee?: object;
  target: string;
  "@type"?: string;
}
