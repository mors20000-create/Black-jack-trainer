# 1.5.8.1 — Game Entry Fixed

- תוקנה תקלה שמנעה כניסה ל-Game Start לאחר הסרת Blackjacks ו-Busts מהתצוגה.
- נוספה הגנה מפני רכיבי סטטיסטיקה חסרים.
- נוספה גרסת cache-busting לקובצי CSS ו-JavaScript כדי ש-GitHub Pages ואייפון יטענו את הקוד החדש.

# 1.5.8 — Simplified Statistics

- הוסרו Blackjacks ו-Busts משורת הסטטיסטיקות העליונה.
- נשארו רק Bank, Profit/Loss, Hands, Wins, Losses ו-Pushes.
- הסטטיסטיקות הפנימיות של Blackjacks ו-Busts נשמרו במנוע לצורכי תאימות, אך אינן מוצגות למשתמש.
- לא בוצעו שינויים בחוקי המשחק או במצב Trainer.

# 1.5.7 — Horizontal Statistics

- הועברו Bank, Profit/Loss, Hands, Wins, Losses, Pushes, Blackjacks ו-Busts לשורה מאוזנת בחלק העליון.
- נשמרה התאמה למסכי מחשב ואייפון באמצעות שבירה ל-4 או 2 עמודות לפי רוחב המסך.
- לא בוצעו שינויים במנוע המשחק.

# Version 1.5.6 — Vertical Statistics

- Removed Win Rate / accuracy from the visible statistics.
- Added vertical statistics: Bank, Profit/Loss, Hands, Wins, Losses, Pushes, Blackjacks and Busts.
- Added persistent counters for pushes, natural blackjacks and player busts.
- Added migration support for older saved games.
- Kept the existing game layout and all trainer features unchanged.

# 1.5.5 — Hint by Player Total

- Moved the recommendation from the side message panel to the active player hand total.
- The recommendation remains visible only when “הצג המלצה” is enabled.
- No change to strategy, game rules, or other interface elements.

# Changelog

## 1.5.3 — Trainer Auto Reshuffle
- במצב Trainer, אם אין בנעל שילוב קלפים שמתאים למסנן שנבחר, המשחק מערבב אוטומטית נעל חדשה ומנסה שוב.
- הבנק, הסטטיסטיקות, ההיסטוריה והמיקום ברצף Split נשמרים לאחר הערבוב.
- הודעת „החפיסות עורבבו” מוצגת גם בערבוב שנגרם מחוסר אפשרויות מתאימות.

## 1.5.2 — Split Trainer Sequential Pairs
- שינוי ממוקד ב-Split Trainer בלבד.
- זוגות השחקן מופיעים בסדר: A,A → 2,2 → 3,3 → 4,4 → 5,5 → 6,6 → 7,7 → 8,8 → 9,9 → 10,10.
- לאחר 10,10 המחזור חוזר ל-A,A.
- קלף הדילר נשאר אקראי בכל יד.
- Double, Surrender, Soft, Hard, Mixed ו-Game Start נשארו ללא שינוי.

# Changelog

## 1.4.1 — Official Strategy Table

- Replaced the long conditional strategy chain with explicit Hard, Soft, Pair and Surrender tables.
- Set the table profile to 5 decks, ENHC, S17 and DAS.
- Corrected ENHC-sensitive plays, including hard 11 vs 10/A and pair 8,8 vs 10/A.
- Prevented surrender from being applied to soft hands, fixing A,4 vs 10.
- Added correct fallback actions when Double, Split or Surrender are unavailable.
- Exposed the strategy data as `BJ.STRATEGY` for future trainer and test modules.


## 1.4.2
- Fixed centralized hand classification in `engine.js`.
- Prevented soft hands from entering hard-hand surrender logic.
- Added automatic classification self-tests.
- Confirmed A,4 vs 10 and A,5 vs 10 recommend Hit.

## 1.4.3 — Strategy Tester
- נוסף מסך `strategy-tester.html` לבדיקת כל טבלאות Basic Strategy.
- 400+ בדיקות לטבלאות Hard, Soft, Pairs ו-Surrender.
- נוספו בדיקות Integration למצבים קריטיים כגון A,4/A,5 מול 10.
- נוספו בדיקות fallback כאשר Double או Split אינם זמינים.
- סינון וחיפוש של תוצאות והדגשה ברורה של תקלות.

## 1.4.4 — Automated Self-Tests
- נוספה חבילת בדיקות אוטומטית שרצה בכל פתיחת משחק.
- נבדקים מבנה הטבלאות, 400+ תאי אסטרטגיה, סיווג Hard/Soft/Pair, כללי Surrender, תרחישי Integration ופעולות fallback.
- נוסף חיווי ירוק/אדום במסך הראשי עם מספר הבדיקות שעברו.
- כשל נשמר ב-localStorage ונרשם ב-Console עם פירוט מלא.
- Strategy Tester משתמש כעת באותה חבילת בדיקות כדי למנוע כפילות בין בדיקות ידניות ואוטומטיות.

## 1.4.5 — Dealer Live Total
- סכום הדילר מתעדכן מיד לאחר שכל קלף חדש נפתח.
- מוצג Soft כאשר האס עדיין נספר כ־11.
- אם הדילר עובר 21, מוצג Bust לצד הסכום.
- בזמן החלטות השחקן עדיין מוצג רק ערך הקלף הגלוי של הדילר.

## 1.5.1 — Game / Trainer Hand Filters
- נוסף מסך פתיחה לפני שולחן המשחק עם שתי בחירות: Game Start או Trainer.
- Trainer נשאר משחק מלא, ולא מצב שאלות.
- נוספו מסננים: Double, Split, Surrender, Soft Hands, Hard Hands ו-Mixed.
- כל חלוקה ראשונית ב-Trainer מתאימה לפחות לאחד המסננים שנבחרו.
- אחרי החלוקה הראשונה, כל המשיכות והדילר פועלים כרגיל מהנעל.
- אין מחוון עוצמה; כל יד ב-Trainer מסוננת.

## 1.5.4 — Hidden System Tests
- בדיקות המערכת ממשיכות לרוץ אוטומטית ברקע בכל פתיחה.
- הוסרו מהממשק "דוח בדיקת מערכת" ו"פתח דוח בדיקות מלא".
- כשהכול תקין, לא מוצג למשתמש שום חיווי.
- רק במקרה של כשל מופיעה התראה בצד המסך עם פרטי התקלה.
