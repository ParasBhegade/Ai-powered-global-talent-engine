# Fix Missing Features from Old PHP Project

## Summary
After a thorough comparison of `project.old` PHP files and the current MERN stack, I've identified all missing features, random values, and broken functionality. This plan fixes everything systematically.

---

## 🔴 Critical Random/Hardcoded Values Found

| Location | Issue |
|---|---|
| `StudentDashboard.jsx` L42 | `readiness = Math.floor(Math.random() * 35) + 60` — completely random |
| `StudentDashboard.jsx` L51-54 | Chart shows `[70, 60, 80, 50]` static if no path selected |
| `ProfilePage.jsx` L25-26 | Hardcoded fake `experience` and `skills` defaults |
| `ProfilePage.jsx` L76 | Always shows `"100% COMPLETE"` badge regardless of actual data |
| `ProfilePage.jsx` L179 | Skill bars use `Math.random()` for width |
| `ProfilePage.jsx` L141 | "AI Core Analysis" bio is completely fabricated |

---

## Section-by-Section Fixes

### 1. Student Dashboard

**Old PHP behavior:**
- Readiness = `rand(60, 95)` (commented "link with test logic later") — needs to be based on actual latest test score
- Chart shows skill weights from DB for selected path; empty/zero if no path or no test
- Profile photo shown in sidebar

**Fixes:**
- Readiness = `latestScore ? round(score/total*100) : 0` — 0 if no path or no test
- Chart: empty state (no bars) if no path selected; actual skill weights if path selected
- Profile photo shown in sidebar next to user name
- Recent Activity uses actual timestamps from latestScore

**Files:** `StudentDashboard.jsx`

---

### 2. Profile Page

**Old PHP behavior:**
- Profile % computed from 6 real fields: fullname, phone, education, experience, skills, photo
- No random bio — only shows real submitted data
- "Save Profile" persists to DB and reloads; no revert on refresh
- Alert at bottom: "Complete your profile to improve recommendations"
- Photo upload works with persist

**Fixes:**
- Remove all hardcoded `experience` and `skills` defaults — blank if not set
- Compute real profile % from 6 fields
- Remove "100% COMPLETE" hardcoded badge; show actual %
- Replace fake AI bio with actual profile summary based on user's data
- Remove `Math.random()` in skill bars; use actual skill weights from career path
- Add completion alert at bottom if profile < 100%
- Fix refresh: always load from API (remove `loaded` guard that skips re-fetch)

**Files:** `ProfilePage.jsx`

---

### 3. Test Page

**Old PHP behavior:**
- fetches ALL questions for the career path
- Questions re-ordered based on `weakTopics` from previous test (adaptive)
- Shows `Question X of Y`

**Fixes:**
- Add adaptive question ordering in server: if user has prev score with weakTopics, prioritize those questions
- Display `Question X of Y` counter
- Ensure no question count limit (old PHP had no LIMIT clause)

**Files:** `TestPage.jsx`, `server/routes/tests.js`

---

### 4. AI Interview

**Old PHP behavior (interview_live.php):**
- Canvas pixel brightness analysis every 600ms
- If face not visible → alert message + Start button HIDDEN
- If obstructed or looking away → Start button HIDDEN
- Full-screen request when interview begins
- TTS cancelled before mic starts

**Currently broken:** No face detection, camera "OK" immediately, no fullscreen

**Fixes:**
- Port pixel brightness face detection from PHP to React (canvas ref + setInterval)
- `faceVisible` state controls Start button visibility
- Status message: "⚠ Face not detected — sit in front of camera."
- `document.documentElement.requestFullscreen()` on camera validation success
- Stop TTS before recognizer.start()

**Files:** `InterviewLivePage.jsx`

---

### 5. Recommendations

**Old PHP behavior (recommendations.php):**
- Full TTS panel: Voice selector dropdown, Rate slider, Pitch slider, Highlight checkbox
- Play / Pause / Resume / Stop buttons
- Spacebar keyboard shortcut for play/pause
- Text highlight during TTS playback (scroll into view)
- Right sidebar: Quick Summary card, Top Focus Areas with animated progress bars, Fast Tips, Actions link to tutorials

**Currently missing:** Only one "Audio Feed" button, no voice selection, no multilingual, no sidebar

**Fixes:**
- Full TTS control panel with all browser voices (multilingual support)
- Rate, Pitch sliders
- Play/Pause/Resume/Stop with disabled states
- Spacebar shortcut
- Right sidebar with Quick Summary (score bar), Top Focus Areas (animated bars), Fast Tips, Tutorials link

**Files:** `RecommendationsPage.jsx`

---

### 6. Admin Dashboard

**Old PHP had:**
- `edit_path.php` — Edit name + description of a path
- `manage_skills.php` — per-path skill management table
- `add_skill.php` / `edit_skill.php` / `delete_skill.php` — skill CRUD with fields: skill_name, category, weight
- `tutorials_admin.php` — tutorial management

**Currently missing:** No Edit path, no Manage Skills, no Add/Edit/Delete skills UI

**Fixes:**
- Edit Path: inline modal in table row
- Skills panel: expandable drawer per path with skill list and Add/Edit/Delete
- Add `category` field to Skill model
- Backend: `PUT /api/careers/:id`, `POST/PUT/DELETE /api/careers/:id/skills`
- Add Tutorials admin section (add/edit/delete tutorials)

**Files:** `AdminDashboard.jsx`, `server/routes/careers.js`, `server/models/Skill.js`

---

### 7. AI Assistant

**Old PHP had:** Speech-to-text input + mute toggle for TTS responses

**Currently missing:** No mic input, no mute button

**Fixes:**
- Microphone (🎤) button activates `webkitSpeechRecognition` → fills input
- Mute toggle (🔇/🔊) disables/enables TTS for AI replies

**Files:** `AIAssistant.jsx`

---

### 8. Tutorials Page

**Old PHP had:** Title + summary + YouTube embed per card, vertical list, path-specific

**Current state:** Mostly correct, minor layout improvement

**Fixes:** Improve card layout – wider, show full summary

---

## Execution Order

1. Fix `StudentDashboard.jsx` (readiness, chart, profile pic in sidebar)
2. Fix `ProfilePage.jsx` (remove ALL random values, real % completion, alert)
3. Fix `InterviewLivePage.jsx` (face detection, fullscreen, block start)
4. Fix `RecommendationsPage.jsx` (full TTS panel, sidebar summary)
5. Fix `AdminDashboard.jsx` + `server/routes/careers.js` (Edit + Skills management)
6. Fix `AIAssistant.jsx` (STT + mute)
7. Fix `TestPage.jsx` + `server/routes/tests.js` (adaptive ordering)

---

## Verification Plan

- Fresh user (no path, no test): all metrics = 0, chart empty
- After selecting path: chart shows real skill weights from DB
- After taking test: readiness = actual score %
- Profile completion % matches actual filled fields
- AI interview blocks start if face not detected
- TTS panel shows all browser voices including non-English

