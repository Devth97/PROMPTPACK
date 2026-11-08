"""Original customer guides and interactive forms; outputs stay in ignored output/."""
from pathlib import Path
import json
from textwrap import wrap
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, letter
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader, PdfWriter
import pypdfium2 as pdfium

OUT = Path('output/planning-products')
INK, GREEN, CREAM = '#243D37', '#DCEBE4', '#F8F6F1'
BODY = ParagraphStyle('body', fontName='Helvetica', fontSize=11, leading=17, textColor=HexColor(INK), spaceAfter=12)

class Guide:
    def __init__(self, path, size, title):
        self.path, self.w, self.h, self.title = path, *size, title
        self.c = Canvas(str(path), pagesize=size)
        self.c.setTitle(title + ' - PromptPack'); self.c.setAuthor('PromptPack / Ornalens LLP')
        self.page = 0
    def start(self, label, title, intro):
        self.page += 1
        c = self.c
        c.setFillColor(HexColor(CREAM)); c.rect(0,0,self.w,self.h,fill=1,stroke=0)
        c.setFillColor(HexColor(INK)); c.setFont('Helvetica-Bold',10)
        c.drawString(44,self.h-40,'PROMPTPACK  /  '+label.upper())
        c.setFont('Helvetica-Bold',25); c.drawString(44,self.h-84,title)
        self.y = self.h-118; self.text(intro)
    def text(self, text, heading=None):
        if heading:
            self.c.setFont('Helvetica-Bold',13); self.c.setFillColor(HexColor(INK))
            self.c.drawString(44,self.y,heading); self.y -= 24
        p = Paragraph(text, BODY)
        _, h = p.wrap(self.w-88, self.h)
        if self.y-h < 62: raise ValueError(f'Page overflow: {self.title} {self.page}')
        p.drawOn(self.c,44,self.y-h); self.y -= h+14
    def field(self, name, label, height=28, multiline=False):
        self.c.setFont('Helvetica-Bold',10); self.c.setFillColor(HexColor(INK)); self.c.drawString(44,self.y,label)
        self.y -= height+10
        if self.y<62: raise ValueError('Form overflow')
        self.c.acroForm.textfield(name=name,tooltip=label,x=44,y=self.y,width=self.w-88,height=height,
            fontName='Helvetica',fontSize=10,textColor=HexColor(INK),fillColor=white,
            borderColor=HexColor('#A7BDB2'),borderWidth=.7,forceBorder=True,
            fieldFlags='multiline' if multiline else '',maxlen=3000 if multiline else 200)
        self.y -= 24
    def end(self):
        self.c.setFillColor(HexColor(INK)); self.c.setFont('Helvetica',8)
        self.c.drawString(44,32,self.title+' | Personal-use edition 1.0 | promptpack.tech')
        self.c.drawRightString(self.w-44,32,str(self.page)); self.c.showPage()
    def save(self): self.c.save()

