"""Build original illustrated guide editions, examples and buyer archives locally.

Dependencies live in product-build/python; paid files never go in the public site.
Run from the repository root after research-product-sources.py.
"""
import csv
import hashlib
import importlib.util
import io
import json
import re
import shutil
import subprocess
import sys
from html import escape
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'product-build' / 'python'))
from PIL import Image, ImageDraw, ImageFont, ImageOps
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image as RLImage, KeepTogether
import pymupdf as fitz

spec = importlib.util.spec_from_file_location('edition_content', ROOT/'private/catalog/edition_content.py')
content = importlib.util.module_from_spec(spec); spec.loader.exec_module(content)
PRODUCTS = json.loads((ROOT/'catalog/products.json').read_text(encoding='utf-8'))
SOURCES = {s['id']:s for s in json.loads((ROOT/'catalog/sources.json').read_text(encoding='utf-8'))}
DEST = ROOT/'product-build/editions'
PUBLIC = ROOT/'assets/product-previews'
COVERS = ROOT/'assets/product-covers'
STARTERS = ROOT/'private/catalog/starters'
INK='#0B0B0F'; CREAM='#FFFBF2'
PALETTE={'Websites':'#9DCBFF','Social content':'#F598F2','Automation':'#F598F2','Video':'#FF9F8E','Design':'#FFE14D','Finance':'#A8F0C6'}
DATE='17 October 2026'
STYLES={
 'eyebrow':ParagraphStyle('eyebrow',fontName='Helvetica-Bold',fontSize=8,leading=12,textColor=colors.HexColor(INK),spaceAfter=12),
 'h1':ParagraphStyle('h1',fontName='Helvetica-Bold',fontSize=29,leading=31,spaceAfter=20,textColor=colors.HexColor(INK)),
 'h2':ParagraphStyle('h2',fontName='Helvetica-Bold',fontSize=17,leading=21,spaceBefore=13,spaceAfter=9,textColor=colors.HexColor(INK)),
 'body':ParagraphStyle('body',fontName='Helvetica',fontSize=10.4,leading=15.4,spaceAfter=10,textColor=colors.HexColor('#34343D')),
 'small':ParagraphStyle('small',fontName='Helvetica',fontSize=8.3,leading=12,spaceAfter=7,textColor=colors.HexColor('#4B4B55'),splitLongWords=True),
 'prompt':ParagraphStyle('prompt',fontName='Helvetica',fontSize=10,leading=14.7,spaceAfter=14,textColor=colors.HexColor(INK),borderWidth=1,borderColor=colors.HexColor(INK),borderPadding=14,backColor=colors.white),
}

def write(path,text):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(text,encoding='utf-8')

def p(text,style='body'):
    return Paragraph(escape(str(text)).replace('\n','<br/>'),STYLES[style])

def face(size,bold=False):
    for name in ['arialbd.ttf' if bold else 'arial.ttf','DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf']:
        try:return ImageFont.truetype(name,size)
        except OSError:pass
    return ImageFont.load_default(size=size)

def wrapped(text,font,width,draw):
    lines=[];line=''
    for word in text.split():
        candidate=(line+' '+word).strip()
        if draw.textlength(candidate,font=font)>width:
            if line:lines.append(line)
            line=word
        else:line=candidate
    if line:lines.append(line)
    return lines

