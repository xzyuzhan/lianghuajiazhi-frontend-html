//公用函数js

/**
* 格式化浮点数到字符串，第二个参数为小数点后保留的位数，返回的是字符串
* 实例：12345.format('0,000.00') 返回：12,345.00
* Formats the number according to the 'format' string;
* adherses to the american number standard where a comma
* is inserted after every 3 digits.
*  note: there should be only 1 contiguous number in the format,
* where a number consists of digits, period, and commas
*        any other characters can be wrapped around this number, including '$', '%', or text
*        examples (123456.789):
*          '0' - (123456) show only digits, no precision
*          '0.00' - (123456.78) show only digits, 2 precision
*          '0.0000' - (123456.7890) show only digits, 4 precision
*          '0,000' - (123,456) show comma and digits, no precision
*          '0,000.00' - (123,456.78) show comma and digits, 2 precision
*          '0,0.00' - (123,456.78) shortcut method, show comma and digits, 2 precision
*
* @method format
* @param format {string} the way you would like to format this text
* @return {string} the formatted number
* @public
*/
Number.prototype.format = function(format) {
    if (typeof format != 'string') { return ''; } // sanity check 
    var hasComma = -1 < format.indexOf(','),
    psplit = stripNonNumeric(format).split('.'),
    that = this;
    // compute precision
    if (1 < psplit.length) {
        // fix number precision
        that = that.toFixed(psplit[1].length);
    }
    // error: too many periods
    else if (2 < psplit.length) {
        throw ('NumberFormatException: invalid format, formats should have no more than 1 period: ' + format);
    }
    // remove precision
    else {
        that = that.toFixed(0);
    }
    // get the string now that precision is correct
    var fnum = that.toString();
    // format has comma, then compute commas
    if (hasComma) {
        // remove precision for computation
        psplit = fnum.split('.');

        var cnum = psplit[0],
      parr = [],
      j = cnum.length,
      m = Math.floor(j / 3),
      n = cnum.length % 3 || 3; // n cannot be ZERO or causes infinite loop 

        // break the number into chunks of 3 digits; first chunk may be less than 3
        for (var i = 0; i < j; i += n) {
            if (i != 0) { n = 3; }
            parr[parr.length] = cnum.substr(i, n);
            m -= 1;
        }
        // put chunks back together, separated by comma
        fnum = parr.join(',');

        // add the precision back in
        if (psplit[1]) { fnum += '.' + psplit[1]; }
    }
    // replace the number portion of the format with fnum
    return format.replace(/[\d,?\.?]+/, fnum);
};

//为古董浏览器增加方法
if (!Object.keys) {
    Object.keys = function (obj) {
        var keys = [],
            k;
        for (k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
        }
        return keys;
    };
}

// 封装localStorage，支持对象和key筛选
$J.localStorage = (function(){
    var ls = window.localStorage;
    function get( key ){
        var item = ls.getItem( key );
        try{
            return JSON.parse( item );
        } catch(err) {
            return item;
        }
    }
    function set( key, data ){
        if( typeof data == 'object' ){
            data = JSON.stringify( data );
        }
        ls.setItem( key, data );
    };
    function del( key ){
        ls.removeItem( key );
    };
    function filter( keyFilter ){
        var result = {}, key;
        for( var i in ls ){
            if( typeof keyFilter == 'function' ){
                if( !keyFilter( i ) ) continue;
            } else if( keyFilter instanceof RegExp ){
                if( !keyFilter.test( i ) ) continue;
            }
            result[i] = get( i );
        }
        return result;
    };
    var f = function( key, data ){
        if( typeof key === 'string' ) {
            if( typeof data === 'undefined' ){
                return get( key );
            } else {
                if( data === null ){
                    del( key );
                } else {
                    set( key, data );
                }
            }
        } else {
            return filter( key );
        }
    };
    f.get = get;
    f.set = set;
    f.del = del;
    f.filter = filter;
    return f;
}());

