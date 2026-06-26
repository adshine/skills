# adshine skills

A collection of agent skills (Claude Code / Codex / any SKILL.md-compatible agent).
Each subdirectory is a self-contained skill: a `SKILL.md` plus any helper scripts.

## Skills

| Skill | What it does |
|-------|--------------|
| [ios-sim-session](ios-sim-session/) | Pin one coding session to one iOS Simulator + an isolated build, so concurrent Claude/Codex/Xcode sessions never clash on the device or DerivedData. |
| [nano-banana-skill](nano-banana-skill/) | AI image generation with Nano Banana Pro (Gemini 3 Pro Image), optimized for Expo / React Native. |

## Install

Install one skill into your agent's skills directory (e.g. Claude Code):

```bash
# whole collection
git clone https://github.com/adshine/skills.git ~/adshine-skills
ln -s ~/adshine-skills/ios-sim-session ~/.claude/skills/ios-sim-session

# or copy a single skill
cp -R ~/adshine-skills/ios-sim-session ~/.claude/skills/
```

Each skill's own `README.md` has its specific install + usage steps.

## Layout

```
skills/
  ios-sim-session/    SKILL.md, README.md, bin/
  nano-banana-skill/  SKILL.md, README.md, scripts/
```

Add a new skill by creating a new top-level directory with a `SKILL.md`.