def cover(slug,name,category,index,preview=None):
    visual_manifest=ROOT/'catalog/visual-assets.json'
    if visual_manifest.exists() and any(asset['slug']==slug for asset in json.loads(visual_manifest.read_text(encoding='utf-8'))['assets']):
        approved=COVERS/(slug+'.webp')
        if not approved.exists():raise FileNotFoundError('Missing approved imagegen cover: '+str(approved))
        return approved
    image=Image.new('RGB',(1200,800),PALETTE.get(category,'#A8F0C6'));d=ImageDraw.Draw(image)
    for x in range(20,1200,30):
        for y in range(20,800,30):d.ellipse((x,y,x+2,y+2),fill='#0B0B0F20')
    d.rectangle((38,38,1160,760),fill=CREAM,outline=INK,width=5)
    d.rectangle((38,38,1160,126),fill=PALETTE.get(category,'#A8F0C6'),outline=INK,width=5)
    d.text((75,65),'PROMPTPACK / ORIGINAL TOOLKITS',font=face(28,True),fill=INK)
    d.text((1040,62),f'{index:02d}',font=face(36,True),fill=INK)
    y=173
    title=wrapped(name.upper(),face(88,True),1000,d)
    if len(title)>3:title=wrapped(name.upper(),face(75,True),1000,d)
    title_font=face(75 if len(wrapped(name.upper(),face(88,True),1000,d))>3 else 88,True)
    for line in title:d.text((75,y),line,font=title_font,fill=INK);y+=98
    y=max(y+15,440)
    d.rectangle((75,y,520,y+48),fill=PALETTE.get(category,'#A8F0C6'),outline=INK,width=2)
    kind='PROMPT LIBRARY' if slug=='website-prompts' else 'PDF TOOLKIT' if slug=='money-audit' else 'FIELD GUIDE'
    d.text((91,y+12),category.upper()+' / '+kind,font=face(21,True),fill=INK)
    line='75+ MARKDOWN PROMPTS / MOTION REFERENCES' if slug=='website-prompts' else '29-PAGE PDF / AUDIT PROMPTS' if slug=='money-audit' else 'GUIDE / PROMPTS / PRACTICAL FILES'
    d.text((75,675),line,font=face(21,True),fill=INK)
    if preview:
        sample=Image.open(preview).convert('RGB');sample.thumbnail((490,205))
        sx=1110-sample.width;sy=710-sample.height
        d.rectangle((sx-9,sy-9,sx+sample.width+9,sy+sample.height+9),fill='white',outline=INK,width=3)
        image.paste(sample,(sx,sy))
    COVERS.mkdir(parents=True,exist_ok=True)
    image.save(COVERS/(slug+'.webp'),quality=90)
    return COVERS/(slug+'.webp')

def run_python(script,*args,cwd):
    code="import runpy,sys;sys.path.insert(0,"+repr(str(ROOT/'product-build/python'))+");sys.argv="+repr([str(script),*map(str,args)])+";runpy.run_path("+repr(str(script))+",run_name='__main__')"
    result=subprocess.run([sys.executable,'-c',code],cwd=cwd,capture_output=True,text=True,check=True)
    return result.stdout.strip()

