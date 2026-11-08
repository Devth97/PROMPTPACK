"""Build original buyer archives. Paid source stays in private/catalog/wave2 (not deployed).
Usage: python scripts/build-business-kits.py --deps PATH_TO_REPORTLAB_AND_PILLOW
Then: node scripts/prepare-business-kits.js --env-file PATH_TO_EXISTING_ENV
"""
import argparse, csv, hashlib, html, json, shutil, sys, zipfile
from pathlib import Path
P=argparse.ArgumentParser(); P.add_argument('--deps'); args=P.parse_args()
if args.deps: sys.path.insert(0,args.deps)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether, Table, TableStyle
from pypdf import PdfReader
import fitz
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'private/catalog/wave2'; OUT=ROOT/'product-build/launch-wave2'
SPECS=json.loads((ROOT/'catalog/launch-products.json').read_text(encoding='utf-8'))
OUT.mkdir(parents=True,exist_ok=True)
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='KitTitle',fontName='Helvetica-Bold',fontSize=36,leading=39,spaceAfter=24,textColor=colors.HexColor('#243539')))
styles.add(ParagraphStyle(name='KitH',fontName='Helvetica-Bold',fontSize=21,leading=25,spaceBefore=20,spaceAfter=14,textColor=colors.HexColor('#243539')))
styles.add(ParagraphStyle(name='KitBody',fontName='Helvetica',fontSize=11,leading=17,spaceAfter=13,textColor=colors.HexColor('#34464b')))
styles.add(ParagraphStyle(name='KitSmall',fontName='Helvetica',fontSize=9,leading=13,spaceAfter=10,textColor=colors.HexColor('#53696e')))
def para(text,style='KitBody'): return Paragraph(html.escape(str(text)).replace('\n','<br/>'),styles[style])
def footer(canvas,doc):
    canvas.setStrokeColor(colors.HexColor('#dccfc4'));canvas.line(44,40,551,40)
    canvas.setFont('Helvetica',8);canvas.setFillColor(colors.HexColor('#53696e'))
    canvas.drawString(44,27,'PROMPTPACK / FIELD GUIDE 1.0');canvas.drawRightString(551,27,str(doc.page))
def guide(spec,sections,path):
    flow=[para('PROMPTPACK / PRACTICAL BUSINESS TOOLS','KitSmall'),Spacer(1,36),para(spec['name'],'KitTitle'),para(spec['headline'],'KitH'),para(spec['summary']),Spacer(1,20),para('Start with the fictional example. Replace assumptions with your own facts before using the output.'),para(spec['needs'],'KitSmall'),para('Version 1.0 - 8 November 2026. Original instruction and examples. No customer or earnings results are claimed.','KitSmall'),PageBreak()]
    for title,paragraphs in sections:
        flow.append(para(title,'KitH'))
        for text in paragraphs: flow.append(para(text))
        flow.append(Spacer(1,8))
    SimpleDocTemplate(str(path),pagesize=(595.28,841.89),leftMargin=44,rightMargin=44,topMargin=42,bottomMargin=57,title=spec['name'],author='PromptPack').build(flow,onFirstPage=footer,onLaterPages=footer)
    return len(PdfReader(str(path)).pages)

