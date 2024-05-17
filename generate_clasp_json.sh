#!/bin/bash

# .clasp.json.idファイルからGASファイルのIDを取得
gas_file_id=$(grep -o '"scriptId":"[^"]*"' .clasp.json.id | cut -d'"' -f4)

# .clasp.json.localファイルからファイルの置き場所に関する情報を取得
local_settings=$(cat .clasp.json.local)

# .clasp.jsonファイルを生成
cat <<EOF > .clasp.json
{
  "scriptId": "$gas_file_id",
  $local_settings
}
EOF