def make_starter(product,edition,folder):
    slug=product['slug'];starter=folder/'starter';starter.mkdir(parents=True,exist_ok=True)
    def save(name,value):write(starter/name,json.dumps(value,indent=2)+'\n')
    if slug=='carousel-studio':
        shutil.copy2(STARTERS/'carousel-render.py',starter/'render.py')
        save('slides.json',[{'title':r[2],'body':r[3],'accent':['#F598F2','#A8F0C6','#9DCBFF','#FFE14D'][i%4]} for i,r in enumerate(edition['rows'])])
        run_python(starter/'render.py','slides.json','output',cwd=starter)
        preview=starter/'output/contact-sheet.jpg'
    elif slug=='carousel-workflows':
        shutil.copy2(STARTERS/'validate-queue.mjs',starter/'validate-queue.mjs')
        save('queue.json',[dict(zip(edition['columns'],row)) for row in edition['rows']])
        output=subprocess.run(['node','validate-queue.mjs','queue.json','--now','2026-02-01T00:00:00Z'],cwd=starter,capture_output=True,text=True,check=True).stdout
        write(starter/'example-report.json',output)
        preview=None
    elif slug=='3d-website-lab':
        shutil.copy2(STARTERS/'three-index.html',starter/'index.html')
        write(starter/'DEPENDENCIES.md','Three.js 0.186.1 is loaded separately from jsDelivr by the import map.\nSource: https://github.com/mrdoob/three.js\nLicense: MIT. No upstream library code is included in this ZIP.\n')
        preview=None
    elif slug=='pixel-brand-kit':
        shutil.copy2(STARTERS/'make-sprites.py',starter/'make-sprites.py')
        save('palette.json',{'ink':INK,'body':'#A8F0C6','accent':'#F598F2'})
        run_python(starter/'make-sprites.py',cwd=starter)
        preview=starter/'output/preview.png'
    elif slug=='youtube-production':
        shutil.copy2(STARTERS/'check-episode.mjs',starter/'check-episode.mjs')
        save('episodes.json',[{'id':'desk-001','title':'Plan one desk reset','source_ledger':'sources.csv','video_file':'not-yet-rendered.mp4','channel':'FICTIONAL DEMO','script_approved':True,'rights_checked':True,'captions_reviewed':False,'thumbnail_reviewed':False,'export_reviewed':False,'upload_approved':False}])
        output=subprocess.run(['node','check-episode.mjs','episodes.json'],cwd=starter,capture_output=True,text=True,check=True).stdout
        write(starter/'example-report.json',output);preview=None
    elif slug in ['motion-with-code','lyric-visuals']:
        project=ROOT/'product-build/videos'/slug
        if not (project/'index.html').exists():
            raise RuntimeError('Verified motion project not ready: '+slug)
        # The motion worker owns the source project. Copy only deliverable inputs.
        for name in ['index.html','package.json','hyperframes.json','README.md','BRIEF.md','shot-plan.json']:
            if (project/name).exists():shutil.copy2(project/name,starter/name)
        for name in ['THIRD-PARTY-NOTICES.md','LICENSES.md','cues.json','timing.json']:
            if (project/name).exists():shutil.copy2(project/name,starter/name)
        for subdir in ['compositions','assets','licenses']:
            if (project/subdir).exists():shutil.copytree(project/subdir,starter/subdir,dirs_exist_ok=True)
        if not (PUBLIC/(slug+'.mp4')).exists():raise RuntimeError('Verified video output not ready: '+slug)
        shutil.copy2(PUBLIC/(slug+'.mp4'),folder/'example.mp4')
        preview=next((f for f in [PUBLIC/(slug+'.jpg'),PUBLIC/(slug+'.png'),PUBLIC/(slug+'-poster.jpg'),PUBLIC/(slug+'-poster.png')] if f.exists()),None)
        if slug=='lyric-visuals' and not (starter/'cues.json').exists():save('cues.json',[{'id':r[0],'start':float(r[1]),'end':float(r[2]),'text':r[3]} for r in edition['rows']])
    else:
        shutil.copy2(STARTERS/'storyboard.py',starter/'storyboard.py')
        if slug=='ugc-ad-scripts':
            filename='script.json';scenes=[('S01','0-4','One small plan','Show an original notebook and introduce one task.'),('S02','4-10','Make the next step visible','Write one task on the blank demonstration page.'),('S03','10-16','Keep the facts on screen','Show the dot-grid insert without a performance claim.'),('S04','16-20','Choose your own next step','Close with the notebook and one factual action.')];kind='notebook'
        elif slug=='short-explainer-studio':
            filename='explainer.json';scenes=[(r[0],r[1],r[2],r[3]) for r in edition['rows']];kind='switches'
        else:
            filename='shots.json';scenes=[('A01','0-4','Establish the shape','Locked product silhouette, soft light from camera left.'),('A02','4-8','Show one detail','One camera move. Keep shape, color and product count fixed.'),('A03','8-11','Hold the end frame','Clean still composition with room for an edit title.')];kind='bottle'
        save(filename,[{'id':s[0],'time':s[1],'title':s[2],'description':s[3],'kind':kind} for s in scenes])
        run_python(starter/'storyboard.py',filename,'output',cwd=starter);preview=starter/'output/storyboard.jpg'
    readme='# '+product['name']+' / Original starter\n\n'+edition['outcome']+'\n\n## First run\n\n'+''.join(f'{i+1}. {s}\n' for i,s in enumerate(edition['first_run']))+'\n## Scope\n\n'+edition['limits']+'\n\nThe exercises and copy are original PromptPack examples. Referenced tools remain available from their authors. The motion starters include local runtime JavaScript and adapted registry markup with the accompanying notices and license files. No credentials or model weights are bundled.\n'
    # Preserve project-specific commands, without appending a prior generated README.
    if slug in ['motion-with-code','lyric-visuals'] and (ROOT/'product-build/videos'/slug/'README.md').exists():
        readme+='\n## Project-specific commands\n\n'+(ROOT/'product-build/videos'/slug/'README.md').read_text(encoding='utf-8')
    write(starter/'README.md',readme)
    return preview

