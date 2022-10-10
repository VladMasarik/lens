import { getInjectable } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import { computed, runInAction } from "mobx";
import React from "react";
import { ClusterModalRegistration, clusterModalsInjectionToken } from "../../extensions/registries";
import { ApplicationBuilder, getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("cluster modal elements", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;

  beforeEach(() => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();
  });

  describe("given custom cluster modal available", () => {
    beforeEach(async () => {
      builder.beforeWindowStart((windowDi) => {
        runInAction(() => {
          windowDi.register(testClusterModalsInjectable);
        });
      });

      rendered = await builder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });
  });

  describe("given custom cluster modal not available", () => {
    beforeEach(async () => {
      rendered = await builder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });
  });
});

const testClusterModalsInjectable = getInjectable({
  id: "some-cluster-modal-injectable",

  instantiate: () => {
    return computed((): ClusterModalRegistration[] => [{
      id: "test-modal-id",
      Component: () => <div data-testid="test-modal">test modal</div>,
      visible: computed(() => true),
    }])
  },

  injectionToken: clusterModalsInjectionToken
});