BAKERY=[
('01 / Your first useful run',[
 'Unzip the complete download into one folder. Open START.html on your computer. Keep app.js, engine.js and kit.css beside it. The tool runs locally; it does not need an account, AI subscription or internet connection. Website links work only when you choose to go online.',
 'Load the Cupcake batch example. It is fictional. Note that the order is for 14 cupcakes while the recipe makes 12. The tool therefore costs two whole batches, producing 24 units and leaving 10 spare units. Change the order to 12, then back to 14. Compare ingredients, labour and overhead as the batch count changes.',
 'Use Save JSON backup before entering a real recipe. Keep the example backup separate from your own working project. The tool remembers a last valid project where browser storage is available, but that storage is not a reliable archive.']),
('02 / Decide what one unit means',[
 'A unit is what you count for the recipe yield and customer order: a cupcake, a cookie, a whole cake or a box. Use the same meaning in both fields. If the recipe makes 24 cookies but customers buy boxes of six, either quote in cookies with clear notes or convert both yield and order quantity to boxes. Do not mix them.',
 'This version plans one recipe per saved project. For a mixed order, cost each recipe separately and reconcile shared delivery, packaging and order-level work outside the tool. Do not charge a shared cost twice or present two recipes as one costed recipe without a reviewed method.',
 'Check: Can another person tell from the product name and notes what a unit includes? If not, clarify the unit before quoting.']),
('03 / Cost ingredients from the amount used',[
 'For each ingredient enter the purchase-pack cost, the pack quantity and the amount used per recipe batch. The cost calculation is pack cost / pack quantity x amount used. A 1,000 g flour pack costing INR 60 contributes INR 15 when a recipe uses 250 g.',
 'Pack quantity and usage must use exactly the same unit. A 500 ml carton and usage of 100 ml are compatible. A pack recorded in kilograms and usage recorded in grams are not compatible until you convert one. The tool intentionally does not guess conversions, density, cup sizes or edible yields.',
 'Use purchase records appropriate to your recipe and a consistent treatment of taxes and delivery costs. Ask your adviser how to treat tax recoverability; this tool does not calculate tax. Zero-cost entries are allowed only when you intentionally supply zero. An empty field is not silently treated as free.',
 'The example rows are cost illustrations, not food recipes, nutritional instructions or allergen guidance. Use your own tested recipes and food-safety process.']),
('04 / Whole batches change the order cost',[
 'The batch count is the order quantity divided by recipe yield, rounded up to the next whole batch. Units produced equal batch count x yield. Spare units equal produced units minus ordered units. Ingredient cost and batch labour are charged for every whole batch.',
 'Independent example: one batch makes 12 cupcakes and uses INR 240 of ingredients. An order of 14 requires two batches, so ingredients cost INR 480. Charging 14/12 x 240 would allocate only INR 280 to this order. That assumes part-batch production or another allocation for leftovers which this model does not make.',
 'Spare units are not assumed to sell. If you actually combine several orders into one production run, create a separate reviewed allocation method. Do not subtract hypothetical leftover sales or treat them as guaranteed recovery.']),
('05 / Pay attention to your time',[
 'Hands-on hours per batch scale with whole batches. Extra hours for this order are added once for consultations, custom decoration, packing coordination or other order-specific work. Total labour cost is (batch hours x batches + extra order hours) x your hourly rate.',
 'For two batches taking 0.75 hands-on hours each, plus 0.5 order hours, total recorded time is 2 hours. At INR 200 per hour, labour is INR 400. Whether passive oven or resting time should be allocated to labour or overhead is your decision; make it consistent and avoid counting the same time twice.',
 'Your labour allowance is already in the cost total. Contribution remaining after all entered costs is a separate quantity; it is not another payment of the same labour. Track actual time after the order to improve future assumptions.']),
('06 / Packaging, overhead and delivery',[
 'Packaging per ordered unit multiplies by the customer quantity, not the units produced. Extra packaging per order covers a shared box or other order-specific material. If you package spare units too, include that expense in a reviewed allocation rather than forgetting it.',
 'Overhead per batch multiplies by whole batches. Other allocated order costs are added once. These are your own allocations for costs such as kitchen energy or shared business expenses. The tool does not measure actual overhead, inventory or cash flow.',
 'Delivery is a single cost line in the quoted order. If you charge the customer separately, ensure the chosen total quote and customer notes agree with the complete customer amount. Do not add a separate delivery charge to a total that already includes it without reviewing the scope.']),
('07 / Margin and payment fees',[
 'The scenario price solves a stated arithmetic problem: quoted price minus percentage fee, fixed fee and included costs should leave the chosen margin as a percentage of the quoted price. Formula: (included cost + fixed payment fee) / (1 - percentage fee - target margin). Percentages are divided by 100 in the calculation.',
 'Example: included costs of INR 700, no fixed fee, a 2% payment fee and 25% target margin produce 700 / 0.73 = INR 958.90 before rounding. Rounding up to INR 10 gives INR 960. This is a cost-based scenario, not proof that customers will pay that amount.',
 'Margin differs from markup. Adding 25% to INR 700 gives INR 875, but that does not leave a 25% margin on the selling price. Combined percentage fees and target margin must remain below 100%. The tool blocks impossible combinations.',
 'Use your actual applicable fee cost, including any relevant charges you choose to allocate. No tax is added to the quote by this application.']),
('08 / Compare the price you actually choose',[
 'Leave Chosen quote price blank to use the rounded scenario. Enter your own amount to test a different quote. The result shows payment fees, contribution after the entered costs and margin at that amount. A zero quote has no defined margin percentage; the cost loss still appears.',
 'Use local market information, service scope, actual costs and your own business judgment when choosing a price. Do not describe the scenario as a market valuation or guaranteed profitable recommendation. Costs that you omit cannot be reflected in the result.',
 'Before sending a real quote, review quantity, scope, delivery, dates, tax handling and payment terms. The application is not a statutory invoicing or accounting system.']),
('09 / Prepare the customer quote',[
 'The customer quote displays the product name, customer/reference text, date, quantity, quoted total, requested deposit, remaining balance and your notes. Internal ingredient and labour breakdowns are excluded from the print layout.',
 'The deposit is the quoted total x your deposit percentage, rounded to two decimals. Balance is quoted total minus deposit. This is a requested payment split, not a record of money received. Actual payment confirmation and order acceptance happen in your own process.',
 'Choose Print customer quote and review the preview. Most desktop browsers can save a PDF. Check page breaks and remove optional browser header/footer text if desired. Do not claim a printed quote is a paid invoice or a confirmed booking.',
 'Avoid including private customer data in examples shared publicly. Store real quotes in your own appropriate business record system.']),
('10 / Backups, order log and next review',[
 'Save a JSON backup for each recipe/order scenario using your own filename. Import backups only from sources you trust, and review all imported costs. Loading an example or importing a project replaces the current project after confirmation; back up first.',
 'The included order-log CSV is an editable blank record template. It does not calculate totals or synchronize with the app. Log your chosen quote, deposit actually received, final payment, delivery and actual costs in the appropriate columns. Mark unpaid amounts honestly.',
 'After fulfilling an order, compare actual ingredient usage, labour and shipping with the planned values. Update the next recipe scenario from evidence. Keep historical quotes unchanged so you can explain what the customer originally accepted.']),
('11 / Three example routes',[
 'Cupcake batch: practice the step from 12 ordered units to 14. The extra batch is the lesson. Ingredients use gram, ml and unit rows; each row keeps its own pack and usage unit consistent.',
 'Decorated cake: this example uses costed material groups to illustrate order-specific labour. Replace each group with your own reviewed ingredient calculation. It is not a supplied cake recipe or a shortcut around ingredient review.',
 'Cookie box: a recipe yields 24 cookies and the order is 30, so two batches produce 48 and leave 18 spare. Confirm whether you are quoting individual cookies or boxes before adapting the example.',
 'These three examples demonstrate the tool. None represents a real bakery, customer order or observed commercial result.']),
('12 / Scope, troubleshooting and license',[
 'If the page has no results, keep the entire extracted folder together and open START.html in a current desktop browser. Complete every numeric field, use positive quantities for ingredient packs/usage, and check the combined fee and margin percentages.',
 'If browser storage is blocked, use JSON backups. A renamed or moved folder may have a different local-storage context. Your files do not need to be uploaded. PromptPack receives no recipe inputs from the offline tool.',
 'This is a manual planning tool, not food-safety advice, nutritional analysis, tax calculation, statutory invoicing, accounting software, inventory management or an order fulfillment service. No legal or market-price suitability is certified.',
 'License: the purchaser may use and adapt the toolkit for their own business and prepare client-facing quotes. Do not redistribute or resell the source toolkit, guide, examples or files as a competing digital product. Your recipes and business records remain yours. Contact PromptPack with the tool version, browser and a small fictional reproduction of any issue; never send credentials or customer data.'])]

