!function ($, undefined) {
    var Template = [
        '<div class="bcd-toggler-wrapper {{SIZE}} ">',
            '<div class="bcd-toggler ',
                    '{{STATE}} {{STATE_STYLE_CLASS}}">',
                '<div class="bcd-toggler-switch"></div>',
            '</div>',
            '<div class="bcd-toggler-lbl {{VISIBILITY}}">{{LABEL}}</div>',
        '</div>'].join('');
    
    $.fn.toggler = function (config) {
        var size          = config.size          || 'large',
            onColorClass  = config.onColorClass  || 'default-on',
            offColorClass = config.offColorClass || 'default-off',
            initState     = config.initState     || 'off',
            showLbl       = ((config.showLbl === false) ? false : true),
            lblOn         = config.lblOn || 'on',
            lblOff        = config.lblOff || 'off',
            markup;
        
        markup = Template.replace('{{SIZE}}', size)
            .replace('{{STATE}}', initState)
            .replace('{{STATE_STYLE_CLASS}}',
                (initState === 'on') ? onColorClass : offColorClass)
            .replace('{{VISIBILITY}}', ((showLbl) ? 'visible' : 'none'))
            .replace('{{LABEL}}', (initState === 'off') ? lblOff : lblOn);

        $(this).html(markup);
        
        $(this).on('mousedown', '.bcd-toggler-wrapper', function () {
            _onClick.call(this, onColorClass, offColorClass, lblOn, lblOff);
        });
    };
    
    function _toggleState(onColorClass, offColorClass, lblOn, lblOff) {
        if ($('.bcd-toggler', $(this)).hasClass('on')) {
            $('.bcd-toggler', $(this)).removeClass('on')
                .removeClass(onColorClass)
                .addClass('off')
                .addClass(offColorClass);
                
            $('.bcd-toggler-lbl', $(this)).html(lblOff);
            $(this).trigger('switchoff');
        } else {
            $('.bcd-toggler', $(this)).removeClass('off')
                .removeClass(offColorClass)
                .addClass('on')
                .addClass(onColorClass);
            $('.bcd-toggler-lbl', $(this)).html(lblOn);
            $(this).trigger('switchon');
        }
        
    }
    
    function _onClick(onColorClass, offColorClass, lblOn, lblOff) {
        _toggleState.call(this, onColorClass, offColorClass, lblOn, lblOff);
    }
}(jQuery)