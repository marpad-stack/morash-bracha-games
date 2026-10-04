---
name: bracha-qa
description: צוות הבדיקה של עשרת חלקי "הבאת ברכה" (משחקי שפרה ופועה של מורה שמיים). השתמש בסקיל הזה בכל בקשה לבדוק, לוודא שהכל עובד, לעבור על המשחקים, QA, בדיקה סופית, מה נשאר לפני פרסום, נגישות, עיצוב, תוכן, ניקוד, הערות בקרת תוכן, או הכנה להעלאה לאתר — גם אם המילה "בדיקה" לא נאמרת במפורש. מכיל סקריפטים דטרמיניסטיים, צ'קליסטים לכל סוג בדיקה, פורמט ממצא אחיד ומחולל דוח.
---

# bracha-qa — איך עובדים

הרעיון: **הבדיקות המכניות בסקריפטים (חינם, חוזרות, אמינות); השיפוט בסוכנים; ההכרעה באדם.**
קרא את `CLAUDE.md` בשורש המאגר לפני הכול.

## 1. הכנה (פעם אחת במחשב)
```
npm i -D playwright axe-core && npx playwright install chromium   # או BROWSER_CHANNEL=msedge לשימוש ב-Edge קיים
```

## 2. הרצה
```
python -m http.server 8765 --bind 127.0.0.1          # מהתיקייה הראשית, בטרמינל נפרד
node .claude/skills/bracha-qa/scripts/smoke.cjs      # תפקוד (--part=a,b לחלקים נבחרים, --deep לצילומי מסך פנימיים)
node .claude/skills/bracha-qa/scripts/axe.cjs        # נגישות + משקל
python .claude/skills/bracha-qa/scripts/inventory.py # מלאי סטטי + ממצאים אוטומטיים
python .claude/skills/bracha-qa/scripts/notes-table.py
python .claude/skills/bracha-qa/scripts/report.py    # qa/דוח-בדיקות.html
```
ב-Claude Code: `/qa` מריץ הכול במקביל דרך `qa-orchestrator`; `/qa-part ז` לחלק אחד.

## 3. פורמט הממצא האחיד
כל סוכן כותב `qa/out/qa-<שם>.json`:
```json
{"agent":"qa-design","run":"2026-09-30T10:00:00","findings":[
 {"id":"D-001","part":"e","severity":"yellow","type":"מגע","title":"כפתורי רמה נמוכים מ-44px","location":"מסך פתיחה, 390px","evidence":"37px · qa/out/e-390.png","proposal":"להגדיל padding","owner":"קוד","status":"open"}]}
```
- `severity`: red (חוסם פרסום) / yellow (לתקן לפני פרסום, לא חוסם) / info (לידיעה).
- `owner`: קוד / כותבת / רב / בדיקה מקצועית / עורכת לשון / מרפד / אנושי-טלפון.
- `part`: a–j, L (דף הבאת ברכה), all.
- ציטוט תוכן — עד 15 מילים. תמיד מיקום מדויק. תמיד הצעה.

## 4. הצ'קליסטים (references/)
- `checklist-functional.md` — מסלול מלא לכל חלק, שמירה, הדפסה, הורדות, iframe, ללא אינטרנט.
- `checklist-design.md` — RTL, מותג, טיפוגרפיה וניקוד, פריסה, מגע, איורים, מצבים, הדפסה.
- `checklist-content.md` — עברית, עקביות, גיל, יהדות וחב"ד, קהל, עובדות, רגישות, קרדיטים.
- `checklist-a11y.md` — WCAG 2.0 AA / ת"י 5568.
- `checklist-release.md` — ניקוי, אריזה, שילוב באתר, פרטיות, משפט.
- `checklist-phone.md` — מה רק אדם בטלפון פיזי יכול לבדוק (8 שורות לכל חלק).
- `definition-of-done.md` — מתי הפרויקט גמור.

## 5. עקרונות
- אין "כנראה תוקן". תוקן = הורץ ואומת, עם הוכחה (קובץ/צילום/מספר).
- חסימות סביבה (Google Fonts חסום, morash.co.il לא נגיש) אינן ממצאים — מסננים ומציינים.
- חוזרים על ריצה קודמת? השוו ל-`qa/out` הקודם: נסגר / חדש / חוזר.
- הסוכנים לא משנים תוכן ולא מוחקים קבצים. תיקוני קוד — רק כשמרפד ביקשה, ואז גם ה-ZIP המתאים ב-`אריזות/` מתעדכן.
