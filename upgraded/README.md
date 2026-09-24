# קובצי עבודה — הבאת ברכה

המסירה המסודרת נמצאת בתיקייה המקבילה **מסירה-משחקי-הבאת-ברכה**.
פתחו בתוכה את התחילו-כאן.html כדי לעבור על כל עשרת החלקים, המסמכים והטקסטים.

התיקייה הנוכחית היא סביבת העבודה. dev מכילה תבניות, הרחבות וסקריפטים לבנייה; source-review מכילה תיעוד שנשלף מן המקורות לצורך בדיקה.

סדר בנייה: dev/build-coloring-assets.py, dev/build.py, dev/collect-data.cjs, dev/build.py, dev/check.cjs ולבסוף dev/package.py ו־dev/verify-package.py. האיורים המאושרים ומקורותיהם נשמרים ב־dev/assets/a-final; פרטי התוכן ב־dev/a-final-content.json.
הבנייה משתמשת במקורות המקוריים בתיקייה הראשית ואינה משנה אותם. התוצרים אינם דורשים Node או Python באתר.

עדכון 24.9.2026: תיקוני חלק א׳ שאושרו יושמו. בדיקות המשחק נמצאות ב־dev/verify-a-final.cjs ובדיקות ההדפסה ב־dev/verify-a-print.cjs. הבדיקות רצות מול שרת מקומי בפורט 8766. פירוט הביצוע: dev/a-release.json. יתר החלקים והנושאים שטרם אושרו נשארו למעבר משותף; החלטות וביצוע נשמרים בנפרד ב־dev/final-review-decisions.json.

חלק ב׳: הנוסח הקיים נשאר עד שהמשתמשת תמסור את העריכה החדשה. שבעה איורים תוקנו ושש הפעילויות שודרגו. קוד הבנייה ב־dev/b-final-build.py, קוד הפעילויות ב־dev/b-final.js, ממשק הקריאה ב־dev/b-polish.js וההדפסה ב־dev/b-print.js. קובצי האיורים והנחיות יצירתם ב־dev/assets/b-final. פירוט השחרור והבדיקות ב־dev/b-release.json; בדיקות המשחק, הנראות וההדפסה ב־dev/verify-b-final.cjs, dev/verify-b-polish.cjs ו־dev/verify-b-print.cjs.

תיקון הדפים הלבנים: b-story.html נטען עם תיקיית b-story-pages שלצדו (40 קובצי תמונה). גם ZIP חלק ב׳ כולל את התיקייה ויש לחלץ את כל תכולתו. b-book-media.js מציג טקסט מקור אם איור אינו זמין. בדיקת 40 העמודים: dev/verify-b-media.cjs. תיעוד איורי הברית וההשראה: dev/assets/brit-update-provenance.json.
