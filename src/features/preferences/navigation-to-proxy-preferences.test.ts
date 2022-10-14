/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("preferences - navigation to proxy preferences", () => {
  let builder: ApplicationBuilder;

  beforeEach(() => {
    builder = getApplicationBuilder();
  });

  afterEach(() => {
    builder.quit();
  });

  describe("given in preferences, when rendered", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      builder.beforeWindowStart(() => {
        builder.preferences.navigate();
      });

      rendered = await builder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not show proxy preferences yet", () => {
      const page = rendered.queryByTestId("proxy-preferences-page");

      expect(page).toBeNull();
    });

    describe("when navigating to proxy preferences using navigation", () => {
      beforeEach(() => {
        builder.preferences.navigation.click("proxy");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows proxy preferences", () => {
        const page = rendered.getByTestId("proxy-preferences-page");

        expect(page).not.toBeNull();
      });
    });
  });
});
