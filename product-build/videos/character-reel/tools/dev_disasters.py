"""Write the 'Dev Disasters' series scripts (episodes ep02-ep11) for the Juno and Pixel engine.

Pattern: Juno panics about a developer disaster in 8 words or fewer, Pixel answers calmly,
lands one deadpan joke in an extreme close-up, teaches the true fix on two screen panels,
and closes on a callback. Run from the character-reel folder: python tools/dev_disasters.py
Each fix is general, accurate advice; "Claude" appears only as the name of a tool.
"""
import json
from pathlib import Path

CAST = {'juno': {'name': 'Juno', 'provider': 'elevenlabs', 'voice': 'FGY2WhTYpPnrIDTdsKH5', 'model': 'eleven_v3', 'speed': 1.0},
        'pixel': {'name': 'Pixel', 'provider': 'elevenlabs', 'voice': 'cjVigY5qzO86Huf0OWal', 'model': 'eleven_v3', 'speed': 1.0}}
CTA = "Follow for tomorrow's disaster."
HOOK = {'camera': 'crashZoomIn+handheld'}
JOKE = {'shot': 'pixelECU', 'eyes': 'slit', 'punch': True}
BORED = {'shot': 'pixelECU', 'eyes': 'bored', 'punch': True}
LAND = {'camera': 'pushSlow'}
END = {'pause': 1.6}

