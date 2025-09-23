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

import { ComponentRef, EventEmitter, Injectable, Type, ViewContainerRef } from '@angular/core';
import { AlertComponent, AlertType } from '../common/alert/alert.component';

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A service to manage opening and closing modals and alerts in the dashboard.
 */
@Injectable({
  providedIn: 'root',
})
export class ModalAndAlertService {
  private dialog?: HTMLDialogElement;
  private modal?: ViewContainerRef;
  private alert?: ViewContainerRef;

  /**
   * Sets the dialog and modal container for injecting components.
   *
   * @param dialog - The HTMLDialogElement where the modal will be shown.
   * @param modal - The ViewContainerRef to inject the component into.
   */
  public setDialogToInject(dialog: HTMLDialogElement, modal: ViewContainerRef): void {
    this.modal = modal;
    this.dialog = dialog;
    this.dialog.addEventListener('close', () => {
      this.modal?.clear();
    });
  }

  /**
   * Sets the alert container for injecting alert components.
   *
   * @param alert - The ViewContainerRef to inject the alert component into.
   */
  public setAlertToInject(alert: ViewContainerRef): void {
    this.alert = alert;
  }
  /**
   * Opens a modal with the specified component.
   * Manages the subscription lifecycle for output event callbacks.
   *
   * @param componentType - The type of the component to be rendered inside the modal.
   * @param inputs - An optional record of inputs to pass to the component.
   * @param outputCallbacks - An optional record of output event callbacks to subscribe to.
   * @param clear - Optionally delete all components present in the modal.
   * @param htmlDialogCloseCallback - (Optional) Callback invoked when the dialog is closed via native events.
   * @throws Error Throws an error if no dialog or modal has been set for the service yet.
   */
  public openModal<C>(
    componentType: Type<C>,
    inputs?: Partial<Record<keyof C, any>>,
    outputCallbacks?: Partial<Record<keyof C, (event?: any) => void>>,
    clear?: boolean,
    htmlDialogCloseCallback?: () => void,
  ): void {
    if (!this.modal || !this.dialog) {
      throw new Error('No dialog set to open the component in.');
    }
    if (clear) {
      this.modal.clear();
    }
    const ref = this.modal.createComponent(componentType);
    this.setInputs(ref, inputs);
    this.subscribeOutputEvents(ref, outputCallbacks, htmlDialogCloseCallback);
    this.dialog.showModal();
  }

  /**
   * Closes the modal. Useful for custom actions (output events) in the injected component.
   */
  public closeModal(): void {
    this.dialog?.close();
  }

  /**
   * Displays an alert with the specified message and optional parameters.
   *
   * @param msg - The message to display in the alert.
   * @param title - An optional title for the alert.
   * @param type - An optional type to classify the alert (e.g., success, error).
   * @param seconds - Optional duration in seconds after which the alert should automatically close.
   * @param showTimer - Show a timer as circle around the dismiss button.
   * @param onCloseCallback - An optional callback to execute when the alert is closed.
   * @throws Error Throws an error if no alert container has been set for the service yet.
   */
  public showAlert(
    msg: string,
    title?: string,
    type?: AlertType,
    seconds?: number,
    showTimer?: boolean,
    onCloseCallback?: () => void,
  ): void {
    if (!this.alert) {
      throw new Error('No alert dom element set to inject the alert in.');
    }
    const ref = this.alert.createComponent(AlertComponent);
    this.setInputs(ref, { msg: msg, type: type, timeoutSeconds: seconds, title: title, showTimer: showTimer });
    ref.instance.closeEvent.subscribe(() => {
      if (onCloseCallback) {
        onCloseCallback();
      }
      ref.destroy();
    });
  }

  /**
   * Subscribes to output events of the component and binds them to the specified callbacks.
   * Also manages the subscription/unsubscription lifecycle and optional dialog close callback.
   *
   * @param component - The component reference whose output events should be subscribed to.
   * @param outputCallbacks - An optional record mapping output event names (as keys) to callback functions.
   *                         Each key should correspond to an EventEmitter property on the component instance.
   *                         The callback receives the event payload.
   * @param htmlDialogCloseCallback - Optional callback to be invoked when the HTMLDialogElement's 'close' event fires.
   *                                 The callback is automatically unsubscribed when the component is destroyed.
   */
  private subscribeOutputEvents<C>(
    component: ComponentRef<C>,
    outputCallbacks?: Partial<Record<keyof C, (event?: any) => void>>,
    htmlDialogCloseCallback?: () => void,
  ): void {
    if (outputCallbacks) {
      for (const key in outputCallbacks) {
        const eventEmitter = component.instance[key] as EventEmitter<any>;
        if (eventEmitter?.subscribe) {
          const sub = eventEmitter.subscribe(outputCallbacks[key]);
          component.onDestroy(() => sub.unsubscribe());
        } else {
          console.error(`'${key}' is not an output event of ${component.componentType.name}`);
        }
      }
    }
    if (htmlDialogCloseCallback) {
      this.dialog?.addEventListener('close', htmlDialogCloseCallback, { once: true });
    }
  }

  /**
   * Sets the inputs for the component instance.
   *
   * @param component - The component instance to set inputs on.
   * @param inputs - A record of inputs to set on the component.
   */
  private setInputs<C>(component: ComponentRef<C>, inputs?: Partial<Record<keyof C, any>>): void {
    if (inputs) {
      for (const key in inputs) {
        component.setInput(key, inputs[key]);
      }
    }
  }
}
