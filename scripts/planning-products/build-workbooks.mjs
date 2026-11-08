import fs from 'node:fs/promises';
import path from 'node:path';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

// Run with the bundled artifact-tool runtime. Paid workbooks remain in ignored output/.
const out = path.resolve('output/planning-products');
await fs.mkdir(out, { recursive: true });
const ink = '#243D37', accent = '#DCEBE4', paper = '#F8F6F1', input = '#FFF3D6';
const money = '#,##0.00;[Red](#,##0.00);0.00';
const serial = iso => (Date.parse(iso+'T00:00:00Z')-Date.UTC(1899,11,30))/86400000;
function set(s, cell, v) { s.getRange(cell).values = [[v]]; }
function formula(s, cell, v) { s.getRange(cell).formulas = [[v]]; }
function base(w, name, title, sub, heads, widths) {
  const s = w.worksheets.getItem(name), end = String.fromCharCode(64+heads.length);
  s.showGridLines = false; s.tabColor = ink;
  s.getRange(`A1:${end}120`).format.font = {name:'Arial',size:11,color:ink};
  s.getRange(`A1:${end}6`).format.fill = paper;
  s.getRange(`A1:${end}1`).merge(); set(s,'A1',title);
  s.getRange('A1').format.font = {name:'Arial',size:22,bold:true,color:ink};
  s.getRange('A1').format.rowHeight = 42;
  s.getRange(`A3:${end}3`).merge(); set(s,'A3',sub); s.getRange('A3').format.rowHeight = 32;
  s.getRange(`A5:${end}5`).merge(); set(s,'A5','GOLD = edit  |  GREEN = calculated  |  Read GUIDE.pdf before entering records');
  s.getRange(`A7:${end}7`).values = [heads];
  s.getRange(`A7:${end}7`).format.fill = ink;
  s.getRange(`A7:${end}7`).format.font = {name:'Arial',size:10,bold:true,color:'#FFFFFF'};
  s.getRange(`A7:${end}7`).format.rowHeight = 32;
  s.getRange(`A8:${end}107`).format.fill = input;
  s.getRange(`A8:${end}107`).format.rowHeight = 24;
  widths.forEach((v,i)=>s.getRange(`${String.fromCharCode(65+i)}:${String.fromCharCode(65+i)}`).format.columnWidth=v);
  s.freezePanes.freezeRows(7);
  return s;
}
function calc(s, cols, end=107) { for (const c of cols) s.getRange(`${c}8:${c}${end}`).format.fill = accent; }
function list(s, range, values) {s.getRange(range).dataValidation = {rule:{type:'list',values}};}
function rows(s,data,start=8) { if(data.length) s.getRange(`A${start}`).write(data); }
function overview(w,title,sub) {
  const s=base(w,'Start',title,sub,['Setting / measure','Value','How to use'],[37,24,85]);
  s.getRange('A8:C107').format.fill=paper;s.getRange('B8:B11').format.fill=input;
  s.getRange('B8:B30').setNumberFormat(money);
  return s;
}
function makeWedding(example) {
  const w=Workbook.create(); ['Start','Quotes','Selections','Payments','Guests','Tasks'].forEach(n=>w.worksheets.add(n));
  const st=overview(w,'The Wedding Decision Kit',example?'FICTIONAL EXAMPLE • Alex & Jamie • all amounts in one currency':'YOUR WORKBOOK • save a dated copy before editing');
  rows(st,[['Target budget',20000,'Edit the amount; this is a planning target.'],['Guest count',80,'Used in every quote. Change it to compare guest-count scenarios.'],['As-of date',serial('2026-11-08'),'Edit this date for due-payment alerts.'],['Currency label','USD','One currency per workbook; no exchange-rate conversion.'],['Selected total',null,'Includes quotes selected once, or your final contract override.'],['Net paid',null,'Payments less refunds on valid selected quotes.'],['Still to pay',null,'Selected total less net paid. Negative is an overpayment credit.'],['Budget remaining',null,'Target budget less selected total. Negative is over budget.'],['Rows needing review',null,'Resolve REVIEW rows before relying on the totals.'],['Expected guests',null,'Sum of party sizes marked Yes in Guests.'],['Unanswered guests',null,'Sum of party sizes marked Pending in Guests.']]);
  st.getRange('B10').setNumberFormat('yyyy-mm-dd'); st.getRange('B9').setNumberFormat('0');
  const q=base(w,'Quotes','Compare the full quote','50 quote rows • IDs must be unique • service fee on base; tax on base + service fee',['Quote ID','Category','Vendor','Fixed fee','Guests','Per guest','Extras','Service %','Tax %','Base','Service fee','Tax','Quote total','Check','Notes'],[14,19,25,15,12,15,15,13,13,16,16,16,18,22,40]);
  q.getRange('D8:M57').setNumberFormat(money);q.getRange('H8:I57').setNumberFormat('0.0%');q.getRange('E8:E57').setNumberFormat('0');calc(q,['E','J','K','L','M','N'],57);
  for(let r=8;r<=57;r++){
    set(q,`A${r}`,`Q${String(r-7).padStart(3,'0')}`);
    formula(q,`E${r}`,`=IF(C${r}="","",Start!$B$9)`);
    formula(q,`N${r}`,`=IF(C${r}="","",IF(AND(COUNTIF($A$8:$A$57,A${r})=1,A${r}<>"",B${r}<>"",ISNUMBER(D${r}),ISNUMBER(E${r}),ISNUMBER(F${r}),ISNUMBER(G${r}),ISNUMBER(H${r}),ISNUMBER(I${r}),D${r}>=0,E${r}>=0,F${r}>=0,G${r}>=0,H${r}>=0,H${r}<=1,I${r}>=0,I${r}<=1),"Ready","REVIEW"))`);
    formula(q,`J${r}`,`=IF(N${r}<>"Ready","",ROUND(D${r}+E${r}*F${r}+G${r},2))`);
    formula(q,`K${r}`,`=IF(N${r}<>"Ready","",ROUND(J${r}*H${r},2))`);
    formula(q,`L${r}`,`=IF(N${r}<>"Ready","",ROUND((J${r}+K${r})*I${r},2))`);
    formula(q,`M${r}`,`=IF(N${r}<>"Ready","",SUM(J${r}:L${r}))`);
  }
  const sel=base(w,'Selections','Turn quotes into commitments','25 selections • one row per chosen quote • a zero contract override is allowed',['Quote ID','Vendor','Quote total','Final contract (optional)','Used total','Net paid','Balance','Next due','Check','Notes'],[15,25,18,24,18,18,18,18,23,40]);
  sel.getRange('C8:G32').setNumberFormat(money);sel.getRange('H8:H32').setNumberFormat('yyyy-mm-dd');calc(sel,['B','C','E','F','G','I'],32);
  for(let r=8;r<=32;r++) {
    const ready=`AND(COUNTIF(Quotes!$A$8:$A$57,A${r})=1,COUNTIF($A$8:$A$32,A${r})=1,COUNTIFS(Quotes!$A$8:$A$57,A${r},Quotes!$N$8:$N$57,"Ready")=1,OR(D${r}="",AND(ISNUMBER(D${r}),D${r}>=0)))`;
    formula(sel,`I${r}`,`=IF(A${r}="","",IF(${ready},IF(COUNTIFS(Payments!$B$8:$B$107,A${r},Payments!$H$8:$H$107,"REVIEW")>0,"REVIEW","Ready"),"REVIEW"))`);
    formula(sel,`B${r}`,`=IF(A${r}="","",IFERROR(INDEX(Quotes!$C$8:$C$57,MATCH(A${r},Quotes!$A$8:$A$57,0)),"Unknown ID"))`);
    formula(sel,`C${r}`,`=IF(I${r}<>"Ready","",SUMIF(Quotes!$A$8:$A$57,A${r},Quotes!$M$8:$M$57))`);
    formula(sel,`E${r}`,`=IF(I${r}<>"Ready","",IF(ISNUMBER(D${r}),D${r},C${r}))`);
    formula(sel,`F${r}`,`=IF(I${r}<>"Ready","",SUMIF(Payments!$B$8:$B$107,A${r},Payments!$G$8:$G$107))`);
    formula(sel,`G${r}`,`=IF(I${r}<>"Ready","",E${r}-F${r})`);
  }
  const p=base(w,'Payments','Record payments and refunds','100 transactions • positive amounts only • refunds reverse paid cash • no future transactions',['Payment ID','Quote ID','Date paid','Type','Amount','Reference','Net paid','Check'],[17,16,18,17,18,35,18,22]);
  p.getRange('C8:C107').setNumberFormat('yyyy-mm-dd');p.getRange('E8:G107').setNumberFormat(money);calc(p,['G','H']);list(p,'D8:D107',['Payment','Refund']);
  for(let r=8;r<=107;r++){
    formula(p,`H${r}`,`=IF(COUNTA(A${r}:F${r})=0,"",IF(AND(A${r}<>"",B${r}<>"",COUNTIF($A$8:$A$107,A${r})=1,COUNTIF(Quotes!$A$8:$A$57,B${r})=1,COUNTIFS(Quotes!$A$8:$A$57,B${r},Quotes!$N$8:$N$57,"Ready")=1,ISNUMBER(C${r}),C${r}>0,C${r}<=Start!$B$10,ISNUMBER(E${r}),E${r}>=0,OR(D${r}="Payment",D${r}="Refund")),"Ready","REVIEW"))`);
    formula(p,`G${r}`,`=IF(H${r}<>"Ready","",IF(D${r}="Refund",-E${r},E${r}))`);
  }
  const g=base(w,'Guests','Keep the guest list together','100 parties • enter party size, including named guest • share only an appropriate copy',['Party / household','Party size','RSVP','Meal / access notes','Table','Contact / notes'],[30,15,17,38,14,42]);list(g,'C8:C107',['Yes','No','Pending']);g.getRange('B8:B107').setNumberFormat('0');
  const t=base(w,'Tasks','The handover list','100 tasks • due dates and contacts in one place • mark Done only after confirmation',['Task / decision','Owner','Due date','Status','Vendor / contact','Handover notes'],[35,24,18,18,35,44]);t.getRange('C8:C107').setNumberFormat('yyyy-mm-dd');list(t,'D8:D107',['To do','In progress','Done']);
  if(example){
    rows(q,[['Q001','Venue','Cedar Hall',3000,80,65,200,.1,.08],['Q002','Venue','Garden House',4000,80,55,300,0,.08],['Q003','Photography','North Light',2100,80,0,150,0,.08]]);
    // Restore guest-count formulas overwritten by the sample input block.
    for(let r=8;r<=10;r++)formula(q,`E${r}`,`=IF(C${r}="","",Start!$B$9)`);
    set(sel,'A8','Q001');set(sel,'A9','Q003');set(sel,'H8',serial('2026-12-01'));
    rows(p,[['P001','Q001',serial('2026-10-15'),'Payment',2000,'Fictional deposit'],['P002','Q001',serial('2026-10-20'),'Refund',200,'Fictional partial refund'],['P003','Q003',serial('2026-11-01'),'Payment',500,'Fictional deposit']]);
    rows(g,[['Alex household',2,'Yes','Vegetarian',1,'Fictional'],['Jamie household',3,'Pending','Confirm meals',null,'Fictional']]);
    rows(t,[['Confirm venue access','Alex',serial('2026-11-20'),'To do','Cedar Hall','Ask about step-free entrance'],['Approve photo schedule','Jamie',serial('2026-11-25'),'In progress','North Light','List essential group photos']]);
  }
  const measures={12:'=SUM(Selections!E8:E32)',13:'=SUM(Selections!F8:F32)',14:'=B12-B13',15:'=B8-B12',16:'=COUNTIF(Quotes!N8:N57,"REVIEW")+COUNTIF(Selections!I8:I32,"REVIEW")+COUNTIF(Payments!H8:H107,"REVIEW")',17:'=SUMIF(Guests!C8:C107,"Yes",Guests!B8:B107)',18:'=SUMIF(Guests!C8:C107,"Pending",Guests!B8:B107)'};
  for(const [r,f]of Object.entries(measures)){formula(st,`B${r}`,f);st.getRange(`B${r}`).format.fill=accent;}
  set(st,'A21','Before relying on totals');set(st,'C21','Incomplete / duplicate rows are excluded. Review warnings and compare against contracts.');
  set(st,'A22','Dates and capacity');set(st,'C22','50 quotes, 25 selections, 100 payments, 100 guest parties, 100 tasks. Do not add rows.');
  set(st,'A23','Overpayment / refunds');set(st,'C23','Negative balance = credit; negative net paid = refunds exceed payments. Investigate either.');
  set(st,'A24','Due dates');set(st,'C24','Selections > Next due is a reminder only. Confirm the actual amount and date with the vendor.');
  set(st,'A19','Selections due');formula(st,'B19','=COUNTIFS(Selections!H8:H32,">0",Selections!H8:H32,"<="&B10,Selections!G8:G32,">0")');
  st.getRange('B16:B19').setNumberFormat('0');st.getRange('B19').format.fill=accent;
  set(st,'A20','Settings check');formula(st,'B20','=IF(AND(ISNUMBER(B8),B8>=0,ISNUMBER(B9),B9>=0,B9=INT(B9),ISNUMBER(B10),B10>0,B11<>""),"Ready","REVIEW")');
  return w;
}
function makeHomes(example){
  const w=Workbook.create();['Start','Handovers','Records','Expenses','Reimbursements','Contacts'].forEach(n=>w.worksheets.add(n));
  const st=overview(w,'Two Homes, One Organizer',example?'FICTIONAL EXAMPLE • one parent\'s personal records':'YOUR WORKBOOK • organize your own records in one place');
  rows(st,[['Report from',serial('2026-11-01'),'Inclusive start date for summary figures.'],['Report through',serial('2026-11-30'),'Inclusive end date; handovers are counted by actual start date.'],['As-of date',serial('2026-11-08'),'Future payments are flagged. Update as needed.'],['Currency label','USD','One currency only. Splits come from your existing agreement.'],['Completed actual hours',null,'Elapsed hours of valid completed handovers starting in the report window.'],['Allocated to other',null,'Other person share of valid expenses you paid in the report window.'],['Repaid to you',null,'Valid reimbursements against those expenses, through the as-of date.'],['Unsettled to you',null,'Allocated share less reimbursements; negative = over-reimbursement.'],['Allocated to you',null,'Your share of valid expenses the other person paid in the report window.'],['Repaid by you',null,'Valid reimbursements against those expenses, through the as-of date.'],['Unsettled by you',null,'Allocated share less reimbursements; negative = over-reimbursement.'],['Rows needing review',null,'Resolve REVIEW before relying on summary totals.']]);
  st.getRange('B8:B10').setNumberFormat('yyyy-mm-dd');
  const h=base(w,'Handovers','Planned and actual time','100 records • enter local date + time • elapsed hours, not custody entitlement or overnight counts',['Record ID','Planned start','Planned end','Actual start','Actual end','Location','Practical notes','Actual hours','Check'],[17,24,24,24,24,27,44,18,22]);
  h.getRange('B8:E107').setNumberFormat('yyyy-mm-dd hh:mm');h.getRange('H8:H107').setNumberFormat('0.00');calc(h,['H','I']);
  for(let r=8;r<=107;r++){
    formula(h,`I${r}`,`=IF(COUNTA(A${r}:G${r})=0,"",IF(AND(A${r}<>"",COUNTIF($A$8:$A$107,A${r})=1,ISNUMBER(B${r}),ISNUMBER(C${r}),C${r}>=B${r},OR(AND(D${r}="",E${r}=""),AND(ISNUMBER(D${r}),ISNUMBER(E${r}),E${r}>=D${r},E${r}<Start!$B$10+1))),"Ready","REVIEW"))`);
    formula(h,`H${r}`,`=IF(AND(I${r}="Ready",ISNUMBER(D${r}),ISNUMBER(E${r})),ROUND((E${r}-D${r})*24,2),"")`);
  }
  const rec=base(w,'Records','A factual record','100 entries • separate what happened from interpretation • keep original messages separately',['Record ID','Date / time','Topic','What happened / exact quote','Source reference','Entered on','Follow-up / due'],[17,24,24,65,40,20,42]);rec.getRange('B8:B107').setNumberFormat('yyyy-mm-dd hh:mm');rec.getRange('F8:F107').setNumberFormat('yyyy-mm-dd');
  const e=base(w,'Expenses','Allocate shared expenses','100 expenses • Me / Other are labels • split follows your existing arrangement, not a legal calculation',['Expense ID','Expense date','Description','Paid by','Total','My share %','Allocated share','Reimbursed','Unsettled','Check','Receipt reference'],[17,19,35,16,17,16,20,18,18,22,35]);
  e.getRange('B8:B107').setNumberFormat('yyyy-mm-dd');e.getRange('E8:I107').setNumberFormat(money);e.getRange('F8:F107').setNumberFormat('0.0%');calc(e,['G','H','I','J']);list(e,'D8:D107',['Me','Other']);
  const p=base(w,'Reimbursements','Record reimbursements','100 transactions • Payment is positive; Refund reverses it • transaction direction follows the expense payer',['Payment ID','Expense ID','Date paid','Type','Amount','Reference','Net repaid','Check'],[18,18,19,18,18,40,19,22]);
  p.getRange('C8:C107').setNumberFormat('yyyy-mm-dd');p.getRange('E8:G107').setNumberFormat(money);calc(p,['G','H']);list(p,'D8:D107',['Payment','Refund']);
  for(let r=8;r<=107;r++){
    formula(e,`J${r}`,`=IF(COUNTA(A${r}:F${r})=0,"",IF(AND(A${r}<>"",COUNTIF($A$8:$A$107,A${r})=1,ISNUMBER(B${r}),B${r}>0,B${r}<=Start!$B$10,C${r}<>"",OR(D${r}="Me",D${r}="Other"),ISNUMBER(E${r}),E${r}>=0,ISNUMBER(F${r}),F${r}>=0,F${r}<=1),"Ready","REVIEW"))`);
    formula(e,`G${r}`,`=IF(J${r}<>"Ready","",ROUND(E${r}*IF(D${r}="Me",1-F${r},F${r}),2))`);
    formula(e,`H${r}`,`=IF(J${r}<>"Ready","",SUMIF(Reimbursements!$B$8:$B$107,A${r},Reimbursements!$G$8:$G$107))`);
    formula(e,`I${r}`,`=IF(J${r}<>"Ready","",G${r}-H${r})`);
    formula(p,`H${r}`,`=IF(COUNTA(A${r}:F${r})=0,"",IF(AND(A${r}<>"",B${r}<>"",COUNTIF($A$8:$A$107,A${r})=1,COUNTIF(Expenses!$A$8:$A$107,B${r})=1,COUNTIFS(Expenses!$A$8:$A$107,B${r},Expenses!$J$8:$J$107,"Ready")=1,ISNUMBER(C${r}),C${r}>0,C${r}<=Start!$B$10,ISNUMBER(E${r}),E${r}>=0,OR(D${r}="Payment",D${r}="Refund")),"Ready","REVIEW"))`);
    formula(p,`G${r}`,`=IF(H${r}<>"Ready","",IF(D${r}="Refund",-E${r},E${r}))`);
  }
  const c=base(w,'Contacts','Practical contacts','100 entries • include only information you are entitled to keep • review access and backups',['Role / service','Name','Phone','Email','Hours / instructions','Document reference'],[24,28,24,38,48,40]);
  if(example){
    rows(h,[['H001',serial('2026-11-01')+.375,serial('2026-11-02')+.75,serial('2026-11-01')+.375,serial('2026-11-02')+.75,'Library entrance','Fictional completed handover'],['H002',serial('2026-11-15')+.375,serial('2026-11-16')+.75,null,null,'Library entrance','Future plan only']]);
    rows(rec,[['R001',serial('2026-11-02')+.75,'School bag','School bag handed over at 18:00.','Fictional note - no attachment',serial('2026-11-02'),'Confirm next school pickup']]);
    rows(e,[['E001',serial('2026-11-02'),'School supplies','Me',120,.6],['E002',serial('2026-11-03'),'Club registration','Other',80,.6]]);
    rows(p,[['P001','E001',serial('2026-11-04'),'Payment',20,'Fictional partial reimbursement'],['P002','E001',serial('2026-11-05'),'Refund',5,'Fictional correction']]);
    rows(c,[['School office','Example contact','Add locally','Add locally','Check pickup arrangements','Store original agreement separately']]);
  }
  formula(st,'B12','=SUMIFS(Handovers!H8:H107,Handovers!D8:D107,">="&B8,Handovers!D8:D107,"<"&B9+1)');
  for(const [r,col,payer]of [[13,'G','Me'],[14,'H','Me'],[16,'G','Other'],[17,'H','Other']])formula(st,`B${r}`,`=SUMIFS(Expenses!${col}8:${col}107,Expenses!D8:D107,"${payer}",Expenses!B8:B107,">="&B8,Expenses!B8:B107,"<"&B9+1)`);
  formula(st,'B15','=B13-B14');formula(st,'B18','=B16-B17');
  formula(st,'B19','=COUNTIF(Handovers!I8:I107,"REVIEW")+COUNTIF(Expenses!J8:J107,"REVIEW")+COUNTIF(Reimbursements!H8:H107,"REVIEW")');
  st.getRange('B12:B19').format.fill=accent;
  set(st,'A22','Read before use');set(st,'C22','A personal organizer. No legal advice, court forms, outcome guarantees or compliance certification.');
  set(st,'A23','Keep source material');set(st,'C23','Keep original receipts and messages separately; this workbook does not authenticate evidence.');
  set(st,'A24','Capacity and dates');set(st,'C24','100 rows per tracker. Dates use local time; DST crossings need manual review. Do not add rows.');
  set(st,'A25','Access and backups');set(st,'C25','Store securely, make dated backups, review file sharing and use a separate copy for each currency.');
  set(st,'A20','Settings check');formula(st,'B20','=IF(AND(ISNUMBER(B8),ISNUMBER(B9),B8>0,B9>=B8,ISNUMBER(B10),B10>0,B11<>""),"Ready","REVIEW")');
  st.getRange('B19').setNumberFormat('0');
  return w;
}

