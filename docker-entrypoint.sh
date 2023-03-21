#!/bin/bash
set -e

if [ ! -d ${MMON_DIR}/basedata ]; then
  echo "没有映射basedata数据库目录给本容器，请先映射数据库目录...\n"
  exit 1
fi

chmod -R 755 ${MMON_DIR}/basedata

#清除pm2日志文件
pm2 flush >/dev/null

#前台启动pm2
pm2-runtime start index.js --name "serverMmon"

exec "$@"
