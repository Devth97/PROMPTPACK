"""Read exported OpenXML independently; never authors spreadsheets."""
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET
import json, math, hashlib
OUT=Path('output/planning-products')
(OUT/'verification.json').unlink(missing_ok=True)
NS={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
def read(book):
    cells={}
    with ZipFile(book) as z:
        names=[s.attrib['name'] for s in ET.fromstring(z.read('xl/workbook.xml')).findall('s:sheets/s:sheet',NS)]
        shared=[]
        if 'xl/sharedStrings.xml' in z.namelist():
            shared=[''.join(n.itertext()) for n in ET.fromstring(z.read('xl/sharedStrings.xml'))]
        for i,name in enumerate(names,1):
            root=ET.fromstring(z.read(f'xl/worksheets/sheet{i}.xml'))
            for c in root.findall('.//s:c',NS):
                typ=c.attrib.get('t');v=c.findtext('s:v',default='',namespaces=NS)
                assert typ!='e',f'{book}: {name}!{c.attrib["r"]}: {v}'
                if typ=='s':v=shared[int(v)]
                elif typ=='inlineStr':v=''.join(c.find('s:is',NS).itertext())
                elif typ not in ['str','b'] and v!='':v=float(v)
                cells[f'{name}!{c.attrib["r"]}']=v
            assert len(root.findall('.//s:sheetViews/s:sheetView/s:pane',NS))==1,'Missing frozen header'
        assert not any(n.startswith('xl/externalLinks/') or n.endswith('vbaProject.bin') for n in z.namelist())
    return cells
def check(book,expected):
    values=read(book)
    for cell,want in expected.items():
        got=values.get(cell,'')
        assert (math.isclose(got,want,abs_tol=.001) if isinstance(want,(int,float)) else got==want),f'{book.name} {cell}: {got!r} != {want!r}'
    return len(expected)
count=0
for slug,expected in [
    ('wedding-decision-kit',{'Start!B12':12409.2,'Start!B13':2300,'Start!B14':10109.2,'Start!B15':7590.8,'Start!B16':0,'Quotes!M8':9979.2,'Quotes!M9':9396,'Selections!G8':8179.2}),
    ('two-homes-organizer',{'Start!B12':33,'Start!B13':48,'Start!B14':15,'Start!B15':33,'Start!B16':48,'Start!B17':0,'Start!B18':48,'Start!B19':0,'Handovers!H9':''})]:
    count+=check(OUT/slug/'EXAMPLE.xlsx',expected)
    count+=check(OUT/slug/'START-HERE.xlsx',{'Start!B12':0,'Start!B13':0,'Start!B14':0,'Start!B20':'Ready'})
for scenario in json.loads((OUT/'qa/scenarios.json').read_text()):
    count+=check(OUT/'qa'/f'{scenario["name"]}.xlsx',scenario['expected'])
(OUT/'verification.json').write_text(json.dumps({'status':'passed','cached_value_assertions':count,'scenario_count':9,'formula_errors':0,'native_excel_tested':False,'google_sheets_tested':False,'files':{str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in OUT.glob('*/*.xlsx')}},indent=2))
print(f'Passed {count} independent cached-value assertions; 9 boundary/error scenarios; no formula errors.')
