"""Compile both explicitly authored character variants from one manuscript."""
from pathlib import Path
import json, re

def compile_manuscript(dev):
    source = json.loads((dev/'story-manuscript.json').read_text(encoding='utf8'))
    previous = json.loads((dev/'story-edit-proposal.json').read_text(encoding='utf8'))
    strip = lambda s: re.sub('[\u0591-\u05bd\u05bf-\u05c2\u05c4-\u05c7]', '', s)
    # Fully pointed Hebrew and unpointed spelling differ in a few words.
    spelling={'בידים':'בידיים','ועינים':'ועיניים','העינים':'העיניים','נתן':'ניתן','עיף':'עייף','עיפה':'עייפה'}
    def plain(s):
        return re.sub('[א-ת]+',lambda m:spelling.get(m[0],m[0]),strip(s))
    assert len(source['scenes']) == 11
    editions = []
    for gender, (key, name) in enumerate([('mendy','מֶענְדִי'),('chani','חַנִּי')]):
        def choose(value):
            if isinstance(value, list):
                assert len(value) == 2
                value = value[gender]
            value = value.replace('{name}', name)
            assert not re.search('[{}]', value), value
            return value
        edition = {k:source[k] for k in ['title','readingNote','closingActivities','revision']}
        edition.update(character=key, characterName=strip(name),
                       status='נערך מחדש לפי בקשת המשתמשת לשפה פשוטה, טבעית וברורה', scenes=[])
        for i, scene in enumerate(source['scenes']):
            n = '\n'.join(choose(line) for line in scene['lines'])
            title = scene.get('titleGirl',scene['title']) if gender else scene['title']
            assert n
            edition['scenes'].append(dict(id=i+1,pages=previous['scenes'][i]['pages'],
                title=strip(title),titleN=title,text=plain(n),n=n))
        editions.append(edition)
    def save(name, content):
        (dev/name).write_text(json.dumps(content,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    boy,girl = editions
    previous.update({k:boy[k] for k in ['title','readingNote','closingActivities','revision','status']})
    previous['subtitle']='נוסח מעודכן לקריאה משותפת'
    previous['scenes']=[{k:v for k,v in s.items() if k not in ['n','titleN']} for s in boy['scenes']]
    previous['revisionNotes']=['משפטים פשוטים, דיאלוגים טבעיים ורצף ברור בין הימים.',
        'המגדל חוזר לאורך הסיפור ומחבר את הפתיחה לסיום.',
        'כפולות עם איור מלא וטקסט בעמוד נפרד, על רקע משותף המותאם לאיור.',
        'בברית מענדי בחולצה לבנה וחני בשמלה לבנה חגיגית וצנועה.']
    previous['productionNotes']=['הטקסט חי ונגיש גם כשהאיור לא זמין, ובעמוד נפרד לצד האיור.',
        'שתי גרסאות עם התאמה מפורשת של המשפטים, הניקוד והאיורים.',
        'אין שאלות במהלך הסיפור. בסוף שלוש פעילויות קצרות: בניית מגדל, פיהוקים וחיפוש באיור.',
        '28 עמודים: כפולות במחשב, עמוד בודד בטלפון; הדפסת A4 או חוברת מקופלת.']
    save('story-edit-proposal.json',previous)
    save('story-edition-nikud.json',[dict(title=s['titleN'],text=s['n']) for s in boy['scenes']])
    save('story-chani.json',girl)

if __name__ == '__main__':
    compile_manuscript(Path(__file__).resolve().parent)
    print('Compiled 11 story scenes and end activities for Mendy and Chani.')
