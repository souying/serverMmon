#!/usr/bin/env bash

#========================================================
#   System Required: CentOS 7+ / Debian 8+ / Ubuntu 16+ / Alpine 3+ /
#     Arch 如有问题带截图反馈 www.baidu.com
#   Description: serverMmon监控安装脚本
#   Github: https://github.com/souying/serverMmon
#========================================================

MMON_BASE_PATH="/opt/serverMmon"
MMON_DASHBOARD_PATH="${MMON_BASE_PATH}/serverMmon"
MMON_MMON_PATH="${MMON_BASE_PATH}/mmon"
MMON_MMON_SERVICE="/etc/systemd/system/mmon.service"
MMON_VERSION="v1.0.0"

cur_dir=$(pwd)

red='\033[0;31m'
green='\033[0;32m'
yellow='\033[0;33m'
plain='\033[0m'
export PATH=$PATH:/usr/local/bin

os_arch=""
[ -e /etc/os-release ] && os_id=$(cat /etc/os-release | grep ^ID= | tr '[A-Z]' '[a-z]')
if [[ $os_id =~ "alpine" ]] || [[ $os_id =~ "openwrt" ]]; then
    os_other='1'
fi

pre_check() {
    [ "$os_other" != 1 ] && ! command -v systemctl >/dev/null 2>&1 && echo "不支持此系统：未找到 systemctl 命令" && exit 1
    
    # check root
    [[ $EUID -ne 0 ]] && echo -e "${red}错误: ${plain} 必须使用root用户运行此脚本！\n" && exit 1
    
    ## os_arch
    if [[ $(uname -m | grep 'x86_64') != "" ]]; then
        os_arch="x64"
        elif [[ $(uname -m | grep 'aarch64\|armv8b\|armv8l') != "" ]]; then
        os_arch="arm64"
        elif [[ $(uname -m | grep 'arm') != "" ]]; then
        os_arch="arm64"
    fi
    
    ## China_IP
    if [[ -z "${CN}" ]]; then
        if [[ $(curl -m 10 -s https://ipapi.co/json | grep 'China') != "" ]]; then
            echo "根据ipapi.co提供的信息，当前IP可能在中国"
            read -e -r -p "是否选用中国镜像完成安装? [Y/n] " input
            case $input in
                [yY][eE][sS] | [yY])
                    echo "使用中国镜像"
                    CN=true
                ;;
                
                [nN][oO] | [nN])
                    echo "不使用中国镜像"
                ;;
                *)
                    echo "使用中国镜像"
                    CN=true
                ;;
            esac
        fi
    fi
    
    if [[ -z "${CN}" ]]; then
        GITHUB_RAW_URL="raw.githubusercontent.com/souying/serverMmon/main/"
        GITHUB_URL="github.com"
        Get_Docker_URL="get.docker.com"
        Get_Docker_Argu=" "
        Docker_IMG="xxxxx"
    else
        GITHUB_RAW_URL="cdn.jsdelivr.net/gh/souying/serverMmon@main/"
        GITHUB_URL="dn-dao-github-mirror.daocloud.io"
        Get_Docker_URL="get.daocloud.io/docker"
        Get_Docker_Argu="xxxxx"
        Docker_IMG="xxxxx"
    fi
}

