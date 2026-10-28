"""Build the complete UGC guide and its companion-file buyer archive."""
import hashlib
import io
import json
from pathlib import Path
import shutil
import sys
import zipfile
from html import escape

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'product-build/python'))
from pypdf import PdfReader, PdfWriter
from pypdf.annotations import Link
from PIL import Image
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

V2 = ROOT / 'product-build/editions-v2'
DEST = V2 / 'ugc-ad-scripts-complete'
OUTPUT = ROOT / 'output/pdf/UGC-Ad-Production-Complete-Guide.pdf'
PDFS = [V2 / 'ugc-ad-scripts/GUIDE.pdf',
        V2 / 'ugc-ad-scripts-2.1/cinematic/CINEMATIC-GUIDE.pdf',
        V2 / 'ugc-ai-ad-studio/GUIDE.pdf']
PARTS = [('Part I - UGC foundations', 14),
         ('Part II - Cinematic generation', 9),
         ('Part III - AI Ad Studio', 9),
         ('Part IV - Production examples', 6)]
CHAPTERS = [
    [('The demonstration brief', 1), ('Reference and style lock', 3),
     ('Hook and six scene boards', 5), ('Shot and presenter direction', 7),
     ('Review and claims', 9), ('Export and experiment', 11), ('First session', 13)],
    [('Generation versus filmed evidence', 1), ('Product and presenter sheets', 2),
     ('Location and blocking map', 3), ('Shared style and lighting', 4),
     ('Lens and camera framing', 5), ('Timed cut prompts', 6),
     ('Troubleshooting', 7), ('Notebook worked example', 8)],
    [('Decode a reference', 1), ('Lock identity sheets', 2), ('Stress-test the plan', 3),
     ('One timed prompt', 4), ('Review the take', 5), ('Film finish in code', 6),
     ('Sign-off', 7), ('Scripts and installation', 8)],
    [('Reference breakdown', 0), ('Product and presenter sheets', 1),
     ('Six-scene shot plan', 2), ('Directing the take', 3),
     ('Frame comparison', 4), ('Export and one-variable test', 5)]
]