SALON=[
('01 / Make the first useful post',[
 'Unzip the complete download and open START.html in a current desktop browser. Keep its app.js, data.js and kit.css files together. Select Day 2, Bring a reference. Enter the real salon name, city and booking instruction, then choose Fill these fields across drafts.',
 'Read the English caption, Hinglish caption, footage brief and story idea. Replace any remaining bracketed field from actual owner-approved facts. For this first draft, film only original reference notes and an empty mirror; customer footage is not required.',
 'Save a JSON backup. Export the review CSV if another person needs to review the plan. The planner does not produce an image, film a video, post to an account or independently approve content.']),
('02 / Lock the facts before writing',[
 'Complete FACT-SHEET.csv with the owner: salon name, city, address, actual booking route, current service menu, prices, appointment process, staff consent and image permissions. Record the source and approval date of each fact. An unknown stays unknown.',
 'Do not invent open appointment slots, testimonials, discounts, credentials, treatment benefits or customer questions. An illustrative question must be labeled as an example. Service and price details need current owner confirmation.',
 'The planner fills only [SALON], [CITY] and [BOOKING]. Other fields, such as [STYLIST], [APPROVED ANSWER] or [VERIFIED ADDRESS], require your review. A removed bracket is not evidence that the underlying statement is true.']),
('03 / Choose a realistic publishing rhythm',[
 'The 30 days are content slots, not an instruction to publish daily. The supplied mix contains 12 reel plans, eight five-slide carousel scripts, six photo posts and four story sets. Choose the number of posts you can actually produce and review.',
 'Group topics by job: explain a consultation, introduce the team, clarify the booking process or show a real salon detail. A clear topic and available footage are more useful than forcing a post onto every calendar date.',
 'Use ORDER-OF-WORK.md as a weekly checklist. Ask the owner which services and questions matter this month before adapting the next set. Do not treat another salon\'s calendar as evidence of demand for yours.']),
('04 / Adapt English and Hinglish',[
 'Every slot includes an English caption and a Roman-script Hinglish version. Hinglish means Hindi-English written in Latin letters; it is not a Devanagari translation. Review vocabulary and tone with someone who knows the salon\'s actual audience.',
 'Preserve service names, prices, limitations and booking instructions across languages. Avoid adding a stronger promise in translation. Read the draft aloud and simplify awkward phrasing.',
 'Select the language planned for posting before recording approval. Editing approved copy requires another review. If you publish both versions, review both versions rather than assuming approval of one covers the other.']),
('05 / Turn a topic into footage',[
 'Each reel plan includes four timed beats: a short hook, context, visible action and closing CTA. Timings are editorial targets, not a promise that a model or camera will generate the sequence correctly.',
 'Prepare a shot list before filming. Specify the actual object, staff member or place, the framing and required permissions. Prefer a mannequin, your own diagram or an empty salon scene when customer permission is unavailable.',
 'A station-preparation clip shows the recorded steps. It cannot prove certification, sterilization or a universal safety standard. Keep product and technique explanations within the owner\'s approved facts.']),
('06 / Design the carousel',[
 'Eight supplied carousel scripts each contain five slides: a useful hook, context, practical action, example and next step. Keep one main idea per slide. Use your own design tool and readable typography; the pack does not include Canva template links or finished graphic assets.',
 'Use generous margins, strong contrast and short copy. If a slide feels crowded, shorten it instead of shrinking the text. Keep the booking instruction consistent with the final caption.',
 'Write alt text after inspecting the actual final image. A plan is not enough to describe unseen visual details accurately. Check that references and brand materials are original or appropriately licensed.']),
('07 / Build a useful story set',[
 'Each content slot includes one story idea. A simple set asks one question, explains one verified point and offers one next step. Avoid making every story a sales pitch.',
 'Collect general questions about appointments and services without asking for sensitive personal details in public. A real question can be anonymized with appropriate permission. Do not fabricate a message screenshot or imply that a staged question came from a customer.',
 'Save real topic requests for the next cycle. A poll response is a content preference, not a booking, purchase or proof that a particular service will sell.']),
('08 / Review and approval',[
 'Choose the language for the draft, resolve its bracketed fields, and check the hook, caption, filming brief and story. Ask the owner to confirm the facts and copy; separately check media permissions. Then record the review status.',
 'The planner will not retain an Approved label when required tokens or review boxes are missing. It records your inputs; it does not verify them. Imported approval records are supplied data, not independent proof of review.',
 'Review the final rendered image or video as well as the planning file. Captions can be truncated, text can be misspelled in artwork, and an approved filming plan can still produce an unapproved shot. Do not confuse content approval with publication.']),
('09 / Export and hand off',[
 'Use Save JSON backup to preserve editable records. The owner-review CSV provides a table of topics, formats, hooks, both captions, asset briefs, story ideas, selected language and status. It is not a scheduler import or an automatic publishing queue.',
 'Keep one agreed version per review cycle. Put actual final media in your own shared folder with clear file names. Record which revision the owner approved and who will publish it.',
 'The offline planner attempts to remember work in browser storage, which may be cleared or unavailable for local files. Keep dated JSON backups in your own folder. Import replaces the current plan only after confirmation.']),
('10 / Worked example: Studio Willow',[
 'Studio Willow in Pune is a fictional salon used only to explain customization. Its example booking instruction is: Message BOOK to ask about an appointment. No real business, customer, booking results or permission records are implied.',
 'For Day 2, the hook is Bring the photo. Bring your questions too. The caption explains that a reference gives direction while hair, routine and the appointment plan can call for a different finish. The footage shows original reference notes and an empty mirror.',
 'The owner\'s real facts and booking route replace the fictional example. Keep unsupported promises out of the caption, and use a clearly labeled staged demonstration if people act out a consultation.']),
('11 / Learn from the actual month',[
 'Record actual post dates and available metrics in RESULTS-LOG.csv. Keep reach, saves, inquiries and confirmed appointments separate. A missing metric stays blank or unknown; do not convert it to zero.',
 'Use the included review prompts with your actual records. Ask which topics led to useful questions and which were difficult to produce. An observed pattern suggests a next test, not a causal explanation or a guaranteed growth strategy.',
 'Prepare the next cycle from actual owner priorities and available assets. Reuse a useful topic with a new example where appropriate; do not publish repeated generic copy simply to fill slots.']),
('12 / License, limits and troubleshooting',[
 'The purchaser may adapt the copy, plans and prompts for their own business and client salon projects, including publishing the adapted posts. Do not resell or redistribute the source library, planner, guide or download as a competing product. Your own business facts and client records remain yours.',
 'Filming, visual design, permissions, account access, posting and final review are separate. The pack is not a booking system, ad-management service, treatment advice or promise of followers, bookings or income.',
 'If the planner is blank, keep the extracted files together and open START.html in a current desktop browser. Use a JSON backup when storage is blocked. For help, share the version, browser and a small fictional reproduction, without customer details or credentials.'])]

