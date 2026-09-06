"""Build Vera's editable vector identity and optically adjusted PNG exports."""
from pathlib import Path
import io
import json
import hashlib
import shutil
import cairosvg
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'brand/free-window-rounded-glass-hardlight'
OUT.mkdir(parents=True,exist_ok=True)
FONT=ROOT/'brand/fonts/Sora.ttf'
ZH=ROOT/'brand/fonts/NotoSansSC.ttf'

def svg(layout='B',small=False,mono=None):
    shapes={
        'A':[(76,76,270,238,40),(366,100,70,214,25),(100,338,336,98,30)],
        'B':[(76,76,238,238,42),(338,100,98,214,32),(100,338,336,98,32)],
        'C':[(76,76,238,360,42),(338,100,98,140,32),(338,264,98,172,32)],
    }[layout]
    if small:shapes=[(72,72,240,240,40),(344,104,96,208,28),(104,344,336,96,28)]
    defs='''<defs>
<linearGradient id="body" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#69B5A5"/><stop offset=".42" stop-color="#347F71"/><stop offset="1" stop-color="#174C45"/></linearGradient>
<linearGradient id="window" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#F4FCF6"/><stop offset=".45" stop-color="#C7F0E5"/><stop offset="1" stop-color="#A7E7DE"/></linearGradient>
<linearGradient id="side" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#A7E7DE"/><stop offset="1" stop-color="#58B8A7"/></linearGradient>
<linearGradient id="lower" x1="0" y1="0" x2="1" y2=".4"><stop stop-color="#71C9B6"/><stop offset="1" stop-color="#B6E9DC"/></linearGradient>
<radialGradient id="light" cx=".16" cy=".04" r=".9"><stop stop-color="#F8FFF3" stop-opacity=".20"/><stop offset="1" stop-color="#F8FFF3" stop-opacity="0"/></radialGradient>
<clipPath id="tile"><rect x="8" y="8" width="496" height="496" rx="112"/></clipPath>
<linearGradient id="bevel" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#E6FFF2" stop-opacity=".75"/><stop offset=".45" stop-color="#A7E7DE" stop-opacity=".08"/><stop offset="1" stop-color="#062E28" stop-opacity=".65"/></linearGradient>
<linearGradient id="glass" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#F1FFF6" stop-opacity=".92"/><stop offset=".3" stop-color="#C8F6E9" stop-opacity=".68"/><stop offset=".7" stop-color="#73CEBB" stop-opacity=".5"/><stop offset="1" stop-color="#B8F5E5" stop-opacity=".82"/></linearGradient>
<linearGradient id="reflection" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FFFFFF" stop-opacity=".5"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
<radialGradient id="softReflection" cx=".23" cy=".04" r=".94"><stop stop-color="#F6FFF9" stop-opacity=".6"/><stop offset=".55" stop-color="#E8FFF5" stop-opacity=".1"/><stop offset="1" stop-color="#D0FFF0" stop-opacity="0"/></radialGradient>
</defs>'''
    if mono:
        # A single ink silhouette with transparent module-shaped apertures.
        contours='M120 8 H392 Q504 8 504 120 V392 Q504 504 392 504 H120 Q8 504 8 392 V120 Q8 8 120 8 Z '
        for x,y,w,h,r in shapes:
            contours+=f'M{x+r} {y} H{x+w-r} Q{x+w} {y} {x+w} {y+r} V{y+h-r} Q{x+w} {y+h} {x+w-r} {y+h} H{x+r} Q{x} {y+h} {x} {y+h-r} V{y+r} Q{x} {y} {x+r} {y} Z '
        content=f'<path fill="{mono}" fill-rule="evenodd" d="{contours}"/>'
    else:
        content='<rect x="8" y="8" width="496" height="496" rx="112" fill="url(#body)"/>'
        if not small:content+='<rect x="11" y="11" width="490" height="490" rx="109" fill="none" stroke="url(#bevel)" stroke-width="5"/>'
        content+='<g clip-path="url(#tile)">'
        for i,(x,y,w,h,r) in enumerate(shapes):
            if not small:
                # Soft contact shadow and a continuous quarter-round bevel profile.
                # Contours follow all four edges; no offset slab or straight lower extrusion.
                for spread in range(10,0,-1):
                    content+=f'<rect x="{x-spread*.5}" y="{y+4-spread*.3}" width="{w+spread}" height="{h+spread*.8}" rx="{r+spread*.5}" fill="#092D25" opacity=".018"/>'
                for step in range(28):
                    import math
                    t=step/27
                    inset=8*(1-math.cos(t*math.pi/2))
                    light=math.sin(t*math.pi/2)
                    top=tuple(round(a+(b-a)*light) for a,b in zip((121,192,170),(224,252,239)))
                    bottom=tuple(round(a+(b-a)*light) for a,b in zip((36,98,79),(124,208,181)))
                    def hx(rgb):return '#'+''.join(f'{c:02x}' for c in rgb)
                    gid=f'round{i}_{step}'
                    content+=f'<defs><linearGradient id="{gid}" x1=".1" y1="0" x2=".7" y2="1"><stop stop-color="{hx(top)}"/><stop offset="1" stop-color="{hx(bottom)}"/></linearGradient></defs>'
                    content+=f'<rect x="{x-3+inset}" y="{y-3+inset}" width="{w+6-2*inset}" height="{h+9-2*inset}" rx="{r+3-inset}" fill="url(#{gid})"/>'
                x,y,w,h,r=x+5,y+5,w-10,h-10,r-5
            fill=['#D3F4E9','#8AD5C5','#9CDECB'][i] if small else 'url(#glass)'
            content+=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"/>'
            if not small:
                content+=f'<clipPath id="pane{i}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}"/></clipPath>'
                content+=f'<path clip-path="url(#pane{i})" d="M{x} {y} H{x+w} V{y+h*.18} Q{x+w*.55} {y+h*.6} {x} {y+h*.5} Z" fill="url(#reflection)"/>'
        if not small:content+='<rect x="8" y="8" width="496" height="496" rx="112" fill="url(#light)"/>'
        content+='</g>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="Vera — free window"><title>Vera — free window</title>{defs}{content}</svg>'

