import {Injectable} from '@angular/core';
import {AssetEditorDialogFormValue} from '../../routes/connector-ui/asset-page/asset-create-dialog/asset-editor-dialog-form-model';
import {AssetEntryDto, DataAddressDto} from './api/legacy-managent-api-client';
import {AssetPropertyMapper} from './asset-property-mapper';
import {HttpRequestParamsMapper} from './http-params-mapper.service';

@Injectable()
export class AssetEntryBuilder {
  constructor(
    private assetPropertyMapper: AssetPropertyMapper,
    private httpRequestParamsMapper: HttpRequestParamsMapper,
  ) {}

  /**
   * Build {@link AssetEntryDto} from {@link AssetEditorDialogFormValue}
   *
   * @param formValue form value
   * @return asset create dto
   */
  buildAssetEntry(formValue: AssetEditorDialogFormValue): AssetEntryDto {
    let properties = this.assetPropertyMapper.buildProperties(formValue);
    const dataAddress = this.buildDataAddressDto(formValue.datasource);
    return {asset: {properties}, dataAddress};
  }

  private buildDataAddressDto(
    datasource: AssetEditorDialogFormValue['datasource'],
  ): DataAddressDto {
    switch (datasource?.dataAddressType) {
      case 'Custom-Data-Address-Json':
        return JSON.parse(datasource.dataDestination?.trim() ?? '');
      case 'Http':
        return this.httpRequestParamsMapper.buildHttpDataAddressDto(datasource);
      default:
        throw new Error(
          `Invalid data address type: ${datasource?.dataAddressType}`,
        );
    }
  }
}