const qa=[];
async function exportBook(w,slug,example){
  w.recalculate();
  const errors=await w.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},maxChars:5000});
  qa.push({slug,example,errors:errors.ndjson,start:(await w.inspect({kind:'region',sheetId:'Start',range:'A8:C25',maxChars:7000})).ndjson});
  const dir=path.join(out,slug);await fs.mkdir(dir,{recursive:true});
  await (await SpreadsheetFile.exportXlsx(w)).save(path.join(dir,`${example?'EXAMPLE':'START-HERE'}.xlsx`));
  if(example){for(let i=0;i<w.worksheets.items.length;i++){
    const s=w.worksheets.items[i];
    const last={Start:'C',Quotes:'O',Selections:'J',Payments:'H',Guests:'F',Tasks:'F',Handovers:'I',Records:'G',Expenses:'K',Reimbursements:'H',Contacts:'F'}[s.name];
    const png=await w.render({sheetName:s.name,range:s.name==='Start'?'A1:C25':`A1:${last}13`,scale:s.name==='Start'?1.15:.9,format:'png'});
    await fs.writeFile(path.join(dir,`preview-${s.name.toLowerCase()}.png`),new Uint8Array(await png.arrayBuffer()));
  }}
}
for(const [slug,fn]of [['wedding-decision-kit',makeWedding],['two-homes-organizer',makeHomes]])for(const example of [false,true]){await exportBook(fn(example),slug,example);console.log(`Exported ${slug} ${example?'example':'blank'}`);}
await fs.writeFile(path.join(out,'workbook-inspection.json'),JSON.stringify(qa,null,2));
// Export mutated scenarios for independent XML/cached-value checks in verify-products.py.
const scenarios=[];
async function scenario(name,w,expected){w.recalculate();const dir=path.join(out,'qa');await fs.mkdir(dir,{recursive:true});await(await SpreadsheetFile.exportXlsx(w)).save(path.join(dir,`${name}.xlsx`));scenarios.push({name,expected});}
let check=makeWedding(true);
set(check.worksheets.getItem('Selections'),'D8',0);
await scenario('wedding-zero-override',check,{'Selections!E8':0,'Selections!G8':-1800,'Start!B12':2430});
check=makeWedding(true);set(check.worksheets.getItem('Selections'),'A10','Q001');
await scenario('wedding-duplicate',check,{'Selections!I8':'REVIEW','Selections!I10':'REVIEW','Start!B12':2430,'Start!B16':2});
check=makeWedding(true);const qp=check.worksheets.getItem('Payments');
rows(qp,[['P100','Q003',serial('2026-11-08'),'Refund',750,'Refund exceeds payment']],107);
await scenario('wedding-last-row-refund',check,{'Payments!G107':-750,'Selections!F9':-250,'Selections!G9':2680});
check=makeWedding(true);set(check.worksheets.getItem('Payments'),'C8',serial('2026-11-09'));
await scenario('wedding-future-payment',check,{'Payments!H8':'REVIEW','Selections!I8':'REVIEW'});
check=makeHomes(true);set(check.worksheets.getItem('Expenses'),'F8',0);set(check.worksheets.getItem('Expenses'),'F9',1);
await scenario('homes-percentage-boundaries',check,{'Expenses!G8':120,'Expenses!G9':80,'Expenses!I8':105});
check=makeHomes(true);set(check.worksheets.getItem('Handovers'),'E8',serial('2026-10-31'));
set(check.worksheets.getItem('Expenses'),'F9',1.01);
await scenario('homes-invalid-inputs',check,{'Handovers!I8':'REVIEW','Handovers!H8':'','Expenses!J9':'REVIEW','Start!B12':0});
check=makeHomes(true);rows(check.worksheets.getItem('Reimbursements'),[['P100','E001',serial('2026-11-08'),'Payment',40,'Fictional overpayment']],107);
await scenario('homes-last-row-overpayment',check,{'Reimbursements!G107':40,'Expenses!I8':-7,'Start!B15':-7});
check=makeHomes(true);set(check.worksheets.getItem('Start'),'B8',serial('2026-11-03'));
await scenario('homes-date-window',check,{'Start!B13':0,'Start!B14':0,'Start!B16':48,'Start!B12':0});
check=makeHomes(false);set(check.worksheets.getItem('Expenses'),'C8','Missing ID');set(check.worksheets.getItem('Reimbursements'),'E8',25);
await scenario('homes-partial-records',check,{'Expenses!J8':'REVIEW','Reimbursements!H8':'REVIEW','Start!B19':2});
await fs.writeFile(path.join(out,'qa','scenarios.json'),JSON.stringify(scenarios,null,2));