def png(source,size):
    return Image.open(io.BytesIO(cairosvg.svg2png(bytestring=source.encode(),output_width=size*3,output_height=size*3))).convert('RGBA').resize((size,size),Image.Resampling.LANCZOS)

def font(size,zh=False):
    f=ImageFont.truetype(str(ZH if zh else FONT),size)
    f.set_variation_by_axes([500])
    return f

def make_drafts():
    board=Image.new('RGB',(1500,1000),'#F5F2EA');d=ImageDraw.Draw(board)
    d.text((62,35),'vera / free window',font=font(38),fill='#245C55')
    labels=['A / 主窗口','B / 模块拼接','C / 负空间']
    for i,key in enumerate('ABC'):
        source=svg(key);(OUT/f'draft-{key}.svg').write_text(source,encoding='utf-8')
        x=i*500
        d.text((x+62,113),labels[i],font=font(23,True),fill='#245C55')
        board.paste(png(source,250),(x+125,170),png(source,250))
        d.rounded_rectangle((x+45,470,x+455,890),radius=22,fill='#17201D')
        board.paste(png(source,192),(x+154,515),png(source,192))
        for j,size in enumerate([16,32,48]):
            im=png(svg(key),size);board.paste(im,(x+95+j*110,785),im)
            d.text((x+88+j*110,846),str(size)+'px',font=font(15),fill='#BFCFC5')
    board.save(OUT/'draft-comparison.png')

def export():
    for name,source in [('logo',svg()),('logo-small',svg(small=True)),('logo-mono-dark',svg(mono='#245C55')),('logo-mono-light',svg(mono='#F5F2EA'))]:
        (OUT/(name+'.svg')).write_text(source,encoding='utf-8')
        if 'mono' in name:png(source,1024).save(OUT/(name+'.png'))
    for size in [16,32,48,128,256,512,1024]:png(svg(small=size<=32),size).save(OUT/f'logo-{size}.png')
    for theme,bg in [('light','#F5F2EA'),('dark','#17201D')]:
        canvas=Image.new('RGB',(1200,630),bg);im=png(svg(),300);canvas.paste(im,(95,165),im)
        d=ImageDraw.Draw(canvas);d.text((459,211),'vera',font=font(148),fill='#245C55' if theme=='light' else '#E5F4EB')
        canvas.save(OUT/f'lockup-{theme}.png')
    board=Image.new('RGB',(1500,940),'#F5F2EA');d=ImageDraw.Draw(board)
    d.text((55,35),'vera / free window',font=font(40),fill='#245C55')
    for i,bg in enumerate(['#F5F2EA','#17201D','#6C8C84']):
        x=i*500;d.rounded_rectangle((x+35,130,x+465,590),radius=30,fill=bg,outline='#AABEB1',width=1)
        im=png(svg(),240);board.paste(im,(x+130,200),im)
        # Synthetic wallpaper test: contrast at a boundary of pale sky and dark forest.
        if i==2:
            d.polygon([(1036,425),(1200,500),(1360,445),(1464,530),(1464,588),(1036,588)],fill='#254C45')
        for j,size in enumerate([16,32,48]):
            im=png(svg(small=size<=32),size);board.paste(im,(x+90+j*115,515),im)
    d.text((58,643),'Optical sizes / 16 · 32 · 48 · 128',font=font(25),fill='#245C55')
    for j,size in enumerate([16,32,48,128]):
        im=png(svg(small=size<=32),size);board.paste(im,(70+j*190,730),im)
    for j,color in enumerate(['#245C55','#879C90']):
        im=png(svg(mono=color),128);board.paste(im,(1060+j*190,730),im)
    board.save(OUT/'brand-preview.png')

def install():
    archive=ROOT/'brand/archive/pre-free-window'
    archive.mkdir(parents=True,exist_ok=True)
    hashes={}
    for size in [16,48,128]:
        p=ROOT/f'icons/icon{size}.png';saved=archive/p.name
        if not saved.exists():shutil.copy2(p,saved)
        hashes[p.name]=hashlib.sha256(saved.read_bytes()).hexdigest()
        shutil.copy2(OUT/f'logo-{size}.png',p)
    (archive/'sha256.json').write_text(json.dumps(hashes,indent=2)+'\n',encoding='utf-8')
    shutil.copy2(OUT/'logo.svg',ROOT/'icons/logo.svg')

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('--install',action='store_true');args=p.parse_args()
    make_drafts();export()
    if args.install:install()
    print(OUT)
