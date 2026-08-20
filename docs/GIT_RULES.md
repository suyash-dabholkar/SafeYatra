# Git Rules — SafeYatra (Smart Tourist Safety System)

Everyone on the team follows this. It's short on purpose. If you're new to git, just follow the steps literally — you don't need to understand git deeply to work safely here.

This is the same workflow we used on ML Tracker, adapted for this project: **4 people**, **firmware + software in one repo**, and **two kinds of secrets** to keep out.

---

## The 3 rules that matter most

1. **Never commit directly to `main`.** Always work on your own branch.
2. **Always `git pull origin main` before starting new work.** This prevents 90% of problems.
3. **Never commit secrets.** Two kinds here:
   - `.env` — backend keys (DB, map API, MQTT broker).
   - `secrets.h` in any firmware sketch — your **WiFi SSID/password** and any keys. ESP32/Heltec code leaks these constantly. Keep them in a gitignored `secrets.h`, never hardcoded in the `.ino`.

Everything below is detail. If you only remember these three, you'll be fine.

---

## Who owns what

We're using **vertical slices** — each person owns a feature end-to-end, not a single layer. Map of folders:

| Person | Owns folder(s) | Role |
|---|---|---|
| **A** | `/firmware/crowd-band/`, `/firmware/ble-gateway/` | Crowd side — band firmware, BLE gateway |
| **B** | `/firmware/remote-band/`, `/firmware/lora-gateway/`, `/trekker-app/` | Remote side — GPS/fall firmware, LoRa, trekker app |
| **C** | `/backend/` (API, DB, geofencing, anomaly fusion, pathfinding, `/backend/ai/` CCI reuse) | Backend + AI |
| **D** | `/dashboard/` | Authority web app (admin + registration view) |

**Don't edit anyone else's folder.** If you need a change in someone else's folder, open a GitHub Issue and ask them.

