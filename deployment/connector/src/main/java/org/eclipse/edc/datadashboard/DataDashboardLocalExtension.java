/*
 *  Copyright (c) 2023 Bayerische Motoren Werke Aktiengesellschaft (BMW AG)
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 *
 *  Contributors:
 *       Bayerische Motoren Werke Aktiengesellschaft (BMW AG) - initial API and implementation
 *
 */

package org.eclipse.edc.datadashboard;

import org.eclipse.edc.catalog.spi.FederatedCacheNode;
import org.eclipse.edc.catalog.spi.FederatedCacheNodeDirectory;
import org.eclipse.edc.connector.dataplane.selector.spi.instance.DataPlaneInstance;
import org.eclipse.edc.connector.dataplane.selector.spi.store.DataPlaneInstanceStore;
import org.eclipse.edc.runtime.metamodel.annotation.Extension;
import org.eclipse.edc.runtime.metamodel.annotation.Inject;
import org.eclipse.edc.spi.system.ServiceExtension;
import org.eclipse.edc.spi.system.ServiceExtensionContext;

import java.util.List;
import java.util.UUID;

@Extension(value = DataDashboardLocalExtension.NAME)
public class DataDashboardLocalExtension implements ServiceExtension {

  public static final String NAME = "DataDashboard Local - please do not use in production";

  @Inject
  private FederatedCacheNodeDirectory federatedCacheNodeDirectory;

  @Inject
  private DataPlaneInstanceStore dataPlaneInstanceStore;

  @Override
  public String name() {
    return NAME;
  }

  @Override
  public void initialize(ServiceExtensionContext context) {
    var nodeUrl = context.getSetting("edc.federated.node.url", null);
    if (nodeUrl != null) {
      context.getMonitor().info("Register federated node: %s".formatted(nodeUrl));
      federatedCacheNodeDirectory.insert(new FederatedCacheNode(UUID.randomUUID().toString(), nodeUrl, List.of("dataspace-protocol-http")));
    }
  }

  @Override
  public void start() {
    var dataPlaneInstance = DataPlaneInstance.Builder.newInstance()
      .url("http://localhost:9192/control/transfer")
      .allowedSourceType("HttpData")
      .allowedDestType("HttpData")
      .build();
    dataPlaneInstanceStore.create(dataPlaneInstance);
  }
}
