/**
 * Created by wenbinzhang on 16/1/12.
 */

window.debug = true;

// 公共库
;(function () {

    String.prototype.jstpl_format = function (ns) {
        function fn(w, g) {
            if (g in ns) {
                return ns[g];
            } else {
                return '';
            }
        };
        return this.replace(/%\(([A-Za-z0-9_|.]+)\)/g, fn);
    };

    //HTML转义
    String.prototype.encode = function () {
        return this.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\'/g, '&apos;').replace(/\"/g, '&quot;');
    };

    //HTML反转义
    String.prototype.decode = function () {
        var div = document.createElement('div');
        div.innerHTML = this;
        return div.innerText || div.textNode || '';
    };

    var M = M || {};

    M.util = {

        log: function (msg) {
            if (!!console && typeof console.log == 'function') {
                if (typeof msg == 'object') {
                    console.log(JSON.stringify(msg));
                } else {
                    console.log(msg);
                }
            }
        },

        _ajaxSuccCallback: function (ret, param) {
            var isjumplogin = false;
            if (ret) {
                switch (parseInt(ret.code)) {
                    case 100003 :
                        isjumplogin = true;
                        M.util.doLogin();
                        break;
                    default :

                }

            }
            return isjumplogin;
        },

        _ajaxErrCallback: function (ret, param) {
            M.util.log(JSON.stringify(param));
        },

        ajax: function (param) {

            var succ = param.success,
                err = param.error;

            param.url = param.url;

            param.success = function (ret) {

                var isjump = false;
                if (!param.stopAction) {
                    isjump = M.util._ajaxSuccCallback(ret, param);
                }
                if (!isjump) { // 如果已经跳转登录了  就没有必要执行回调函数了
                    if (typeof succ == 'function') {
                        succ(ret);
                    }
                }

            };

            param.error = function (ret) {

                if (!param.stopAction) {
                    M.util._ajaxErrCallback(ret, param);
                }

                if (typeof err == 'function') {
                    err(ret);
                }
            };
            param.data = param.data || {};
            param.data.rt_time = +( new Date());
            param.crossDomain = true;
            param.xhrFields = {
                withCredentials: true
            };

            if (param.contentType && param.contentType == 'application/json') {
                param.data = JSON.stringify(param.data);
            }

            $.ajax(param);
        },

        formateRate: function (rate) {
            var str = '';
            var num = parseFloat((rate * 100).toFixed(2));
            str = num + '%';
            return str;
        },

        formateDate: function (date) {
            var str = '', date = date + '';
            if (date && date.length == 8) {
                str = date.substr(0, 4) + '-' + date.substr(4, 2) + '-' + date.substr(6, 2);
            } else {
                str = date;
            }
            return str;
        },

        formateTime: function (time) {

            function _addZore(num) {
                if (num < 10) {
                    num = '0' + num;
                }
                return num;
            }

            if (typeof time != 'object') {
                time = '' + time;
                if (time.length > 12) {
                    time = new Date(parseInt(time));
                } else {
                    time = new Date(parseInt(time) * 1000);
                }
            }

            var year = time.getFullYear();
            var month = _addZore(time.getMonth() + 1);
            var date = _addZore(time.getDate());
            var hours = _addZore(time.getHours());
            var minutes = _addZore(time.getMinutes());
            var seconds = _addZore(time.getSeconds());
            return {
                year: year,
                month: month,
                date: date,
                hours: hours,
                minutes: minutes,
                seconds: seconds,
                str: year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds
            };

        },

        formateMoney: function (money, fixed, len) {
            var n = parseInt(fixed) || 2,
                len = parseInt(len) || 3,
                money = parseFloat((money + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "",
                l = money.split(".")[0].split("").reverse(),
                r = money.split(".")[1],
                t = "";

            for (i = 0; i < l.length; i++) {
                t += l[i] + ((i + 1) % len == 0 && (i + 1) != l.length ? "," : "");
            }

            if (fixed == 0) {
                return t.split("").reverse().join("");
            } else {
                return t.split("").reverse().join("") + "." + r;
            }

        },

        formateMoneyByM: function (money, fixed, len) {
            var money = parseInt(money) || 0;
            return M.util.formateMoney(parseFloat(money / 100).toFixed(2), fixed, len);
        },

        addErr: function (str) {
            return '<span class="label label-sm label-danger">' + str + '</span>';
        },

        addSucc: function (str) {
            return '<span class="label label-sm label-success">' + str + '</span>';
        },

        addDef: function (str) {
            return '<span class="label label-sm label-default">' + str + '</span>';
        },

        addPri: function (str) {
            return '<span class="label label-sm label-primary">' + str + '</span>';
        },

        addInfo: function (str) {
            return '<span class="label label-sm label-info">' + str + '</span>';
        },

        addWarn: function (str) {
            return '<span class="label label-sm label-warning">' + str + '</span>';
        },

        addParam: function (url, obj) {
            var p = M.util.param(obj);
            if (!/\?/.test(url) && !/#/.test(url)) {
                url = url + '?' + p;
            } else if (/\?/.test(url) && !/#/.test(url)) {
                url = url + '&' + p;
            } else if (!/\?/.test(url) && /#/.test(url)) {
                url = url.replace('#', '?' + p + '#');
            } else {
                url = url.replace('?', '?' + p + '&');
            }
            return url;
        },

        addHash: function (url, obj) {
            var p = M.util.param(obj);
            if (!/#/.test(url)) {
                url = url + '#' + p;
            } else {
                url = url.replace('#', '#' + p + '&');
            }
            return url;
        },

        param: function (obj) {
            if (typeof obj != 'object') {
                return;
            }
            var p = [];
            for (var i in obj) {
                p.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]));
            }

            return p.join('&');
        },

        getParam: function (name, url) {
            var r = new RegExp('(\\?|#|&)' + name + '=(.*?)(#|&|$)');
            var m = (url || location.href).match(r);
            return (m ? m[2] : '');
        },

        delParam: function (name, url) {
            var r = new RegExp('(\\?|#|&)(' + name + '=.*?)(#|&|$)');
            var m = (url || location.href).match(r);
            if (m && (m.length >= 3) && m[2]) {
                var matchstr = m[0],
                    s = m[2];
                if (matchstr.charAt(0) == '&') {
                    s = '&' + s;
                }
                return url.replace(s, '');
            } else {
                return url;
            }
        },

        showPage: function (pagekey, param) {
            var hash = 'cpage=' + pagekey;

            if (typeof param == 'object') {
                for (var i in param) {
                    hash += '&' + i + '=' + encodeURIComponent(param[i]);
                }
            }

            location.hash = hash;
        },

        convertObjParamToStr: function (obj) {
            var param = [];
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    param.push(i + '=' + obj[i])
                }
            }
            return param.join('&');
        },

        empty: [
            '<div class="note note-warning">',
            '	<h4 class="block">%(title)</h4>',
            '	<p>%(content)</p>',
            '</div>'
        ].join(''),

        makeTableEmpty: function (obj) {

            var title = obj.title || '搜索无结果';
            var content = obj.content || '搜索无结果!';

            var str = this.empty.jstpl_format({
                title: title,
                content: content
            });

            return '<tr><td colspan="' + (obj.colspan || 1) + '">' + str + '</td></tr>';
        },

        loadJSCacheMap: {},

        loadJS: function (src, callback, errCallback) {
            if (!src) {
                return;
            }
            if (M.util.loadJSCacheMap[src]) {
                if (typeof callback == 'function') {
                    callback();
                }
                return;
            }
            var e = document.createElement('script');
            e.setAttribute('type', 'text/javascript');
            e.setAttribute('charset', "utf-8");
            e.setAttribute('src', src);
            if (typeof errCallback == 'function') {
                e.onerror = errCallback;
            }
            ;
            e.onload = function () {
                M.util.loadJSCacheMap[src] = true;
                if (typeof callback == 'function') {
                    callback();
                }
            };
            document.getElementsByTagName('head')[0].appendChild(e);
        },

        attrSaveObj: function (obj) {
            var str = JSON.stringify(obj).encode();
            return $.base64.encode(encodeURIComponent(str));
        },

        attrGetObj: function (str) {

            var objStr = '',
                obj = null;

            try {
                objStr = decodeURIComponent($.base64.decode(str)).decode();
                obj = JSON.parse(objStr);
            } catch (e) {

            }
            return obj;
        },

        isLowBrowser: function () {

            var isLow = true, ua = navigator.userAgent;

            if (/Chrome|Safari|WebKit|Edge|Gecko/ig.test(ua)) {
                isLow = false;
            } else if (/MSIE/ig.test(ua)) {

                var version = parseInt(ua.split('MSIE')[1]);
                if (version >= 9) {
                    isLow = false;
                }
            }

            return isLow;
        },

        // parseXmlToJson: function (res) {
        //     return JSON.parse($($($.parseXML(res)).find('string')).text());
        // }
    };

    M.ajax = M.util.ajax;
    M.log = M.util.log;

    window.M = M;

})();