// This function removes non-numeric characters
function stripNonNumeric(str) {
    str += '';
    var rgx = /^\d|\.|-$/;
    var out = '';
    for (var i = 0; i < str.length; i++) {
        if (rgx.test(str.charAt(i))) {
            if (!((str.charAt(i) == '.' && out.indexOf('.') != -1) ||
             (str.charAt(i) == '-' && out.length != 0))) {
                out += str.charAt(i);
            }
        }
    }
    return out;
}

function stopBubble(event){
    event.stopPropagation();
}

//添加进收藏夹
function AddFavorite(pid) {
    ga('send', 'event', 'cart', 'addfav', '' + pid);
    AjaxCall("user", "ajaxAddFavorite", { 'pid': pid }, function(data) {
        if (data.status) {
            alert('收藏成功');
        } else {
            alert(data.message);
        }
    });
}

function htmlEncode(value){
  //create a in-memory div, set it's inner text(which jQuery automatically encodes)
  //then grab the encoded contents back out.  The div never exists on the page.
  return $J('<div/>').text(value).html();
}

function htmlDecode(value){
  return $J('<div/>').html(value).text();
}

$J.fn.extend({
	// 回车提交文本框，要求在form内
	easysubmit: function( allow_empty ){
		var that = this;
		var form = this.ancestorUntil('form');
		if( form.length > 0 ){
			if( !allow_empty ){
				form.on('submit', function(){
					return $J.trim( that.val() ).length > 0;
				});
			}
			this.on('keyup', function(event){
				if( event.keyCode == 13 ){
					form.submit();
				}
			});
		}
		return this;
	},
    //按条件显示隐藏
    toggleBy: function( condition ){
        return this.each(function(){
            if( condition ){
                $J(this).show();
            } else {
                $J(this).hide();
            }
        });
    },
    toggleOffBy: function( condition ){
        return this.each(function(){
            if( condition ){
                $J(this).hide();
            } else {
                $J(this).show();
            }
        });
    },
    //按条件切换class的有无
    toggleClassBy: function( condition, className ){
        return this.each(function(){
            if( condition ){
                $J(this).addClass( className );
            } else {
                $J(this).removeClass( className );
            }
        });
    },
    // 找到符合条件的一个先祖
    ancestorUntil: function( selector ){
        var parents = this.parentsUntil( selector );
        if( parents.length > 0 ){
            return parents.last().parent();
        }
        return this.parent( selector );
    }
});

function addCartCallback(data){
    if (data == null || data.status == null) {
        alert('添加到购物车出现异常，请联系客服');
        return;
    }
    var msg = '添加到购物车成功';
    if (!data.status)
        msg = '添加到购物车失败';
    if (data.message)
        msg += "\r\n" + data.message;
    if (data.cart_num !== null)
        $J('#cart_num').attr('alt', data.cart_num).html(data.cart_num);
    alert(msg);
}

//添加到收藏夹
function addFavoriteFromASIN(source_id, source_site_id) {
    ga('send', 'event', 'embedded', 'addfav', '' + source_id);
    AjaxCall("user", "ajaxAddFavoriteFromASIN", {source_id: source_id, source_site_id: source_site_id}, function(data) {
        if (data.status) {
            // 加收藏
            $J(".jmall-fav").removeClass('jmall-active').next().addClass('jmall-active');
        } else {
            alert(data.message);
        }
    });
    return false;
}

function delFavoriteFromASIN(source_id, source_site_id) {
    ga('send', 'event', 'embedded', 'delfav', '' + source_id);
    AjaxCall("user", "ajaxDelFavoriteFromASIN", {source_id: source_id, source_site_id: source_site_id}, function(data) {
        if (data.status) {
            $J(".jmall-faved").removeClass('jmall-active').prev().addClass('jmall-active');
        } else {
            alert(data.message);
        }
    });
    return false;
}

function is_ascii(str){
    return /^[\x00-\xff]+$/.test(str);
}

function openchat() {
    var siteId = '80021157';
    var planId = '1083';
    var g = 'http://chatserver.comm100.cn/ChatWindow.aspx?siteId=' + siteId + '&planId=' + planId + '&partnerId=-1&visitType=1&byHref=1';
    window.open(g, "livechat" + siteId, "left = 150, top = 150, height = 570, width = 552, resizable=yes, toolbar = no, location = no, menubar = no, status = no");
    return false;
}