confirm() {
    if [[ $# > 1 ]]; then
        echo && read -e -p "$1 [默认$2]: " temp
        if [[ x"${temp}" == x"" ]]; then
            temp=$2
        fi
    else
        read -e -p "$1 [y/n]: " temp
    fi
    if [[ x"${temp}" == x"y" || x"${temp}" == x"Y" ]]; then
        return 0
    else
        return 1
    fi
}

update_script() {
    echo -e "> 更新脚本"
    
    curl -sL https://${GITHUB_RAW_URL}/script/install.sh -o /tmp/mmon_install.sh
    new_version=$(cat /tmp/mmon_install.sh | grep "MMON_VERSION" | head -n 1 | awk -F "=" '{print $2}' | sed 's/\"//g;s/,//g;s/ //g')
    if [ ! -n "$new_version" ]; then
        echo -e "脚本获取失败，请检查本机能否链接 https://${GITHUB_RAW_URL}/script/install.sh"
        return 1
    fi
    echo -e "当前最新版本为: ${new_version}"
    mv -f /tmp/mmon_install.sh ./mmon_install.sh && chmod a+x ./mmon_install.sh
    
    echo -e "3s后执行新脚本"
    sleep 3s
    clear
    exec ./mmon_install.sh
    exit 0
}

before_show_menu() {
    echo && echo -n -e "${yellow}* 按回车返回主菜单 *${plain}" && read temp
    show_menu
}

install_base() {
    (command -v git >/dev/null 2>&1 && command -v curl >/dev/null 2>&1 && command -v wget >/dev/null 2>&1 && command -v unzip >/dev/null 2>&1 && command -v getenforce >/dev/null 2>&1) ||
    (install_soft curl wget git unzip)
}

install_soft() {
    (command -v yum >/dev/null 2>&1 && yum makecache && yum install $* selinux-policy -y) ||
    (command -v apt >/dev/null 2>&1 && apt update && apt install $* selinux-utils -y) ||
    (command -v pacman >/dev/null 2>&1 && pacman -Syu $* base-devel --noconfirm && install_arch)  ||
    (command -v apt-get >/dev/null 2>&1 && apt-get update && apt-get install $* selinux-utils -y) ||
    (command -v apk >/dev/null 2>&1 && apk update && apk add $* -f)
}

install_mmon() {
    install_base
    
    echo -e "> 安装监控Mmon"
    echo -e "正在获取监控Mmon版本号"
    
    local version=$(curl -m 10 -sL "https://api.github.com/repos/souying/serverMmon/releases/latest" | grep "tag_name" | head -n 1 | awk -F ":" '{print $2}' | sed 's/\"//g;s/,//g;s/ //g')
    if [ ! -n "$version" ]; then
        version=$(curl -m 10 -sL "https://fastly.jsdelivr.net/gh/souying/serverMmon/" | grep "option\.value" | awk -F "'" '{print $2}' | sed 's/souying\/serverMmon@/v/g')
    fi
    if [ ! -n "$version" ]; then
        version=$(curl -m 10 -sL "https://gcore.jsdelivr.net/gh/souying/serverMmon/" | grep "option\.value" | awk -F "'" '{print $2}' | sed 's/souying\/serverMmon@/v/g')
    fi
    
    if [ ! -n "$version" ]; then
        echo -e "获取版本号失败，请检查本机能否链接 https://api.github.com/repos/souying/serverMmon/releases/latest"
        return 0
    else
        echo -e "当前最新版本为: ${version}"
    fi
    
    # 监控文件夹
    if [ ! -d "${MMON_MMON_PATH}" ]; then
        mkdir -p $MMON_MMON_PATH
    else
        echo "您可能已经安装过监控端，重复安装会覆盖数据，请注意备份。"
        read -e -r -p "是否退出安装? [Y/n] " input
        case $input in
            [yY][eE][sS] | [yY])
                echo "退出安装"
                exit 0
            ;;
            [nN][oO] | [nN])
                echo "继续安装"
                rm -rf $MMON_MMON_PATH/*
            ;;
            *)
                echo "退出安装"
                exit 0
            ;;
        esac
    fi
    chmod 777 -R $MMON_MMON_PATH
    
    echo -e "正在下载监控端到${MMON_MMON_PATH}"
    echo -e "${GITHUB_URL}/souying/serverMmon/releases/download/${MMON_VERSION}/serverMmon-linux-${os_arch}.zip"
    wget -t 2 -T 10 --no-check-certificate -O serverMmon-linux-${os_arch}.zip ${GITHUB_URL}/souying/serverMmon/releases/download/${MMON_VERSION}/serverMmon-linux-${os_arch}.zip >/dev/null 2>&1
    if [[ $? != 0 ]]; then
        echo -e "${red}Release 下载失败，请检查本机能否连接 ${GITHUB_URL}${plain}"
        return 0
    fi
    
    unzip -qo serverMmon-linux-${os_arch}.zip -d $MMON_MMON_PATH &&
    [[ ! -f $MMON_MMON_PATH/mmon ]] && mv $MMON_MMON_PATH/serverMmon-linux-${os_arch} $MMON_MMON_PATH/mmon
    rm -rf serverMmon-linux-${os_arch}.zip
    
    #脚本加入环境变量
    curl -o /usr/bin/MMON -Ls https://cdn.365api.cn/mmon/mmon_install.sh
    chmod +x /usr/bin/MMON
    [ -L /usr/bin/mmon ] && rm -rf /usr/bin/mmon
    ln -s /usr/bin/MMON /usr/bin/mmon
    chmod +x /usr/bin/mmon
    
    modify_agent_config 0
    
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

modify_agent_config() {
    check_mmon
    echo -e "> 加载配置"
        input_agent_token() {
        agent_token=""
        read -ep "请输入token，回车默认123456789(限数字)，退出请输入exit：" agent_token
        [ "$agent_token" == "exit" ] && exit 0 ||
        if [ "${agent_token}" == "" ]; then
            agent_token="123456789"
        elif [ -z $(echo ${agent_token} | egrep "^([0-9])+?$") ]; then
            clear
            echo -e "${red}token输入非法，请重新输入！！！${plain}"
            input_agent_token
        fi
        }

        input_agent_port() {
        agent_port=""
        read -ep "请输入端口号, 回车默认端口5888(端口范围：4000-60000), 退出请输入exit：" agent_port
        [ "$agent_token" == "exit" ] && exit 0 ||
        if [ "${agent_port}" == "" ]; then
            agent_port="5888"
        elif [ -z $(echo ${agent_port} | egrep "^([4-9][0-9]{3}|[1-5][0-9]{4}|60000)$") ]; then
            clear
            echo -e "${red}端口输入非法！请重新输入！！！${plain}"
            input_agent_port
        fi
    }
    input_agent_token
    input_agent_port
    
    # 写入配置文件config.json
    echo -e "当前token：$agent_token \n当前port：$agent_port"
    echo -e "开始写入配置文件config.json到路径${MMON_MMON_PATH}"
    [ ! -d ${MMON_MMON_PATH} ] && echo "${red}未安装监控端，退出修改！" || cat << EOF > ${MMON_MMON_PATH}/config.json
{
    "token":${agent_token},
    "port":${agent_port}
}
EOF
    [ -f ${MMON_MMON_PATH}/config.json ] && echo -e "写入配置文件完成！！！"
    
    if [ "$os_other" != 1 ];then
        wget -t 2 -T 10 --no-check-certificate -O $MMON_MMON_SERVICE https://${GITHUB_RAW_URL}/scripts/mmon.service >/dev/null 2>&1
        if [[ $? != 0 ]]; then
            echo -e "${red}文件下载失败，请检查本机能否连接 ${GITHUB_RAW_URL}${plain}"
            return 0
        fi
    fi

    if [ "$os_other" != 1 ];then
    
        args=" $*"
        sed -i "/ExecStart/ s/$/${args}/" ${MMON_MMON_SERVICE}
    else
        echo "@reboot nohup ${MMON_MMON_PATH}/mmon >/dev/null 2>&1 &" >> /etc/crontabs/root
       [[ ! $(pgrep "crond") ]] && crond
    fi
    echo -e "${green}MMON ${MMON_VERSION}${plain} 安装完成，已设置开机自启"
    echo -e "MMON配置 ${green}加载成功，请稍等重启生效${plain}"
    
    if [ "$os_other" != 1 ];then
        systemctl daemon-reload
        systemctl enable mmon
        systemctl restart mmon
    else
        nohup ${MMON_MMON_PATH}/mmon >/dev/null 2>&1 &
    fi
    
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

show_agent_log() {
    check_mmon
    echo -e "> 获取Mmon日志"
    [ "$os_other" = 1 ] && echo -e "${red}当前系统暂不支持使用该功能！！！${plain}\n" ||
    journalctl -xf -u mmon.service
    
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

uninstall_agent() {
    check_mmon
    echo -e "> 卸载Mmon"
    if [ "$os_other" != 1 ] && [ -f $MMON_MMON_SERVICE ];then
        systemctl disable mmon.service
        systemctl stop mmon.service
        rm -rf $MMON_MMON_SERVICE
        systemctl daemon-reload
    elif [ "$os_other" = 1 ]; then
        sed -i "/mmon/d" /etc/crontabs/root
        [ $(pgrep "mmon") ] && kill -s 9 $(pgrep "mmon")
    fi
    
    [ -d $MMON_MMON_PATH ] && rm -rf $MMON_MMON_PATH
    clean_all
    
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

clean_all() {
    if [ -z "$(ls -A ${MMON_BASE_PATH})" ]; then
        rm -rf ${MMON_BASE_PATH}
    fi
    [ -f /usr/bin/MMON ] && rm -rf /usr/bin/MMON 
    [ -L /usr/bin/mmon ] && rm -rf /usr/bin/mmon
}

check_mmon() {
    [ ! -d ${MMON_MMON_PATH} ] && echo -e "${red}未安装监控端，请先执行安装监控Mmon！！！${plain}\n" && exit 1       
}

status_agent() {
    check_mmon
    echo -e "> Mmon状态"
    if [ "$os_other" = 1 ]; then
      [ $(pgrep "mmon") ] && echo -e "${green}Mmon运行正常！${plain}" || echo -e "${red}Mmon运行出错！${plain}"
    else
        systemctl status mmon.service
    fi
    
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

restart_agent() {
    check_mmon
    echo -e "> 重启Mmon"
    if [ "$os_other" = 1 ]; then
        [ $(pgrep "mmon") ] && kill -s 9 $(pgrep ${MMON_PID_NAME})
        nohup ${MMON_MMON_PATH}/mmon >/dev/null 2>&1 &
       [ $(pgrep "mmon") ] && echo -e "${green}已重启Mmon${plain}" || echo -e "${red}Mmon启动出错！${plain}"
    else
        systemctl restart mmon.service
    fi
    
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

stop_agent() {
    check_mmon
    echo -e "> 停止Mmon"
    if [ "$os_other" = 1 ]; then
        [ $(pgrep "mmon") ] && kill -s 9 $(pgrep ${MMON_PID_NAME})
        [ $(pgrep "mmon") ] && echo -e "${red}未能停止Mmon，请手动处理！！！${plain}" || echo -e "${green}已停止Mmon${plain}"
    else
        systemctl stop mmon.service
    fi
    
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

show_usage() {
    echo "青蛇探针监控端 管理脚本使用方法: "
    echo "--------------------------------------------------------"
    echo "./mmon_install.sh install_mmon               - 安装监控mmon"
    echo "./mmon_install.sh show_agent_log             - 查看Mmon日志"
    echo "./mmon_install.sh modify_agent_config        - 修改Mmon配置"
    echo "./mmon_install.sh status_agent               - 查看Mnon状态"
    echo "./mmon_install.sh uninstall_agent            - 卸载Mmon"
    echo "./mmon_install.sh restart_agent              - 重启Mmon"
    echo "./mmon_install.sh stop_agent                 - 停止Mmon"
    echo "./mmon_install.sh update_script              - 更新脚本"
    echo "--------------------------------------------------------"
}

show_menu() {
    echo -e "
    ${green}serverMmon监控管理脚本${plain} ${red}${MMON_VERSION}${plain}
    --- https://github.com/souying/serverMmon ---
    ${green}1.${plain} 安装监控Mmon
    ${green}2.${plain} 查看Mmon日志
    ${green}3.${plain} 修改Mmon配置
    ${green}4.${plain} 查看Mnon状态
    ${green}5.${plain} 卸载Mmon
    ${green}6.${plain} 重启Mmon
    ${green}7.${plain} 停止Mmon
    ${green}8.${plain} 更新脚本
    ————————————————-
    ${green}0.${plain}  退出脚本
    "
    echo && read -ep "请输入选择 [0-8]: " num
    
    case "${num}" in
        0)
            exit 0
        ;;
        1)
            install_mmon
        ;;
        2)
            show_agent_log
        ;;
        3)
            modify_agent_config
        ;;
        4)
            status_agent
        ;;
        5)
            uninstall_agent
        ;;
        6)
            restart_agent
        ;;
        7)
            stop_agent
        ;;
        8)
            update_script
        ;;
        *)
            echo -e "${red}请输入正确的数字 [0-8]${plain}"
        ;;
    esac
}

pre_check

if [[ $# > 0 ]]; then
    case $1 in
        "install_mmon")
            install_mmon 0
        ;;
        "modify_agent_config")
            modify_agent_config 0
        ;;
        "show_agent_log")
            show_agent_log 0
        ;;
        "uninstall_agent")
            uninstall_agent 0
        ;;
        "status_agent")
            status_agent 0
        ;;
        "restart_agent")
            restart_agent 0
        ;;
        "stop_agent")
            stop_agent 0
        ;;
        "stop_agent")
            update_script 0
        ;;
        *) show_usage ;;
    esac
else
    show_menu
fi
