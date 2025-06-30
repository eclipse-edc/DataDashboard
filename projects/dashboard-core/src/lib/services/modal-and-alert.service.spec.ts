import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalAndAlertService } from './modal-and-alert.service';
import { Component, ViewContainerRef } from '@angular/core';

@Component({
  template: '<span id="test-component">test</span>',
  standalone: true,
})
class TestComponent {}

describe('ModalAndAlertService', () => {
  let service: ModalAndAlertService;
  let fixture: ComponentFixture<TestComponent>;
  let dialogElement: HTMLDialogElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [ModalAndAlertService],
    });

    fixture = TestBed.createComponent(TestComponent);
    service = TestBed.inject(ModalAndAlertService);
    dialogElement = document.createElement('dialog');
    document.body.appendChild(dialogElement);
    service.setDialogToInject(dialogElement, fixture.componentRef.injector.get(ViewContainerRef));
  });

  afterEach(() => {
    document.body.removeChild(dialogElement);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open and close modal', () => {
    service.openModal(TestComponent);
    expect(dialogElement.open).toBeTrue();
    service.closeModal();
    expect(dialogElement.open).toBeFalse();
  });

  it('should throw error when opening modal without a valid dialog', () => {
    service.setDialogToInject(dialogElement, null!);

    expect(() => service.openModal(TestComponent)).toThrowError();
  });

  it('should set inputs and output callbacks', () => {
    const modal: ViewContainerRef = (service as any).modal as ViewContainerRef;
    const modalCreateSpy = spyOn(modal, 'createComponent');
    const inputSpy = spyOn<any>(service, 'setInputs');
    const outputSpy = spyOn<any>(service, 'subscribeOutputEvents');

    service.openModal(TestComponent);
    expect(modalCreateSpy).toHaveBeenCalled();
    expect(inputSpy).toHaveBeenCalled();
    expect(outputSpy).toHaveBeenCalled();
  });

  it('should throw error when opening alert without a valid ViewContainerRef', () => {
    expect(() => service.showAlert('should fail')).toThrowError();
  });

  it('should throw error on show alert without a valid ViewContainerRef', () => {
    expect(() => service.showAlert('test')).toThrowError();
  });
});
