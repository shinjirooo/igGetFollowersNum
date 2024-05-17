
// 特定のシートからアカウントIDを取得し、Instagramのフォロワー数を取得して記録する
function main() {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  var sheetName = PropertiesService.getScriptProperties().getProperty('SHEET_NAME');
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

  var today = new Date();
  today.setHours(0, 0, 0, 0); // 時刻を00:00:00に設定
  var formattedDate = Utilities.formatDate(today, Session.getScriptTimeZone(), 'M/d'); // '9/12' の形式でフォーマット
  var dayOfWeekStr = getJapaneseDayOfWeek(today); // 日本語の曜日を取得

  var lastRow = sheet.getLastRow();
  var lastDateValue = sheet.getRange(lastRow, 1).getValue();
  var lastDate = lastDateValue instanceof Date ? new Date(lastDateValue) : new Date(0); // 日付が無効ならばエポックを設定
  lastDate.setHours(0, 0, 0, 0);

  // rewrite the following line using back slash
  var emailBody = '';

  // 最後の行が今日の日付でなければ新しい行を追加
  if (!(lastDate instanceof Date) || lastDate.getTime() != today.getTime()) {
    lastRow++;
    sheet.appendRow([today]);
    sheet.getRange(lastRow, 1).setNumberFormat('M/d（ddd）'); // 日付の表示形式を設定
  }

  var accountIds = getAccountIds();
  accountIds.forEach((accountId, index) => {
    var result = getIgFollowerNum(accountId);
    var cell = sheet.getRange(lastRow, index + 2);
    if (result == null) {
      Logger.log(`アカウントID「${accountId}」でエラーが発生しました。`);
      // 結果がnullの場合、背景を薄い赤色に設定
      cell.setBackground('lightcoral');
      emailBody += `アカウントID「${accountId}」: エラーが発生しました。\n`;
    } else {
      Logger.log(`アカウント名「${result.business_discovery.name}」のフォロワー数は「${result.business_discovery.followers_count}」です。`);
      // フォロワー数を記録
      cell.setValue(result.business_discovery.followers_count);
      // 数値の表示形式を設定
      cell.setNumberFormat('#,##0');
      emailBody += `${result.business_discovery.name}：${result.business_discovery.followers_count}人\n`;
    }
  });

  var recipientEmail = PropertiesService.getScriptProperties().getProperty('ADMIN_MAIL_ADDRESS');
  var subject = `📱ドコモショップ強化6店舗Instagramフォロワー数レポートです🙋　${formattedDate}（${dayOfWeekStr}）`;
  MailApp.sendEmail(recipientEmail, subject, emailBody);
}

// Instagramのフォロワー数を取得する
function getIgFollowerNum(username) {
  var accessToken = PropertiesService.getScriptProperties().getProperty('ACCESS_TOKEN');
  var userId = PropertiesService.getScriptProperties().getProperty('USER_ID');
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');

  try {
    var apiUrl = `https://graph.facebook.com/v17.0/${userId}?fields=business_discovery.username(${username})%7Bfollowers_count%2Cmedia_count%2Cname%2Cusername%7D&access_token=${accessToken}`;
    var response = UrlFetchApp.fetch(apiUrl);
    var json = JSON.parse(response.getContentText());

    Logger.log(json);
    return json; // 応答データを返す
  } catch (e) {
    Logger.log("エラーが発生しました: " + e.message);
    return null; // エラーが発生した場合はnullを返す
  }
}

function test__getIgFollowerNum() {
  getIgFollowerNum('docomoshop_himejimiyukidori');
}

// 特定のシートからアカウントIDを取得する
function getAccountIds() {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  var sheetName = PropertiesService.getScriptProperties().getProperty('SHEET_NAME');
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

  var firstColumnValues = sheet.getRange(1, 1, sheet.getLastRow()).getValues();
  var accountIDRow = firstColumnValues.findIndex(row => row[0] === 'アカウントID') + 1;// 「アカウントID」と書かれた行を取得する

  if (accountIDRow > 0) {
    var lastColumn = sheet.getLastColumn();
    var range = sheet.getRange(accountIDRow, 2, 1, lastColumn - 1);
    var rowData = range.getValues()[0];

    // データのログ出力（確認用）
    Logger.log(rowData);

    return rowData;
  } else {
    Logger.log('「アカウントID」の行が見つかりませんでした。');
  }
}

function getJapaneseDayOfWeek(date) {
  var dayOfWeek = date.getDay(); // 曜日を数値で取得（0:日曜日, 1:月曜日, ..., 6:土曜日）
  var dayOfWeekStr = ['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]; // 数値を日本語の曜日に変換
  return dayOfWeekStr;
}