def render_preview(pdf,slug):
    folder=ROOT/'assets/product-previews';folder.mkdir(parents=True,exist_ok=True)
    doc=fitz.open(pdf);page=doc[1 if len(doc)>1 else 0];pix=page.get_pixmap(matrix=fitz.Matrix(1.35,1.35))
    img=Image.frombytes('RGB',[pix.width,pix.height],pix.samples);img.save(folder/(slug+'-inside.webp'),quality=88)
    thumbs=[]
    for p in doc:
        pix=p.get_pixmap(matrix=fitz.Matrix(.33,.33));thumb=Image.frombytes('RGB',[pix.width,pix.height],pix.samples);thumbs.append(thumb)
    contact=Image.new('RGB',(5*210,((len(thumbs)+4)//5)*300),'#d9d9d9')
    draw=ImageDraw.Draw(contact)
    for i,t in enumerate(thumbs):
        x=(i%5)*210;y=(i//5)*300;contact.paste(t,(x,y));draw.text((x+5,y+282),str(i+1),fill='black')
    review=ROOT/'output/wave2-review';review.mkdir(parents=True,exist_ok=True);contact.save(review/(slug+'-guide-contact.png'))

def salon_data():
    data=json.loads((SOURCE/'salon-content.json').read_text(encoding='utf-8'))
    days=[]
    for i,raw in enumerate(data['days'],1):
        topic,fmt,goal,hook,en,hi,asset,story=raw
        if i in [10,24]: fmt='Reel'
        if i==27: fmt='Carousel'
        production='Photo/story plan: '+asset+'\nInteraction: '+story
        if fmt=='Reel':
            production='0-3s / Hook: '+hook+'\n3-8s / Context: show the written topic or original reference note.\n8-15s / Demonstration: '+asset+'\n15-20s / Close: show the confirmed booking instruction.\nVoiceover draft: '+en+'\nProduction note: rehearse and trim to your actual speaking pace; timings are planning targets. Use original/permission-cleared assets.'
        if fmt=='Carousel':
            item=next(c for c in data['carousels'] if c[0]==i)
            production='\n\n'.join('Slide '+str(n)+' / '+text.replace('|','\n',1) for n,text in enumerate(item[2],1))
        days.append(dict(day=i,topic=topic,format=fmt,goal=goal,hook=hook,english=en,hinglish=hi,asset=asset,story=story,production=production))
    assert {fmt:sum(d['format']==fmt for d in days) for fmt in ['Reel','Carousel','Photo','Story set']}=={'Reel':12,'Carousel':8,'Photo':6,'Story set':4}
    return dict(days=days,prompts=data['prompts'])

manifest=[]
for spec in SPECS:
    slug=spec['slug'];folder=OUT/slug;folder.mkdir(exist_ok=True)
    is_bakery=slug=='bakeprice-studio'
    shutil.copy2(SOURCE/('bakery.html' if is_bakery else 'salon.html'),folder/'START.html')
    shutil.copy2(SOURCE/('bakery-app.js' if is_bakery else 'salon-app.js'),folder/'app.js')
    shutil.copy2(SOURCE/'kit.css',folder/'kit.css')
    sections=list(BAKERY if is_bakery else SALON)
    md=['# '+spec['name'],'',spec['summary'],'']
    for title,paragraphs in sections: md.extend(['## '+title,'',*sum(([p,''] for p in paragraphs),[])])
    (folder/'GUIDE.md').write_text('\n'.join(md),encoding='utf-8')
    (folder/'README.txt').write_text(spec['name']+'\n\nUnzip the complete folder, then open START.html. Start with GUIDE.pdf. Keep the files together.\nSave JSON backups. Browser storage is not a permanent record.\n\n'+spec['needs']+'\n\n'+spec['limits']+'\n\nLicense: use for your own business and client work. Do not redistribute or resell the source toolkit.\nSupport: https://promptpack.tech/contact/\n',encoding='utf-8')
    if is_bakery:
        shutil.copy2(ROOT/'scripts/bakeprice-engine.js',folder/'engine.js')
        prompts=[
          ('Review units','Review [INGREDIENT TABLE]. Compare pack and recipe-usage units row by row. Flag incompatible units, missing quantities and unknown conversions. Do not guess density, cup sizes, edible yields or current prices. Return the exact fields requiring correction.'),
          ('Check a cost ledger','Using [PURCHASE RECORDS] and [RECIPE], return ingredient, pack cost, pack quantity, same-unit recipe usage and cost per batch. Show arithmetic. Keep missing facts UNKNOWN. Do not invent a recipe or claim the calculation establishes food safety.'),
          ('Explain whole batches','For [RECIPE YIELD] and [ORDER QUANTITY], compute whole batches, units produced and spare units. Show the ceiling calculation. Do not assume spare units will sell. Explain any alternative allocation only as a scenario requiring owner review.'),
          ('Audit labour','Using [ACTUAL TIME NOTES], separate hands-on batch time from extra order work. Identify possible double counting and uncertain allocations. Do not add invented working hours or prescribe a market wage.'),
          ('Review a quote','Compare [QUOTE] against [APPROVED ORDER SCOPE] and [COST OUTPUT]. Check quantity, product description, total, deposit, balance and delivery terms. List discrepancies. Do not approve the quote or infer tax treatment.'),
          ('Draft a customer clarification','Write a concise message asking for the missing details in [ORDER BRIEF]. Ask about quantity, design scope, date and delivery. Do not collect unnecessary private information or imply the order is confirmed.'),
          ('Test one assumption','Using [BASE PROJECT] and [ONE CHANGED INPUT], calculate the difference in included costs and the chosen quote scenario. Preserve all other inputs. Label the result a sensitivity test, not a prediction of customer willingness to pay.'),
          ('Compare actual to planned','Using [PLANNED COSTS] and [ACTUAL RECORDS], show variances for ingredients, labour, packaging and delivery. Mark missing actuals UNKNOWN. Do not infer profit or causality from incomplete records.'),
          ('Draft quote notes','From [OWNER-APPROVED SCOPE AND TERMS], write plain customer quote notes. Preserve the actual price and dates. Flag missing details rather than inventing deposits, cancellation terms, certifications or legal rights.'),
          ('Review the next recipe','Using [LAST ORDER REVIEW], propose three changes to the next costing process. Name the actual observation behind each suggestion. Keep business decisions with the owner and tax/food-safety questions with appropriate qualified sources.')]
        (folder/'AI-PROMPTS.md').write_text('# Ten staged prompts\n\nUse your own assistant if desired; no AI account is required for the offline tool. Remove customer information before sharing records.\n\n'+'\n\n'.join('## '+str(i)+' / '+title+'\n\n'+text for i,(title,text) in enumerate(prompts,1)),encoding='utf-8')
        with (folder/'ORDER-LOG.csv').open('w',newline='',encoding='utf-8-sig') as f: csv.writer(f).writerow(['Order reference','Date','Product','Units','Quote total','Deposit requested','Deposit received','Balance received','Actual ingredients','Actual labour allowance','Actual packaging','Actual delivery','Other actual costs','Status','Notes'])
    else:
        data=salon_data();(folder/'data.js').write_text('window.SALON_DATA='+json.dumps(data,ensure_ascii=False).replace('<','\\u003c')+';\n',encoding='utf-8')
        bank=['# Salon content bank','Original drafts. Replace bracketed fields; confirm facts and permissions. Production timings are editorial targets, not tested video outputs.','']
        for day in data['days']:
            bank.extend(['## Day '+str(day['day'])+' / '+day['topic'],day['format']+' / '+day['goal'],'### Hook',day['hook'],'### English',day['english'],'### Hinglish',day['hinglish'],'### Asset brief',day['asset'],'### Story',day['story'],'### Production plan',day['production'],''])
        bank.extend(['# Twenty staged AI prompts','Use with your own AI assistant if desired. Do not paste private customer records.'])
        for number,title,text in data['prompts']:bank.extend(['## '+number+' / '+title,text,''])
        (folder/'CONTENT-BANK.md').write_text('\n\n'.join(bank),encoding='utf-8')
        for name,head,rows in [('FACT-SHEET.csv',['Field','Approved value','Source','Owner approval date'],[[key,'','',''] for key in ['Salon name','City','Address','Booking route','Current services','Prices','Staff permissions','Media rights','Owner reviewer']]),('RESULTS-LOG.csv',['Slot','Actual publish date','Channel','Reach','Saves','Inquiries','Confirmed appointments','Missing data','Notes'],[[str(i),'','','','','','','',''] for i in range(1,31)]),('APPROVAL-LOG.csv',['Slot','Draft revision','Reviewer','Copy approved date','Media permission reference','Final asset reviewed','Publication owner'],[[str(i),'','','','','',''] for i in range(1,31)])]:
            with (folder/name).open('w',newline='',encoding='utf-8-sig') as f:w=csv.writer(f);w.writerow(head);w.writerows(rows)
        (folder/'ORDER-OF-WORK.md').write_text('# Weekly work order\n\n1. Confirm actual owner priorities and facts.\n2. Choose producible content slots.\n3. Request permitted footage and make drafts.\n4. Review both selected copy and final assets.\n5. Record owner approval and the publication owner.\n6. Publish through your own authorized account.\n7. Record actual results, preserving missing data as unknown.\n8. Save a dated JSON backup.\n',encoding='utf-8')
        sections.append(('13 / The twenty-prompt workflow',[title+': '+text for _,title,text in data['prompts']]))
    pdf=folder/'GUIDE.pdf';pages=guide(spec,sections,pdf);render_preview(pdf,slug)
    finalpdf=ROOT/'output/pdf';finalpdf.mkdir(parents=True,exist_ok=True);shutil.copy2(pdf,finalpdf/(slug+'-guide.pdf'))
    archive=OUT/(slug+'.zip')
    with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
        for file in sorted(folder.iterdir()):z.write(file,slug+'/'+file.name)
    raw=archive.read_bytes();assert len(raw)<4_000_000
    manifest.append(dict(slug=slug,name=spec['name'],archive=str(archive.relative_to(ROOT)).replace('\\','/'),sha256=hashlib.sha256(raw).hexdigest(),bytes=len(raw),pdf_pages=pages,files=[f.name for f in sorted(folder.iterdir())]))
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print(json.dumps(manifest,indent=2))
