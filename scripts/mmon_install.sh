#!/usr/bin/env bash

#========================================================
#   System Required: CentOS 7+ / Debian 8+ / Ubuntu 16+ / Alpine 3+ /
#     Arch 如有问题带截图反馈 https://github.com/souying/serverMmon/issues
#   Description: serverMmon监控安装脚本
#   Github: https://github.com/souying/serverMmon
#========================================================

MMON_BASE_PATH="/opt/serverMmon"
MMON_DASHBOARD_PATH="${MMON_BASE_PATH}/dashboard"
MMON_MMON_PATH="${MMON_BASE_PATH}/mmon"
MMON_MMON_SERVICE="/etc/systemd/system/mmon.service"
MMON_VERSION="v1.0.4"

cur_dir=$(pwd)

red='\033[0;31m'
green='\033[0;32m'
yellow='\033[0;33m'
plain='\033[0m'
export PATH=$PATH:/usr/local/bin

os_arch=""
[ -e /etc/os-release ] && os_id=$(cat /etc/os-release | grep ^ID= | tr '[A-Z]' '[a-z]')
echo -e "当前系统ID为：${os_id#*=}"

if [[ $os_id =~ "alpine" ]]; then
    os_name='alpine'
    os_other=1
elif [[ $(uname -s | tr '[A-Z]' '[a-z]') =~ "linux" ]]; then
    os_name='linux'
fi

