/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./top-bar.module.scss";
import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react";
import type { IComputedValue } from "mobx";
import { Icon } from "../../icon";
import { cssNames } from "../../../utils";
import topBarItemsInjectable from "./top-bar-items/top-bar-items.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { TopBarRegistration } from "./top-bar-registration";
import isLinuxInjectable from "../../../../common/vars/is-linux.injectable";
import isWindowsInjectable from "../../../../common/vars/is-windows.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import { UpdateButton } from "../../../../features/application-update/child-features/application-update-using-top-bar/renderer/update-button";
import topBarPrevEnabledInjectable from "./prev-enabled.injectable";
import topBarNextEnabledInjectable from "./next-enabled.injectable";
import goBackInjectable from "./go-back.injectable";
import goForwardInjectable from "./go-forward.injectable";
import closeWindowInjectable from "./close-window.injectable";
import maximizeWindowInjectable from "./maximize-window.injectable";
import toggleMaximizeWindowInjectable from "./toggle-maximize-window.injectable";
import watchHistoryStateInjectable from "../../../remote-helpers/watch-history-state.injectable";
import topBarItems2Injectable from "./top-bar-items/top-bar-items2.injectable";
import type { TopBarItem } from "./top-bar-items/top-bar-item-injection-token";
import welcomeRouteInjectable from "../../../../common/front-end-routing/routes/welcome/welcome-route.injectable";
import navigateToWelcomeInjectable from "../../../../common/front-end-routing/routes/welcome/navigate-to-welcome.injectable";

interface Dependencies {
  navigateToWelcomePage: () => void;
  welcomeRouteIsActive: IComputedValue<boolean>;
  items: IComputedValue<TopBarRegistration[]>;
  items2: IComputedValue<TopBarItem[]>;
  isWindows: boolean;
  isLinux: boolean;
  prevEnabled: IComputedValue<Boolean>;
  nextEnabled: IComputedValue<Boolean>;
  goBack: () => void;
  goForward: () => void;
  minimizeWindow: () => void;
  toggleMaximizeWindow: () => void;
  closeWindow: () => void;
  watchHistoryState: () => () => void;
}

const NonInjectedTopBar = observer(({
  items,
  items2,
  navigateToCatalog,
  catalogRouteIsActive,
  navigateToWelcomePage,
  welcomeRouteIsActive,
  isWindows,
  isLinux,
  prevEnabled,
  nextEnabled,
  goBack,
  goForward,
  closeWindow,
  minimizeWindow,
  toggleMaximizeWindow,
  watchHistoryState,
}: Dependencies) => {
  const elem = useRef<HTMLDivElement | null>(null);

  const goHome = () => {
    navigateToWelcomePage();
  };

  const windowSizeToggle = (evt: React.MouseEvent) => {
    if (elem.current === evt.target) {
      toggleMaximizeWindow();
    }
  };

  useEffect(() => watchHistoryState(), []);

  return (
    <div
      className={styles.topBar}
      onDoubleClick={windowSizeToggle}
      ref={elem}>
      <div className={styles.items}>
        {items2.get().map((item) => {
          const Component = item.Component;

          return <Component key={item.id} />;
        })}

        <Icon
          data-testid="home-button"
          material="home"
          onClick={goHome}
          disabled={welcomeRouteIsActive.get()}
        />
        <Icon
          data-testid="history-back"
          material="arrow_back"
          onClick={goBack}
          disabled={!prevEnabled.get()}
        />
        <Icon
          data-testid="history-forward"
          material="arrow_forward"
          onClick={goForward}
          disabled={!nextEnabled.get()}
        />
        <UpdateButton />
      </div>
      <div className={styles.items}>
        {renderRegisteredItems(items.get())}
        {(isWindows || isLinux) && (
          <div className={cssNames(styles.windowButtons, { [styles.linuxButtons]: isLinux })}>
            <div
              className={styles.minimize}
              data-testid="window-minimize"
              onClick={minimizeWindow}
            >
              <svg shapeRendering="crispEdges" viewBox="0 0 12 12">
                <rect
                  fill="currentColor"
                  width="10"
                  height="1"
                  x="1"
                  y="9"
                />
              </svg>
            </div>
            <div
              className={styles.maximize}
              data-testid="window-maximize"
              onClick={toggleMaximizeWindow}
            >
              <svg shapeRendering="crispEdges" viewBox="0 0 12 12">
                <rect
                  width="9"
                  height="9"
                  x="1.5"
                  y="1.5"
                  fill="none"
                  stroke="currentColor"
                />
              </svg>
            </div>
            <div
              className={styles.close}
              data-testid="window-close"
              onClick={closeWindow}
            >
              <svg shapeRendering="crispEdges" viewBox="0 0 12 12">
                <polygon fill="currentColor" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const renderRegisteredItems = (items: TopBarRegistration[]) => (
  items.map((registration, index) => {
    if (!registration?.components?.Item) {
      return null;
    }

    return <registration.components.Item key={index} />;
  })
);

export const TopBar = withInjectables<Dependencies>(NonInjectedTopBar, {
  getProps: (di) => ({
    navigateToWelcomePage: di.inject(navigateToWelcomeInjectable),
    items: di.inject(topBarItemsInjectable),
    items2: di.inject(topBarItems2Injectable),
    isLinux: di.inject(isLinuxInjectable),
    isWindows: di.inject(isWindowsInjectable),
    prevEnabled: di.inject(topBarPrevEnabledInjectable),
    nextEnabled: di.inject(topBarNextEnabledInjectable),

    welcomeRouteIsActive: di.inject(
      routeIsActiveInjectable,
      di.inject(welcomeRouteInjectable),
    ),

    goBack: di.inject(goBackInjectable),
    goForward: di.inject(goForwardInjectable),
    closeWindow: di.inject(closeWindowInjectable),
    minimizeWindow: di.inject(maximizeWindowInjectable),
    toggleMaximizeWindow: di.inject(toggleMaximizeWindowInjectable),
    watchHistoryState: di.inject(watchHistoryStateInjectable),
  }),
});
