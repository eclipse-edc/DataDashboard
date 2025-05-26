# EDC Data Dashboard

**Please note: This repository does not contain production-grade code and is only intended for demonstration purposes.**

EDC Data Dashboard is a dev frontend application for [EDC Management API](https://github.com/eclipse-edc/Connector).

## Table of content

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [Run / deploy the dashboard](#run--deploy-the-dashboard)
4. [Create a custom dashboard (How to use the library)](#create-a-custom-dashboard-how-to-use-the-library)
5. [Contributing](#contributing)

# Overview

The data dashboard is an angular library (dashboard-core) wrapped in an angular application.
This application uses all available features from the library and is like a default dashboard.

The dashboard uses [daisyUI](https://daisyui.com), based on [tailwindcss](https://tailwindcss.com), as component framework.
For the EDC Management API the [Think-iT-Labs/edc-connector-client](https://github.com/Think-iT-Labs/edc-connector-client) is used.

All the components and services are inside the library to make the creation of custom dashboards easier.
With the library approach, dependency management and extensibility for custom dashboards is improved.

The library itself ([projects/dashboard-core](projects/dashboard-core)) is divided into multiple lazy loadable chunks:
  1. [dashboard-core](projects/dashboard-core/src/lib) includes:
     - Data model
     - Dashboard layout (header, sidebar) and general services (edc client, modals and alerts, state, data type registry)
     - Small reusable components
  2. [dashboard-core/assets](projects/dashboard-core/assets) includes all components and services for the asset view.
  3. [dashboard-core/catalog](projects/dashboard-core/catalog) includes all components and services for the catalog view.
  4. [dashboard-core/contract-definitions](projects/dashboard-core/contract-definitions) includes all components and services for the contract definition view.
  5. [dashboard-core/policies](projects/dashboard-core/policies) includes all components and services for the policy view.
  6. [dashboard-core/transfer](projects/dashboard-core/transfer) includes all components and services for the contract and transfer history views.

The application is merely a wrapper to configure which parts of the library to use:
- [src/styles.css](src/styles.css): Setup for tailwindcss and daisyUI
- [src/app/app.component.ts](src/app/app.component.ts): Defines necessary configuration
- [src/app/app.config.ts](src/app/app.config.ts): Load base path and provide default config
- [src/app/app.component.html](src/app/app.component.html): Includes the dashboard layout component
- [src/app/app.routes.ts](src/app/app.routes.ts): Defines the menu items (view) and which views (parts of the library) to use.

The current default application setup integrates all available library parts,
which can be customized by modifying the specified files.


# Configuration

## Connector configuration
The user has the ability to add connectors within the dashboard.
This user-specific configuration is currently stored in the local storage of the browser, including auth keys.
So to have it said, be aware of the danger that secrets stored in local storage pose.

For pre-configured connectors in the dashboard you have to create a JSON configuration at `public/config/edc-connector-config.json`.
The file must contain a JSON array of [EdcConfig](projects/dashboard-core/src/lib/models/edc-config.ts) objects.
The [edc-connector-config.json](public/config/edc-connector-config.json) in this repo contains an example configuration.
<br> ___Note:___ Configuration loading is implemented in the angular wrapper application as you pass the pre-configured connector configuration
to the [DashboardAppComponent](projects/dashboard-core/src/lib/dashboard-app/dashboard-app.component.ts).
So if you only use the library, the config loading has to be re-implemented.

## Application configuration
The angular application wrapper supports dynamic base path configuration at runtime to enable the use of
the container images in deployment scenarios where the dashboard is not running at root level but some sub path.
To configure a base path, add a file to the deployment environment at `public/config/APP_BASE_HREF.txt` with just the path and nothing else, e.g.:
```text
/my/custom/sub/path
```
For more details how this works, have a look at the [app.config.ts](src/app/app.config.ts) and the angular docs about [APP_BASE_HREF](https://angular.dev/api/common/APP_BASE_HREF).


# Run / deploy the dashboard
Currently, there are three ways to run or deploy the data dashboard.

## Helm
For deployments in kubernetes clusters use the Helm chart (details in [helm](helm) directory).
To apply a configuration, create a ConfigMap (following the [configuration](#configuration) section) and set this in the `volumes` and `volumeMounts` values, e.g.:
  - ConfigMap
    ```yaml
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: example-config
    data:
      edc-connector-config.json: |-
        [
          {
            "connectorName": "Consumer",
            "managementUrl": "http://cp-consumer.dataspace/management",
            "defaultUrl": "http://cp-consumer.dataspace/api",
            "protocolUrl": "http://cp-consumer.dataspace/protocol",
            "federatedCatalogEnabled": true,
            "federatedCatalogUrl": "http://fc-consumer.dataspace/catalog",
            "did": "did:web:ih-consumer.dataspace"
          },
          ...
        ]
    ```
  - Helm values
    ```yaml
      volumes:
        - name: config
          configMap:
            name: example-config
      volumeMounts:
        - name: config
          mountPath: /app/config/edc-connector-config.json
          subPath: edc-connector-config.json
          readOnly: true
    ```

## Docker
__ToDo__: Add public image (github)<br>
In a (local) docker environment you can run the dashboard with the following command and reach it at `http://localhost:8080`:
```shell
docker run -p 8080:8080 <container-image>
```

For per-configured connectors create a `edc-connector-config.json` (following the [configuration](#configuration) section) and mount it in the container.
```shell
docker run -p 8080:8080 -v <path-to-config-folder>:/app/config <container-image>
```


## Angular dev server (for debugging)
To have a quicker development cycle, you can also run the data dashboard in the Angular dev server environment.
For a dev environment, you have to run the following commands.
The dashboard will be available at `http://localhost:4200`

_Note that 2. and 3. always have to be executed for each run._

1. `npm install`
2. `npm run lib-start`
3. `npm run start`



# Create a custom dashboard (How to use the library)

__ToDo__: Keep this section if no npm package is published in github registry? Otherwise, put package in registry and change ref.<br>

## Include the library in your angular project
- Add daisyUI to your angular project (https://daisyui.com/docs/install/angular/).
- Add material-symbols to your project (https://www.npmjs.com/package/material-symbols):
    ```shell
    npm i material-symbols
    ```
- Add ngx-float-ui to your project (https://github.com/tonysamperi/ngx-float-ui):
    ```shell
    npm i ngx-float-ui
    ```
- Add edc-connector-client to your project (https://github.com/Think-iT-Labs/edc-connector-client):
    ```shell
    npm i @think-it-labs/edc-connector-client
    ```
- Add the library to your project:
    ```shell
    echo @eclipse-edc:registry=https://gitlab.cc-asp.fraunhofer.de/api/v4/projects/72400/packages/npm/ >> .npmrc
    npm i @eclipse-edc/dashboard-core
    ```
- Add the library and material-symbols to the `styles.css` to ensure that all utility classes used in the library are added to the generated css, e.g.:
    ```css
    @import 'tailwindcss';
    @import 'material-symbols/rounded.css';
    @plugin 'daisyui';
    @source '../node_modules/@eclipse-edc/dashboard-core/';
    ```
- The wrapper application in this repository can guide you how to use the library.


## Custom data types
If you have data planes with different data types than `HttpData`, you should implement a custom form like [HttpDataType](projects/dashboard-core/src/lib/common/data-address/http-data-type/http-data-type.component.ts)
and register it to the [DataTypeRegistryService](projects/dashboard-core/src/lib/services/data-type-registry.service.ts) so that this is used for the creation of data addresses for the custom type.
Otherwise, a fallback is used, where the user needs to know the properties for the data types data address.

## Custom themes
DaisyUI provides a [theme generator](https://daisyui.com/theme-generator/) that allows you to easily create a theme for your custom dashboard.



# Contributing

See [how to contribute](https://github.com/eclipse-edc/docs/blob/main/CONTRIBUTING.md) for details.