EP = {
    'ep02': ('The database is gone', [
        ('j', 'panicked', "Pixel, the whole database is gone!", HOOK),
        ('p', 'calm', "Breathe. When did you last back it up?", {'camera': 'static'}),
        ('j', 'worried', "Define back up.", {'say': "Define... back up?"}),
        ('p', 'deadpan', "Okay. Different breathing exercise.", JOKE),
        ('p', 'explaining', "Stop writing to it. Then check if your host keeps automatic backups or point-in-time restore. Many do.", {'screen': 'f1'}),
        ('j', 'skeptical', "And next time?", {}),
        ('p', 'explaining', "Never give an AI agent your production password. Give it a copy to break.", {'screen': 'f2'}),
        ('j', 'realizing', "So it deleted the real one because I let it.", LAND),
        ('p', 'warm', "It did exactly what it was allowed to. " + CTA, END)],
        [('f1', 'Right now', ['stop writes', 'restore a backup'], '#ff9f8e'), ('f2', 'Next time', ['agents get a copy', 'never production'], '#a8f0c6')]),
    'ep03': ('My API key is on GitHub', [
        ('j', 'panicked', "My API key is on GitHub. Publicly!", dict(HOOK, say="My A P I key is on GitHub. Publicly!")),
        ('p', 'calm', "Rotate it. Right now. Before anything else.", {'camera': 'static'}),
        ('j', 'skeptical', "Can't I just delete the file?", {}),
        ('p', 'deadpan', "Git remembers. And bots scan public repos fast.", JOKE),
        ('p', 'explaining', "Make a new key, revoke the old one, then check the usage page for anything you didn't do.", {'screen': 'f1'}),
        ('j', 'worried', "And next time?", {}),
        ('p', 'explaining', "Keys live in a dot env file that git ignores. Turn on secret scanning so GitHub warns you first.", {'screen': 'f2'}),
        ('j', 'realizing', "So deleting it was the least important step.", LAND),
        ('p', 'warm', "Rotating was the important one. " + CTA, END)],
        [('f1', 'Right now', ['new key', 'revoke the old one', 'check usage'], '#ff9f8e'), ('f2', 'Next time', ['.env + .gitignore', 'secret scanning on'], '#a8f0c6')]),
    'ep04': ('Claude keeps forgetting', [
        ('j', 'frustrated', "Claude keeps forgetting what we decided!", {'camera': 'crashZoomIn'}),
        ('p', 'calm', "It's not forgetting. Nobody wrote it down.", {'camera': 'static'}),
        ('j', 'skeptical', "It's an AI. It should just know.", {}),
        ('p', 'deadpan', "You also forget where you parked.", BORED),
        ('p', 'explaining', "Put your decisions in a CLAUDE.md file in the project. Claude Code reads it at the start of every session.",
         {'screen': 'f1', 'say': "Put your decisions in a Claude dot M D file in the project. Claude Code reads it at the start of every session."}),
        ('j', 'curious', "What goes in it?", {}),
        ('p', 'explaining', "The stack, the rules, what's done and what's next. Short and current.", {'screen': 'f2'}),
        ('j', 'realizing', "So the memory is a file I own.", LAND),
        ('p', 'warm', "Update it like a diary. " + CTA, END)],
        [('f1', 'CLAUDE.md', ['read every session', 'lives in your project'], '#ffe14d'), ('f2', 'What goes in', ['stack + rules', 'done + next'], '#a8f0c6')]),
    'ep05': ('Fixed one bug, broke three', [
        ('j', 'panicked', "It fixed one bug and broke three!", HOOK),
        ('p', 'calm', "Classic. Did you have tests?", {'camera': 'static'}),
        ('j', 'teasing', "I had vibes.", {}),
        ('p', 'deadpan', "Vibes don't fail loudly.", JOKE),
        ('p', 'explaining', "Before the fix, ask for a test that fails because of the bug. Then fix until that test passes.", {'screen': 'f1'}),
        ('j', 'curious', "And the other three?", {}),
        ('p', 'explaining', "Run every test after each change. If something old breaks, you see it in seconds, not on Monday.", {'screen': 'f2'}),
        ('j', 'realizing', "Tests are the receipts.", LAND),
        ('p', 'warm', "Keep the receipts. " + CTA, END)],
        [('f1', 'First', ['failing test', 'then the fix'], '#ffe14d'), ('f2', 'Every change', ['run all tests', 'catch it in seconds'], '#9dcbff')]),
    'ep06': ('It only works on my laptop', [
        ('j', 'panicked', "The app only works on my laptop!", {'camera': 'crashZoomIn'}),
        ('p', 'calm', "Then your laptop knows something the server doesn't.", {'camera': 'static'}),
        ('j', 'skeptical', "Like what?", {}),
        ('p', 'explaining', "Usually a secret or a setting. The server needs every environment variable you use locally.", {'screen': 'f1'}),
        ('j', 'worried', "How do I know which ones?", {}),
        ('p', 'explaining', "Keep an env example file with every name, no values. And commit your lockfile, so versions match.", {'screen': 'f2'}),
        ('j', 'realizing', "So the server was missing ingredients.", LAND),
        ('p', 'deadpan', "Same recipe, empty fridge.", JOKE),
        ('p', 'warm', CTA, END)],
        [('f1', 'The gap', ['env variables', 'on the server too'], '#ff9f8e'), ('f2', 'The fix', ['.env.example', 'commit the lockfile'], '#a8f0c6')]),
    'ep07': ('I approved every command', [
        ('j', 'shocked', "I approved every command without reading!", HOOK),
        ('p', 'calm', "You're not alone. Let's make it safer.", {'camera': 'static'}),
        ('j', 'worried', "Is my computer okay?", {}),
        ('p', 'deadpan', "Probably. Let's not rely on probably.", JOKE),
        ('p', 'explaining', "Set permission rules. Allow the safe ones, like running tests. Always ask before deleting, pushing or touching secrets.", {'screen': 'f1'}),
        ('j', 'skeptical', "Won't it ask me constantly?", {}),
        ('p', 'explaining', "Less than you think. And work on a branch, so any mistake stays small.", {'screen': 'f2'}),
        ('j', 'realizing', "Fewer prompts, but the scary ones still stop.", LAND),
        ('p', 'warm', "That's the deal. " + CTA, END)],
        [('f1', 'Allow', ['run tests', 'read files'], '#a8f0c6'), ('f2', 'Always ask', ['delete', 'push', 'secrets'], '#ff9f8e')]),
    'ep08': ('My site is down', [
        ('j', 'panicked', "My site is down. Everyone's messaging me!", HOOK),
        ('p', 'calm', "First, put it back. Then find out why.", {'camera': 'static'}),
        ('j', 'skeptical', "Put it back how?", {}),
        ('p', 'explaining', "Most hosts let you roll back to the last deploy that worked. One click, site's up.", {'screen': 'f1'}),
        ('j', 'relieved', "Okay. It's up.", {}),
        ('p', 'explaining', "Now read the failed deploy's logs. Fix it on a branch, preview it, then ship again.", {'screen': 'f2'}),
        ('j', 'realizing', "Restore first, investigate second.", LAND),
        ('p', 'deadpan', "Panic third, if there's time.", BORED),
        ('p', 'warm', CTA, END)],
        [('f1', '1. Restore', ['roll back', 'last good deploy'], '#a8f0c6'), ('f2', '2. Investigate', ['read the logs', 'fix, preview, ship'], '#9dcbff')]),
    'ep09': ('Claude rewrote everything overnight', [
        ('j', 'shocked', "Claude rewrote my whole codebase overnight!", HOOK),
        ('p', 'calm', "Was it on a branch?", {'camera': 'static'}),
        ('j', 'worried', "What's a branch?", {}),
        ('p', 'deadpan', "That explains the overnight part.", JOKE),
        ('p', 'explaining', "Before big changes, commit what works. Then let it work on a separate branch, so main stays safe.", {'screen': 'f1'}),
        ('j', 'skeptical', "And how do I check what it did?", {}),
        ('p', 'explaining', "Read the diff, file by file. Ask for small commits with clear messages, not one giant surprise.", {'screen': 'f2'}),
        ('j', 'realizing', "Small steps I can actually review.", LAND),
        ('p', 'warm', "And undo. " + CTA, END)],
        [('f1', 'Before', ['commit what works', 'new branch'], '#ffe14d'), ('f2', 'After', ['read the diff', 'small commits'], '#a8f0c6')]),
    'ep10': ('Six hours on one bug', [
        ('j', 'frustrated', "Six hours on one bug. Six!", HOOK),
        ('p', 'calm', "Let's make it smaller.", {'camera': 'static'}),
        ('j', 'skeptical', "The bug?", {}),
        ('p', 'deadpan', "The problem. The bug keeps its attitude.", BORED),
        ('p', 'explaining', "Cut it down to the smallest example that still breaks. Remove everything that doesn't matter.", {'screen': 'f1'}),
        ('j', 'curious', "Then what?", {}),
        ('p', 'explaining', "Log each step and check the real values. The bug lives where your guess and the log disagree.", {'screen': 'f2'}),
        ('j', 'realizing', "So I stop guessing and start measuring.", LAND),
        ('p', 'warm', "Best minutes you'll spend all day. " + CTA, END)],
        [('f1', 'Shrink it', ['smallest repro', 'remove the noise'], '#9dcbff'), ('f2', 'Measure it', ['log each step', 'guess vs log'], '#ffe14d')]),
    'ep11': ('My cloud bill', [
        ('j', 'shocked', "My cloud bill gave me a heart attack!", HOOK),
        ('p', 'calm', "Okay. First, find what's still running.", {'camera': 'static'}),
        ('j', 'worried', "But I deleted the project.", {}),
        ('p', 'deadpan', "Deleting the code doesn't delete the servers.", JOKE),
        ('p', 'explaining', "Open billing and sort by service. Shut down anything idle: servers, databases, old storage.", {'screen': 'f1'}),
        ('j', 'skeptical', "How do I stop this happening again?", {}),
        ('p', 'explaining', "Set a budget alert. Most clouds email you when spending passes a limit you choose.", {'screen': 'f2'}),
        ('j', 'realizing', "So the alarm comes before the bill.", LAND),
        ('p', 'warm', "Much healthier. " + CTA, END)],
        [('f1', 'Today', ['sort by service', 'shut idle things'], '#ff9f8e'), ('f2', 'From now', ['budget alert', 'email at your limit'], '#a8f0c6')]),
}


def main():
    for ep, (title, rows, panels) in EP.items():
        lines = []
        for i, (sp, emo, text, extra) in enumerate(rows, 1):
            extra = dict(extra)
            line = {'id': f'l{i:02d}', 'speaker': 'juno' if sp == 'j' else 'pixel', 'emotion': emo, 'text': text, 'pause': extra.pop('pause', 0.3)}
            line.update(extra)
            lines.append(line)
        script = {'title': title, 'cast': CAST, 'lines': lines,
                  'panels': [{'id': a, 'title': b, 'rows': c, 'color': d} for a, b, c, d in panels],
                  'endcard': {'kicker': 'JUNO & PIXEL · DEV DISASTERS', 'title': 'Follow for tomorrow', 'brand': 'PROMPTPACK.TECH'}}
        folder = Path('episodes') / ep
        folder.mkdir(parents=True, exist_ok=True)
        (folder / 'script.json').write_text(json.dumps(script, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
        words = sum(len(l['text'].split()) for l in lines)
        print(f"{ep} {title!r}: {len(lines)} lines, {words} words, hook {len(lines[0]['text'].split())} words")


if __name__ == '__main__':
    main()
