# Kyob Command Center — Design Brief

## What This Is

A personal ops dashboard used by one person (OJ, Head of Marketing at Quely) every working day. It is not a product — it is a private tool. Think of it as a war room: everything OJ needs to see, act on, and track in one place, with zero noise.

It runs as a web app at a private Railway URL. OJ opens it in the morning and keeps it open all day.

---

## The Person Using This

**OJ** — runs marketing, content, outbound sales, and the Quely website simultaneously. On any given day he is:
- Responding to LinkedIn outreach follow-ups in HeyReach
- Writing or scheduling LinkedIn posts
- Updating the Quely website in Claude
- Jumping into Agile standup/planning calls
- Extracting tasks from those calls and tracking them

He is always context-switching. The dashboard needs to orient him instantly — no hunting, no scrolling to find what matters.

---

## Current Layout (What Exists Today)

### Overall structure
Two-column layout: fixed left sidebar (280px) + scrollable main content area.

```
┌──────────────────────┬──────────────────────────────────────┐
│  SIDEBAR (280px)     │  MAIN CONTENT                        │
│                      │                                      │
│  "Quick Tasks"       │  Today's date header                 │
│  [task list]         │                                      │
│  [quick log input]   │  [Outbound Panel]                    │
│                      │  [Content Panel]                     │
│  "Tools"             │  [Website Panel]                     │
│  [search bar]        │                                      │
│  [tool list]         │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

---

## Every Component — What It Does

### 1. Task List (sidebar, top)
- Shows all open tasks as a persistent list (they never disappear until marked done)
- Tasks come from 3 sources: **Fathom** (auto-extracted from meeting recordings), **Slack** (captured from messages), or **Manual** (OJ types them in)
- Each task shows: title (up to 2 lines), source badge (blue = fathom, green = slack, grey = manual), and time since added ("3d ago", "2h ago")
- Clicking a task opens a **popup modal** showing: full title, source, area, date added, meeting recording link, and context notes
- Checkbox on the left marks it done and removes it from the list
- Empty state: "No tasks today"

### 2. Quick Log (sidebar, below task list header)
- A single text input: `+ Quick log a task...`
- Short input (<60 chars): saves directly as one manual task
- Long/rambling input: hits an AI endpoint that extracts multiple tasks, shows a checkbox preview so OJ can confirm which ones to add
- Preview state shows: "Found N tasks" with checkboxes + "Add N tasks" / "cancel" buttons

### 3. Tools Section (sidebar, bottom)
- Search bar to filter 28 tools by name/description/category
- Tools grouped by category: Content & LinkedIn, Outbound & Sales, Research, GTM Strategy, Product, Data
- Each tool is a button showing its name
- Clicking a tool opens a **right-side drawer** with: tool name, description, what inputs it needs, when it was last run, and a "Launch in Claude Code" button
- Tools are Claude skills/prompts that OJ runs in Claude Code CLI

### 4. Outbound Panel (main content, top)
- A static daily reminder card: "Check HeyReach — respond to open messages"
- Shows today's date
- "Open HeyReach →" link

### 5. Content Panel (main content, middle)
- **Repurpose checklist** at the top — 3 items that reset daily:
  - Engage on LinkedIn (comments + replies)
  - Post to Atlassian Community
  - Post to YouTube Community
  - Turns green with "Done today" when all checked. Resets at midnight.
- **Post queue** below: list of LinkedIn posts with title, status badge (draft/scheduled/published), and scheduled date
- Filter tabs: All / Draft / Scheduled / Published

### 6. Website Panel (main content, bottom)
- Shows open website tasks (area = "website") with their status
- Same AI-powered quick log as the sidebar but scoped to website tasks
- Tasks marked as "blocking" are highlighted differently

---

## Current Visual Language (Keep or Evolve)

| Token | Value |
|-------|-------|
| Page background | `#0f0f1a` (very dark navy-black) |
| Sidebar background | `#16162a` |
| Card background | `#1e1e35` |
| Primary accent | Purple `#a855f7` (Tailwind `purple-500`) |
| Text primary | `rgba(255,255,255,0.80)` |
| Text secondary | `rgba(255,255,255,0.40)–0.60` |
| Text muted | `rgba(255,255,255,0.20)–0.30` |
| Border | `rgba(255,255,255,0.10)` |
| Fathom source | Blue badge |
| Slack source | Green badge |
| Manual source | Grey badge |
| Font | System sans-serif (Next.js default) |