**Cross-cutting features** (they touch two people's folders — coordinate with an Issue *before* you start, so you don't both edit the same thing):
- **NFC bind/reset** — A (physical tap flow on the gateway/kiosk) ↔ C (backend `/registration/bind` + `/release` endpoints).
- **Exit-routing / pathfinding** — A (zone graph + routing logic design) ↔ C (the actual Dijkstra/A* implementation in `/backend/`).
- **CCI integration** — C only (wiring the reused CrowdPulse YOLO+CCI+RandomForest into the pipeline — reuse, don't rebuild).

**Shared files** (`README.md`, `.gitignore`, `.env.example`, `/docs/`, `docker-compose.yml`) — anyone can change, but always via a PR.

This split means we almost never edit the same file, so merge conflicts should be rare.

---

## One-time setup

Do this once on your machine. **Everyone must do this or your commits won't show up on your GitHub profile.**

```bash
git config --global user.name "Your Name"
git config --global user.email "the-email-on-your-github-account@example.com"
```

The email **must match** the email on your GitHub account, otherwise your work won't count as your contribution.

Then get the code:

```bash
git clone <repo-url>
cd safeyatra
```

---

## The everyday workflow

This is the loop you repeat for every piece of work. Copy-paste it.

### Step 1 — Get the latest code

```bash
git checkout main
git pull origin main
```

Do this **every time** before starting something new. Don't skip it.

### Step 2 — Make your own branch

```bash
git checkout -b feat/c/geofence-breach-rule
```

(See naming rules below.)

### Step 3 — Do your work, then commit

```bash
git add .
git commit -m "feat(backend): add zone-breach detection rule"
```

Commit whenever something works — not once at the end. Small, frequent commits are good.

### Step 4 — Push your branch

```bash
git push -u origin feat/c/geofence-breach-rule
```

(After the first push on a branch, plain `git push` is enough.)

### Step 5 — Open a Pull Request

Go to GitHub, you'll see a green "Compare & pull request" button. Click it.

- Title: same format as your commit message
- Description: what you changed, why, and how to test it
- If it fixes an issue, write `Closes #7` in the description

### Step 6 — Get 1 approval, then merge

Someone else on the team reviews it and approves. Then click **"Squash and merge"**, and delete the branch when GitHub offers.

### Step 7 — Go back to step 1

```bash
git checkout main
git pull origin main
```

---

## Branch names

Format:

```
type/person/short-description
```

- **type** — only `feat` or `fix`
- **person** — `a`, `b`, `c`, or `d`
- **description** — lowercase, hyphens between words, 2–4 words

Examples:

```
feat/a/crowd-band-vibrate
feat/a/ble-gateway-scan
feat/b/fall-detection-heuristic
feat/b/trekker-sos-screen
feat/c/anomaly-fusion-engine
feat/c/cci-zone-status-wiring
feat/d/live-map-zones
feat/d/efir-one-click
fix/a/led-direction-swap
fix/b/gps-nmea-parse-crash
fix/c/duplicate-incident-500
fix/d/alert-feed-sort-order
```

---

## Commit messages

Format:

```
type(scope): short description
```

- **type** — only `feat` or `fix`
  - `feat` = you added or changed something
  - `fix` = you corrected something that was broken
- **scope** — one of: `crowd-band`, `remote-band`, `gateway`, `backend`, `ai`, `dashboard`, `trekker`, `docs`
- **description** — lowercase, starts with a verb in command form ("add", not "added"), no full stop

Good:

```
feat(crowd-band): add continuous buzz on danger status
feat(gateway): forward BLE presence list to backend
feat(remote-band): add two-stage fall detection
feat(backend): add Dijkstra exit routing on danger zone
feat(ai): wire CCI risk score into zone-status push
feat(dashboard): add live map with color-coded zones
fix(backend): return 409 on duplicate band bind
feat(docs): add access-and-roles reference
```

Bad — do not do this:

```
update
final
changes
asdf
fixed bug
Added crowd band code and also changed backend and dashboard
```

**One commit = one logical change.** Don't bundle three unrelated things into one commit.

Note: we only use `feat` and `fix`. Setup, docs, and config changes all go under `feat` with the right scope. Don't overthink which one to pick.

---

## About commit count

Our commit history is part of what gets graded, so it should look active and professional.

The right way to get there: **commit every time something works.** If you follow that habit naturally, you'll end up with plenty of commits and each one will look meaningful.

Do **not** make empty or pointless commits to inflate the number. It's obvious in the log and it looks worse than having fewer commits.

---

## Never commit these

Our `.gitignore` handles most of it, but be aware:

**Secrets (the important ones):**
- `.env` — backend DB creds, map API key, MQTT broker creds
- `secrets.h` — **WiFi SSID/password and keys inside firmware sketches.** This is the easy one to leak because it sits right in the `.ino`. Keep a gitignored `secrets.h` and commit `secrets.example.h` with blank placeholders instead.
- Map API keys must go in `.env` (and be referrer-restricted), never hardcoded in dashboard/trekker JS. Tip: using **Leaflet + OpenStreetMap** needs no key at all — prefer it to avoid the problem entirely.

**Junk / build output:**
- `node_modules/`, `venv/`, `__pycache__/`, `*.pyc`
- `.pio/`, `build/`, Arduino/PlatformIO build folders
- Large model weights — YOLO `*.pt` files are big; keep them out of git (share separately or use Git LFS). A small `risk_model.pkl` is fine.

If you ever accidentally commit a secret (a WiFi password, an API key): **tell the team immediately.** We rotate/change it. Deleting the commit is not enough — it stays in the history.

To share config, edit the `.example` files instead (empty placeholder values, no real secrets).

---

## Issues and tasks

- Every task should be a GitHub Issue
- Label it `person-a` / `person-b` / `person-c` / `person-d`, and a phase: `phase-bringup` (hardware/skeleton), `phase-integration`, `phase-polish`
- Mention the issue number in your PR (`Closes #12`)

This gives us a clear record of who did what, which is useful if we're asked about individual contribution.

---

## Protect the integration window

This project only works when four separate slices talk to each other, and **everything routes through the backend API (Person C).** So:

- **Weeks 1–early 2: work in parallel.** Frontend/dashboard/firmware people build against *stubbed* backend endpoints (fake JSON) so nobody is blocked waiting on the real backend.
- **Don't let any one slice run over into integration time.** The moment your piece works standalone, help wire it in.
- Keep PRs small during integration — a huge PR the night before demo won't get a real review and *will* break something.

---

## If you mess up

Don't panic and don't try random commands you found online. Ask in the group chat first. Here are the safe fixes for common situations:

**"I made changes on `main` by accident, I haven't committed yet"**
```bash
git stash
git checkout -b feat/c/my-work
git stash pop
```
Your changes move to a new branch.

**"I committed to `main` by accident, I haven't pushed yet"**
```bash
git branch feat/c/my-work    # save your work to a new branch
git reset --hard origin/main # reset main back to normal
git checkout feat/c/my-work  # continue on your branch
```

**"I want to undo my last commit but keep my changes"**
```bash
git reset --soft HEAD~1
```

**"My branch is behind main and GitHub says there's a conflict"**
```bash
git checkout main
git pull origin main
git checkout your-branch-name
git merge main
```
Then fix the conflicted files (git marks them with `<<<<<<<` and `>>>>>>>`), then commit.

**"I don't know what state I'm in"**
```bash
git status
```
This is always safe to run and usually tells you what to do next.

---

## Quick command cheat sheet

| What you want | Command |
|---|---|
| Which branch am I on / what changed | `git status` |
| Get latest main | `git checkout main` then `git pull origin main` |
| New branch | `git checkout -b feat/c/thing` |
| Switch branch | `git checkout branch-name` |
| Stage everything | `git add .` |
| Commit | `git commit -m "feat(backend): add thing"` |
| Push (first time on a branch) | `git push -u origin branch-name` |
| Push (after that) | `git push` |
| See recent commits | `git log --oneline -10` |
| List branches | `git branch` |

---

## Daily rhythm

- Pull `main` before starting work
- Commit whenever something works
- Push at least once a day, even if the feature isn't finished (pushing to *your own branch* is always safe)
- Keep PRs small — a huge PR won't get a real review from anyone