def front_matter():
    stream = io.BytesIO()
    c = canvas.Canvas(stream, pagesize=A4)
    w, h = A4
    ink, green, paper = map(HexColor, ['#111a15', '#174e3c', '#fffbf2'])

    def page():
        c.setFillColor(paper)
        c.rect(0, 0, w, h, fill=1, stroke=0)
        c.setFillColor(green)
        c.setFont('Helvetica-Bold', 9)
        c.drawString(44, h - 45, 'PROMPTPACK / COMPLETE EDITION 2.3')
        c.setFillColor(ink)

    page()
    c.setFont('Helvetica-Bold', 51)
    for text, y in [('UGC Ad', 716), ('Production Guide', 658)]:
        c.drawString(42, y, text)
    c.setFont('Helvetica', 15)
    c.drawString(44, 620, 'Brief. Character. Light. Frame. Finish.')
    cover_image = io.BytesIO()
    with Image.open(ROOT / 'assets/ugc-course/workflow-03.webp') as image:
        image.convert('RGB').save(cover_image, format='JPEG', quality=90, optimize=True)
    cover_image.seek(0)
    c.drawImage(ImageReader(cover_image),
                44, 234, width=w - 88, height=(w - 88) * 2 / 3)
    c.setFont('Helvetica', 8)
    c.drawString(44, 218, 'Original cinematic concept boards / notebook demonstration example')
    c.setFillColor(green)
    c.rect(44, 136, w - 88, 56, fill=1, stroke=0)
    c.setFillColor(HexColor('#ffffff'))
    c.setFont('Helvetica-Bold', 15)
    c.drawString(61, 169, '40 pages / 22 editable prompts / 4 connected parts')
    c.setFont('Helvetica', 10)
    c.drawString(61, 150, 'Includes character sheets, lighting, shot prompts and film finishing.')
    c.setFillColor(ink)
    c.setFont('Helvetica', 9)
    c.drawString(44, 99, 'One guide. Companion templates, worksheets and scripts stay editable in the ZIP.')
    c.drawString(44, 82, 'Use your own AI tools and editor. Accounts and generation credits are separate.')
    c.setFont('Helvetica-Bold', 8)
    c.drawString(44, 44, 'UGC AD SCRIPT KIT / COMPILED 25 OCT 2026')
    c.showPage()

    page()
    c.setFont('Helvetica-Bold', 35)
    c.drawString(44, 744, 'Find your next step.')
    c.setFont('Helvetica', 10)
    c.drawString(44, 718, 'Select a section below, or use the PDF bookmarks to jump to a chapter.')
    links, start = [], 2
    descriptions = [
        ['Brief, evidence, six boards, script, review and a controlled test.',
         'Begin here when you are turning a product into an ad plan.'],
        ['Character and product sheets, blocking, lens, light and cut prompts.',
         'Use this part when your plan is ready for image and video generation.'],
        ['Reference decode, stress test, timed prompt, take review and film finish.',
         'Use the seven-stage method to repeat the production process.'],
        ['Six original cinematic previews of the working material at each stage.',
         'Study the examples, then adapt the prompts to your own approved product.']]
    y = 664
    for index, ((title, count), lines) in enumerate(zip(PARTS, descriptions)):
        c.setFillColor(green)
        c.rect(44, y - 29, w - 88, 36, fill=1, stroke=0)
        c.setFillColor(HexColor('#ffffff'))
        c.setFont('Helvetica-Bold', 14)
        c.drawString(56, y - 16, title)
        c.setFont('Helvetica-Bold', 10)
        c.drawRightString(w - 57, y - 15, f'{start + 1}-{start + count}')
        links.append(((44, y - 29, w - 44, y + 7), start))
        c.setFillColor(ink)
        c.setFont('Helvetica', 10)
        for row, line in enumerate(lines):
            c.drawString(52, y - 52 - row * 17, line)
        c.setFont('Helvetica', 8.5)
        chapter_line = ' / '.join(t for t, _ in CHAPTERS[index][:3])
        c.drawString(52, y - 93, chapter_line)
        y -= 110
        start += count
    c.setStrokeColor(green)
    c.line(44, 214, w - 44, 214)
    c.setFont('Helvetica-Bold', 12)
    c.drawString(44, 191, 'Using the companion files')
    c.setFont('Helvetica', 9)
    for line, yy in [
        ('PROMPTS.md contains prompts 01-14; cinematic/ adds prompts 15-22.', 169),
        ('ugc-ai-ad-studio/ holds the skill, stage references, templates and two scripts.', 152),
        ('Read START-HERE.md in the ZIP for file paths and the first production session.', 135),
        ('Original page artwork and dates are preserved. Printed numbering restarts in each part.', 101),
        ('The contents ranges and PDF bookmarks use the complete guide page positions.', 84),
        ('This is a written production guide, not a recorded course or generator service.', 54)]:
        c.drawString(44, yy, line)
    c.save()
    stream.seek(0)
    return stream, links