The mood is: quiet, dense, dark. Like a terminal that grew up. Not flashy.

---

## What Is Working

- Dark background is correct — this is a focus tool, not a marketing site
- Purple accent gives it a distinct identity
- Information density in the sidebar is appropriate
- Source badges (fathom/slack/manual) are useful at a glance

---

## What Needs to Be Better (Pain Points for the Redesign)

1. **Sidebar feels crowded and undifferentiated** — tasks and tools are stacked with no visual breathing room or hierarchy. It is hard to tell at a glance where the task zone ends and the tools zone begins.

2. **Tasks have no visual weight** — every task looks identical regardless of source or age. A Fathom task from a 1-hour strategy meeting looks the same as a manually typed one-liner.

3. **No sense of progress or momentum** — the dashboard doesn't reflect how the day is going. You can't see "3 of 8 tasks done" or "2 tasks overdue."

4. **Panels in the main area feel generic** — three cards stacked vertically with the same visual treatment. No personality, no clear visual hierarchy between Outbound / Content / Website.

5. **The Repurpose checklist is buried** — it's inside the Content panel but it's a daily ritual that deserves more prominence.

6. **Tools drawer feels disconnected** — it slides in from the right but there's no visual relationship between it and the tool you clicked.

7. **Empty states are flat** — "No tasks today" is just grey text.

8. **The date header at the top of main content is underused** — it's just a string with no context or orientation.

---

## Feature Requirements (Must Appear in the New Design)

Every feature below must be represented somewhere in the design. No feature can be removed — only repositioned or restyled.

| Feature | Must include |
|---------|-------------|
| Task list | Permanent list of open tasks, never auto-deletes |
| Task source badges | fathom / slack / manual visually distinct |
| Task age | "Xd ago" or similar timestamp on each task |
| Task popup | Click → modal with full detail, meeting link, notes, mark done |
| Task completion | Checkbox or button to mark done |
| Quick log input | Free-text, AI-powered multi-task extraction |
| Tools list | 28 tools, grouped by category, searchable |
| Tool drawer | Click tool → details + launch button |
| Outbound reminder | Daily HeyReach check-in with link |
| Repurpose checklist | 3 items, daily reset, green when all done |
| Post queue | LinkedIn posts with status + date |
| Website tasks | Website-scoped task list with blocking flag |
| Website quick log | Same AI log but scoped to website |

---

## Data Models (So the Design Knows What Fields Exist)

### Task
```
id, title, area (outbound/content/website/general),
source (fathom/slack/manual), status (open/done),
priority (blocking/normal/null), meetingId (fathom recording ID),
notes (context string), createdAt, updatedAt
```

### Post (LinkedIn queue)
```
id, title (first line / hook), content (full text),
platform (linkedin), status (draft/scheduled/published),
scheduledDate, notes, createdAt
```

### Tool
```
name, description, inputs, claudeSkillPath, category, lastRun
```

---

## Constraints

- **Web only** — no mobile breakpoint needed. Designed for a wide desktop browser (min 1280px wide).
- **Single user** — no auth UI, no multi-user states, no empty onboarding.
- **Always-on** — this is kept open all day. Design for low eye strain over long sessions.
- **Dark mode only** — no light mode toggle.
- **No external design system** — custom components, not Material/Ant/Chakra etc.
- **Tech stack**: Next.js 15 App Router, Tailwind CSS v4, TypeScript. The implementation will be done in code after design approval.

---

## Tone / Reference Words

Focused. Quiet. Intentional. Dense but breathable. A serious tool for a single operator.

References (feel only, not copy): Linear, Raycast, Vercel dashboard, Arc browser sidebar.

Anti-references: Notion (too generalist), Asana (too corporate), any SaaS with big colorful illustrations.

---

## What to Design

1. **Lo-fi wireframe first** — layout and component placement, no color. Resolve the layout problems before adding polish.
2. **Hi-fi mockup** — apply the color palette (evolve it if needed), typography, spacing, and interactions.
3. **Component states to show**: task with popup open, tools drawer open, quick log in AI-extraction mode, repurpose checklist half-done vs fully done, post queue with mixed statuses.

The output of the design process will be handed back to Claude Code for implementation as React/Tailwind components.
