# קובצי עבודה — הבאת ברכה

המסירה המסודרת נמצאת בתיקייה המקבילה **מסירה-משחקי-הבאת-ברכה**.
פתחו בתוכה את התחילו-כאן.html כדי לעבור על כל עשרת החלקים, המסמכים והטקסטים.

התיקייה הנוכחית היא סביבת העבודה. dev מכילה תבניות, הרחבות וסקריפטים לבנייה; source-review מכילה תיעוד שנשלף מן המקורות לצורך בדיקה.

סדר בנייה: dev/build-coloring-assets.py, dev/build.py, dev/collect-data.cjs, dev/build.py, dev/check.cjs ולבסוף dev/package.py ו־dev/verify-package.py. האיורים המאושרים ומקורותיהם נשמרים ב־dev/assets/a-final; פרטי התוכן ב־dev/a-final-content.json.
הבנייה משתמשת במקורות המקוריים בתיקייה הראשית ואינה משנה אותם. התוצרים אינם דורשים Node או Python באתר.

עדכון 24.9.2026: תיקוני חלק א׳ שאושרו יושמו. בדיקות המשחק נמצאות ב־dev/verify-a-final.cjs ובדיקות ההדפסה ב־dev/verify-a-print.cjs. הבדיקות רצות מול שרת מקומי בפורט 8766. פירוט הביצוע: dev/a-release.json. יתר החלקים והנושאים שטרם אושרו נשארו למעבר משותף; החלטות וביצוע נשמרים בנפרד ב־dev/final-review-decisions.json.

חלק ב׳: הנוסח המוצע אושר ושולב כספר בן 28 עמודים, בגרסאות מענדי וחני. הטקסט המנוקד נפרד מהאיורים. תצוגת כפולות RTL במחשב, עמוד אחד בטלפון, 11 עצירות הקראה ושתי אפשרויות הדפסה (A4 מלא או קיפול A4). הסקריפטים b-edition-build.py, b-edition.js, b-edition.css ו־b-edition-print.js בונים את המהדורה. מקור הטקסט: story-edit-proposal.json, story-edition-nikud.json ו־story-chani.json. איורים והנחיות: dev/assets/story-edition. קוד המשחקים המשותפים נשאר ב־b-final.js וב־b-polish.js.

התמונות הנוכחיות נטענות מ־b-story-art; מקור 40 עמודי הספר נשמר ב־b-story-pages לתיעוד ותאימות בלבד. חבילת ZIP מכילה את שתי התיקיות ואת b-story.html, כולל נתוני התמונות לשימוש ללא אינטרנט. בדיקות המהדורה: verify-b-edition.cjs ו־verify-b-variants.cjs. דוחות בדיקה ישנים מתעדים את המהדורה הקודמת.
