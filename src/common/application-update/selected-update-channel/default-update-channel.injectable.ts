/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import releaseChannelInjectable from "../../vars/release-channel.injectable";
import { createLazyInitializableState } from "../../initializable-state/create-lazy";
import { updateChannels } from "../update-channels";

const defaultUpdateChannelInjectable = createLazyInitializableState({
  id: "default-update-channel",
  init: (di) => updateChannels[di.inject(releaseChannelInjectable).get()],
});

export default defaultUpdateChannelInjectable;
