import { MenuItem } from './menu-item';

export interface AppConfig {
  menuItems: MenuItem[];
  healthCheckIntervalSeconds?: number; // Default: 30
  enableUserConfig?: boolean; // Default: true
}