// md5
;(function ($) {

    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
     * These functions implement the four basic operations the algorithm uses.
     */
    function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }

    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
     * Calculate the MD5 of an array of little-endian words, and a bit length.
     */
    function binl_md5(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var i, olda, oldb, oldc, oldd,
            a = 1732584193,
            b = -271733879,
            c = -1732584194,
            d = 271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5_ff(a, b, c, d, x[i], 7, -680876936);
            d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

            a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5_gg(b, c, d, a, x[i], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5_hh(d, a, b, c, x[i], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i], 6, -198630844);
            d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    }

    /*
     * Convert an array of little-endian words to a string
     */
    function binl2rstr(input) {
        var i,
            output = '';
        for (i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
    }

    /*
     * Convert a raw string to an array of little-endian words
     * Characters >255 have their high-byte silently ignored.
     */
    function rstr2binl(input) {
        var i,
            output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0;
        }
        for (i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        return output;
    }

    /*
     * Calculate the MD5 of a raw string
     */
    function rstr_md5(s) {
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }

    /*
     * Calculate the HMAC-MD5, of a key and some data (raw strings)
     */
    function rstr_hmac_md5(key, data) {
        var i,
            bkey = rstr2binl(key),
            ipad = [],
            opad = [],
            hash;
        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
            bkey = binl_md5(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    }

    /*
     * Convert a raw string to a hex string
     */
    function rstr2hex(input) {
        var hex_tab = '0123456789abcdef',
            output = '',
            x,
            i;
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) +
                hex_tab.charAt(x & 0x0F);
        }
        return output;
    }

    /*
     * Encode a string as utf-8
     */
    function str2rstr_utf8(input) {
        return unescape(encodeURIComponent(input));
    }

    /*
     * Take string arguments and return either raw or hex encoded strings
     */
    function raw_md5(s) {
        return rstr_md5(str2rstr_utf8(s));
    }

    function hex_md5(s) {
        return rstr2hex(raw_md5(s));
    }

    function raw_hmac_md5(k, d) {
        return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
    }

    function hex_hmac_md5(k, d) {
        return rstr2hex(raw_hmac_md5(k, d));
    }

    $.md5 = function (string, key, raw) {
        if (!key) {
            if (!raw) {
                return hex_md5(string);
            } else {
                return raw_md5(string);
            }
        }
        if (!raw) {
            return hex_hmac_md5(key, string);
        } else {
            return raw_hmac_md5(key, string);
        }
    };

}(typeof jQuery === 'function' ? jQuery : this));

