# data-dashboard

Deploys the EDC Data Dashboard.

![Version: 0.1.2](https://img.shields.io/badge/Version-0.1.2-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.2.3](https://img.shields.io/badge/AppVersion-0.2.3-informational?style=flat-square)

## Installing the Chart

To install the chart with the release name 'my-release':

```console
$ helm repo add edc-dashboard https://gitlab.cc-asp.fraunhofer.de/api/v4/projects/72400/packages/helm/stable
$ helm install my-release edc-dashboard/data-dashboard --version 0.1.2
```

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` |  |
| autoscaling | object | `{"enabled":false,"maxReplicas":10,"minReplicas":1,"targetCPUUtilizationPercentage":80}` | This section is for setting up autoscaling more information can be found here: https://kubernetes.io/docs/concepts/workloads/autoscaling/ |
| fullnameOverride | string | `""` |  |
| image | object | `{"pullPolicy":"IfNotPresent","repository":"container-registry.gitlab.cc-asp.fraunhofer.de/isst-dst/adoptions/data-dashboard/dashboard","tag":"0.2.3"}` | This sets the container image more information can be found here: https://kubernetes.io/docs/concepts/containers/images/ |
| imagePullSecret | object | `{"dockerConfigJson":"eyJhdXRocyI6eyJjb250YWluZXItcmVnaXN0cnkuZ2l0bGFiLmNjLWFzcC5mcmF1bmhvZmVyLmRlIjp7InVzZXJuYW1lIjoiazhzLXB1bGwtc2VjcmV0IiwicGFzc3dvcmQiOiJnbHBhdC0xUlBtQ1dxbkItbXR1ekJhRkVDMSJ9fX0K","name":"dashboard-pull-secret"}` | Pull secret for the container images. |
| imagePullSecret.dockerConfigJson | string | `"eyJhdXRocyI6eyJjb250YWluZXItcmVnaXN0cnkuZ2l0bGFiLmNjLWFzcC5mcmF1bmhvZmVyLmRlIjp7InVzZXJuYW1lIjoiazhzLXB1bGwtc2VjcmV0IiwicGFzc3dvcmQiOiJnbHBhdC0xUlBtQ1dxbkItbXR1ekJhRkVDMSJ9fX0K"` | Base64 encoded docker JSON config. Default for dashboard image in gitlab container registry. |
| imagePullSecret.name | string | `"dashboard-pull-secret"` | Name of the secret |
| ingress | object | `{"annotations":{},"className":"","enabled":false,"hosts":[{"host":"chart-example.local","paths":[{"path":"/","pathType":"Prefix"}]}],"tls":[]}` | This block is for setting up the ingress for more information can be found here: https://kubernetes.io/docs/concepts/services-networking/ingress/ |
| ingress.enabled | bool | `false` | If enabled, an ingress resource is created. |
| ingress.hosts[0].paths | list | `[{"path":"/","pathType":"Prefix"}]` | The value of the first path is used to determine the base path of the dashboard |
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
| serviceAccount | object | `{"annotations":{},"automount":false,"create":false,"name":""}` | This section builds out the service account more information can be found here: https://kubernetes.io/docs/concepts/security/service-accounts/ |
| serviceAccount.annotations | object | `{}` | Annotations to add to the service account |
| serviceAccount.automount | bool | `false` | Automatically mount a ServiceAccount's API credentials? |
| serviceAccount.create | bool | `false` | Specifies whether a service account should be created |
| serviceAccount.name | string | `""` | The name of the service account to use. If not set and create is true, a name is generated using the fullname template |
| tolerations | list | `[]` |  |
| volumeMounts | list | `[]` | Additional volumeMounts on the output Deployment definition. Should be used to mount the connector configuration at '/app/config/edc-connector-config.json'. |
| volumes | list | `[]` | Additional volumes on the output Deployment definition. Should be used for pre-configuring connectors in the dashboard. |

----------------------------------------------
Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)
