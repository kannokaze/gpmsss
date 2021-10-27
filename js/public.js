var $;
layui.use(['layer', 'table'], function() {
    var layer = layui.layer,
        table = layui.table;
    // window.$ = $;        
    $ = layui.$;
    layui.layer.config({
        extend: 'skin.css', //加载新皮肤
        skin: parent.skinStyle
    })
    $(document).off('mousedown', '.layui-table-grid-down').on('mousedown', '.layui-table-grid-down', function(event) { table._tableTrCurr = $(this).closest('td'); });
    $(document).off('click', '.layui-table-tips-main [lay-event]').on('click', '.layui-table-tips-main [lay-event]', function(event) {
        var elem = $(this);
        var tableTrCurr = table._tableTrCurr;
        if (!tableTrCurr) { return; }
        var layerIndex = elem.closest('.layui-table-tips').attr('times'); // 关闭当前这个显示更多的
        layer.close(layerIndex);
        table._tableTrCurr.find('[lay-event="' + elem.attr('lay-event') + '"]').first().click();
    });
})


var gpms = {
    dhost: "http://localhost/gpmsss/",
    host: "http://localhost:8081/gpms/",
    downloadHost: "http://localhost:8081/uploadServer",
    isLogin: function(res, fn) {
        if (typeof res === "string") {
            res = JSON.parse(res);
        }

        if (res.code == 4) {
            //询问框
            parent.layer.alert('未登录或长时间未操作，去登录？', {
                btn: ['去登录'], //按钮
                title: '系统提示',
                icon: 5,
                skin: 'layui-layer-molv',
                anim: 6,
                closeBtn: 0,
                scrollbar: false
            }, function() {
                top.location.href = gpms.dhost + "page/login.html";
            });
        } else {
            if (typeof fn === "function") {
                fn();
            }
        }
    },
    download: function(url, name) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true); // 也可以使用POST方式，根据接口
        xhr.responseType = "blob"; // 返回类型blob
        xhr.withCredentials = true; // 跨域
        // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
        xhr.onload = function() {
            // 请求完成
            // if (this.status === 201) {
            // console.log(this.response);
            // gpms.isLogin(this.response, function() {
            // 返回200
                var blob = this.response;
                var reader = new FileReader();
                reader.readAsDataURL(blob); // 转换为base64，可以直接放入a表情href
                reader.onload = function(e) {
                    // 转换完成，创建一个a标签用于下载
                    var a = document.createElement('a');
                    a.download = name || '信息导出文件.xlsx';
                    a.href = e.target.result;
                    $("body").append(a); // 修复firefox中无法触发click
                    a.click();
                    $(a).remove();
                }
            // var a = document.createElement('a');
            // a.download = 'data.xlsx' || name;
            // a.href = url;
            // $("body").append(a); // 修复firefox中无法触发click
            // a.click();
            // $(a).remove();
            // })
            console.log("下载")
            // }
        };
        // 发送ajax请求
        xhr.send();
    }

}