def wedding():
    g=Guide(OUT/'wedding-decision-kit'/'GUIDE.pdf',A4,'The Wedding Decision Kit')
    g.start('01 / Start here','Make the next decision clearer.','A practical Excel kit for comparing the full cost of vendors, choosing what to book and seeing what remains to pay. Start with a copy of START-HERE.xlsx; EXAMPLE.xlsx contains fictional records you can inspect without altering your own data.')
    g.text('1. Save your working copy','Set up in five minutes')
    g.text('Use a recent desktop version of Microsoft Excel that supports .xlsx. There are no macros or AI accounts. This release was calculated and inspected with the artifact spreadsheet engine; native Excel and Google Sheets import have not yet been tested. Keep your original files untouched.')
    g.text('2. Open Start and edit the four gold settings: target budget, guest count, as-of date and currency label. Dates must be real Excel dates, not text. Use one currency throughout; this kit does not convert currencies.')
    g.text('3. Open Quotes and add one option per row. Enter explicit zeros for fees that do not apply. Select chosen quote IDs in Selections, then enter actual payments in Payments. Gold cells are inputs; green cells calculate.')
    g.text('4. Review every REVIEW row. Incomplete or duplicate financial records are excluded from the totals. A zero warning count is a helpful check, not a confirmation that your contracts or assumptions are correct.')
    g.end()
    g.start('02 / Quotes','Compare like with like.','Use the same guest count for every quote. Give every quote a unique ID, such as Q001, and keep that ID when a vendor changes their price.')
    g.text('Fixed fee + (guest count x per-guest price) + extras = base.<br/>Service fee = base x service percentage, rounded to two decimals.<br/>Tax = (base + service fee) x tax percentage, rounded to two decimals.<br/>Quote total = base + service fee + tax.','The calculation')
    g.text('Cedar Hall: 3,000 fixed + 80 guests x 65 + 200 extras = 8,400 base. At 10% service, the fee is 840. At 8% tax on 9,240, tax is 739.20. Total: <b>9,979.20</b>.','Worked example')
    g.text('Garden House: 4,000 + 80 x 55 + 300 = 8,700. No service fee; 8% tax = 696. Total: <b>9,396.00</b>. This is 583.20 less than Cedar Hall under these assumptions. Price is one input; compare access, inclusions, cancellation terms and timing too.')
    g.text('Tax and service-fee rules differ by vendor and location. Ask the vendor which amounts are taxable and whether a quoted figure is already inclusive. If the real fee basis differs, use the confirmed final total in Selections rather than forcing a misleading quote calculation. Avoid counting tax twice.','Check the quote basis')
    g.end()
    g.start('03 / Commitments','A deposit is part of the price.','Selections is the list of quotes you actually choose, not another comparison sheet. Use each chosen quote ID once. Repeated selection IDs are flagged and excluded.')
    g.text('The optional Final contract field replaces the calculated quote total. Leave it empty to use the quote. Entering 0 deliberately means a zero contract amount. Update this field after a revised contract, not by subtracting a deposit.','Choose the agreed total')
    g.text('For Cedar Hall, the agreed total is 9,979.20. Record a 2,000 payment and a 200 refund in Payments, each as a positive amount with the correct type. Net paid = 1,800. Balance = <b>8,179.20</b>. The agreed total remains 9,979.20.','Partial payments and refunds')
    g.text('The fictional photography quote is 2,430, with 500 paid. Together the selected total is <b>12,409.20</b>, net paid is <b>2,300</b> and still to pay is <b>10,109.20</b>. Against a 20,000 target, budget remaining is <b>7,590.80</b>.')
    g.text('Next due is a reminder date, not an automated payment schedule. Confirm dates and amounts from the contract. Negative balance means overpayment credit; negative net paid means refunds exceed payments. Review either case. Future-dated payments are flagged until the as-of date is updated.','Before paying')
    g.end()
    g.start('04 / Guests and handover','Keep the small details findable.','Guests and Tasks are practical trackers; they do not send invitations, reminders or payments.')
    g.text('Use one guest-party row per household. Party size includes the named guest. Choose Yes, No or Pending. Start summarizes the number of people in Yes and Pending parties. Enter numeric whole party sizes and check for duplicated households.','Guest list')
    g.text('Meal and access information can be sensitive. Record only what is useful and share only the appropriate subset with a caterer or venue. Keep contact information out of public screenshots and ad examples.')
    g.text('For each task, add one owner, an actual due date and a concrete next action. Use the handover notes for details someone else needs on the day: arrival instructions, a vendor contact or a confirmed decision. Mark Done after confirmation.','Day-of handover')
    g.text('The workbook includes 50 quotes, 25 selections and 100 rows each for payments, guest parties and tasks. Formulas have fixed ranges. Do not insert extra rows expecting totals to extend; use a new workbook if you need more capacity. Keep related payments with their selection.','Capacity and safe editing')
    g.text('Make dated backups before bulk changes. Work on one copy at a time. Check warning rows, quote inclusions and signed contracts before relying on the summary. This organizer is not financial, tax or event-planning advice.')
    g.end()
    g.start('05 / Printable worksheet','Vendor decision conversation','Print or fill this page for a vendor call. Transfer confirmed figures to the workbook and keep the original quote.')
    for n,l,h in [('vendor','Vendor / quote ID',28),('scope','What is included, and what costs extra?',70),('fees','Service / tax basis and confirmed final total',55),('terms','Deposit, next payment and cancellation terms',55),('decision','Decision, open questions and who follows up',70)]:g.field('wedding_'+n,l,h,h>28)
    g.end();g.save()