// base64
;(function () {
    var _ = jQuery || window;

    _.base64 = ( function ($) {

        var _PADCHAR = "=",
            _ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
            _VERSION = "1.0";


        function _getbyte64(s, i) {
            // This is oddly fast, except on Chrome/V8.
            // Minimal or no improvement in performance by using a
            // object with properties mapping chars to value (eg. 'A': 0)

            var idx = _ALPHA.indexOf(s.charAt(i));

            if (idx === -1) {
                throw "Cannot decode base64";
            }

            return idx;
        }


        function _decode(s) {
            var pads = 0,
                i,
                b10,
                imax = s.length,
                x = [];

            s = String(s);

            if (imax === 0) {
                return s;
            }

            if (imax % 4 !== 0) {
                throw "Cannot decode base64";
            }

            if (s.charAt(imax - 1) === _PADCHAR) {
                pads = 1;

                if (s.charAt(imax - 2) === _PADCHAR) {
                    pads = 2;
                }

                // either way, we want to ignore this last block
                imax -= 4;
            }

            for (i = 0; i < imax; i += 4) {
                b10 = ( _getbyte64(s, i) << 18 ) | ( _getbyte64(s, i + 1) << 12 ) | ( _getbyte64(s, i + 2) << 6 ) | _getbyte64(s, i + 3);
                x.push(String.fromCharCode(b10 >> 16, ( b10 >> 8 ) & 0xff, b10 & 0xff));
            }

            switch (pads) {
                case 1:
                    b10 = ( _getbyte64(s, i) << 18 ) | ( _getbyte64(s, i + 1) << 12 ) | ( _getbyte64(s, i + 2) << 6 );
                    x.push(String.fromCharCode(b10 >> 16, ( b10 >> 8 ) & 0xff));
                    break;

                case 2:
                    b10 = ( _getbyte64(s, i) << 18) | ( _getbyte64(s, i + 1) << 12 );
                    x.push(String.fromCharCode(b10 >> 16));
                    break;
            }

            return x.join("");
        }


        function _getbyte(s, i) {
            var x = s.charCodeAt(i);

            if (x > 255) {
                throw "INVALID_CHARACTER_ERR: DOM Exception 5";
            }

            return x;
        }


        function _encode(s) {
            if (arguments.length !== 1) {
                throw "SyntaxError: exactly one argument required";
            }

            s = String(s);

            var i,
                b10,
                x = [],
                imax = s.length - s.length % 3;

            if (s.length === 0) {
                return s;
            }

            for (i = 0; i < imax; i += 3) {
                b10 = ( _getbyte(s, i) << 16 ) | ( _getbyte(s, i + 1) << 8 ) | _getbyte(s, i + 2);
                x.push(_ALPHA.charAt(b10 >> 18));
                x.push(_ALPHA.charAt(( b10 >> 12 ) & 0x3F));
                x.push(_ALPHA.charAt(( b10 >> 6 ) & 0x3f));
                x.push(_ALPHA.charAt(b10 & 0x3f));
            }

            switch (s.length - imax) {
                case 1:
                    b10 = _getbyte(s, i) << 16;
                    x.push(_ALPHA.charAt(b10 >> 18) + _ALPHA.charAt(( b10 >> 12 ) & 0x3F) + _PADCHAR + _PADCHAR);
                    break;

                case 2:
                    b10 = ( _getbyte(s, i) << 16 ) | ( _getbyte(s, i + 1) << 8 );
                    x.push(_ALPHA.charAt(b10 >> 18) + _ALPHA.charAt(( b10 >> 12 ) & 0x3F) + _ALPHA.charAt(( b10 >> 6 ) & 0x3f) + _PADCHAR);
                    break;
            }

            return x.join("");
        }


        return {
            decode: _decode,
            encode: _encode,
            VERSION: _VERSION
        };

    }(jQuery) );

}());


