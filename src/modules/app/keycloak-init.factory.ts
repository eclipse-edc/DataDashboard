import { KeycloakService } from 'keycloak-angular';
import { AppConfigService } from './app-config.service';

export function initializeKeycloak(
  keycloak: KeycloakService,
  configService: AppConfigService
): () => Promise<boolean> {
  return () =>
    configService.loadConfig().then(() => {
      const config = configService.getConfig();

      if (!config?.keycloakUrl || !config?.keycloakRealm || !config?.keycloakClientId) {
        return Promise.reject('Missing Keycloak config in app.config.json');
      }

      return keycloak.init({
        config: {
          url: config.keycloakUrl,
          realm: config.keycloakRealm,
          clientId: config.keycloakClientId,
        },
        initOptions: {
          onLoad: 'login-required',
          checkLoginIframe: false
        }
      });
    });
}
