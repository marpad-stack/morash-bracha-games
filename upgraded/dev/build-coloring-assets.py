"""Package generated illustrations, thumbnails and digital coloring hit regions.

Illustration content and colorization come from image_gen. This script only
normalizes dimensions, encodes thumbnails and computes application hit masks.
"""
from pathlib import Path
import json, re, shutil
import numpy as np
from PIL import Image, ImageFilter
ROOT=Path(__file__).resolve().parents[2];DEV=ROOT/'upgraded/dev';ASSETS=DEV/'assets/a-final';SOURCE=ASSETS/'source';OUT=ASSETS/'runtime';IMAGES=OUT/'images'
IMAGES.mkdir(parents=True,exist_ok=True)
config=json.loads((DEV/'a-final-content.json').read_text(encoding='utf-8'))
source_regions=ROOT/'upgraded/a-coloring/regions.js'
regions=json.loads(re.search(r'const REGIONS\s*=\s*([\s\S]+);',source_regions.read_text(encoding='utf-8'))[1])
W,H=800,1131

def components(binary):
    """4-connected components using row runs and union/find, no extra dependency."""
    parents=[0];runs=[];previous=[]
    def root(i):
        while parents[i]!=i:parents[i]=parents[parents[i]];i=parents[i]
        return i
    for y,row in enumerate(binary):
        changes=np.diff(np.r_[False,row,False].astype(np.int8));starts=np.flatnonzero(changes==1);ends=np.flatnonzero(changes==-1)
        current=[];j=0
        for x,end in zip(starts,ends):
            label=len(parents);parents.append(label)
            while j<len(previous) and previous[j][1]<=x:j+=1
            k=j
            while k<len(previous) and previous[k][0]<end:
                other=root(previous[k][2]);parents[root(label)]=other;k+=1
            current.append((int(x),int(end),label));runs.append((y,int(x),int(end),label))
        previous=current
    labels=np.zeros(binary.shape,dtype=np.int32)
    for y,x,end,label in runs:labels[y,x:end]=root(label)
    return labels

def masks(line,colored):
    ink=line.convert('L').resize((W,H),Image.Resampling.LANCZOS).filter(ImageFilter.MinFilter(3))
    labels=components(np.asarray(ink)>165);counts=np.bincount(labels.ravel());counts[0]=0
    ids=np.argsort(counts)[::-1][:254];ids=ids[counts[ids]>30]
    lookup=np.zeros(len(counts),np.uint8)
    for i,k in enumerate(ids,1):lookup[k]=i
    mask=lookup[labels]
    color=np.asarray(colored.resize((W,H),Image.Resampling.LANCZOS).convert('RGB'))
    interior=np.asarray(Image.fromarray((mask>0).astype('uint8')*255).filter(ImageFilter.MinFilter(25)))>0
    edge=set(np.r_[labels[0],labels[-1],labels[:,0],labels[:,-1]].tolist())
    candidates=[k for k in ids if k not in edge and counts[k]>1100][:28]
    entries=[];rgb=[]
    for k in candidates:
        yy,xx=np.where((labels==k)&interior)
        if not len(xx):continue
        cx,cy=np.mean(xx),np.mean(yy);index=np.argmin((xx-cx)**2+(yy-cy)**2)
        entries.append({'x':round(float(xx[index])/W,4),'y':round(float(yy[index])/H,4),'id':int(lookup[k])})
        rgb.append(np.median(color[labels==k],axis=0))
    assert len(entries)>=8,('Not enough usable color regions',len(entries))
    # Quantize region colors into a compact per-drawing palette for the game.
    palette=np.array([[248,216,180],[151,100,61],[61,91,133],[195,217,232],[228,168,183],[170,193,148],[245,232,204]],dtype=float)
    values=np.array(rgb)
    for _ in range(12):
        nearest=((values[:,None,:]-palette[None,:,:])**2).sum(2).argmin(1)
        for k in range(len(palette)):
            selected=values[nearest==k]
            if len(selected):palette[k]=selected.mean(0)
    used=sorted(set(nearest.tolist()));colors=['#'+''.join(f'{int(round(x)):02x}' for x in palette[k]) for k in used]
    for entry,k in zip(entries,nearest):entry['n']=used.index(int(k))+1
    return Image.fromarray(mask,'L').convert('RGB'),{'p':colors,'r':entries}

report=[]
for id in config['editedIds']+[p['id'] for p in config['addedPages']]:
    line_path=SOURCE/f'page{id:02}.png';color_path=SOURCE/f'color{id:02}.png'
    assert line_path.is_file() and color_path.is_file(),f'Missing generated pair {id}'
    line=Image.open(line_path).convert('RGB');color=Image.open(color_path).convert('RGB')
    line=line.resize((1200,1697),Image.Resampling.LANCZOS);color=color.resize((900,1273),Image.Resampling.LANCZOS)
    line.save(IMAGES/f'page{id:02}.png',optimize=True)
    line.resize((300,424),Image.Resampling.LANCZOS).save(IMAGES/f'thumb{id:02}.png',optimize=True)
    color.save(IMAGES/f'color{id:02}.jpg',quality=91,optimize=True)
    color.resize((300,424),Image.Resampling.LANCZOS).save(IMAGES/f'colorthumb{id:02}.jpg',quality=87,optimize=True)
    color.resize((360,509),Image.Resampling.LANCZOS).save(IMAGES/f'mem{id:02}.png',optimize=True)
    mask,data=masks(line,color);mask.save(IMAGES/f'mask{id:02}.png',optimize=True);regions[str(id)]=data
    report.append({'id':id,'colorRegions':len(data['r']),'palette':len(data['p'])})
for id in config['removedIds']:regions.pop(str(id),None)
(OUT/'regions.js').write_text('const REGIONS='+json.dumps(regions,separators=(',',':'))+';\n',encoding='utf-8')
shutil.copy2(DEV/'a-final-clues.json',OUT/'clues.json')
(ASSETS/'asset-audit.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
