/**
 * シート名からシートを作成する。headerを引数で設定する
 */
function findOrCreateSheet(sheetName, headers) {
  const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  const ss = getSpreadsheetBySpreadsheetId(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  // シートが存在しない場合は、新しいシートを作成する
  if (sheet == null) {
    sheet = ss.insertSheet(sheetName);
    Logger.log('Sheet created: ' + sheetName);
  } else {
    // シートが存在する場合は、ログに出力する
    Logger.log('Sheet already exists: ' + sheetName);
  }

  if(headers == null) {
    return sheet;
  }

  // シートが空であるか、1行目が空白である場合は、必要な列を設定する
  if (sheet.getLastRow() === 0 || sheet.getRange(1, 1, 1, sheet.getLastColumn()).isBlank()) {
    // 列の見出しを1行目に設定する
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sheet;
}