def homes(size,name):
    g=Guide(OUT/'two-homes-organizer'/name,size,'Two Homes, One Organizer')
    g.start('01 / Start here','Keep practical records together.','A personal Excel organizer for handovers, factual notes, shared expenses and important contacts. It is designed for one person to maintain their own records, using arrangements they already have.')
    g.text('Save a working copy of START-HERE.xlsx. Use EXAMPLE.xlsx to see fictional entries. In Start, enter your report dates, as-of date and currency. Use real Excel dates; date-time cells must include the time. Gold cells are inputs and green cells calculate.','Your first five minutes')
    g.text('Use a recent desktop version of Microsoft Excel that supports .xlsx. No macros, AI subscription or shared portal is required. This release was calculated and inspected with the artifact spreadsheet engine; native Excel and Google Sheets import have not yet been tested.')
    g.text('This is an organizational tool. It does not calculate legal entitlements, replace an agreement, provide legal advice, authenticate evidence or promise court acceptance or outcomes. Contact a qualified local professional for advice about rights or obligations.','Understand the scope')
    g.text('Keep source messages, receipts and agreements separately. A typed summary does not replace an original. Store the workbook securely, check device and sharing access, and make dated backups. This file does not provide encryption or a private messaging service.','Choose what to record')
    g.end()
    g.start('02 / Time','Separate the plan from the event.','Use one Handovers row for one continuous period. Planned start and end describe the intended period; actual start and end record what happened.')
    g.text('Both actual timestamps are required before hours appear. The calculation is (actual end - actual start) x 24, rounded to two decimals. Missing actual times stay blank. A future plan with both actual fields empty is valid but contributes no actual hours.','Elapsed hours')
    g.text('In the example, 1 November 09:00 to 2 November 18:00 is <b>33 hours</b>. The planned 15-16 November period has no actual times, so it adds no actual hours. Negative intervals, duplicate IDs and future completed records are flagged.')
    g.text('Start includes completed periods whose <b>actual start</b> falls within the report window, including the full end day. It includes the full interval even if it ends outside the report window. It does not clip periods at midnight or calculate overnight entitlements.','What the summary means')
    g.text('The sheet uses local timestamps without timezone conversion. A period crossing a daylight-saving change can differ from actual elapsed time; review it manually against your source records. Overlapping entries are not automatically resolved; check and remove duplicates before relying on totals.')
    g.end()
    g.start('03 / Expenses','Make the split explicit.','Use Expenses for a cost that has actually been paid. Me and Other are labels from your perspective. Use the percentage in your existing arrangement; the workbook does not decide the appropriate split.')
    g.text('For each expense, enter a unique ID, date, description, payer, total and My share %. If you paid, the allocated share is total x (1 - My share %). If Other paid, the allocated share is total x My share %. Amounts are rounded to two decimals.','The allocation')
    g.text('School supplies cost 120, you paid, and your share is 60%. The allocated share for Other is <b>48</b>. Record 20 received and a 5 refund in Reimbursements. Net repaid is <b>15</b>; unsettled to you is <b>33</b>.','Worked example')
    g.text('The club cost 80, Other paid and your share is 60%. Your allocated share is <b>48</b>. With no reimbursement entered, unsettled by you is <b>48</b>. These separate directions are deliberately not netted against one another.')
    g.text('Every reimbursement uses a positive amount and either Payment or Refund. Its direction follows the payer of the referenced expense. A refund reverses a previous reimbursement, not the original purchase. For a purchase refund, update the expense total and document the correction and receipt.','Corrections')
    g.end()
    g.start('04 / Notes and checks','Keep observations factual.','Records is a dated index of your own notes. Include enough context to understand an event later, while keeping unnecessary sensitive information out.')
    g.text('Write the date and time, the topic, what you directly observed or the exact words you received, and a reference to the original source. Keep interpretation separate from observation. Add the date you entered the record and a practical follow-up.','A useful record')
    g.text('Example: "School bag handed over at 18:00" with a source reference is a concrete note. A label about someone\'s character is not a substitute for describing an event. Do not alter original messages or present a summary as an authenticated transcript.')
    g.text('The reporting window applies to the <b>expense date</b>, not payment date. Repaid amounts for those expenses include valid reimbursements through the as-of date, even outside the report window. REVIEW rows are excluded; compare the totals against receipts and original records.','Read the totals correctly')
    g.text('Enter explicit 0% or 100% when applicable. A negative unsettled amount means over-reimbursement; it is not automatically an amount legally owed. Missing/duplicate IDs, negative amounts, invalid percentages and future payment dates need review.')
    g.text('Each tracker has 100 rows. Do not insert rows expecting formulas to expand. Keep currencies separate. Contacts is a practical directory, not authority to collect or disclose another person\'s information.','Limits and maintenance')
    g.end()
    g.start('05 / Fillable record','Handover note','Fill digitally in a PDF reader that supports forms, or print. Keep source material separately. Save a new dated copy for each event.')
    for n,l,h in [('date','Record ID / event date and time',28),('plan','Planned and actual handover times',45),('place','Location and practical arrangements',45),('facts','What I directly observed / exact words',90),('source','Original source reference and follow-up',65)]:g.field('handover_'+n,l,h,h>28)
    g.end()
    g.start('06 / Fillable record','Shared expense note','Record your existing split and source receipt. This form records your inputs; it does not establish an obligation.')
    for n,l,h in [('id','Expense ID / date / currency',28),('item','Description and receipt reference',55),('split','Total / payer / my share % / agreed basis',55),('payments','Reimbursements and refunds: dates, amounts, references',90),('followup','Outstanding questions and next action',65)]:g.field('expense_'+n,l,h,h>28)
    g.end();g.save()

