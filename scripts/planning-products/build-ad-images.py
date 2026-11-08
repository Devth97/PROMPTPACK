from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont, ImageOps
OUT=Path('output/planning-products'); ADS=OUT/'ad-assets';ADS.mkdir(exist_ok=True)
FONT=Path('C:/Windows/Fonts')
def font(size,bold=False):return ImageFont.truetype(str(FONT/('arialbd.ttf' if bold else 'arial.ttf')),size)
def text_wrap(draw,text,f,maxwidth):
    lines=['']
    for word in text.split():
        if draw.textlength((lines[-1]+' '+word).strip(),font=f)>maxwidth:lines.append(word)
        else:lines[-1]=(lines[-1]+' '+word).strip()
    return lines
specs=[
 ('wedding-decision-kit','full-quote','Compare the full wedding quote.','Guest costs. Extras. Fees. One clear comparison.','quotes'),
 ('wedding-decision-kit','balance','What is still left to pay?','Track deposits and refunds without losing the agreed total.','start'),
 ('two-homes-organizer','practical','Two homes. One practical organizer.','Handovers, factual notes, expenses and contacts.','start'),
 ('two-homes-organizer','expenses','Make the expense split clear.','Record an existing split, reimbursements and refunds.','expenses')]
for slug,concept,title,sub,sheet in specs:
    im=Image.new('RGB',(1080,1350),'#FFFBF2');d=ImageDraw.Draw(im)
    d.rectangle((0,0,1080,18),fill='#243D37');d.text((64,60),'PROMPTPACK  /  EXCEL + PDF',font=font(24,True),fill='#243D37')
    y=132
    for line in text_wrap(d,title,font(64,True),940):d.text((64,y),line,font=font(64,True),fill='#101416');y+=76
    y+=20
    for line in text_wrap(d,sub,font(30),940):d.text((64,y),line,font=font(30),fill='#243D37');y+=42
    src=Image.open(OUT/slug/f'preview-{sheet}.png').convert('RGB')
    if sheet=='start':src=src.crop((0,180,src.width,min(src.height,800)))
    # Show a real, clearly labelled excerpt rather than a fabricated dashboard.
    else:src=src.crop((0,0,min(src.width,1650),min(src.height,420)))
    card=ImageOps.contain(src,(944,510));box_y=max(y+40,480)
    d.rectangle((60,box_y-4,1020,box_y+518),fill='#DCEBE4',outline='#243D37',width=3)
    im.paste(card,(68,box_y+8));d=ImageDraw.Draw(im)
    d.text((64,1040),'ACTUAL WORKBOOK EXCERPT / FICTIONAL DATA',font=font(20,True),fill='#243D37')
    d.text((64,1100),'Blank + example files. Practical PDF guide.',font=font(29),fill='#243D37')
    if slug=='two-homes-organizer':d.text((64,1150),'Personal organization. Not legal advice.',font=font(24),fill='#243D37')
    d.rectangle((64,1220,1016,1290),fill='#FFE14D',outline='#101416',width=3)
    d.text((90,1235),'$49 USD  /  ONE PAYMENT',font=font(32,True),fill='#101416')
    im.save(ADS/f'{slug}-{concept}.png',optimize=True)
print('Created four original static ad drafts from actual fictional workbook previews.')