;(function () {

    var config = {
        urls: {
            getPublicKey: '/onecollection_admin/get_pub_key'
        }
    };

    var encrypt = null;

    var publicKey = '';

    function getKey(cb) {
        if (publicKey) {
            if (typeof cb == 'function') {
                cb(encrypt);
            }
        } else {

            var url = config.urls.getPublicKey;
            var param = {};

            M.ajax({
                stopAction: true,
                url: url,
                dataType: 'json',
                type: 'POST',
                contentType: 'application/json',
                data: param,
                success: function (ret) {
                    if (ret && ret.code == 0 && ret.data && ret.data.pub_key) {
                        publicKey = ret.data.pub_key;
                        encrypt.setPublicKey(publicKey);
                        if (typeof cb == 'function') {
                            cb(encrypt);
                        }
                    } else {
                        alert(ret.msg);
                    }
                },
                error: function () {
                    alert('网络错误,获取密码加密公钥失败!');
                }
            });
        }
    };

    function init(cb) {
        if (typeof JSEncrypt == 'function') {
            if (typeof cb == 'function') {
                getKey(cb);
            }
        } else {
            M.util.loadJS('./js/lib/jsencrypt.js', function () {
                encrypt = new JSEncrypt();
                if (typeof cb == 'function') {
                    getKey(cb);
                }
            });
        }
    };

    window.g_rsa = {
        init: init
    }
}());

;(function () {

    var loadedFileCache = {};

    function loadOneFile(url) {

        var isCSS = /\.css(?:\?|#|$)/i.test(url);
        var dtd = $.Deferred();
        var node = document.createElement(isCSS ? "link" : "script");

        node.onload = function () {
            loadedFileCache[url] = true;
            dtd.resolve();
            node = null;
        };

        node.onerror = function () {
            if (console && console.log) {
                console.log('load file: ' + url + ' fail;');
            }
            dtd.reject();
            node = null;
        };

        if (isCSS) {
            node.rel = "stylesheet";
            node.href = url;
        } else {
            node.async = true;
            node.src = url;
        }
        document.getElementsByTagName('head')[0].appendChild(node);
        return dtd.promise();
    };

    function loadFiles(urls) {
        if (!$.isArray(urls)) {
            return loadFiles([urls]);
        }
        var ret = [];
        for (var i = 0; i < urls.length; i++) {
            var url = urls[i];
            if (/\.(js|css)(?:\?|#|$)/i.test(url)) {
                if (!loadedFileCache[url]) {
                    ret[i] = loadOneFile(url);
                }
            }
        }
        ;
        return $.when.apply($, ret);
    };

    window.g_loadFiles = loadFiles;


}());

// 上传封装
;(function () {

    var tokenUrl = 'http://218.17.81.211:45852/onecollection_admin/qiniu_uptoken';
    //var tokenUrl = 'http://admin.collection360.dafyjk.com/api/collection_admin/qiniu_uptoken_by_ns?ns=collection-firstparty';

    function initDown(cb) {
        if (typeof cb == 'function') {
            if (typeof Qiniu == 'object' && typeof Qiniu.uploader == 'function') {
                cb();
            } else {
                setTimeout(function () {
                    initDown(cb);
                }, 1000);
            }
        }
    };

    function init(cb) {
        var fn = arguments.callee;
        if (!fn.hasLoaded) {
            fn.hasLoaded = true;
            M.util.loadJS('js/qiniu/plupload/plupload.full.min.js', function () {
                M.util.loadJS('js/qiniu/qiniu.js', function () {
                    initDown(cb);
                });
            });

        } else {
            initDown(cb);
        }
    };

    function getToken() {
        return tokenUrl;
    };

    window.g_upload = {
        init: init,
        getToken: getToken
    }

}());