wedding();homes(A4,'GUIDE-A4.pdf');homes(letter,'GUIDE-US-Letter.pdf')
for slug in ['wedding-decision-kit','two-homes-organizer']:
    folder=OUT/slug
    (folder/'README.txt').write_text('PROMPTPACK | Personal-use edition 1.0\n\n1. Read the PDF guide.\n2. Open START-HERE.xlsx and save your own copy.\n3. Inspect EXAMPLE.xlsx for fictional worked examples.\n\nRequires a recent desktop Microsoft Excel version that supports .xlsx.\nNo macros. Google Sheets import and native Excel are not yet verified.\nDo not insert rows: capacity is documented in the guide.\nPDF forms require a reader with AcroForm support; browser support varies.\n\nSupport: https://promptpack.tech/contact\nRefund policy: https://promptpack.tech/refund\n\nLICENSE: One purchaser may adapt and print these files for personal use,\nincluding sharing relevant extracts with their own household or advisers.\nDo not resell, redistribute the blank templates, offer them as a public\ndownload or use them as a template product for clients. All sample names,\nfigures and records are fictional. Original content copyright 2026\nOrnalens LLP / PromptPack. Your entered data remains yours.\n',encoding='utf-8')

qa=[]
for pdf in OUT.glob('*/*.pdf'):
    if '-filled-qa' in pdf.name: continue
    r=PdfReader(pdf); fields=r.get_fields() or {}
    widgets=[a.get_object() for page in r.pages for a in page.get('/Annots',[]) if a.get_object().get('/Subtype')=='/Widget']
    assert len(fields)==len(widgets)==(5 if 'wedding' in str(pdf) else 10)
    assert all(f.get('/T') in fields and f.get('/AP',{}).get('/N') for f in widgets)
    writer=PdfWriter();writer.clone_document_from_reader(r)
    values={n:'QA example 2026-11-08' for n in fields}
    writer.update_page_form_field_values(None,values,auto_regenerate=False)
    test=pdf.with_name(pdf.stem+'-filled-qa.pdf');writer.write(test)
    filled=PdfReader(test)
    assert all(v.get('/V')==values[n] for n,v in filled.get_fields().items())
    for page in filled.pages:
        for a in page.get('/Annots',[]):
            obj=a.get_object()
            if obj.get('/Subtype')=='/Widget':
                assert obj.get('/V')==values[obj['/T']] and obj['/AP']['/N']
    render_dir=OUT/'qa'/pdf.parent.name/pdf.stem;render_dir.mkdir(parents=True,exist_ok=True)
    doc=pdfium.PdfDocument(pdf);doc.init_forms()
    for i,page in enumerate(doc):page.render(scale=1.15).to_pil().save(render_dir/f'page-{i+1}.png')
    fd=pdfium.PdfDocument(test);fd.init_forms()
    fd[len(fd)-1].render(scale=1.15).to_pil().save(render_dir/'filled-last-page.png')
    qa.append({'file':str(pdf),'pages':len(r.pages),'fields':len(fields),'field_value_and_widget_checks':'passed'})
(OUT/'pdf-inspection.json').write_text(json.dumps(qa,indent=2))
print(json.dumps(qa,indent=2))
