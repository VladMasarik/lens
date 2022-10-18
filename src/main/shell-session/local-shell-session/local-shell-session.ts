/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { UserStore } from "../../../common/user-store";
import type { ShellSessionArgs, ShellSessionDependencies } from "../shell-session";
import { ShellSession } from "../shell-session";
import type { ModifyTerminalShellEnv } from "../shell-env-modifier/modify-terminal-shell-env.injectable";
import type { JoinPaths } from "../../../common/path/join-paths.injectable";
import type { GetDirnameOfPath } from "../../../common/path/get-dirname.injectable";
import type { GetBasenameOfPath } from "../../../common/path/get-basename.injectable";
import { TerminalChannels } from "../../../common/terminal/channels";

export interface LocalShellSessionDependencies extends ShellSessionDependencies {
  readonly directoryForBinaries: string;
  readonly userStore: UserStore;
  modifyTerminalShellEnv: ModifyTerminalShellEnv;
  joinPaths: JoinPaths;
  getDirnameOfPath: GetDirnameOfPath;
  getBasenameOfPath: GetBasenameOfPath;
}

export class LocalShellSession extends ShellSession {
  ShellType = "shell";

  constructor(protected readonly dependencies: LocalShellSessionDependencies, args: ShellSessionArgs) {
    super(dependencies, args);
  }

  protected getPathEntries(): string[] {
    return [this.dependencies.directoryForBinaries];
  }

  protected get cwd(): string | undefined {
    return this.cluster.preferences?.terminalCWD;
  }

  public async open() {
    const cachedShellEnv = await this.getCachedShellEnv();
    const env = this.dependencies.modifyTerminalShellEnv(this.cluster.id, cachedShellEnv);
    const shell = env.PTYSHELL;

    if (shell) {
      const args = await this.getShellArgs(shell);

      await this.openShellProcess(shell, args, env);
    } else {
      this.send({
        type: TerminalChannels.ERROR,
        data: "PTYSHELL is not defined with the environment",
      });
      this.dependencies.logger.warn(`[LOCAL-SHELL-SESSION]: PTYSHELL env var is not defined for ${this.terminalId}`);
    }
  }

  protected async getShellArgs(shell: string): Promise<string[]> {
    const pathFromPreferences = this.dependencies.userStore.kubectlBinariesPath || this.kubectl.getBundledPath();
    const kubectlPathDir = this.dependencies.userStore.downloadKubectlBinaries
      ? await this.kubectlBinDirP
      : this.dependencies.getDirnameOfPath(pathFromPreferences);

    switch(this.dependencies.getBasenameOfPath(shell)) {
      case "powershell.exe":
        return ["-NoExit", "-command", `& {$Env:PATH="${kubectlPathDir};${this.dependencies.directoryForBinaries};$Env:PATH"}`];
      case "bash":
        return ["--init-file", this.dependencies.joinPaths(await this.kubectlBinDirP, ".bash_set_path")];
      case "fish":
        return ["--login", "--init-command", `export PATH="${kubectlPathDir}:${this.dependencies.directoryForBinaries}:$PATH"; export KUBECONFIG="${await this.kubeconfigPathP}"`];
      case "zsh":
        return ["--login"];
      default:
        return [];
    }
  }
}
