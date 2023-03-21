//Flot Pie Chart Devices
$(function() {

    var data = [{
        label: "苹果手机",
        data: 21,
        color: "#d3d3d3",
    }, {
        label: "三星",
        data: 3,
        color: "#bababa",
    }, {
        label: "微软",
        data: 15,
        color: "#79d2c0",
    }, {
        label: "黑莓",
        data: 52,
        color: "#1ab394",
    }];

    var plotObj = $.plot($("#flot-pie-chart-devices"), data, {
        series: {
            pie: {
                show: true
            }
        },
        grid: {
            hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: false
        }
    });

});

//Flot Pie Chart Browsers
$(function() {

    var data = [{
        label: "Chrome",
        data: 21,
        color: "#d3d3d3",
    }, {
        label: "Firefox",
        data: 3,
        color: "#bababa",
    }, {
        label: "IE",
        data: 15,
        color: "#79d2c0",
    }, {
        label: "Safari",
        data: 52,
        color: "#1ab394",
    }];

    var plotObj = $.plot($("#flot-pie-chart-browsers"), data, {
        series: {
            pie: {
                show: true
            }
        },
        grid: {
            hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: false
        }
    });

});

//Flot Pie Chart Sources
$(function() {

    var data = [{
        label: "客户 1",
        data: 21,
        color: "#d3d3d3",
    }, {
        label: "客户 2",
        data: 3,
        color: "#bababa",
    }, {
        label: "客户 3",
        data: 15,
        color: "#79d2c0",
    }, {
        label: "客户 4",
        data: 52,
        color: "#1ab394",
    }];

    var plotObj = $.plot($("#flot-pie-chart-sources"), data, {
        series: {
            pie: {
                show: true
            }
        },
        grid: {
            hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: false
        }
    });

});


//Flot Pie Chart Carriers
$(function() {

    var data = [{
        label: "运营商 1",
        data: 21,
        color: "#d3d3d3",
    }, {
        label: "运营商 2",
        data: 3,
        color: "#bababa",
    }, {
        label: "运营商 3",
        data: 15,
        color: "#79d2c0",
    }, {
        label: "运营商 4",
        data: 52,
        color: "#1ab394",
    }];

    var plotObj = $.plot($("#flot-pie-chart-carriers"), data, {
        series: {
            pie: {
                show: true
            }
        },
        grid: {
            hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: false
        }
    });

});

//Flot Pie Chart Gender
$(function() {

    var data = [{
        label: "男",
        data: 50,
        color: "#d3d3d3",
    },{
        label: "女",
        data: 50,
        color: "#1ab394",
    }];

    var plotObj = $.plot($("#flot-pie-chart-gender"), data, {
        series: {
            pie: {
                show: true
            }
        },
        grid: {
            hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: false
        }
    });

});

//Flot Pie Chart Age groups
$(function() {

    var data = [{
        label: "18/24",
        data: 21,
        color: "#d3d3d3",
    }, {
        label: "24/34",
        data: 3,
        color: "#bababa",
    }, {
        label: "35/44",
        data: 15,
        color: "#79d2c0",
    }, {
        label: "45/54",
        data: 37,
        color: "#1ab394",
    }, {
        label: ">55",
        data: 15,
        color: "#79d2c0",
    }];

    var plotObj = $.plot($("#flot-pie-chart-age-groups"), data, {
        series: {
            pie: {
                show: true
            }
        },
        grid: {
            hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: false
        }
    });

});

//Flot Pie Chart Spending power
$(function() {

    var data = [{
        label: "高",
        data: 20,
        color: "#d3d3d3",
    }, {
        label: "中",
        data: 40,
        color: "#1ab394",
    }, {
        label: "低",
        data: 40,
        color: "#79d2c0",
    }];

    var plotObj = $.plot($("#flot-pie-chart-spending-power"), data, {
        series: {
            pie: {
                show: true
            }
        },
        grid: {
            hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: false
        }
    });

});

//Flot Pie Chart User type
$(function() {

    var data = [{
        label: "商业",
        data: 60,
        color: "#1ab394",
    }, {
        label: "私营",
        data: 40,
        color: "#79d2c0",
    }];

    var plotObj = $.plot($("#flot-pie-chart-user-type"), data, {
        series: {
            pie: {
                show: true
            }
        },
        grid: {
            hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: false
        }
    });

});

//Flot Pie Chart Interest
$(function() {

    var data = [{
        label: "汽车",
        data: 21,
        color: "#d3d3d3",
    }, {
        label: "体育",
        data: 3,
        color: "#bababa",
    }, {
        label: "健康",
        data: 15,
        color: "#79d2c0",
    }, {
        label: "教育",
        data: 37,
        color: "#1ab394",
    }, {
        label: "其他",
        data: 15,
        color: "#79d2c0",
    }];

    var plotObj = $.plot($("#flot-pie-chart-interest"), data, {
        series: {
            pie: {
                show: true
            }
        },
        grid: {
            hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: false
        }
    });

});


