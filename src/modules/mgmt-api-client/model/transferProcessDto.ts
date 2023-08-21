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
import { DataRequestDto } from './dataRequestDto';
import { DataAddressInformationDto } from './dataAddressInformationDto';


export interface TransferProcessDto {
    "edc:dataDestination"?: DataAddressInformationDto;
    "edc:dataRequest"?: DataRequestDto;
    "@id"?: string;
    "edc:state"?: string;
    "edc:stateTimestamp"?: number;
    "edc:type"?: string;
}
