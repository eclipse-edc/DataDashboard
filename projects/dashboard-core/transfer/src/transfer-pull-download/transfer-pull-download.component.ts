/*
 *  Copyright (c) 2025 Fraunhofer-Gesellschaft zur Förderung der angewandten Forschung e.V.
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 *
 *  Contributors:
 *       Fraunhofer-Gesellschaft zur Förderung der angewandten Forschung e.V. - initial API and implementation
 *
 */

import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, inject } from '@angular/core';
import { ContractAgreement, ContractNegotiation } from '@think-it-labs/edc-connector-client';
import { ContractAndTransferService } from '../contract-and-transfer.service';
import * as mime from 'mime';
import { Subject, takeUntil } from 'rxjs';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'lib-transfer-pull-download',
  templateUrl: './transfer-pull-download.component.html',
  imports: [FormsModule, NgClass],
})
export class TransferPullDownloadComponent implements OnChanges, OnDestroy {
  private readonly transferService = inject(ContractAndTransferService);

  private readonly destroy$ = new Subject<void>();
  private readonly EXTENSION_WARNING =
    "Override the filename or when the download includes a content type this may trigger your browser to set a file extension. Otherwise, the download won't have a file extension.";

  @Input() agreement!: ContractAgreement;
  @Input() negotiation!: ContractNegotiation;
  @Input() transferId!: string;
  @Output() startEvent = new EventEmitter<void>();
  @Output() completionEvent = new EventEmitter<void>();
  @Output() errorEvent = new EventEmitter<string>();

  warningMsg?: string;
  filename?: string;
  fileExtension?: string | null = null;
  downloadRunning = false;
  progress = 0;
  error = false;

  async ngOnChanges() {
    if (this.negotiation && this.agreement) {
      const dataset = await this.transferService.getDataset(this.agreement, this.negotiation, true);
      if (!dataset) {
        this.handleError('Could not fetch the dataset for this contract agreement.');
      }
      if (dataset['contenttype']) {
        this.fileExtension = mime.default.getExtension(dataset['contenttype']);
        if (!this.fileExtension) {
          this.warningMsg = `The content type of the asset set is '${dataset['contenttype']}', but no file extension was found for this type. ${this.EXTENSION_WARNING}`;
        } else {
          this.fileExtension = '.' + this.fileExtension;
        }
      } else {
        this.warningMsg = `No content type for the asset set. ${this.EXTENSION_WARNING}`;
      }
    }
  }

  async downloadAsset() {
    try {
      const download$ = await this.transferService.downloadDataset(this.transferId);
      this.downloadRunning = true;
      this.startEvent.emit();
      download$.pipe(takeUntil(this.destroy$)).subscribe({
        next: (event: HttpEvent<Blob>) => {
          switch (event.type) {
            case HttpEventType.DownloadProgress:
              if (event.total) {
                this.progress = Math.round((100 * event.loaded) / event.total);
              }
              break;
            case HttpEventType.Response:
              if (event.status < 400) {
                this.createDownloadLink(
                  event.body as Blob,
                  this.filename ?? this.agreement.assetId.concat(this.fileExtension ?? ''),
                );
                this.progress = 100;
              }
              break;
          }
        },
        error: this.handleError.bind(this),
      });
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private createDownloadLink(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    this.completionEvent.emit();
  }

  private handleError(error: Error | string): void {
    this.error = true;
    let errorMsg: string;
    if (typeof error === 'string') {
      errorMsg = `Download failed: ${error}`;
    } else if (error['message']) {
      errorMsg = `Download failed: ${JSON.stringify(error.message)}`;
    } else {
      errorMsg = `Download failed: ${JSON.stringify(error)}`;
    }
    console.error(errorMsg);
    this.errorEvent.emit(errorMsg);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
