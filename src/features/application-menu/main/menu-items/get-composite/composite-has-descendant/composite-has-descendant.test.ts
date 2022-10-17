/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Composite } from "../get-composite";
import getComposite from "../get-composite";
import { compositeHasDescendant } from "./composite-has-descendant";

describe("composite-has-descendant, given composite with children and grand children", () => {
  let composite: Composite<{ id: string; parentId: string | undefined }>;

  beforeEach(() => {
    const items = [
      { id: "some-root-id", parentId: undefined },
      { id: "some-child-item", parentId: "some-root-id" },

      {
        id: "some-grand-child-item",
        parentId: "some-child-item",
      },
    ];

    composite = getComposite({ source: items });
  });

  it("has a child as descendant", () => {
    const actual = compositeHasDescendant<typeof composite["value"]>(
      (referenceComposite) => referenceComposite.value.id === "some-child-item",
    )(composite);

    expect(actual).toBe(true);
  });

  it("has a grand child as descendant", () => {
    const actual = compositeHasDescendant<typeof composite["value"]>(
      (referenceComposite) => referenceComposite.value.id === "some-grand-child-item",
    )(composite);

    expect(actual).toBe(true);
  });

  it("does not have an unrelated descendant", () => {
    const actual = compositeHasDescendant<typeof composite["value"]>(
      (referenceComposite) => referenceComposite.value.id === "some-unknown-item",
    )(composite);

    expect(actual).toBe(false);
  });
});