def example_pages():
    stream = io.BytesIO()
    c = canvas.Canvas(stream, pagesize=A4)
    w, h = A4
    examples = [
        ('Reference breakdown', 'Brief and evidence / Parts I and III',
         'Study framing, light direction and the observable action in each reference. The blank analysis area represents the notes you must make; it is not a claim that this image proves a product feature.',
         'For each inspected shot, record FRAME, LIGHT and ACTION. Separate what you can observe from what still needs product evidence.'),
        ('Product and presenter sheets', 'Identity lock / Part II chapter 08 and Part III stage 02',
         'Use front, back and face views to keep one presenter consistent, and clean product views to keep shape and colour stable. This presenter is an original generated character.',
         'Create one consistent original presenter in front, back and face views, with one wardrobe and neutral background. Add clean product views from approved real-product references.'),
        ('Six-scene shot plan', 'Hook, body and close / Part I chapter 03',
         'The sequence moves from loose notes to a visible page-marking action, a product detail and a sample-page close. Shot order, timing and the opening promise must agree.',
         'Plan six scene jobs: situation, question, demonstration, detail, qualification and next action. Keep the product, light and camera axis consistent.'),
        ('Directing the take', 'Camera and action / Part I chapter 04 and Part III stage 05',
         'A contact sheet helps you compare presenter framing, hand action, detail coverage and the recording setup. It illustrates direction; it is not footage from a recorded product test.',
         'For each shot specify the subject, starting state, one action, camera position, light source and end state. Rehearse the real demonstration before recording.'),
        ('Frame comparison', 'Review and finishing / Part III stage 06',
         'This generated comparison illustrates a neutral and a warmer visual treatment. It is a concept, not a measured before/after from the finishing script. In production, compare the same real frame and preserve the product colour.',
         'Match exposure and white balance first. Apply one subtle finish to the assembled edit, then compare the same frame with and without warmth, bloom and grain.'),
        ('Export and one-variable test', 'Handoff and experiment / Part I chapter 06',
         'Keep the approved body and destination constant while testing one opening change. The blank results table is intentional: no winning version or performance result has been invented.',
         'Package the approved script, shot list, references and rights records. Name one test variable and hypothesis; leave observed outcomes blank until real data exists.')
    ]
    style = ParagraphStyle('body', fontName='Helvetica', fontSize=10, leading=15,
                           textColor=HexColor('#17251f'))
    for i, (title, reference, body, prompt) in enumerate(examples, 1):
        c.setFillColor(HexColor('#fffbf2'))
        c.rect(0, 0, w, h, fill=1, stroke=0)
        c.setFillColor(HexColor('#174e3c'))
        c.setFont('Helvetica-Bold', 9)
        c.drawString(44, h - 45, f'PART IV / PRODUCTION EXAMPLE {i:02d}')
        c.setFillColor(HexColor('#111a15'))
        c.setFont('Helvetica-Bold', 27)
        c.drawString(44, h - 85, title)
        c.setFont('Helvetica', 9)
        c.drawString(44, h - 108, reference)
        picture = io.BytesIO()
        with Image.open(ROOT / f'assets/ugc-course/workflow-{i:02d}.webp') as image:
            image.convert('RGB').save(picture, format='JPEG', quality=80, optimize=True)
        picture.seek(0)
        c.drawImage(ImageReader(picture), 44, 345, width=w - 88, height=(w - 88) * 2 / 3)
        y = 322
        for heading, text in [('WHAT TO NOTICE', body), ('PROMPT FRAMEWORK', prompt)]:
            c.setFillColor(HexColor('#174e3c'))
            c.setFont('Helvetica-Bold', 9)
            c.drawString(44, y, heading)
            paragraph = Paragraph(escape(text), style)
            _, ph = paragraph.wrap(w - 88, 200)
            paragraph.drawOn(c, 44, y - 15 - ph)
            y -= ph + 46
        assert y > 55, (title, y)
        c.setFillColor(HexColor('#17251f'))
        c.setFont('Helvetica', 8)
        c.drawString(44, 40, 'Original generated concept / full illustration prompts: cinematic-preview-examples/IMAGE-PROMPTS.md')
        c.showPage()
    c.save()
    stream.seek(0)
    return stream


def build_pdf():
    DEST.mkdir(parents=True, exist_ok=True)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    front, links = front_matter()
    writer = PdfWriter()
    writer.append(PdfReader(front), import_outline=False)
    writer.add_outline_item('Contents', 1)
    start = 2
    sources = [*PDFS, example_pages()]
    for source, (title, count), chapters in zip(sources, PARTS, CHAPTERS):
        reader = PdfReader(source)
        assert len(reader.pages) == count, source
        writer.append(reader, import_outline=False)
        parent = writer.add_outline_item(title, start)
        for label, offset in chapters:
            writer.add_outline_item(label, start + offset, parent=parent)
        start += count
    for rect, target in links:
        writer.add_annotation(1, Link(rect=rect, target_page_index=target))
    writer.add_metadata({'/Title': 'UGC Ad Production Guide - Complete Edition 2.3',
                         '/Author': 'PromptPack', '/Subject': 'UGC scripts, character sheets, lighting, cinematic prompts and film finishing'})
    for p in writer.pages:
        p.compress_content_streams()
    writer.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
    writer.write(OUTPUT)
    verify = PdfReader(OUTPUT)
    assert len(verify.pages) == 40
    assert len(verify.pages[1]['/Annots']) == 4
    text = '\n'.join(p.extract_text() or '' for p in verify.pages).lower()
    for phrase in ['presenter sheet', 'lighting', 'timed prompt', 'bloom', 'stress test']:
        assert phrase in text, phrase
    assert len(verify.outline) >= 4
    shutil.copy2(OUTPUT, DEST / 'GUIDE.pdf')


