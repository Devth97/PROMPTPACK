"""Create typographic static ads from actual reviewed tool screenshots, no synthetic testimonials."""
import argparse,json,sys,textwrap
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--screenshots',required=True);p.add_argument('--deps');args=p.parse_args()
if args.deps:sys.path.insert(0,args.deps)
from PIL import Image,ImageDraw,ImageFont,ImageOps
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'product-build/launch-wave2/ad-assets';OUT.mkdir(parents=True,exist_ok=True)
bold='C:/Windows/Fonts/arialbd.ttf';regular='C:/Windows/Fonts/arial.ttf'
def font(size,b=False):return ImageFont.truetype(bold if b else regular,size)
specs=json.loads((ROOT/'catalog/launch-products.json').read_text(encoding='utf-8'))
for spec in specs:
    bakery=spec['slug']=='bakeprice-studio'
    titles=['14 ordered.\n12 per batch.\nCost both batches.','Your time belongs\nin the quote.'] if bakery else ['A month of\nsalon content.\nA clearer brief.','Give every post\na useful\nfilming brief.']
    for variant,title in enumerate(titles,1):
        for height,aspect in [(1350,'4x5'),(1920,'9x16')]:
            im=Image.new('RGB',(1080,height),spec['light']);d=ImageDraw.Draw(im);accent=spec['color'];ink='#243539'
            d.rounded_rectangle((48,48,1032,height-48),radius=24,fill='#fffdf9',outline=ink,width=3)
            d.text((86,91),'PROMPTPACK / BUSINESS TOOLS',font=font(25,True),fill=ink)
            title_y=160 if height==1350 else 275
            d.multiline_text((86,title_y),title,font=font(68,True),fill=accent,spacing=5)
            subtitle='Offline recipe costing + printable quote' if bakery else 'English + Hinglish copy. Your own footage.'
            top=title_y+len(title.splitlines())*80+32
            d.text((86,top),subtitle,font=font(29),fill=ink)
            screenshot=Image.open(Path(args.screenshots)/('bakery-result.png' if bakery else 'salon-editor.png')).convert('RGB')
            # Crop only for this layout; this is the actual tool, not a fabricated dashboard.
            crop_height=520 if bakery else 800
            screenshot=screenshot.crop((0,0,screenshot.width,min(screenshot.height,crop_height)))
            reserve=0 if height==1350 else 230
            box=(86,top+70,994,height-298-reserve)
            fitted=ImageOps.contain(screenshot,(box[2]-box[0],box[3]-box[1]))
            x=box[0]+(box[2]-box[0]-fitted.width)//2;y=box[1]+(box[3]-box[1]-fitted.height)//2
            im.paste(fitted,(x,y));d.rectangle((x,y,x+fitted.width,y+fitted.height),outline='#cbbbaa',width=2)
            d.text((86,height-270-reserve),'Fictional example / actual toolkit screen',font=font(23),fill='#596c70')
            d.text((86,height-224-reserve),f"INR {spec['price_inr']} once",font=font(43,True),fill=accent)
            d.rounded_rectangle((86,height-150-reserve,994,height-83-reserve),radius=8,fill=accent)
            label='TRY THE FREE SAMPLE AT PROMPTPACK.TECH'
            bbox=d.textbbox((0,0),label,font=font(25,True));d.text(((1080-(bbox[2]-bbox[0]))/2,height-130-reserve),label,font=font(25,True),fill='white')
            im.save(OUT/(spec['slug']+'-v'+str(variant)+'-'+aspect+'.png'))
print('Rendered 8 PNG creative drafts: 2 products x 2 message variants x 2 aspect ratios.')
