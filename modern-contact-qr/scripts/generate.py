#!/usr/bin/env python3
"""Render supplied vCards as rounded, locally generated QR codes."""
from pathlib import Path
import argparse
import re
import zipfile
import qrcode
import zxingcpp
from PIL import Image, ImageDraw

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('vcards', nargs='+', type=Path)
parser.add_argument('--output', required=True, type=Path)
parser.add_argument('--color', default='#1D5043', help='Dark foreground hex color on white')
args=parser.parse_args()
color=args.color
if not re.fullmatch(r'#[0-9a-fA-F]{6}',color):
    parser.error('--color must be a six-digit hex color')
channels=[int(color[i:i+2],16)/255 for i in (1,3,5)]
linear=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in channels]
luminance=sum(v*w for v,w in zip(linear,(.2126,.7152,.0722)))
if 1.05/(luminance+.05)<7:
    parser.error('Choose a darker foreground (at least 7:1 contrast on white)')
if len({p.stem for p in args.vcards}) != len(args.vcards):
    parser.error('Input filenames must have unique stems')
out=args.output
out.mkdir(parents=True,exist_ok=True)
files=[]
for source in args.vcards:
    name=source.stem
    payload=source.read_bytes().decode('utf-8-sig')
    lines=payload.splitlines()
    if lines.count('BEGIN:VCARD')!=1 or lines.count('END:VCARD')!=1 or 'VERSION:3.0' not in lines:
        parser.error(f'{source}: supply exactly one vCard 3.0 contact per file')
    for ext in ('png','svg'):
        if (out/f'{name}-modern-qr.{ext}').exists():
            parser.error(f'Output for {name} already exists; choose a fresh output folder')
    qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,border=0)
    qr.add_data(payload); qr.make(fit=True); matrix=qr.get_matrix(); n=len(matrix); unit=20; size=(n+8)*unit
    im=Image.new('RGB',(size,size),'white'); d=ImageDraw.Draw(im)
    svg=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}"><rect width="100%" height="100%" fill="white"/>']
    eyes=[(0,0),(n-7,0),(0,n-7)]
    for y,row in enumerate(matrix):
        for x,on in enumerate(row):
            if not on or any(ex<=x<ex+7 and ey<=y<ey+7 for ex,ey in eyes): continue
            cx=(x+4.5)*unit; cy=(y+4.5)*unit; r=9.3
            d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=color)
            svg.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{color}"/>')
    for ex,ey in eyes:
        for inset,width,radius,fill in [(0,7,24,color),(1,5,14,'white'),(2,3,10,color)]:
            x=(ex+4+inset)*unit; y=(ey+4+inset)*unit; w=width*unit
            d.rounded_rectangle((x,y,x+w-1,y+w-1),radius,fill=fill)
            svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{w}" rx="{radius}" fill="{fill}"/>')
    svg.append('</svg>')
    png=out/f'{name}-modern-qr.png'; vector=out/f'{name}-modern-qr.svg'; im.save(png); vector.write_text(''.join(svg))
    for test_size in [size,600,400]:
        result=zxingcpp.read_barcode(im.resize((test_size,test_size),Image.Resampling.LANCZOS))
        if not result or result.text != payload:
            raise RuntimeError(f"QR decode failed for {name} at {test_size}px")
    print(name,'verified at full size, 600px and 400px')
    files.extend([png,vector])
archive=out/'modern-contact-qr-codes.zip'
if archive.exists():
    parser.error('Archive already exists; choose a fresh output folder')
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as bundle:
    for path in files:
        bundle.write(path,path.name)
    for source in args.vcards:
        bundle.write(source,source.name)
print(f'Created {archive}')