Date.prototype.format = function(fmt) { //author: meizz  
    var o = {
        "M+": this.getMonth() + 1, //月份  
        "d+": this.getDate(), //日  
        "h+": this.getHours(), //小时  
        "m+": this.getMinutes(), //分  
        "s+": this.getSeconds(), //秒   
        "q+": Math.floor((this.getMonth() + 3) / 3), //q是季度
        "S": this.getMilliseconds() //毫秒  
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

String.prototype.format = function(args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof(args) == "loginTime") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题  
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}

function dateFormat(value) {
    return value ? new Date(value).format("yyyy-MM-dd hh:mm:ss") : "";
}


/*
 * 超时限制
 */
function isTimeOut(last) {
    var timestamp = Date.parse(new Date());
    var diff = last - timestamp;
    if (diff < 0) {
        return true;
    }
    return false;
}
var lastTime;

function getLastTime(time) {
    lastTime = time;
}

function getConfigDeadline(ele, timeoutfn) {
    var last;
    timeoutfn = timeoutfn || function() {
        layer.alert('同学你来的太晚了，无法修改或提交了哦！<br>最晚期限：' + dateFormat(last), {
            btn: ['我还想提交'], //按钮
            title: '系统提示',
            icon: 5,
            skin: 'layui-layer-molv',
            anim: 6,
            closeBtn: 0,
            scrollbar: false
        }, function() {
            layer.alert('已通知教师您的意愿', { title: '温馨提示', icon: 1, })
        });
    }

    var flatss = false;
    console.log($)
    $.ajax({
        url: gpms.host + "api/config/deadline",
        type: "GET",
        xhrFields: { withCredentials: true },
        crossDomain: true,
        async: false,
        beforeSend: function(xhr) {
            index = layer.msg('加载中', {
                icon: 16,
                shade: 0.01
            });
        },
        success: function(res) {
            if (res.data.length < 1) {
                ele.html("尚未定义期限");
                return;
            }
            if (!isTimeOut(res.data[0].confLasttime)) {
                flatss = true;
            }
            last = res.data[0].confLasttime;
            ele.html("期限：" + dateFormat(res.data[0].confLasttime) + "，剩余：" + deadlineTime(res.data[0].confLasttime, timeoutfn));
        },
        error: function(xhr, status, error) {
            layer.alert('接口返回异常<br>' + error, { icon: 5 });
            ele.html("获取失败")
        },
        complete: function(xhr, status) {
            layer.close(index);
        }
    })

    return flatss;
}

function getCommentDeadline(ele, stage, timeoutfn) {
    var last;
    timeoutfn = timeoutfn || function() {
        layer.alert('本年实习已经结束了，无法评分了哦！<br>最晚期限：' + dateFormat(last), {
            btn: ['我还想评分'], //按钮
            title: '系统提示',
            icon: 5,
            skin: 'layui-layer-molv',
            anim: 6,
            closeBtn: 0,
            scrollbar: false
        }, function() {
            layer.alert('已通知管理员，您还想评分', { title: '温馨提示', icon: 1, })
        });
    }
    // console.log(stage)
    var flatss = false;
    $.ajax({
        url: gpms.host + "api/config/deadlineCommentByNow",
        type: "GET",
        data: 'stage=' + stage,
        xhrFields: { withCredentials: true },
        crossDomain: true,
        // async: false,
        beforeSend: function(xhr) {
            index = layer.msg('加载中', {
                icon: 16,
                shade: 0.01
            });
        },
        success: function(res) {
            if (res.data.length < 1) {
                ele.html("尚未定义期限");
                return;
            }
            if (!isTimeOut(res.data[0].confLasttime)) {
                flatss = true;
            }
            last = res.data[0].confLasttime;
            ele.html("期限：" + dateFormat(res.data[0].confLasttime) + "，剩余：" + deadlineTime(res.data[0].confLasttime, timeoutfn));
            getLastTime(res.data[0].confLasttime);
        },
        error: function(xhr, status, error) {
            layer.alert('接口返回异常<br>' + error, { icon: 5 });
            ele.html("获取失败")
        },
        complete: function(xhr, status) {
            layer.close(index);
        }
    })

    return flatss;
}



function deadlineTime(last, fn) {
    var timestamp = Date.parse(new Date());
    var diff = last - timestamp;
    var day, hours;

    days = Math.floor(diff / (24 * 3600 * 1000));
    hours = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));

    if (last - timestamp >= 0) {

    } else {
        fn();
        days = 0;
        hours = 0;
    }

    return days + " 天 " + hours + " 时 ";
}



/**
 * 获取 blob
 * @param  {String} url 目标文件地址
 * @return {Promise} 
 */
function getBlob(url) {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();

        xhr.open('GET', url);

        xhr.responseType = 'blob';

        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            }
        };

        xhr.send();

    });
}

/**
 * 保存
 * @param  {Blob} blob     
 * @param  {String} filename 想要保存的文件名称
 */
function saveAs(blob, filename) {
    if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        const link = document.createElement('a');
        const body = document.querySelector('body');

        link.href = window.URL.createObjectURL(blob);
        link.download = filename;

        // fix Firefox
        link.style.display = 'none';
        body.appendChild(link);

        link.click();
        body.removeChild(link);

        window.URL.revokeObjectURL(link.href);
    }
}

/**
 * 下载
 * @param  {String} url 目标文件地址
 * @param  {String} filename 想要保存的文件名称
 */
function download(url, filename) {
    getBlob(url).then(blob => {
        saveAs(blob, filename);
    });
}


Date.prototype.format = function(fmt) { // author: meizz
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


function getFileSize(fileByte) {
    var fileSizeByte = fileByte;
    var fileSizeMsg = "";
    if (fileSizeByte < 1048576) fileSizeMsg = (fileSizeByte / 1024).toFixed(2) + "KB";
    else if (fileSizeByte == 1048576) fileSizeMsg = "1MB";
    else if (fileSizeByte > 1048576 && fileSizeByte < 1073741824) fileSizeMsg = (fileSizeByte / (1024 * 1024)).toFixed(2) + "MB";
    else if (fileSizeByte > 1048576 && fileSizeByte == 1073741824) fileSizeMsg = "1GB";
    else if (fileSizeByte > 1073741824 && fileSizeByte < 1099511627776) fileSizeMsg = (fileSizeByte / (1024 * 1024 * 1024)).toFixed(2) + "GB";
    else fileSizeMsg = "文件超过1TB";
    return fileSizeMsg;
}