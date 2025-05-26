import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EdcConfig } from '../models/edc-config';
import { EdcClientService } from './edc-client.service';

/**
 * Service to manage all global dashboard states.
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardStateService implements OnDestroy {
  /**
   * Subject to hold the state of whether the menu is open or closed.
   */
  private readonly _isMenuOpen = new BehaviorSubject<boolean>(true);

  /**
   * Observable to expose the current state of the menu.
   */
  public readonly isMenuOpen$ = this._isMenuOpen.asObservable();

  /**
   * Subject to hold the state whether federated catalog is enabled or not.
   */
  private readonly _isFederatedCatalogEnabled = new BehaviorSubject<boolean>(false);

  /**
   * Observable to expose the current state of the federated catalog.
   */
  public readonly isFederatedCatalogEnabled$ = this._isFederatedCatalogEnabled.asObservable();

  /**
   * A BehaviorSubject that holds an array of `EdcConfig` objects.
   * This variable is used to manage and observe configuration data for EDC (Enterprise Data Center).
   * The initial value is an empty array.
   *
   * @type {BehaviorSubject<EdcConfig[]>}
   */
  private readonly _edcConfigs: BehaviorSubject<EdcConfig[]> = new BehaviorSubject<EdcConfig[]>([]);
  /**
   * An observable stream of EDC connector configurations.
   *
   * @type {Observable<EdcConfig[]>}
   */
  public readonly edcConfigs$: Observable<EdcConfig[]> = this._edcConfigs.asObservable();

  private readonly _currentEdcConfig: BehaviorSubject<EdcConfig | undefined> = new BehaviorSubject<
    EdcConfig | undefined
  >(undefined);
  /**
   * An observable of the currently selected connector in the dashboard.
   */
  public readonly currentEdcConfig$: Observable<EdcConfig | undefined> = this._currentEdcConfig.asObservable();

  /**
   * A BehaviorSubject to hold the locally stored EDC configs.
   */
  private readonly _localStorageEdcConfigs: BehaviorSubject<EdcConfig[]> = new BehaviorSubject<EdcConfig[]>([]);
  private readonly LOCAL_STORAGE_CONFIG_KEY = 'edc_local_configs';
  /**
   * An observable stream of locally stored EDC configs.
   */
  public readonly localStorageEdcConfigs$: Observable<EdcConfig[]> = this._localStorageEdcConfigs.asObservable();

  private readonly LOCAL_STORAGE_THEME_KEY = 'theme';

  constructor(private readonly edc: EdcClientService) {
    // On load, try to retrieve the locally stored EDC configs from local storage.
    const storedLocalConfigs = localStorage.getItem(this.LOCAL_STORAGE_CONFIG_KEY);
    if (storedLocalConfigs && storedLocalConfigs.length > 0) {
      try {
        const parsedConfigs: EdcConfig[] = JSON.parse(storedLocalConfigs);
        this._localStorageEdcConfigs.next(parsedConfigs);
        this.setCurrentEdcConfig(parsedConfigs[0]);
      } catch (error) {
        console.error('Error parsing locally stored EDC configurations:', error);
      }
    }

    const storedTheme = localStorage.getItem(this.LOCAL_STORAGE_THEME_KEY);
    if (storedTheme) {
      this.setTheme(storedTheme);
    }
  }

  /**
   * Sets the theme for the application by updating the document's body attribute
   * and saving the theme to local storage.
   *
   * @param theme - A string representing the theme to be set.
   */
  public setTheme(theme: string) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(this.LOCAL_STORAGE_THEME_KEY, theme);
  }
  /**
   * Set the menu open state.
   * @param open - A boolean indicating whether the menu should be open.
   */
  public setMenuOpen(open: boolean) {
    this._isMenuOpen.next(open);
  }

  /**
   * Toggle the current state of the menu.
   */
  public toggleMenuOpen() {
    this._isMenuOpen.next(!this._isMenuOpen.getValue());
  }

  /**
   * set state of federated catalog
   * @param enabled - A boolean indicating whether federated catalog is enabled or not.
   */
  public setFederatedCatalogEnabled(enabled: boolean) {
    this._isFederatedCatalogEnabled.next(enabled);
  }

  /**
   * Updates the EDC configurations with the provided array of configurations.
   *
   * @param {EdcConfig[]} configs - An array of EDC configuration objects to be set.
   * @return {void} This method does not return a value.
   */
  public setEdcConfigs(configs: EdcConfig[]): void {
    this._edcConfigs.next(configs);
  }

  /**
   * Sets the current EDC configuration and updates the client accordingly.
   *
   * @param {EdcConfig} config - The configuration object to set as the current EDC configuration.
   * @return {void} This method does not return a value.
   */
  public setCurrentEdcConfig(config: EdcConfig): void {
    this.edc.setDashboardClient(config);
    this.setFederatedCatalogEnabled(config.federatedCatalogUrl !== undefined && config.federatedCatalogEnabled);
    this._currentEdcConfig.next(config);
  }

  /**
   * Adds a single EDC configuration to local storage.
   *
   * @param config - The EDC configuration object to add.
   */
  public addLocalStorageEdcConfig(config: EdcConfig): void {
    const currentLocalStorageConfigs = this._localStorageEdcConfigs.getValue();
    const edcConfigs = this._edcConfigs.getValue();
    if (
      currentLocalStorageConfigs.find(c => c.connectorName === config.connectorName) ||
      edcConfigs.find(c => c.connectorName === config.connectorName)
    ) {
      throw new TypeError(`EDC config with name '${config.connectorName}' already exists.`);
    }
    const updatedConfigs = [...currentLocalStorageConfigs, config];
    this._localStorageEdcConfigs.next(updatedConfigs);
    localStorage.setItem(this.LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(updatedConfigs));
  }

  /**
   * Deletes a single EDC configuration from local storage.
   * Assumes that each EDC config has a unique identifier property (e.g., id).
   *
   * @param config - The EDC configuration object to delete.
   */
  public deleteLocalStorageEdcConfig(config: EdcConfig): void {
    const currentConfigs = this._localStorageEdcConfigs.getValue();
    const updatedConfigs = currentConfigs.filter(c => c.connectorName !== config.connectorName);
    this._localStorageEdcConfigs.next(updatedConfigs);
    localStorage.setItem(this.LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(updatedConfigs));
  }

  ngOnDestroy() {
    this._isMenuOpen.complete();
    this._isFederatedCatalogEnabled.complete();
    this._edcConfigs.complete();
    this._currentEdcConfig.complete();
  }
}
