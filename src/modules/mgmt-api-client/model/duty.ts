/**
 * EDC REST API
 * EDC REST APIs - merged by OpenApiMerger
 *
 * The version of the OpenAPI document: 0.0.1-SNAPSHOT
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { Action } from './action';
import { Constraint } from './constraint';
import { Permission } from './permission';


export interface Duty { 
    action?: Action;
    assignee?: string;
    assigner?: string;
    consequence?: Duty;
    constraints?: Array<Constraint>;
    parentPermission?: Permission;
    target?: string;
    uid?: string;
}
