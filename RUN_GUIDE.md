@'
# Run GodzillaCoder SupportDesk in VS Code on Windows

This guide runs the combined project: the **backend** in `backend\` and the **React frontend** in `frontend\`.

---

## 1. Install the tools (one time)

1. **Node.js LTS** – download from https://nodejs.org and install with the default options.
2. **Git** – download from https://git-scm.com and install with the default options.
3. **VS Code** – https://code.visualstudio.com
4. Open a new terminal (PowerShell) and check:
   ```powershell
   node -v
   npm -v
   git --version
   ```
   Each should print a version number. If not, restart your computer and try again.

> If PowerShell says *"running scripts is disabled on this system"* when you run `npm`, run this once:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` and answer **Y**.

---

## 2. Get the project from GitHub

In a terminal (for example in `D:\`):

```powershell
git clone https://github.com/varothayan8/support-ticket-management-system.git
cd support-ticket-management-system
```