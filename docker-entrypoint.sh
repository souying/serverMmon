#!/bin/bash
set -e

if [[ ! -d ${MMON_DIR}/config -a ! -d ${MMON_DIR}/home -a ! -d ${MMON_DIR}/server ]]; then
  echo "没有映射config,home,server配置目录给本容器，请先映射配置目录...\n"
  exit 1
fi

if [ ! -s ${MMON_DIR}/config/config.js ]; then
  echo "检测到config配置目录下不存在config.js，从示例文件复制一份用于初始化...\n"
  cp -fr ${MMON_DIR}/sample/config/ ${MMON_DIR}/
fi

if [ ! -s ${MMON_DIR}/home/config.js ]; then
  echo "检测到home配置目录下不存在config.js，从示例文件复制一份用于初始化...\n"
  cp -fr ${MMON_DIR}/sample/home/ ${MMON_DIR}/
fi

if [ ! -s ${MMON_DIR}/server/config.js ]; then
  echo "检测到server配置目录下不存在config.js，从示例文件复制一份用于初始化...\n"
  cp -fr ${MMON_DIR}/sample/server/ ${MMON_DIR}/
fi

#清除pm2日志文件
pm2 flush >/dev/null

#前台启动pm2
pm2-runtime start index.js --name "serverMmon"

exec "$@"
