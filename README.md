# EDC Data Dashboard

**Note: this repository does not contain production-grade code and is only intended for demonstration purposes**

EDC Data Dashboard is a frontend application for [EDC connectors](https://github.com/eclipse-dataspaceconnector/DataSpaceConnector) running in the [MVD](https://github.com/agera-edc/MinimumViableDataspace).

## Generate client code for EDC REST APIs

1. [optional] copy the current version of EDC's `openapi.yaml` file to `openapi/`. There is one checked in, so this is not required.
2. in a shell execute
   ```shell
   docker run --rm -v "${PWD}:/local" openapitools/openapi-generator-cli generate -i /local/openapi/openapi.yaml -g typescript-angular -o /local/src/modules/edc-dmgmt-client/
   ```
   This re-generates the service and model classes. _Be careful not to overwrite service `constructor` methods!


## Deploy to Azure

Create a resource group and container registry:

```bash
export RESOURCE_GROUP=edc-data-dashboard
export ACR_NAME=edcdatadashboard
az group create --resource-group $RESOURCE_GROUP --location westeurope -o none
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Standard --location westeurope --admin-enabled -o none
```

Dockerize the application and push it to the registry by running:

```bash
az acr build --registry $ACR_NAME --image edc-showcase/edc-data-dashboard:latest .
```

The docker image is now ready to be deployed to Azure Container Instances (ACI). The `app.config.json` file contains configuration which is fetched by the application at startup. This file can be overridden at deployment time by mounting a secret on `assets/config`. For each deployment you need to provide the corresponding connector backend URL, the storage account name and the API key using this secret. Deploy to ACI using the following command:

```bash
export CONNECTOR_DATA_URL=<CONNECTOR_DATA_URL>
export CONNECTOR_CATALOG_URL=<CONNECTOR_CATALOG_URL>
export STORAGE_ACCOUNT=<STORAGE_ACCOUNT>
export API_KEY=<API_KEY>

# deploy to ACI (when prompted for credentials use the username/password as available in Azure Portal: ACR->Access Keys)
az container create --image ${ACR_NAME}.azurecr.io/edc-showcase/edc-data-dashboard:latest \
--resource-group $RESOURCE_GROUP \
--name edc-data-dashboard \
--secrets "app.config.json"="{\"dataManagementApiUrl\": \"$CONNECTOR_DATA_URL\", \"catalogUrl\": \"$CONNECTOR_CATALOG_URL\", \"storageAccount\": \"$STORAGE_ACCOUNT\", \"apiKey\": \"$API_KEY\"}" \
--secrets-mount-path /usr/share/nginx/html/assets/config \
--dns-name-label edc-data-dashboard
```


