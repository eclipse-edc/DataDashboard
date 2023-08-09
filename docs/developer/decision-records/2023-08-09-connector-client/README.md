# Connector client

## Decision

We'll replace the direct management API calls with a provided library, the chosen
one is [EDC-connector-client](https://github.com/Think-iT-Labs/edc-connector-client)

## Rationale

Maintaining the low level http communication with the connector is an additional
effort that can be delegated to a dedicated library.

## Approach

The library will be added as a dependency and all the calls to the connector will
pass through it.
Dependabot will be activated, it will permit us to stay updated with the newest
releases.