pre_check() {
    [ "$os_other" != 1 ] && ! command -v systemctl >/dev/null 2>&1 || ! systemctl list-units >/dev/null 2>&1 && echo "未找到此系统 systemctl 命令，尝试改用nohup挂起运行监控端！！!" && os_other=1
    
    # check root
    [[ $EUID -ne 0 ]] && echo -e "${red}错误: ${plain} 必须使用root用户运行此脚本！\n" && exit 1
    
    ## os_arch
    if [[ $(uname -m | grep 'x86_64') != "" ]]; then
        os_arch="x64"
    elif [[ $(uname -m | grep 'aarch64\|armv8b\|armv8l') != "" ]]; then
        os_arch="arm64"
    elif [[ $(uname -m | grep 'armv7l\|arm') != "" ]]; then
        #os_arch="arm"
        echo -e "${yellow}监控端暂不支持arm32架构！！！${plain}"
    else
        echo -e "${red}当前$(uname -m)架构暂不支持使用！！！${plain}"
        exit 1
    fi
    ## os_alpine
    
    
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
        GITHUB_RAW_URL="raw.githubusercontent.com/souying/serverMmon/main"
        GITHUB_URL="github.com"
        Get_Docker_URL="get.docker.com"
        Get_Docker_Argu=" "
        Docker_IMG="ghcr.io/souying/mmon"
    else
        GITHUB_RAW_URL="gitee.com/souying/serverMmon/raw/main"
        #GITHUB_RAW_URL="gcore.jsdelivr.net/gh/souying/serverMmon@main"
        #GITHUB_RAW_URL="fastly.jsdelivr.net/gh/souying/serverMmon@main"
        #GITHUB_RAW_URL="cdn.zenless.top/gh/souying/serverMmon@main"
        GITHUB_URL="dn-dao-github-mirror.daocloud.io"
        Get_Docker_URL="get.daocloud.io/docker"
        Get_Docker_Argu=" -s docker --mirror Aliyun"
        Docker_IMG="grbhq/mmon"
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
    
    curl -sL https://${GITHUB_RAW_URL}/scripts/mmon_install.sh -o /tmp/mmon_install.sh
    new_version=$(cat /tmp/mmon_install.sh | grep "MMON_VERSION" | head -n 1 | awk -F "=" '{print $2}' | sed 's/\"//g;s/,//g;s/ //g')
    if [ ! -n "$new_version" ]; then
        echo -e "脚本获取失败，请检查本机能否链接 https://${GITHUB_RAW_URL}/scripts/mmon_install.sh"
        return 1
    fi
    echo -e "当前最新版本为: ${new_version}"
    
    #脚本加入环境变量
    curl -o /usr/bin/MMON -Ls https://${GITHUB_RAW_URL}/scripts/mmon_install.sh
    chmod +x /usr/bin/MMON
    [ -L /usr/bin/mmon ] && rm -rf /usr/bin/mmon
    ln -s /usr/bin/MMON /usr/bin/mmon
    chmod +x /usr/bin/mmon
    
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

version_mmon() {
    echo -e "正在获取监控Mmon版本号"
    
    m_version=$(curl -m 10 -skL "https://api.github.com/repos/souying/serverMmon/releases" | awk -F'"' '/tag_name/ {print $4}' | sort -u)
    if [ ! -n "$m_version" ]; then
        #m_version=$(curl -m 10 -sL "https://fastly.jsdelivr.net/gh/souying/serverMmon/" | sed -n 's/.*option value="[^@]*@\([0-9]\+\.[0-9]\+\.[0-9]\+\).*/v\1/p')
        m_version=$(curl -m 10 -skL "https://fastly.jsdelivr.net/gh/souying/serverMmon/" | sed -nE 's/.*souying\/serverMmon@([0-9]+\.[0-9]+(\.[0-9]+)?).*/v\1/p'| sort -u) #-u去重, -r降序, 没有-r为升序
    fi
    if [ ! -n "$m_version" ]; then
        m_version=$(curl -m 10 -skL "https://gcore.jsdelivr.net/gh/souying/serverMmon/" | sed -nE 's/.*souying\/serverMmon@([0-9]+\.[0-9]+(\.[0-9]+)?).*/v\1/p'| sort -u)
    fi
    
    if [ ! -n "$m_version" ]; then
        echo -e "获取版本号失败，请检查本机能否链接 https://api.github.com/repos/souying/serverMmon/releases/latest"
        return 1
    fi
    m_version_array=($m_version)

    select_version() {
        echo -e "最新可用版本号："
        for i in $(seq 0 $((${#m_version_array[@]}-1))); do
            #最新的10个版本号
            if [[ "$i" -lt $((${#m_version_array[@]}-10)) ]]; then
                continue
            fi
            echo -e "${green}$((i+1)))  ${m_version_array[$i]}${plain}"
        done
        
        while true; do
        read -p "请选择版本序列号或直接输入存在的版本号[输入exit退出]（直接回车选择最新版本）：" input_version
            if [[ "$input_version" == "exit" ]]; then
                exit 0
            elif [[ -z "$input_version" ]]; then
                # 回车最新版
                version="${m_version_array[-1]}"
                break
            elif [[ "$input_version" =~ ^[0-9]+$ && "$input_version" -ge 1 && "$input_version" -le "${#m_version_array[@]}" ]]; then
                # 选择版本序列号
                version="${m_version_array[$((input_version-1))]}"
                break
            elif [[ " ${m_version_array[*]} " == *" $input_version "* ]]; then
                # 输入存在的版本号
                version="$input_version"
                break
            else
                echo -e "${yellow}错误：无效的选项，请重新选择!${plain}"
            fi
        done
        echo "您选择了版本号：${version}"
    }
    
    if [ $# -lt 1 ]; then
        select_version
    elif [[ " ${m_version_array[*]} " == *" $1 "* ]]; then
        version=$1 && echo "您选择了版本号：${version}"
    else    
        echo -e "${red}$1不存在的版本号，请输入存在的版本号！格式为v1.x.x${plain}" && exit 0
    fi
}

download_mmon() {
    echo -e "正在下载监控端到${MMON_MMON_PATH}"
    echo -e "https://${GITHUB_URL}/souying/serverMmon/releases/download/${version}/serverMmon-${os_name}-${os_arch}.zip"
    wget -t 2 -T 10 --no-check-certificate -O serverMmon-${os_name}-${os_arch}.zip https://${GITHUB_URL}/souying/serverMmon/releases/download/${version}/serverMmon-${os_name}-${os_arch}.zip >/dev/null 2>&1
    if [[ $? != 0 ]]; then
        echo -e "${red}Release 下载失败，请检查本机能否连接 ${GITHUB_URL}${plain}"
        return 1
    fi
    
    unzip -qo serverMmon-${os_name}-${os_arch}.zip -d $MMON_MMON_PATH &&
    [[ ! -f $MMON_MMON_PATH/mmon ]] && mv $MMON_MMON_PATH/serverMmon-${os_name}-${os_arch} $MMON_MMON_PATH/mmon
    chmod +x $MMON_MMON_PATH/mmon
    rm -rf serverMmon-${os_name}-${os_arch}.zip
}

install_mmon() {
    [ -z ${os_arch} ] && return 1
    install_base
    echo -e "> 安装监控Mmon"
    # 选择监控Mmon版本
    if [ $# -ge 3 ]; then
        version_mmon "$3"
    else
        version_mmon
    fi
    [ $? != 0 ] && return 0
    
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
    #下载监控Mmon
    download_mmon
    [ $? != 0 ] && return 0
    
    #脚本加入环境变量
    curl -o /usr/bin/MMON -Ls https://${GITHUB_RAW_URL}/scripts/mmon_install.sh
    chmod +x /usr/bin/MMON
    [ -L /usr/bin/mmon ] && rm -rf /usr/bin/mmon
    ln -s /usr/bin/MMON /usr/bin/mmon
    chmod +x /usr/bin/mmon
    
    if [[ $# -ge 2 ]]; then
        modify_agent_config "$@"
    else
        modify_agent_config 0
    fi

    if [[ $# == 0 ]]; then
        show_menu
    fi
}

update_mmon() {
    check_mmon
    echo -e "> 更新监控Mmon"
    #选择监控Mmon版本
    if [[ $# -ge 1 && "$1" != "0" ]]; then
        version_mmon "$@"
    else
        version_mmon
    fi
    [ $? != 0 ] && return 0
    
    #停止监控Mmon
    stop_agent 0
    [[ $? != 0 ]] && echo -e "${red}无法停止监控Mmon！退出执行${plain}" && exit 1

    #下载监控Mmon
    rm -rf $MMON_MMON_PATH/mmon
    download_mmon
    [ $? != 0 ] && return 0
    
    #启动监控Mmon
    if [ "$os_other" != 1 ];then
        systemctl start mmon
    else
        cd ${MMON_MMON_PATH} && nohup ./mmon >/dev/null 2>&1 &
    fi
    echo -e "${green}监控Mmon更新完成！${plain}"
    
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
    
    if [ $# -lt 2 ]; then
        input_agent_token
        input_agent_port
    else
        agent_token=$1
        agent_port=$2
        shift 2
    fi
    
    # 写入配置文件config.json
    echo -e "当前token：$agent_token \n当前port：$agent_port"
    echo -e "开始写入配置文件config.json到路径${MMON_MMON_PATH}"
    cat << EOF > ${MMON_MMON_PATH}/config.json
{
    "token":${agent_token},
    "port":${agent_port}
}
EOF
    [ -s ${MMON_MMON_PATH}/config.json ] && echo -e "写入配置文件完成！！！"
    
    if [ "$os_other" != 1 ];then
        echo -e "${red}开始下载mmon.service服务文件...${plain}"
        wget -t 2 -T 10 --no-check-certificate -O $MMON_MMON_SERVICE https://${GITHUB_RAW_URL}/scripts/mmon.service >/dev/null 2>&1
        if [[ $? != 0 ]]; then
            echo -e "${red}mmon.service服务文件下载失败，请检查本机能否连接 ${GITHUB_RAW_URL}${plain}"
            return 0
        fi
    fi

    if [ "$os_other" != 1 ];then
    
        args=" $*"
        sed -i "/ExecStart/ s/$/${args}/" ${MMON_MMON_SERVICE}
    else
        (crontab -l | grep -v "nohup ./mmon") | crontab -
        [ $os_name == "alpine" ] && echo "@reboot cd ${MMON_MMON_PATH} && nohup ./mmon >/dev/null 2>&1 &" >> /etc/crontabs/root && [[ ! $(pgrep -f "crond") ]] && crond ||
        (echo "@reboot cd ${MMON_MMON_PATH} && nohup ./mmon >/dev/null 2>&1 &"; crontab -l) | crontab - && [[ ! $(pgrep -f "cron") ]] && cron
    fi
    echo -e "${green}MMON ${MMON_VERSION}${plain} 安装完成，已设置开机自启"
    echo -e "MMON配置 ${green}加载成功，请稍等重启生效${plain}"
    
    if [ "$os_other" != 1 ];then
        systemctl daemon-reload
        systemctl enable mmon
        systemctl restart mmon
    else
        cd ${MMON_MMON_PATH} && nohup ./mmon >/dev/null 2>&1 &
    fi
    
    # 选择安装VnStat流量监控插件
    if (! command -v vnstat >/dev/null 2>&1); then
        echo "检测到未安装VnStat流量监控(用于Mmon流量统计的插件)"
        if [ $# -lt 1 ]; then
            read -e -r -p "是否需要安装? [Y/n] " option
            case $option in
                [yY][eE][sS] | [yY])
                    echo "确认安装"
                    install_vnstat 0
                ;;
                [nN][oO] | [nN])
                    echo "退出安装"
                    #exit 0
                ;;
                *)
                    echo "默认安装"
                    install_vnstat 0
                ;;
            esac
        elif [ "$1" == "-y" ]; then
            install_vnstat 0
        fi
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
        #sed -i "/mmon/d" /etc/crontabs/root
        (crontab -l | grep -v "nohup ./mmon") | crontab -
        [[ $(pgrep -f "mmon$") ]] && kill -s 9 $(pgrep -f "mmon$")
    fi
    
    [ -d $MMON_MMON_PATH ] && rm -rf $MMON_MMON_PATH
    clean_all
    echo -e "${green}已成功卸载监控Mmon！${plain}"
    
    # 卸载VnStat流量监控命令
    if (command -v vnstat >/dev/null 2>&1); then
        uninstall_vnstat 0
    fi
    
    if [[ $# == 0 ]]; then
        show_menu
    fi
}

clean_all() {
    if [[ ! -d ${MMON_MMON_PATH} && ! -d ${MMON_DASHBOARD_PATH} ]]; then
        rm -rf ${MMON_BASE_PATH}
    fi
    [ -f /usr/bin/MMON ] && rm -rf /usr/bin/MMON 
    [ -L /usr/bin/mmon ] && rm -rf /usr/bin/mmon
}

check_mmon() {
    [ ! -d ${MMON_MMON_PATH} ] && echo -e "${red}未安装监控端，请先执行安装监控Mmon！！！${plain}\n" && exit 1       
}

check_dashboard() {
    [ ! -d ${MMON_DASHBOARD_PATH} ] && echo -e "${red}未安装探针面板，请先执行安装青蛇探针面板(serverMmon)！！！${plain}\n" && exit 1       
}

status_agent() {
    check_mmon
    echo -e "> Mmon状态"
    if [ "$os_other" = 1 ]; then
      [[ $(pgrep -f "mmon$") ]] && echo -e "${green}Mmon运行正常！${plain}" || echo -e "${red}Mmon运行出错！${plain}"
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
        [[ $(pgrep -f "mmon$") ]] && kill -s 9 $(pgrep -f "mmon$")
        cd ${MMON_MMON_PATH} && nohup ./mmon >/dev/null 2>&1 &
       [[ $(pgrep -f "mmon$") ]] && echo -e "${green}已重启Mmon${plain}" || echo -e "${red}Mmon启动出错！${plain}"
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
        [[ $(pgrep -f "mmon$") ]] && kill -s 9 $(pgrep -f "mmon$")
        [[ $(pgrep -f "mmon$") ]] && echo -e "${red}未能停止Mmon，请手动处理！！！${plain}" && return 1 || echo -e "${green}已停止Mmon${plain}"
    else
        systemctl stop mmon.service
    fi
    
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

install_dashboard() {
    install_base
    
    echo -e "> 安装面板"
    
    # 面板文件夹
    if [ ! -d "${MMON_DASHBOARD_PATH}" ]; then
        mkdir -p $MMON_DASHBOARD_PATH
    else
        echo "您可能已经安装过面板端，重复安装会覆盖数据，请注意备份。"
        read -e -r -p "是否退出安装? [Y/n] " input
        case $input in
            [yY][eE][sS] | [yY])
                echo "退出安装"
                exit 0
            ;;
            [nN][oO] | [nN])
                echo "继续安装"
            ;;
            *)
                echo "退出安装"
                exit 0
            ;;
        esac
    fi
    
    chmod 777 -R $MMON_DASHBOARD_PATH
    
    command -v docker >/dev/null 2>&1
    if [[ $? != 0 ]]; then
        echo -e "正在安装 Docker"
        bash <(curl -sL https://${Get_Docker_URL}) ${Get_Docker_Argu} >/dev/null 2>&1
        if [[ $? != 0 ]]; then
            echo -e "${red}安装失败，请检查本机能否连接 ${Get_Docker_URL}${plain}"
            return 0
        fi
        systemctl enable docker.service
        systemctl start docker.service
        [[ $? != 0 ]] && echo -e "${red}Docker 服务启动失败！请手动处理！${plain}" && exit 1 || echo -e "${green}Docker${plain} 安装成功" 
    fi
    
    command -v docker-compose >/dev/null 2>&1
    if [[ $? != 0 ]]; then
        echo -e "正在安装 Docker-compose"
        curl -L https://${GITHUB_URL}/docker/compose/releases/download/v2.16.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose >/dev/null 2>&1
        if [[ $? != 0 ]]; then
            echo -e "${red}安装失败，请检查本机能否连接 ${Get_Docker_URL}${plain}"
            return 0
        fi
        chmod +x /usr/local/bin/docker-compose
    fi
    
    if [[ $# -ge 1 && "$1" != "0" ]]; then
        modify_dashboard_config "$@"
    else
        modify_dashboard_config 0
    fi
    
    if [[ $# == 0 ]]; then
        show_menu
    fi
}

modify_dashboard_config() {
    check_dashboard
    echo -e "> 修改面板配置"
    
    echo -e "正在下载 Docker 脚本"
    wget -t 2 -T 10 -O /tmp/mmon-docker-compose.yaml https://${GITHUB_RAW_URL}/docker-compose.yaml >/dev/null 2>&1
    if [[ $? != 0 ]]; then
        echo -e "${red}下载脚本失败，请检查本机能否连接 ${GITHUB_RAW_URL}${plain}"
        return 0
    fi
    
    echo "配置开始"
    input_mmon_site_port() {
        agent_port=""
        read -ep "请输入站点访问端口: (回车默认端口5999, 端口范围：1000-60000), 退出请输入exit：" mmon_site_port
        [ "$mmon_site_port" == "exit" ] && exit 0 ||
        if [ "${mmon_site_port}" == "" ]; then
            mmon_site_port="5999"
        elif [ -z $(echo ${mmon_site_port} | egrep "^([1-9][0-9]{3}|[1-5][0-9]{4}|60000)$") ]; then
            clear
            echo -e "${red}端口输入非法！请重新输入！！！${plain}"
            input_mmon_site_port
        fi
    }
    
    if [[ $# -lt 1 || "$1" == "0" ]]; then
        input_mmon_site_port
    else
        mmon_site_port=$1
    fi

    ## 替换端口
    sed -i "/ports/{ n; s|\d.*\d:|$mmon_site_port:|; }" /tmp/mmon-docker-compose.yaml
    ## 替换镜像源
    sed -i "/image/{ s|: .*|: $Docker_IMG:latest|; }" /tmp/mmon-docker-compose.yaml
    
    #[ -d $MMON_DASHBOARD_PATH/basedata ] && mkdir -p $MMON_DASHBOARD_PATH/basedata
    mv -f /tmp/mmon-docker-compose.yaml ${MMON_DASHBOARD_PATH}/docker-compose.yaml
    
    echo -e "面板配置 ${green}修改成功，请稍等重启生效${plain}"
    
    restart_and_update 0
    
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

restart_and_update() {
    check_dashboard
    echo -e "> 重启并更新面板"
    
    cd $MMON_DASHBOARD_PATH
    
    docker compose version >/dev/null 2>&1
    if [[ $? == 0 ]]; then
        docker compose pull
        docker compose down
        docker compose up -d
    else
        docker-compose pull
        docker-compose down
        docker-compose up -d
    fi
    
    if [[ $? == 0 ]]; then
        echo -e "${green}青蛇探针 重启成功${plain}"
        echo -e "默认管理面板地址：${yellow}域名(ip):站点访问端口${plain}"
        echo -e "默认管理面板登录地址：${yellow}域名(ip):站点访问端口${plain}/admin"
    else
        echo -e "${red}重启失败，可能是因为启动时间超过了两秒，请稍后查看日志信息${plain}"
    fi
    
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

start_dashboard() {
    check_dashboard
    echo -e "> 启动面板"
    
    docker compose version >/dev/null 2>&1
    if [[ $? == 0 ]]; then
        cd $MMON_DASHBOARD_PATH && docker compose up -d
    else
        cd $MMON_DASHBOARD_PATH && docker-compose up -d
    fi
    
    if [[ $? == 0 ]]; then
        echo -e "${green}青蛇探针 启动成功${plain}"
    else
        echo -e "${red}启动失败，请稍后查看日志信息${plain}"
    fi
    
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

stop_dashboard() {
    check_dashboard
    echo -e "> 停止面板"
    
    docker compose version >/dev/null 2>&1
    if [[ $? == 0 ]]; then
        cd $MMON_DASHBOARD_PATH && docker compose down
    else
        cd $MMON_DASHBOARD_PATH && docker-compose down
    fi
    
    if [[ $? == 0 ]]; then
        echo -e "${green}青蛇探针 停止成功${plain}"
    else
        echo -e "${red}停止失败，请稍后查看日志信息${plain}"
    fi
    
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

show_dashboard_log() {
    check_dashboard
    echo -e "> 获取面板日志"
    
    docker compose version >/dev/null 2>&1
    if [[ $? == 0 ]]; then
        cd $MMON_DASHBOARD_PATH && docker compose logs -f
    else
        cd $MMON_DASHBOARD_PATH && docker-compose logs -f
    fi
    
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

uninstall_dashboard() {
    check_dashboard
    echo -e "> 卸载管理面板"
    
    docker compose version >/dev/null 2>&1
    if [[ $? == 0 ]]; then
        cd $MMON_DASHBOARD_PATH && docker compose down
    else
        cd $MMON_DASHBOARD_PATH && docker-compose down
    fi
    
    rm -rf $MMON_DASHBOARD_PATH
    docker rmi -f ghcr.io/souying/mmon:latest > /dev/null 2>&1
    docker rmi -f grbhq/mmon:latest > /dev/null 2>&1
    clean_all
    
    if [[ $# == 0 ]]; then
        show_menu
    fi
}

install_vnstat() {
    echo -e "> 安装VnStat流量监控"
    
    [ "$os_other" = 1 ] && echo -e "${red}不支持当前$os_id系统：未找到 systemctl 命令${plain}" && exit 1 ||
    (command -v vnstat >/dev/null 2>&1) && echo -e "${green}已安装过VnStat流量监控，无需再安装！${plain}" && return 1
    #install_soft vnstat
    # 安装依赖环境
    if [[ $os_id =~ "ubuntu" || $os_id =~ "debian" ]]; then
        install_soft tar build-essential libsqlite3-dev libpcap-dev
    elif [[ $os_id =~ "centos" ]]; then
        install_soft tar gcc make sqlite-devel libpcap-devel
    else
        echo -e "${red}当前$os_id系统暂不适配安装VnStat流量监控，请手动安装！${plain}" && exit 1
    fi
    
    # 编译安装
    mkdir -p /tmp -m 777 && cd /tmp
    echo -e "正在下载VnStat源码到/tmp"
    echo -e "https://humdi.net/vnstat/vnstat-2.10.tar.gz"
    curl -kL https://humdi.net/vnstat/vnstat-2.10.tar.gz -# -o vnstat-2.10.tar.gz
    [[ $? != 0 ]] && echo -e "${green}下载出错！请检查本机能否连接https://humdi.net/vnstat${plain}" && return 1
    tar xzf vnstat-2.10.tar.gz && cd /tmp/vnstat-2.10
    ./configure --prefix=/usr --sysconfdir=/etc
    make -j$(nproc) && make install
    
    # 复制vnstat服务文件
    cp examples/systemd/simple/vnstat.service /usr/lib/systemd/system
    rm -rf /tmp/vnstat-2.10.tar.gz
    # 启动vnstat服务
    systemctl daemon-reload
    systemctl enable vnstat
    systemctl unmask vnstat
    systemctl restart vnstat
    [[ $? == 0 ]] && echo -e "\n${green}VnStat流量监控 启动成功！${plain}" || echo -e "\n${red}VnStat流量监控 服务启动出错，请手动处理！${plain}"
    
    if [[ $# == 0 ]]; then
        show_menu
    fi
}

uninstall_vnstat() {
    echo -e "> 卸载VnStat流量监控"
    
    (! command -v vnstat >/dev/null 2>&1) && echo -e "${red}未安装VnStat流量监控，请先安装！${plain}" && return 1
    if [ -d /tmp/vnstat-2.10 ]; then
        cd /tmp/vnstat-2.10
    else
        echo -e "\n${red}未检测到vnstat-2.10文件夹，请手动卸载VnStat！${plain}"
        return 1
    fi
    # 停止vnstat服务
    systemctl disable vnstat
    systemctl stop vnstat
    systemctl daemon-reload
    # 使用源码卸载
    ./configure --prefix=/usr --sysconfdir=/etc && make uninstall
    
    [[ $? == 0 ]] && echo -e "\n${green}VnStat流量监控 卸载成功！${plain}"
    # 清理残留文件
    cd ${cur_dir}
    [ -d /tmp/vnstat-2.10 ] && rm -rf /tmp/vnstat-2.10
    [ -s /etc/vnstat.conf ] && rm -rf /etc/vnstat.conf
    [ -d /var/lib/vnstat ] && rm -rf /var/lib/vnstat
    [ -s /usr/lib/systemd/system/vnstat.service ] && rm -rf /usr/lib/systemd/system/vnstat.service
    echo -e "\n${green}VnStat残留文件 清理完成！${plain}"
    
    if [[ $# == 0 ]]; then
        show_menu
    fi
}

show_usage() {
    echo "青蛇探针监控端 管理脚本使用方法: "
    echo "--------------------------------------------------------"
    echo "./mmon_install.sh install_mmon               - 安装监控mmon"
    echo "./mmon_install.sh update_mmon                - 更新监控mmon"
    echo "./mmon_install.sh show_agent_log             - 查看Mmon日志"
    echo "./mmon_install.sh modify_agent_config        - 修改Mmon配置"
    echo "./mmon_install.sh status_agent               - 查看Mnon状态"
    echo "./mmon_install.sh uninstall_agent            - 卸载Mmon"
    echo "./mmon_install.sh restart_agent              - 重启Mmon"
    echo "./mmon_install.sh stop_agent                 - 停止Mmon"
    echo "--------------------------------------------------------"
    echo "青蛇探针面板 管理脚本使用方法: "
    echo "--------------------------------------------------------"
    echo "./mmon_install.sh install_dashboard          - 安装青蛇探针面板"
    echo "./mmon_install.sh modify_dashboard_config    - 修改面板配置"
    echo "./mmon_install.sh restart_and_update         - 重启并更新面板"
    echo "./mmon_install.sh start_dashboard            - 启动面板"
    echo "./mmon_install.sh stop_dashboard             - 停止面板"
    echo "./mmon_install.sh show_dashboard_log         - 获取面板日志"
    echo "./mmon_install.sh uninstall_dashboard         - 卸载管理面板"
    echo "./mmon_install.sh update_script              - 更新脚本"
    echo "--------------------------------------------------------"
    echo "青蛇探针面板 插件使用: "
    echo "./mmon_install.sh install_vnstat             - 安装VnStat流量监控"
    echo "./mmon_install.sh uninstall_vnstat           - 卸载VnStat流量监控"
    echo "--------------------------------------------------------"
}

show_menu() {
    echo -e "
    ${green}serverMmon监控管理脚本${plain} ${red}${MMON_VERSION}${plain}
    --- https://github.com/souying/serverMmon ---
    ${green}1.${plain}  安装监控Mmon
    ${green}2.${plain}  更新监控Mmon
    ${green}3.${plain}  查看Mmon日志
    ${green}4.${plain}  修改Mmon配置
    ${green}5.${plain}  查看Mnon状态
    ${green}6.${plain}  卸载Mmon
    ${green}7.${plain}  重启Mmon
    ${green}8.${plain}  停止Mmon
    ————————————————-
    ${green}9.${plain}  安装青蛇探针面板(serverMmon)
    ${green}10.${plain} 修改面板配置
    ${green}11.${plain} 重启并更新面板
    ${green}12.${plain} 启动面板
    ${green}13.${plain} 停止面板
    ${green}14.${plain} 获取面板日志
    ${green}15.${plain} 卸载管理面板
    ————————————————-
    ${green}16.${plain} 安装VnStat流量监控
    ${green}17.${plain} 卸载VnStat流量监控
    ${green}18.${plain} 更新脚本
    ————————————————-
    ${green}0.${plain}  退出脚本
    "
    echo && read -ep "请输入选择 [0-18]: " num
    
    case "${num}" in
        0)
            exit 0
        ;;
        1)
            install_mmon
        ;;
        2)
            update_mmon
        ;;
        3)
            show_agent_log
        ;;
        4)
            modify_agent_config
        ;;
        5)
            status_agent
        ;;
        6)
            uninstall_agent
        ;;
        7)
            restart_agent
        ;;
        8)
            stop_agent
        ;;
        9)
            install_dashboard
        ;;
        10)
            modify_dashboard_config
        ;;
        11)
            restart_and_update
        ;;
        12)
            start_dashboard
        ;;
        13)
            stop_dashboard
        ;;
        14)
            show_dashboard_log
        ;;
        15)
            uninstall_dashboard
        ;;
        16)
            install_vnstat
        ;;
        17)
            uninstall_vnstat
        ;;
        18)
            update_script
        ;;
        *)
            echo -e "${red}请输入正确的数字 [0-18]${plain}"
        ;;
    esac
}

pre_check

if [[ $# > 0 ]]; then
    case $1 in
        "install_mmon")
            shift
            if [ $# -ge 2 ]; then
                install_mmon "$@"
            else
                install_mmon 0
            fi
        ;;
        "update_mmon")
            shift
            if [ $# -ge 1 ]; then
                update_mmon "$@"
            else
                update_mmon 0
            fi
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
        "update_script")
            update_script 0
        ;;
        "install_vnstat")
            install_vnstat 0
        ;;
        "uninstall_vnstat")
            uninstall_vnstat 0
        ;;
        "install_dashboard")
            shift
            if [ $# -ge 1 ]; then
                install_dashboard "$@"
            else
                install_dashboard 0
            fi
        ;;
        "modify_dashboard_config")
            modify_dashboard_config 0
        ;;
        "restart_and_update")
            restart_and_update 0
        ;;
        "start_dashboard")
            start_dashboard 0
        ;;
        "stop_dashboard")
            stop_dashboard 0
        ;;
        "show_dashboard_log")
            show_dashboard_log 0
        ;;
        "uninstall_dashboard")
            uninstall_dashboard 0
        ;;
        *) show_usage ;;
    esac
else
    show_menu
fi
