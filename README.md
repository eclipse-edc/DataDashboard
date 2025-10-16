# EDC Data Dashboard

ℹ️ _This repository does not contain production-grade code and is only intended for demonstration purposes._

EDC Data Dashboard is a dev frontend application for [EDC Management API](https://github.com/eclipse-edc/Connector).

## Table of content

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [Run the dashboard](#run-the-dashboard)
4. [Create a custom dashboard (How to use the library)](#create-a-custom-dashboard-how-to-use-the-library)
5. [Contributing](#contributing)

# Overview

The data dashboard is an angular library (dashboard-core) wrapped in an angular application.
This application uses all available features from the library and is like a default dashboard.

The dashboard uses [daisyUI](https://daisyui.com), based on [tailwindcss](https://tailwindcss.com), as component framework.
For the EDC Management API the [Think-iT-Labs/edc-connector-client](https://github.com/Think-iT-Labs/edc-connector-client) is used.

| Framework/Library    | Version |
|----------------------|-----------------------------|
| daisyUI              | v5   |
| tailwindcss          | v4   |
| edc-connector-client | v0.8.0 (Management API v3)  |


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
5. [dashboard-core/home](projects/dashboard-core/home) includes the home view component for introduction and view descriptions.
6. [dashboard-core/policies](projects/dashboard-core/policies) includes all components and services for the policy view.
7. [dashboard-core/transfer](projects/dashboard-core/transfer) includes all components and services for the contract and transfer history views.

The application is merely a wrapper to configure which parts of the library to use:
- [src/styles.css](src/styles.css): Setup for tailwindcss and daisyUI
- [src/app/app.component.ts](src/app/app.component.ts): Defines necessary configuration
- [src/app/app.config.ts](src/app/app.config.ts): Load base path and provide default config
- [src/app/app.component.html](src/app/app.component.html): Includes the dashboard layout component
- [src/app/app.routes.ts](src/app/app.routes.ts): Defines the menu items (view) and which views (parts of the library) to use.

The current default application setup integrates all available library parts,
which can be customized by modifying the specified files.


# Configuration
ℹ️ Configuration loading is implemented in the angular wrapper application as you pass the configuration
to the [DashboardAppComponent](projects/dashboard-core/src/lib/dashboard-app/dashboard-app.component.ts).
So if you only use the library, the config loading has to be re-implemented.

## Connector configuration
For pre-configured connectors in the dashboard you have to create a JSON configuration at `public/config/edc-connector-config.json`.
The file must contain a JSON array of [EdcConfig](projects/dashboard-core/src/lib/models/edc-config.ts) objects.
The [edc-connector-config.json](public/config/edc-connector-config.json) in this repo contains an example configuration.

⚠️ ___Be extra careful NOT to commit those changes, as they might leak potentially sensitive information!___ <br>
As some extra safety consider running<br>
`git update-index --assume-unchanged public/config/edc-connector-config.json` <br>
before changing this file.

## Application configuration

Beside the connector configuration, there is some application configuration. The configuration is loaded from `public/config/app-config.json`.
The [app-config.json](public/config/app-config.json) in this repository contains the default configuration.
The following application config values exist:
- `appTitle` (string): Set the name of the application in the header area.<br>__Default__: EDC Dashboard
- `menuItems` ([MenuItem](projects/dashboard-core/src/lib/models/menu-item.ts) Array): Configure the menu items (views) of the dashboard. Set the icon, text, router path and view description (for the home view) for each item.
- `healthCheckIntervalSeconds` (number): Sets the interval in seconds to check if the connection to the current connector is still established.<br>__Default__: `30`
- `initialTheme` (string): Set the initial theme (for available values, see theme switcher in top right).
- `enableUserConfig` (boolean): If enabled, the user has the ability to add connectors within the dashboard.
This user-specific configuration is currently stored in the local storage of the browser, including auth keys.<br>
__Default__: `false`<br>
⚠️ _So to have it said, be aware of the danger that secrets stored in local storage pose._

### Base Path
The angular application wrapper supports dynamic base path configuration at runtime to enable the use of 
container images in deployment scenarios where the dashboard is not running at root level but some sub path.
To configure a base path, add a file to the deployment environment at `public/config/APP_BASE_HREF.txt` with just the path and nothing else, e.g.:
```text
/my/custom/sub/path
```
For more details how this works, have a look at the [app.config.ts](src/app/app.config.ts) and the angular docs about [APP_BASE_HREF](https://angular.dev/api/common/APP_BASE_HREF).


# Run the dashboard
## Docker
The dashboard will be availabe at `http://localhost:8080`

1. `docker build -t eclipse-edc/data-dashboard .`
2. `docker run -p 8080:8080 -v $PWD/public/config/:/app/config -v $PWD/nginx.conf:/etc/nginx/conf.d/default.conf eclipse-edc/data-dashboard`

## Angular dev server
To run the data dashboard, you have to execute the following commands.
The dashboard will be available at `http://localhost:4200`

_Note that 2. and 3. always have to be executed for each run._

1. `npm install`
2. `npm run lib-start`
3. `npm run start`



# Create a custom dashboard (How to use the library)

To build a custom dashboard you first have to publish the angular library (dashboard-core) to a package registry:
```shell
cd projects/dashboard-core
npm publish --registry=<your-registry-url>
```

## Include the library in your angular project
When the library is published to your registry, perform the following steps in the angular project you want to use the library in:
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
    echo @eclipse-edc:registry=<your-registry-url> >> .npmrc
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

