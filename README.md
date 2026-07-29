# Blackjack Trainer 1.1

פרויקט עצמאי למשחק ואימון בלאק ג׳ק בדפדפן.

## הפעלה ב-Windows

1. חלצו את קובץ ה-ZIP לתיקייה רגילה.
2. פתחו את `index.html` באמצעות Chrome או Microsoft Edge.
3. אין צורך בהתקנה או בחיבור לאינטרנט.

אפשר גם ללחוץ פעמיים על `Start Blackjack Trainer.bat`.

## מה כלול

- תצוגה לרוחב ומותאמת גם למסכים צרים.
- משחק ENHC עם 5 חפיסות כברירת מחדל.
- S17 ו-Late Surrender.
- המלצת Basic Strategy לפי סימון המשתמש.
- סיכויי ניצחון לפי היד המוצגת וקלף הדילר בלבד.
- אנימציית פתיחת קלפים עם גב אדום.
- ערבוב אוטומטי כאשר נשארים 130 קלפים.
- הודעה גדולה: "החפיסות עורבבו".
- שמירה וטעינה דרך הדפדפן.
- ספירת קלפים Hi-Lo בזמן אמת.
- Running Count ו-True Count לפי מספר החפיסות שנותרו.
- איפוס אוטומטי של הספירה בכל ערבוב נעל.

## מבנה הפרויקט

- `index.html` — מבנה המסך.
- `style.css` — העיצוב והאנימציות.
- `app.js` — מנוע המשחק, ההמלצות והחישובים.
- `Start Blackjack Trainer.bat` — פתיחה מהירה ב-Windows.

## הערה

נתוני השמירה נשמרים ב-localStorage של הדפדפן שבו פתחתם את המשחק.


## ספירת קלפים Hi-Lo

- קלפים 2–6 מוסיפים `+1`.
- קלפים 7–9 אינם משנים את הספירה.
- קלפים 10, J, Q, K ו-A מורידים `-1`.
- **Running Count** הוא הסכום המצטבר מאז הערבוב האחרון.
- **True Count** הוא ה-Running Count חלקי מספר החפיסות המשוער שנותרו בנעל.
- הספירה מתעדכנת רק לאחר שהקלף נפתח ונראה על המסך.


## ספירת קלפים Hi-Lo
הספירה מוסתרת כברירת מחדל. כדי להציג Running Count, True Count ומספר חפיסות שנותרו, סמן במשחק את האפשרות **הפעל ספירת קלפים Hi-Lo**. הבחירה נשמרת בדפדפן.


## גרסה 1.3 — Cut Card אופציונלי
- נוספה אפשרות **בטל Cut Card**.
- כאשר האפשרות כבויה: ערבוב מתבצע ב־130 קלפים שנותרו.
- כאשר האפשרות מסומנת: המשחק ממשיך עד שהנעל נגמרת ורק אז מערבב.
- Running Count ו־True Count מתאפסים בעת ערבוב.
- הבחירה נשמרת בדפדפן.


## מבנה הקוד בגרסה 1.4

- `js/core.js` – מרחב השמות ומחלקת המשחק.
- `js/shoe.js` – הנעל, ערכי קלפים וספירת Hi-Lo.
- `js/strategy.js` – המלצות Basic Strategy.
- `js/odds.js` – סימולציית סיכויים ו-EV.
- `js/engine.js` – מהלך הסיבוב ופעולות השחקן.
- `js/ui.js` – ציור המסך, הקלפים וההיסטוריה.
- `js/storage.js` – שמירה וטעינה.
- `js/main.js` – חיבור הכפתורים והפעלת המשחק.

גרסה זו גם מתקנת את זיהוי ה-Surrender כך שלא יוצע על יד רכה, לדוגמה A,4 מול 10.

## Strategy table (v1.4.1)

The recommendation engine now reads explicit data tables in `js/strategy.js`:

- `BJ.STRATEGY.hard`
- `BJ.STRATEGY.soft`
- `BJ.STRATEGY.pairs`
- `BJ.STRATEGY.surrender`

Rule profile: 5 decks, ENHC/no-hole-card, dealer stands on soft 17, double after split, up to four hands. This makes future rule profiles and automated tests easier to add without rewriting the game engine.


## Version 1.4.2 — Engine classification

- Added a single `classifyHand()` source of truth in `engine.js`.
- Classification order is Pair → Soft → Hard.
- `strategy.js` now consults that classification before surrender, pair or normal-hand tables.
- Added startup self-tests for A,4, A,5, hard 15 and representative pairs.
- Verified A,5 versus dealer 10 returns Hit and cannot return Surrender.

## Strategy Tester
פתחו את `strategy-tester.html`, או לחצו במשחק על **פתח Strategy Tester**. המסך משווה את טבלאות האסטרטגיה מול snapshot עצמאי ומריץ גם בדיקות חיבור של מנוע ההמלצות.

## Version 1.4.4 — Automated Self-Tests
בכל פתיחת המשחק נטען `js/automated-tests.js` ומריץ בדיקות עצמאיות לפני תחילת המשחק. חיווי ירוק פירושו שכל הבדיקות עברו; חיווי אדום פותח את דוח הכשלים. תוצאות אחרונות נשמרות תחת `bjLastSelfTestReport` ב-localStorage ונרשמות גם ב-Developer Console.

### סכום הדילר בזמן אמת
כאשר הדילר מתחיל למשוך קלפים, הסכום ליד הכותרת שלו מתעדכן אחרי כל פתיחת קלף. לפני תור הדילר מוצג רק ערך הקלף הגלוי.

## מצב Game / Trainer
בפתיחת האפליקציה בוחרים Game Start למשחק אקראי רגיל, או Trainer למשחק מלא שבו החלוקה הראשונית מסוננת לפי Double, Split, Surrender, Soft Hands או Hard Hands. Mixed מסמן את כל המסננים. אין שאלות ואין רמת עוצמה.


## Split Trainer — סדר קבוע
כאשר מסומן רק Split, ידי השחקן מחולקות בסדר קבוע: A,A, אחר כך 2,2 ועד 10,10, ואז המחזור מתחיל מחדש. קלף הדילר בלבד אקראי. שאר מצבי האימון לא השתנו.

### ערבוב אוטומטי במצב Trainer
אם הנעל הנוכחית כבר לא מכילה שילוב שמתאים למסנן האימון, המשחק יערבב נעל חדשה אוטומטית וימשיך. הבנק, הסטטיסטיקות ורצף ה-Split אינם מתאפסים.

### בדיקות מערכת
הבדיקות האוטומטיות רצות ברקע ואינן מוצגות כאשר הכול תקין. במקרה של כשל תופיע התראה בצד המסך עם אפשרות להציג את פרטי הבדיקה שנכשלה.


## Version 1.5.5
The recommendation is displayed beside the active player hand total instead of inside the general message panel.


## גרסה 1.5.7 — סטטיסטיקות אנכיות

התצוגה כוללת בנק, רווח/הפסד, ידיים, ניצחונות, הפסדים ותיקו. אין Win Rate, Blackjacks או Busts בתצוגה.


## גרסה 1.5.7
- הסטטיסטיקות הועברו לשורה אופקית בחלק העליון.
- במסכים בינוניים הן נשברות ל-4 עמודות ובטלפון ל-2 עמודות, ללא עמודה אנכית ארוכה.
- מנוע המשחק והנתונים לא השתנו.
