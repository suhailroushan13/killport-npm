# killport-npm

[![npm version](https://img.shields.io/npm/v/killport-npm.svg)](https://www.npmjs.com/package/killport-npm)
[![Node.js](https://img.shields.io/node/v/killport-npm.svg)](https://nodejs.org/)

CLI that finds the process **listening on a TCP port** and terminates it. Works on **Windows**, **macOS**, **Ubuntu / Linux**, and **WSL** (same code path as Linux).

## Table of contents

- [Requirements](#requirements)
- [Install (quick reference)](#install-quick-reference)
- [Install on Windows](#install-on-windows)
- [Install on macOS](#install-on-macos)
- [Install on Ubuntu (and most Debian-based Linux)](#install-on-ubuntu-and-most-debian-based-linux)
- [Install on WSL (Windows Subsystem for Linux)](#install-on-wsl-windows-subsystem-for-linux)
- [How to use (proper workflow)](#how-to-use-proper-workflow)
- [Usage summary](#usage-summary)
- [Package lifecycle (npm / pnpm / yarn)](#package-lifecycle-npm--pnpm--yarn)
- [Authors](#authors)

## Requirements

- **Node.js 18+** (from [nodejs.org](https://nodejs.org), your OS package manager, or a version manager such as **nvm** / **fnm** / **n**)

Package managers supported:

- **npm** (ships with Node)
- **pnpm** — same package; lifecycle scripts (`preinstall` / `postinstall`) run the same as with npm
- **Yarn** — same package; use **Yarn Classic (1.x)** `yarn global add` for a global CLI, or **`yarn dlx`** (Yarn 2+) for a one-off run (same idea as `npx` / `pnpm dlx`)

Platform tools used:

| OS | Resolution | Kill |
|----|------------|------|
| macOS | `lsof` | `kill` |
| Linux / WSL | `ss`, then `lsof` | `kill` |
| Windows | `netstat` | `taskkill` |

Killing processes owned by another user may require **Administrator** (Windows) or **sudo** (Unix).

---

## Install (quick reference)

| Goal | npm | pnpm | Yarn |
|------|-----|------|------|
| Global CLI (`killport` on your PATH) | `npm install -g killport-npm` | `pnpm add -g killport-npm` | `yarn global add killport-npm` (Classic **1.x** only; ensure [Yarn global bin is on `PATH`](https://classic.yarnpkg.com/lang/en/docs/cli/global/)) |
| One-off, no global install | `npx killport-npm <port>` | `pnpm dlx killport-npm <port>` | `yarn dlx killport-npm <port>` (**Yarn 2+**; for Yarn 1 use `npx` or a global install) |

After a global install, run:

```bash
killport --help
killport 3000
```

If `killport` is not found, your global bin directory is not on `PATH`. See the OS sections below.

---

## Install on Windows

1. **Install Node.js 18+**  
   - Download from [nodejs.org](https://nodejs.org), or e.g. `winget install OpenJS.NodeJS.LTS` (build may vary).

2. **Optional: install pnpm**  
   - Follow [pnpm installation](https://pnpm.io/installation) (e.g. `npm install -g pnpm` or the standalone script).

3. **Install this package globally**

   ```powershell
   npm install -g killport-npm
   ```

   or

   ```powershell
   pnpm add -g killport-npm
   ```

   or (Yarn Classic 1.x)

   ```powershell
   yarn global add killport-npm
   ```

4. **PATH**  
   - **npm:** global binaries usually live under `%AppData%\npm`. The Node installer often adds this to PATH.  
   - **pnpm:** run `pnpm setup` once and follow the printed instructions so the pnpm global bin is on PATH.  
   - **Yarn Classic:** run `yarn global bin` and add that folder to PATH if `killport` is not found.  
   - Open a **new** terminal after changing PATH.

5. **Permissions**  
   - If `taskkill` fails for a system or other user’s process, open **PowerShell** or **Command Prompt** as **Administrator** and run `killport <port>` again.

6. **Use without global install**

   ```powershell
   npx killport-npm 3000
   pnpm dlx killport-npm 3000
   yarn dlx killport-npm 3000
   ```

---

## Install on macOS

1. **Install Node.js 18+** (official installer, Homebrew `brew install node`, or nvm/fnm).

2. **Install globally**

   ```bash
   npm install -g killport-npm
   # or
   pnpm add -g killport-npm
   # or (Yarn Classic 1.x)
   yarn global add killport-npm
   ```

3. **PATH**  
   - If `killport` is not found, ensure your npm global prefix is on PATH (`npm prefix -g` → `bin` next to it). For pnpm, run `pnpm setup` if you use pnpm’s default store layout. For Yarn Classic, add Yarn’s global bin to PATH (see `yarn global bin`).

4. **Permissions**  
   - If you get permission errors killing another user’s process, use `sudo killport <port>` (only when necessary).

5. **One-off**

   ```bash
   npx killport-npm 3000
   pnpm dlx killport-npm 3000
   yarn dlx killport-npm 3000
   ```

`lsof` is available by default on macOS.

---

## Install on Ubuntu (and most Debian-based Linux)

1. **Install Node.js 18+**  
   - e.g. [NodeSource](https://github.com/nodesource/distributions), **nvm**, or your distro’s packages if the version is ≥ 18.

2. **Tools**  
   - `ss` is in **`iproute2`** (usually preinstalled): `sudo apt update && sudo apt install -y iproute2`  
   - Optional fallback: `sudo apt install -y lsof`

3. **Install globally**

   ```bash
   npm install -g killport-npm
   # or
   pnpm add -g killport-npm
   # or (Yarn Classic 1.x)
   yarn global add killport-npm
   ```

4. **PATH**  
   - Same idea as macOS: ensure the global `bin` directory npm/pnpm/Yarn uses is on your `PATH` (restart the shell after changes).

5. **Permissions**  
   - Use `sudo killport <port>` if the listener is owned by root or another user.

6. **One-off**

   ```bash
   npx killport-npm 3000
   pnpm dlx killport-npm 3000
   yarn dlx killport-npm 3000
   ```

---

## Install on WSL (Windows Subsystem for Linux)

WSL runs a **Linux** distro; install **Node inside that distro** (not only on Windows), then use the **same commands as Ubuntu / Linux** above.

1. Open your WSL terminal (e.g. Ubuntu).
2. Install Node 18+ there (nvm is a common choice).
3. Run:

   ```bash
   npm install -g killport-npm
   # or
   pnpm add -g killport-npm
   # or (Yarn Classic 1.x)
   yarn global add killport-npm
   ```

**Important:** `killport` in WSL only sees processes **in that Linux environment**. If a server is bound on the **Windows** host, kill it from **Windows** (PowerShell/CMD) with a Windows install of Node + `killport`, or stop the process from Task Manager.

Ensure `iproute2` / `ss` (and optionally `lsof`) are installed in the distro, as on Ubuntu.

---

## How to use (proper workflow)

1. **See what would be killed** (safe):

   ```bash
   killport 3000 --dry-run
   ```

2. **Kill the listener** (default is forceful: `SIGKILL` on Unix, `taskkill /F` on Windows):

   ```bash
   killport 3000
   ```

3. **Try graceful shutdown first** (then force on Unix if needed; on Windows tries `taskkill` without `/F`, then `/F`):

   ```bash
   killport 3000 --graceful
   ```

4. **Interactive mode** (only when stdin is a TTY): run `killport` with no arguments and enter the port when prompted.

5. **Help:**

   ```bash
   killport --help
   ```

---

## Usage summary

```bash
killport <port> [options]
```

| Option | Meaning |
|--------|---------|
| `--dry-run` | Print PID(s) that would be killed; do not kill |
| `--graceful` | `SIGTERM` / `taskkill` without `/F` first (Unix then `SIGKILL` if needed) |
| `--help`, `-h` | Help |

Same flags work with runners, for example:

```bash
npx killport-npm 8080 --dry-run
pnpm dlx killport-npm 8080 --dry-run
yarn dlx killport-npm 8080 --dry-run
```

---

## Package lifecycle (npm / pnpm / yarn)

`preinstall` and `postinstall` run for **npm**, **pnpm**, and **yarn** installs of this package.

| Script | When | Purpose |
|--------|------|---------|
| `preinstall` | Before install | Ensures Node ≥ 18 |
| `postinstall` | After install | Short usage hint (WSL hint when detected) |
| `prepublishOnly` | Before `npm publish` | Syntax-checks CLI and lib files (maintainers) |

---

## Authors

- [Suhail Roushan](https://github.com/suhailroushan13)

## Links

[![GitHub](https://img.shields.io/badge/github-000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/suhailroushan13)

[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/suhailroushan13/)

[![twitter](https://img.shields.io/badge/twiiter-00acee?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/0xsuhailroushan)
