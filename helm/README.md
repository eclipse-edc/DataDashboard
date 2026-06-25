# data-dashboard

Deploys the EDC Data Dashboard.

![Version: 0.5.0](https://img.shields.io/badge/Version-0.5.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.5.0](https://img.shields.io/badge/AppVersion-0.5.0-informational?style=flat-square)

## Installing the Chart

To install the chart with the release name 'my-release':

```console
$ helm install my-release oci://ghcr.io/eclipse-edc/charts/data-dashboard --version 0.5.0
```

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` |  |
| autoscaling | object | `{"enabled":false,"maxReplicas":10,"minReplicas":1,"targetCPUUtilizationPercentage":80}` | This section is for setting up autoscaling more information can be found here: https://kubernetes.io/docs/concepts/workloads/autoscaling/ |
| basicAuth.enabled | bool | `false` | If enabled: Basic username/password also need to be configured for dashboard access. |
| basicAuth.password | string | `nil` | The password to set for auth |
| basicAuth.username | string | `nil` | The username to set for auth |
| config.appTitle | string | `"EDC Dashboard"` | Change the application title displayed in the header |
| config.enableUserConfig | bool | `false` | If enabled, the user can add new connectors to the dashboard, that are stored in the local storage. |
| config.healthCheckIntervalSeconds | int | `30` | Health check interval for the currently selected connector in the dashboard. |
| config.initialTheme | string | `nil` | Set the initial theme (for available values, see theme switcher in top right) |
| config.menuItems | list | `[{"divider":true,"materialSymbol":"home_app_logo","routerPath":"home","text":"Home"},{"materialSymbol":"book_ribbon","routerPath":"catalog","text":"Catalog","viewDescription":"In the catalog view you can browse datasets of other connectors. For each dataset you can run contract negotiations to consume the data afterwards. If the selected connector has a federated catalog, the available datasets of other participants will be displayed automatically. Otherwise, you can request the catalog of other connectors configured in the dashboard. At any time you can request the catalog of unknown connectors by requesting it manually."},{"materialSymbol":"deployed_code_update","routerPath":"assets","text":"Assets","viewDescription":"The asset view allows you to create, edit and delete the assets (datasets) in your connector. An asset represents any data that can be shared, for example static files, streaming data or API access. The dashboard only allows you to create assets with data types that your data plane(s) support."},{"materialSymbol":"policy","routerPath":"policies","text":"Policy Definitions","viewDescription":"The policy definitions view allows you to create, edit and delete policies. Policies are a generic way of defining a set of duties, rights, or obligations. EDC and DSP express policies with ODRL."},{"divider":true,"materialSymbol":"contract_edit","routerPath":"contract-definitions","text":"Contract Definitions","viewDescription":"The contract definitions view allows you to create, edit and delete contract definitions. Contract definitions link assets and policies by declaring which policies apply to a set of assets. Contract definitions contain two types of policies: an access policy (who can see or discover the data contract offer) and a contract policy (the actual terms and conditions of data use once a contract has been agreed upon)."},{"materialSymbol":"handshake","routerPath":"contracts","text":"Contracts","viewDescription":"The contract view allows you to browse all contract negotiations that have been finished with an agreement. You can switch between providing and consuming contracts of the selected connector. For consuming contracts a transfer process can be started to receive the asset."},{"materialSymbol":"schedule_send","routerPath":"transfer-history","text":"Transfer History","viewDescription":"The transfer history view lets you browse and deprovision finished and ongoing transfer processes. You can switch between providing and consuming transfer processes of the selected connector."}]` | Configure the menu of the dashboard. 'routerPath' must match the path configured for this view in the angular router. 'divider' adds a dividing line below the menu item. Menu items with 'viewDescription' will appear in the home view with this description. Available material symbols can be found here: https://marella.github.io/material-symbols/demo/#rounded |
| fullnameOverride | string | `""` |  |
| image | object | `{"pullPolicy":"IfNotPresent","repository":"ghcr.io/eclipse-edc/data-dashboard","tag":"0.5.0"}` | This sets the container image more information can be found here: https://kubernetes.io/docs/concepts/containers/images/ |
| imagePullSecrets | string | `nil` | This is for setting pull secrets if private images are used. |
| ingress | object | `{"annotations":{},"className":"","enabled":false,"hosts":[{"host":"chart-example.local","paths":[{"path":"/","pathType":"Prefix"}]}],"tls":[]}` | This block is for setting up the ingress for more information can be found here: https://kubernetes.io/docs/concepts/services-networking/ingress/ |
| ingress.enabled | bool | `false` | If enabled, an ingress resource is created. |
| ingress.hosts[0].paths | list | `[{"path":"/","pathType":"Prefix"}]` | The value of the first path is used to determine the base path of the dashboard. |
| livenessProbe | object | `{}` | This is to setup a liveness probe. More information can be found here: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/ |
| nameOverride | string | `""` | This is to override the chart name. |
| nodeSelector | object | `{}` |  |
| podAnnotations | object | `{}` | This is for setting Kubernetes Annotations to a Pod. For more information checkout: https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/ |
| podLabels | object | `{}` | This is for setting Kubernetes Labels to a Pod. For more information checkout: https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/ |
| podSecurityContext | object | `{}` |  |
| readinessProbe | object | `{}` | This is to setup a readiness probe. More information can be found here: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/ |
| replicaCount | int | `1` | This will set the replicaset count more information can be found here: https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/ |
| resources | object | `{"limits":{"cpu":"150m","ephemeral-storage":"10Mi","memory":"100Mi"},"requests":{"cpu":null,"ephemeral-storage":"10Mi","memory":null}}` | Default resource requests and limits |
| securityContext | object | `{}` |  |
| service | object | `{"port":8080,"type":"ClusterIP"}` | This is for setting up a service more information can be found here: https://kubernetes.io/docs/concepts/services-networking/service/ |
| service.port | int | `8080` | This sets the ports more information can be found here: https://kubernetes.io/docs/concepts/services-networking/service/#field-spec-ports |
| service.type | string | `"ClusterIP"` | This sets the service type more information can be found here: https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types |
| tolerations | list | `[]` |  |
| volumeMounts | list | `[]` | Additional volumeMounts on the output Deployment definition. Should be used to mount the connector configuration at '/app/config/edc-connector-config.json'. |
| volumes | list | `[]` | Additional volumes on the output Deployment definition. Should be used for pre-configuring connectors in the dashboard. |

----------------------------------------------
Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)