def build_archive():
    with zipfile.ZipFile(V2 / 'ugc-ad-scripts-2.1.zip') as source:
        files = {i.filename: source.read(i) for i in source.infolist()
                 if not i.is_dir() and not i.filename.lower().endswith('.pdf')}
    prefix = 'ugc-ad-scripts/'
    studio = V2 / 'ugc-ai-ad-studio'
    for f in sorted(studio.rglob('*')):
        if f.is_file() and '__pycache__' not in f.parts and f.suffix.lower() != '.pdf':
            files[prefix + 'ugc-ai-ad-studio/' + f.relative_to(studio).as_posix()] = f.read_bytes()
    files[prefix + 'GUIDE.pdf'] = OUTPUT.read_bytes()
    start = '''# UGC Ad Script Kit - Complete Edition 2.3

Open GUIDE.pdf: one 40-page guide containing all four parts.

1. Part I, pages 3-16: brief, evidence, script, six boards, review and export.
2. Part II, pages 17-25: product/presenter reference sheets, blocking, lens,
   lighting, action timing and cinematic cut prompts.
3. Part III, pages 26-34: decode, sheets, stress test, one timed prompt,
   take review, film finishing and sign-off. Use the PDF bookmarks to navigate.
4. Part IV, pages 35-40: six cinematic production examples with prompt frameworks.

## Editable practical files

- PROMPTS.md: prompts 01-14; cinematic/PROMPTS-15-22.md: prompts 15-22.
- cinematic/: style header, cut template, shot lists and notebook worked example.
- ugc-ai-ad-studio/: installable skill, stage references, blank templates,
  timed-prompt checker, film-finish script and a fictional coffee-set worked example.
- worksheets/, showcase/, starter/: the original blank/filled worksheets,
  notebook boards, script and optional local storyboard utility.

To install the skill, read ugc-ai-ad-studio/START-HERE.md. To use it without
installing, read its SKILL.md and follow the stage references in order.
Python 3.9+ is needed for its scripts; film_finish.py also needs ffmpeg.
Use your own image/video tools, accounts and credits. The ZIP includes written
guides, templates and code, not a recorded course, finished ad or generator service.
'''
    files[prefix + 'START-HERE.md'] = start.encode()
    manifest = json.loads((ROOT / 'docs/ugc-workflow-image-prompts.json').read_text())
    prompt_text = '# Cinematic preview illustration prompts\n\nOriginal built-in imagegen concepts. These are illustration prompts, separate from the 22 production prompts.\n\n'
    prompt_text += '\n\n'.join(f'## {a["step"]:02d}. {a["title"]}\n\n{a["prompt"]}' for a in manifest['assets'])
    files[prefix + 'cinematic-preview-examples/IMAGE-PROMPTS.md'] = prompt_text.encode()
    files[prefix + 'CHANGELOG.md'] = (
        '# Complete Edition 2.3 / 2026-10-25\n\n'
        'Combines the 14-page UGC guide, 9-page cinematic module and 9-page AI Ad Studio '
        'guide and six cinematic example pages into GUIDE.pdf, with a cover, linked contents and chapter bookmarks. '
        'Includes all 22 prompts and all companion worksheets, templates and skill scripts.\n\n'
    ).encode() + files[prefix + 'CHANGELOG.md']
    for name, data in list(files.items()):
        if name.endswith(('.md', '.txt')) and name != prefix + 'START-HERE.md':
            text = data.decode('utf-8')
            if '/ugc-ai-ad-studio/' in name:
                text = text.replace('GUIDE.pdf', '../GUIDE.pdf (Part III)')
            else:
                text = text.replace('cinematic/CINEMATIC-GUIDE.pdf', 'GUIDE.pdf (Part II)')
            files[name] = text.encode()
    for name, data in files.items():
        target = DEST / name.removeprefix(prefix)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    archive = V2 / 'ugc-ad-scripts-complete.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as out:
        for name, data in sorted(files.items()):
            out.writestr(name, data)
    with zipfile.ZipFile(archive) as check:
        assert check.testzip() is None
        assert [n for n in check.namelist() if n.endswith('.pdf')] == [prefix + 'GUIDE.pdf']
        assert prefix + 'ugc-ai-ad-studio/scripts/check_timed_prompt.py' in check.namelist()
        assert prefix + 'cinematic/PROMPTS-15-22.md' in check.namelist()
    data = archive.read_bytes()
    assert len(data) < 4_000_000, f'Archive exceeds delivery cap: {len(data)}'
    report = {'pdf': str(OUTPUT), 'pages': 40, 'prompts': 22, 'archive': str(archive),
              'archive_bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
              'edition': '2.3', 'files': len(files)}
    (DEST / 'BUILD-RECEIPT.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    build_pdf()
    build_archive()
