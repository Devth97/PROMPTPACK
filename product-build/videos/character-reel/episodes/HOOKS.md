# Juno and Pixel: 30 episode hooks (draft, awaiting the user's OK)

Pattern (from public view counts on developer-disaster reels: disasters far outperform tutorials):
Juno panics about a developer disaster in 8 words or fewer, Pixel calmly fixes it in plain steps,
then the CTA "Comment PIXEL". About 100 words per script. All wording is original.
"Claude" appears only as the name of the tool, never as a character.

| # | Juno's hook (panic) | Pixel's fix |
|---|---|---|
| 01 | Pixel, the whole database is gone. | Restore from backup; never hand an AI agent production credentials |
| 02 | My API key is on GitHub. Publicly. | Rotate the key first, then clean history and turn on secret scanning |
| 03 | Claude keeps forgetting what we decided. | Write decisions into a CLAUDE.md file it reads every session |
| 04 | It fixed one bug and broke three. | Have it write a failing test before it touches the fix |
| 05 | The app only works on my laptop. | Environment variables, an .env.example and a lockfile |
| 06 | I approved every command without reading. | Permission rules: allow safe commands, always ask for risky ones |
| 07 | My site is down. Everyone's messaging me. | Read the deploy log, roll back to the last good deploy, then debug |
| 08 | Claude rewrote my whole codebase overnight. | Branches, small commits and reviewing every diff |
| 09 | Six hours on one bug. Six! | Shrink it to a minimal reproduction and add logging |
| 10 | My cloud bill just gave me a heart attack. | Budget alerts and shutting down idle resources |
| 11 | I don't understand a single line it wrote. | Ask it to walk you through the code before you accept it |
| 12 | Tests pass. Nothing actually works. | Tests that assert nothing; check assertions and run the app |
| 13 | I pushed straight to main. Oops. | `git revert` and branch protection |
| 14 | My prompt is three pages long. | One task per prompt, with the goal and the done-check |
| 15 | It installed a package that doesn't exist. | Verify every dependency; invented names can be typosquats |
| 16 | Users can see each other's data! | Server-side authorization checks on every request |
| 17 | My laptop died. Did I push? | Push often; your remote is your backup |
| 18 | Out of context, halfway through the feature. | Save the plan to a file, start a fresh session from it |
| 19 | Every file has a different code style. | A style rules file plus a formatter that runs automatically |
| 20 | The login page lets anyone in. | Test the failure paths; never trust the browser |
| 21 | It deleted the wrong folder. Everything. | Deny rules for destructive commands and working in a sandbox |
| 22 | My site takes ten seconds to load. | Measure first; oversized images are the usual culprit |
| 23 | A thousand fake signups since breakfast. | Rate limits and server-side bot checks |
| 24 | I pasted customer emails into a chatbot. | Redact personal data before it goes in any prompt |
| 25 | Forty tabs of docs and still lost. | Point the assistant at the one exact docs page |
| 26 | It agrees with everything I say. | Ask it to argue against your plan before building |
| 27 | Worked yesterday. Nothing changed. Broken today. | Something changed: dependencies, environment or data. Diff them |
| 28 | I can't undo what it just did. | Commit or checkpoint before every big change |
| 29 | It's live but Google can't find it. | The leftover "noindex" tag and a missing sitemap |
| 30 | Pixel, where do I even start? | A one-page plan, a CLAUDE.md and your first small commit |