def render_example_card(product,edition,folder):
    image=Image.new('RGB',(1200,800),CREAM);d=ImageDraw.Draw(image);accent=PALETTE[product['category']]
    d.rectangle((30,30,1170,770),fill='white',outline=INK,width=4)
    d.rectangle((30,30,1170,120),fill=accent,outline=INK,width=4)
    d.text((65,58),'ORIGINAL EXAMPLE / '+product['name'].upper(),font=face(25,True),fill=INK)
    yy=170
    for line in wrapped(edition['subtitle'],face(43,True),1060,d):d.text((65,yy),line,font=face(43,True),fill=INK);yy+=55
    yy+=35
    for i,row in enumerate(edition['rows'][:4]):
        text=' / '.join(str(v) for v in row[:3])
        lines=wrapped(text,face(24),1020,d)
        for line in lines[:2]:d.text((85,yy),line,font=face(24),fill=INK);yy+=34
        yy+=22
    d.text((65,715),'WORKED EXAMPLE / NOT A LIVE ACCOUNT OR CUSTOMER RESULT',font=face(18,True),fill=INK)
    output=folder/'example.jpg';image.save(output,quality=94);return output

def banner(canvas,doc,product,accent):
    w,h=doc.pagesize;canvas.saveState();canvas.setFillColor(colors.HexColor(CREAM));canvas.rect(0,0,w,h,fill=1,stroke=0)
    canvas.setFillColor(colors.HexColor(accent));canvas.rect(0,h-38,w,38,fill=1,stroke=0)
    canvas.setFillColor(colors.HexColor(INK));canvas.setFont('Helvetica-Bold',8);canvas.drawString(42,h-24,'PROMPTPACK / ORIGINAL FIELD GUIDES')
    canvas.setStrokeColor(colors.HexColor(INK));canvas.line(42,36,w-42,36)
    canvas.setFont('Helvetica',7);canvas.drawString(42,23,product['name']+' / Edition 1.1 / '+DATE);canvas.drawRightString(w-42,23,str(doc.page));canvas.restoreState()

