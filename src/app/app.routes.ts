import { Routes } from '@angular/router';
import { MenuItem } from '@eclipse-edc/dashboard-core';

export const routes: Routes = [
  {
    path: 'assets',
    loadComponent: () => import('@eclipse-edc/dashboard-core/assets').then(m => m.AssetViewComponent),
  },
  {
    path: 'policies',
    loadComponent: () => import('@eclipse-edc/dashboard-core/policies').then(m => m.PolicyViewComponent),
  },
  {
    path: 'contract-definitions',
    loadComponent: () =>
      import('@eclipse-edc/dashboard-core/contract-definitions').then(m => m.ContractDefinitionsViewComponent),
  },
  {
    path: 'contracts',
    loadComponent: () => import('@eclipse-edc/dashboard-core/transfer').then(m => m.ContractViewComponent),
  },

  {
    path: 'catalog',
    loadComponent: () => import('@eclipse-edc/dashboard-core/catalog').then(m => m.CatalogViewComponent),
  },
  {
    path: 'transfer-history',
    loadComponent: () => import('@eclipse-edc/dashboard-core/transfer').then(m => m.TransferHistoryViewComponent),
  },
];

export const menuItems: MenuItem[] = [
  {
    text: 'Home',
    materialSymbol: 'home_app_logo',
    routerPath: '/app',
    divider: true,
  },
  {
    text: 'Catalog',
    materialSymbol: 'book_ribbon',
    routerPath: 'catalog',
  },
  {
    text: 'Assets',
    materialSymbol: 'deployed_code_update',
    routerPath: 'assets',
  },
  {
    text: 'Policy Definitions',
    materialSymbol: 'policy',
    routerPath: 'policies',
  },
  {
    text: 'Contract Definitions',
    materialSymbol: 'contract_edit',
    routerPath: 'contract-definitions',
    divider: true,
  },
  {
    text: 'Contracts',
    materialSymbol: 'handshake',
    routerPath: 'contracts',
  },
  {
    text: 'Transfer History',
    materialSymbol: 'schedule_send',
    routerPath: 'transfer-history',
  },
];
