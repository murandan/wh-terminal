/** * BACKEND V3.9 - TOTAL STABLE
 * - Сегментированная запись (пропуск H и J для формул)
 * - Сброс желтого формата и жирности
 * - Бухгалтерское выравнивание и формат чисел (красный минус)
 */
const SS = SpreadsheetApp.getActiveSpreadsheet();
const TZ = "GMT+5";

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  try {
    const sheet = SS.getSheetByName("Items");
    const lastRow = sheet.getLastRow();
    if (lastRow < 3) return jsonResponse([]);
    const data = sheet.getRange(3, 1, lastRow - 2, 8).getValues();
    return jsonResponse(data.map(row => ({
      id: row[0].toString(), name: row[1], stock: row[4], cost: row[5], price: row[6]
    })).filter(i => i.id && i.id !== ""));
  } catch (e) { return jsonResponse({error: e.toString()}); }
}

function doPost(e) {
  try {
    const sheet = SS.getSheetByName("Transactions");
    const p = JSON.parse(e.postData.contents);
    const date = Utilities.formatDate(new Date(), TZ, "dd.MM.yyyy HH:mm:ss");
    
    // Поиск первой пустой строки (минимум 3-я)
    const colA = sheet.getRange("A:A").getValues();
    let row = 3;
    for (let i = 2; i < colA.length; i++) {
      if (!colA[i][0]) { row = i + 1; break; }
      if (i === colA.length - 1) row = colA.length + 1;
    }

    const p1 = [], p2 = [], p3 = [];
    p.cart.forEach(item => {
      // Кусок 1: Колонки A-G (1-7)
      p1.push([date, p.tx_id, p.tx_type, item.item_id, item.item_name, Number(item.qty), Number(item.price)]);
      // Кусок 2: Колонка I (9)
      p2.push([Number(item.cost_price)]);
      // Кусок 3: Колонки K-P (11-16)
      p3.push(["Розничный клиент", p.payment_method, "", p.source, "", ""]);
    });

    // ЗАПИСЬ ДАННЫХ (пропускаем колонки 8 и 10)
    sheet.getRange(row, 1, p1.length, 7).setValues(p1);
    sheet.getRange(row, 9, p2.length, 1).setValues(p2);
    sheet.getRange(row, 11, p3.length, 6).setValues(p3);

    // ГЛУБОКИЙ СБРОС ФОРМАТА
    const fullRange = sheet.getRange(row, 1, p1.length, 16);
    fullRange.clearFormat()
             .setBackground(null)
             .setFontWeight("normal")
             .setFontColor("#000000")
             .setVerticalAlignment("middle")
             .setWrap(false);

    // ВЫРАВНИВАНИЕ
    // Текст (A-E) — слева
    sheet.getRange(row, 1, p1.length, 5).setHorizontalAlignment("left");
    // Числа (F-J) — справа
    sheet.getRange(row, 6, p1.length, 5).setHorizontalAlignment("right");
    // Остальное (K-P) — слева
    sheet.getRange(row, 11, p1.length, 6).setHorizontalAlignment("left");

    // ФОРМАТ ЧИСЕЛ (Без копеек, разделение тысяч, красный минус)
    const moneyFormat = "#,##0;[Red]-#,##0;0";
    sheet.getRange(row, 1, p1.length, 1).setNumberFormat("dd.MM.yyyy HH:mm:ss"); // Дата
    sheet.getRange(row, 7, p1.length, 2).setNumberFormat(moneyFormat); // G, H
    sheet.getRange(row, 9, p1.length, 2).setNumberFormat(moneyFormat); // I, J

    return jsonResponse({success: true});
  } catch (e) { return jsonResponse({success: false, error: e.toString()}); }
}