def build_pdf(product,edition,prompts,folder,cover_path,example_path):
    pdf=folder/'GUIDE.pdf';story=[]
    doc=SimpleDocTemplate(str(pdf),pagesize=(595.28,841.89),rightMargin=44,leftMargin=44,topMargin=67,bottomMargin=57,title=product['name']+' | PromptPack',author='PromptPack',pageCompression=1)
    story += [p(product['category'].upper()+' / EDITION 1.1','eyebrow'),p(product['name'],'h1'),p(edition['subtitle'],'h2'),Spacer(1,15),p(edition['outcome']),Spacer(1,14),RLImage(str(cover_path),width=507,height=338),Spacer(1,12),p('Original guide, prompts and editable practical files. Tool source snapshots checked '+DATE+'.','small'),PageBreak()]
    story += [p('START HERE','eyebrow'),p('A first result you can inspect.','h1'),p('What you will make','h2'),p(edition['outcome']),p('First session','h2')]
    story += [p(f'{i+1}. {step}') for i,step in enumerate(edition['first_run'])]
    story += [p('Know the boundary','h2'),p(edition['limits']),p('How this guide is organized','h2'),p('Work through the six workshop steps, inspect the original example, then use the prompt library for your own project. WORKSHEET.csv is blank; WORKED-EXAMPLE.csv shows a filled version. START-HERE.md lists every included file. The source register links directly to the upstream repositories.'),PageBreak()]
    for start in range(0,6,2):
        story += [p('WORKSHOP / '+str(start//2+1).zfill(2),'eyebrow'),p(['Define the work.','Make a first version.','Review the handoff.'][start//2],'h1')]
        for i in range(start,start+2):
            title,action,reason,check=edition['lessons'][i]
            story += [p(f'{i+1:02d}. {title}','h2'),p(action),p('Why this step matters: '+reason),p('CHECK / '+check,'small'),Spacer(1,14)]
        story += [PageBreak()]
    story += [p('WORKED EXAMPLE','eyebrow'),p('Start with something concrete.','h1'),p(edition['case'])]
    img=Image.open(example_path);width=507;height=min(300,507*img.height/img.width)
    story += [RLImage(str(example_path),width=width,height=height,kind='proportional'),Spacer(1,15),p('Your turn','h2'),p('Duplicate the starter and keep the original example unchanged. Replace one subject, message or palette choice, run the same local check and write down what changed. Keep observed results separate from a desired outcome. When a real account, recording or model is needed, complete that stage with your own authorized inputs.'),PageBreak()]
    story += [p('USE THE PROMPT LIBRARY','eyebrow'),p('Brief it. Then review it.','h1'),p('Replace bracketed fields with specific inputs. Supply source material and the file or tool the prompt should operate on. If an input is missing, ask for it or label the output provisional. Keep a short acceptance checklist beside the prompt; a fluent answer is not a verified result.'),p('A useful session','h2'),p('1. State the input and the job.\n2. Run the prompt in your own tool.\n3. Inspect the actual output.\n4. Name a concrete revision.\n5. Record the approved result and its limitations.'),p('Common input fields','h2'),p('PROJECT: the thing you are making.\nAUDIENCE: who needs it and what they already know.\nGOAL: one observable result.\nSOURCE MATERIAL: evidence or authorized assets.\nTOOL OR FORMAT: the actual destination and constraints.'),p('Shared working rule','h2'),p('Use supplied facts, separate assumptions from observations and do not claim to have run a tool or test unless it was run. The examples in this guide are fictional or original demonstration files, not testimonials.'),PageBreak()]
    for start in range(0,len(prompts),2):
        story += [p('PROMPTS / '+str(start+1).zfill(2)+'-'+str(min(start+2,len(prompts))).zfill(2),'eyebrow')]
        for number,title,text in prompts[start:start+2]:
            story += [p(f'{number}. {title}','h2'),p(text,'prompt'),p('After running: inspect the named output, apply the workshop checks and keep unresolved questions visible.','small'),Spacer(1,12)]
        story += [PageBreak()]
    story += [p('TROUBLESHOOT / REVIEW','eyebrow'),p('Fix the specific failure.','h1')]
    for title,body in edition['troubleshoot']:story += [p(title,'h2'),p(body)]
    story += [p('Before using the final result','h2'),p('Confirm the intended audience and output format. Check the supplied facts and your rights to the inputs. Open the actual exported files at their intended size. Record the tool version and any remaining defect. Keep credentials out of the workbook. Live publishing and payment actions belong to a separate authorized workflow.'),PageBreak()]
    story += [p('SOURCE REGISTER','eyebrow'),p('Public tools. Original teaching.','h1'),p('These independent products reference public tools; they are not the paid files or courses of another storefront. The upstream projects are available separately. Model weights and hosted service entitlements are separate. The motion starters include runtime JavaScript and adapted registry markup with their notices and license files; other dependencies are installed separately. Original exercises, prose and examples are the substance of this guide.')]
    for key in edition['sources']:
        source=SOURCES[key];license_name=source.get('license_name',source['license'])
        story += [p(source['repository'],'h2'),p('Recorded license: '+license_name+' / Revision: '+source['revision'][:12],'small'),Paragraph('<link href="'+escape(source['url'])+'" color="#111111">'+escape(source['url'])+'</link>',STYLES['small']),Paragraph('<link href="'+escape(source['license_url'])+'" color="#111111">Read the license at the recorded revision</link>',STYLES['small'])]
    story += [Spacer(1,15),p('Separate permissions matter','h2'),p('A software repository license does not automatically grant rights to every model, font, reference photo, voice or music track used with it. Use the relevant asset and service terms for your project. No affiliation or endorsement is claimed.'),p('Edition notes','h2'),p('Checked '+DATE+'. Tool interfaces and service requirements can change. Recheck the upstream documentation before installing or connecting a live service. The local examples were built with the dependency versions in BUILD-REPORT.json.','small')]
    accent=PALETTE[product['category']]
    doc.build(story,onFirstPage=lambda c,d:banner(c,d,product,accent),onLaterPages=lambda c,d:banner(c,d,product,accent))
    document=fitz.open(pdf)
    for i in range(len(document)):
        text=document[i].get_text()
        if not text.strip():raise AssertionError(f'Blank page {i+1}: {pdf}')
        # No visible text may extend beyond the printable page box.
        for block in document[i].get_text('blocks'):
            if block[0]<-1 or block[1]<-1 or block[2]>596.5 or block[3]>843:raise AssertionError(f'Out-of-page text on page {i+1}: {pdf}')
    proof=folder/'proofs';proof.mkdir(exist_ok=True)
    for i in sorted(set([0,1,2,5,6,len(document)-1])):
        page=document[i];page.get_pixmap(matrix=fitz.Matrix(1.2,1.2)).save(proof/f'page-{i+1:02d}.png')
    # A public interior preview is deliberately one workshop page, not the full buyer file.
    preview=document[2].get_pixmap(matrix=fitz.Matrix(1.4,1.4));preview_path=PUBLIC/(product['slug']+'-inside.webp')
    Image.frombytes('RGB',[preview.width,preview.height],preview.samples).save(preview_path,quality=90)
    count=len(document);document.close();return count

def markdown(product,edition,prompts):
    text=f'# {product["name"]}\n\n{edition["subtitle"]}\n\nEdition 1.1 / {DATE}\n\n## What you will make\n\n{edition["outcome"]}\n\n## First run\n\n'
    text+=''.join(f'{i+1}. {s}\n' for i,s in enumerate(edition['first_run']))+'\n## Scope\n\n'+edition['limits']+'\n'
    for i,(title,action,why,check) in enumerate(edition['lessons'],1):text+=f'\n## {i:02d}. {title}\n\n{action}\n\nWhy: {why}\n\nCheck: {check}\n'
    text+='\n## Original worked example\n\n'+edition['case']+'\n'
    for number,title,body in prompts:text+=f'\n## Prompt {number}: {title}\n\n```text\n{body}\n```\n'
    text+='\n## Troubleshooting\n'
    for title,body in edition['troubleshoot']:text+=f'\n### {title}\n\n{body}\n'
    return text

def main():
    DEST.mkdir(parents=True,exist_ok=True);PUBLIC.mkdir(parents=True,exist_ok=True)
    manifest=[]
    for index,product in enumerate(PRODUCTS,3):
        slug=product['slug'];edition=content.EDITIONS[slug];folder=DEST/slug;folder.mkdir(parents=True,exist_ok=True)
        raw=(ROOT/'private/catalog'/slug/'PROMPTS.md').read_text(encoding='utf-8')
        prompts=[(n,t,body.split('\n\nContext:')[0].strip()) for n,t,body in re.findall(r'## (\d+)\. ([^\n]+)\n\n```text\n(.*?)\n```',raw,re.S)]
        assert len(prompts)==product['count'],slug
        original_preview=make_starter(product,edition,folder)
        if not original_preview:original_preview=render_example_card(product,edition,folder)
        example=Image.open(original_preview).convert('RGB');example.thumbnail((1440,1200));example.save(PUBLIC/(slug+'-example.webp'),quality=90)
        cover_path=cover(slug,product['name'],product['category'],index,original_preview)
        shutil.copy2(cover_path,folder/'cover.webp')
        write(folder/'GUIDE.md',markdown(product,edition,prompts))
        write(folder/'PROMPTS.md','# '+product['name']+' / Editable prompts\n\n'+''.join(f'## {n}. {t}\n\n```text\n{body}\n```\n\n' for n,t,body in prompts))
        for name,rows in [('WORKSHEET.csv',[]),('WORKED-EXAMPLE.csv',edition['rows'])]:
            with (folder/name).open('w',encoding='utf-8',newline='') as f:
                writer=csv.writer(f);writer.writerow(edition['columns']);writer.writerows(rows)
        sources=[SOURCES[k] for k in edition['sources']]
        write(folder/'SOURCES.json',json.dumps(sources,indent=2)+'\n')
        write(folder/'SOURCES.md','# Source register\n\nPublic tools referenced by this independent guide; no affiliation with another storefront is established.\n\n'+''.join(f'- {s["repository"]}: {s["url"]}\n  - Revision: {s["revision"]}\n  - License evidence: {s["license_url"]}\n  - Recorded license: {s.get("license_name",s["license"])}\n' for s in sources)+'\nUpstream projects remain separately licensed. Motion starters include runtime and registry components with notices under starter/. Check model, service and asset terms separately.\n')
        write(folder/'USAGE.txt','PromptPack original guide and examples / Edition 1.1\n\nYou may adapt the original prompts, worksheets and example source files for personal projects and client deliverables. You may not redistribute this guide or resell the unmodified pack as a standalone library. Referenced software keeps its own license and remains available from its authors. Included runtime and registry components are identified in the starter notices; these usage terms do not replace their licenses. No rights to third-party models, accounts, recordings, voices, fonts or reference assets are granted by this pack. Results depend on your inputs and tools; no growth, revenue or identical-output result is promised.\n')
        count=build_pdf(product,edition,prompts,folder,cover_path,original_preview)
        report={'edition':'1.1','date':DATE,'pdf_pages':count,'prompt_count':len(prompts),'example':'Original local demonstration; not a customer result','source_revisions':{s['repository']:s['revision'] for s in sources},'python':sys.version.split()[0],'validation':'PDF text/bounds and original starter checks; live AI generation, account publishing and purchase delivery are outside this build.'}
        write(folder/'BUILD-REPORT.json',json.dumps(report,indent=2)+'\n')
        files=['GUIDE.pdf','GUIDE.md','PROMPTS.md','WORKSHEET.csv','WORKED-EXAMPLE.csv','SOURCES.md','SOURCES.json','USAGE.txt','BUILD-REPORT.json','cover.webp','starter/']
        if (folder/'example.mp4').exists():files.append('example.mp4')
        write(folder/'START-HERE.md','# '+product['name']+'\n\n'+edition['outcome']+'\n\n## Included\n\n'+''.join('- '+name+'\n' for name in files)+'\n## First session\n\n'+''.join(f'{i+1}. {s}\n' for i,s in enumerate(edition['first_run']))+'\n## Important limits\n\n'+edition['limits']+'\n\nRead USAGE.txt and SOURCES.md. These are independently authored teaching materials, not another storefront\'s course files.\n')
        archive=DEST/(slug+'.zip')
        with ZipFile(archive,'w',ZIP_DEFLATED) as z:
            for file in sorted(folder.rglob('*')):
                if file.is_file() and 'proofs' not in file.relative_to(folder).parts:z.write(file,slug+'/'+file.relative_to(folder).as_posix())
        with ZipFile(archive) as z:assert z.testzip() is None
        digest=hashlib.sha256(archive.read_bytes()).hexdigest()
        item={'slug':slug,'name':product['name'],'edition':'1.1','subtitle':edition['subtitle'],'outcome':edition['outcome'],'limits':edition['limits'],'first_run':edition['first_run'],'lessons':[row[0] for row in edition['lessons']],'pdf_pages':count,'prompt_count':len(prompts),'archive':archive.name,'archive_bytes':archive.stat().st_size,'sha256':digest,'sources':[s['id'] for s in sources],'cover':'/assets/product-covers/'+slug+'.webp','inside':'/assets/product-previews/'+slug+'-inside.webp','example':'/assets/product-previews/'+slug+'-example.webp','video':'/assets/product-previews/'+slug+'.mp4' if (PUBLIC/(slug+'.mp4')).exists() else None,'content_status':'built','sale_status':'checkout-not-configured','includes':[f'{count}-page PDF field guide',str(len(prompts))+' editable prompts','Original worked example and starter files','Blank and filled worksheets','Repository source register and usage notes']}
        manifest.append(item)
        print(f'{slug}: {count} pages, {len(prompts)} prompts, {archive.stat().st_size:,} bytes')
    for i,slug,name,category in [(1,'money-audit','Money Audit Pack','Finance'),(2,'website-prompts','75+ 3D Website Prompts','Websites')]:cover(slug,name,category,i)
    write(DEST/'manifest.json',json.dumps(manifest,indent=2)+'\n')
    write(ROOT/'catalog/editions.json',json.dumps(manifest,indent=2)+'\n')
    write(DEST/'START-HERE.md','# PromptPack product editions\n\nEleven independently authored digital product bundles. Each includes a PDF, editable guide, prompt library, original example, worksheets and a source register.\n\nFull buyer files are local and excluded from deployment. Public preview images are copied to assets/. No new checkout was created or activated. Upload each ZIP to your selling platform and verify buyer delivery before adding its checkout URL.\n\nRebuild: python scripts/build-product-editions.py\nRebuild public pages: node scripts/build-catalog.js\n')
    write(DEST/'PUBLISHING.md','# Product upload handoff\n\n1. Open manifest.json and the per-product listing notes.\n2. In your chosen selling platform, create the product using its accurate included-file list.\n3. Upload the matching ZIP and its cover. Keep the SHA-256 digest for comparison.\n4. Set the intended price, support and refund terms. Existing metadata prices are proposals, not active offers.\n5. Run the platform test-purchase process and verify the exact buyer archive.\n6. Add the verified URL, price and currency to the store metadata before showing a buy button.\n\nDo not upload product-build/python, research copies, proofs, old draft archives or credentials as buyer content.\n')
    for item in manifest:
        product=next(p for p in PRODUCTS if p['slug']==item['slug']);edition=content.EDITIONS[item['slug']]
        write(DEST/'listings'/(item['slug']+'.md'),'# '+item['name']+'\n\n'+edition['subtitle']+'\n\n'+edition['outcome']+'\n\n## Included\n\n'+''.join('- '+v+'\n' for v in item['includes'])+'\n## Requirements and limits\n\n'+edition['limits']+'\n\n## Files\n\nBuyer ZIP: '+item['archive']+'\nSHA-256: '+item['sha256']+'\n\nContent is built locally. Checkout is not configured; do not advertise an active purchase yet.\n')
    with ZipFile(DEST/'promptpack-product-editions.zip','w',ZIP_DEFLATED) as z:
        for item in manifest:z.write(DEST/item['archive'],'products/'+item['archive'])
        for file in [DEST/'manifest.json',DEST/'START-HERE.md',DEST/'PUBLISHING.md',*sorted((DEST/'listings').glob('*.md'))]:z.write(file,file.relative_to(DEST).as_posix())
    print('Built',len(manifest),'editions with',sum(i['pdf_pages'] for i in manifest),'PDF pages.')

if __name__=='__main__':main()
