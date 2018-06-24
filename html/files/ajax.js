var AjaxCall = (function(){
	var lastRequests = null;

	return function(module, action, params, callback, callerror, settings) {
		AjaxLoading.start();
		var async = true;
		var timeout = 10000;
		var url = '';
		var abort_before = true;	//默认干掉之前的请求
		var time_start = new Date().getTime();
		if( $J.isPlainObject( settings ) ){
			if( typeof settings.async == 'boolean' ){
				async = settings.async;
			}
			if( typeof settings.timeout == 'number' ){
				timeout = settings.timeout;
			}
			if( typeof settings.abort_before == 'boolean' ){
				abort_before = settings.abort_before;
			}
		}
		if (module.substring(0, 4) == 'http') {
			url = module + '/' + action;
		} else {
			url = ajaxContextPath + '/' + module + '/' + action;
		}
		if( abort_before && lastRequests ){
			lastRequests.abort();
		}
		lastRequests = $J.ajax({
			type: "POST",
			async: async,
			url: url,
			data: params,
			timeout: timeout,
			dataType: "json",
			success: function(data) {
				AjaxLoading.end();
				if (typeof callback == "function") {
					callback(data);
				}
			},
			error: function(jqXHR, textStatus) {
				AjaxLoading.end();
				var result = true;
				if ( textStatus == "timeout" ) {
					alert("请求超时");
				}
				if (typeof callerror == "function") {
					if( callerror( jqXHR, textStatus ) === false ){
						result = false;
					}
				}
				if( result && window.ga !== undefined ){
					var time_used = new Date().getTime() - time_start;
					ga('send', 'event', 'ajax_error', url, textStatus, time_used);
				}
			}
		});
		return lastRequests;
	}
})();

var LoadingController = function( start_func, end_func ){
	var _count = 0;
	return {
		start: function(){
			if( _count == 0 && typeof start_func == 'function' ){
				start_func();
			}
			++ _count;
		},
		end: function(){
			-- _count;
			if( _count <= 0 && typeof end_func == 'function' ){
				end_func();
			}
			if( _count < 0 ){
				_count = 0;
			}
		},
		count: function(){
			return _count > 0;
		}
	};
};

var _lodingTextInterval = 0;

var AjaxLoadingStart = function() {
	var header_wrap = $J(".jmall-header-wrap");
	if (!header_wrap.find(".jmall-loading").hasClass('fadein')) {
	    header_wrap.find(".jmall-cs span").addClass('jmall-cs-loading');
	    $J("#jmall-loadingDiv").show();
		var _lodingTextLen = 0;
		_lodingTextInterval = setInterval(function() {
			var text = '';
			switch (_lodingTextLen) {
				case 0:
					text = '&nbsp;&nbsp;&nbsp;';
					break;
				case 1:
					text = '.&nbsp;&nbsp;';
					break;
				case 2:
					text = '..&nbsp;';
					break;
				case 3:
					text = '...';
					break;
			}
			header_wrap.find(".jmall-loading var").html(text);
			$J("#jmall-loadingDiv").html('正在载入' + text + '<span></span>');
			if (_lodingTextLen >= 3)
				_lodingTextLen = 0;
			else
				_lodingTextLen++;
		}, 500);
	}
};

var AjaxLoadingEnd = function() {
	var header_wrap = $J(".jmall-header-wrap");
	header_wrap.find(".jmall-loading").removeClass('fadein').addClass('fadeout').addClass('hide');
	header_wrap.find(".jmall-cs span").removeClass('jmall-cs-loading');
	$J("#jmall-loadingDiv").hide();
	if (_lodingTextInterval > 0)
		window.clearInterval(_lodingTextInterval);
};

//默认Loading动画控制器
var AjaxLoading = new LoadingController( AjaxLoadingStart, AjaxLoadingEnd );

var jmall = {
    ajaxCallback: function(mod, act, data){
        return function(callback){
            AjaxCall(mod, act, data, function(result){
                callback(!result.status, result);
            });
        }
    },
    errorCallback: function(err, result){
        if(typeof err == 'string')
            alert(err);
        else if(typeof result == 'object' && typeof result.message == 'string')
            alert(result.message);
    }
}
