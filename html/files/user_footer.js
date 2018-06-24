// 顶部导航栏的自动隐藏
$J(function() {
    var header = $J('.jmall-header-wrap.jmall-fixed, .jmall-header-wrap.jmall-extend'),
        _h = header.find('.jmall-menu').outerHeight() + 2;
    if(!header.length) return;
    $J(window).scroll(function(){
        if($J(window).scrollTop() < _h){
            header.css({'position':'absolute', 'top':'0'});
            header.removeClass('jmall-header-now-fixed');
        }
        else{
            header.css({'position':'fixed', 'top': - + _h + 'px'});
            header.addClass('jmall-header-now-fixed');
        }
    });
});

init_switch_search_source();