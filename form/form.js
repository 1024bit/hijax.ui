/**
 *  VUI's `form` class, for form beautify and form progressive enhancement
 *
 *  Inspiration:
 *  Form elements cut off from form that is not the meaning of existence
 *  Autocomplete's datasource: server, local
 *
 *  Usage:
 *    $(formselector).form(options)
 *    $(formselector).form('checkbox|radio|select', selector, settings)
 *    $(checkboxselector).checkbox(options), ...
 *    $(formselector).data('vui-form').checkbox(options), ...
 *
 *  Event:
 *
 *
 *  Copyright(c) 2014 xx.com
 *  Copyright(c) 2014 Cherish Peng<cherish.peng@xx.com>
 *  MIT Licensed
 */
define(function (require, exports) {
    var
        $ = require('jquery');
    require('jquery.ui.widget');
    require('../vui.widget');
    require('jquery.fn.dimension');

    $.widget('vui.form', $.vui.widget, {
        options: {
            themes: {
                'default': {
                    style: {
                        // Checkbox
                        checkbox: '', checkboxChecked: '', checkboxDisabled: '',
                        // Select
                        select: '', selectFocus: '', selectHover: '', selectOpen: '', selectClose: '',
                        selectInput: '', selectArrow: '', selectCombox: '',
                        selectOptionList: '', selectOption: '', selectOptionSelected: ''
                    }
                }
            }
        },
        _createWidget: function (options, element) {
            // options.element must be jQuery object
            if (!$.nodeName((options && options.element && options.element[0]) || element, 'form')) {
                return $.error("Only can initialize on form element");
            }
            this._super.apply(this, arguments)
        },
        _attachEvent: function () {
            this._super.apply(this, arguments);

            var
                options = this.options, style = options.themes[options.theme].style,
                clspfx = options.classPrefix,
                clsoptslt = clspfx + '-select-option-selected',
                sltcbx = 'span.' + clspfx + '-checkbox',
                sltslt = 'div.' + clspfx + '-select',
                sltarw = 'a.' + clspfx + '-select-arrow',
                sltopt = 'li.' + clspfx + '-select-option',
                evtmap = {};

            // Checkbox event
            evtmap['click ' + sltcbx] = function (e) {
                var $target = $(e.target);
                $target.toggleClass(style.checkboxChecked);
                $(e.target.checkbox).prop('checked', $target.hasClass(style.checkboxChecked));
            };

            // Select event
            evtmap['click ' + sltarw] = function (e) {
                var
                    $element = $(e.target).closest(sltslt),
                    $optionlist = $($element[0].optionlist),
                    $btmli,
                    style = options.themes[$($element[0].select).attr('vui-theme')].style,
                    len = $element[0].select.options.length,
                    wtop, wh, wbtm, etop, eh, ebtm, h;

                if ($optionlist.is(':visible')) {
                    $optionlist
                        .hide()
                        .css('zIndex', 'auto');
                    $element.addClass(style.selectClose).removeClass(style.selectOpen);
                    return;
                }
                // Large value enough to mask everything else
                $optionlist.css('zIndex', 100000);
                wtop = this.window.scrollTop();
                wh = this.window.height();
                wbtm = wtop + wh;
                $optionlist.show();
                $element.addClass(style.selectOpen).removeClass(style.selectClose);
                // Calc height
                if (len <= $element[0].select.size) {
                    $btmli = $optionlist.find('li:nth-child(' + len + ')');
                    $optionlist.css('height', ($btmli.length ? ($btmli.position().top + $btmli.outerHeight(true)) : 0) + 'px');
                }

                etop = $element.offset().top;
                eh = $element.outerHeight();
                ebtm = etop + eh;
                h = $optionlist.outerHeight();

                // Out of viewport
                if (ebtm + h > wbtm) {
                    if (etop - wtop > wbtm - ebtm) {
                        $optionlist.css('top', '-' + h + 'px');
                    } else {
                        $optionlist.css('top', eh);
                    }
                }
                e.preventDefault();
            };
            evtmap['click ' + sltopt] = function (e) {
                var
                    element = $(e.target).closest(sltslt)[0],
                    $input = $(element.input), $current = $(e.currentTarget), $optionlist = $(element.optionlist),
                    style = options.themes[$(element.select).attr('vui-theme')].style,
                    oldval = element.select.value, newval = $current.attr('value'),
                    sltoptcls = style.selectOptionSelected + ' ' + clsoptslt;

                $optionlist.hide().css('zIndex', 'auto');
                $(element).addClass(style.selectClose).removeClass(style.selectOpen);
                $(e.target).trigger('blur' + this.eventNamespace);

                if (oldval !== newval) {
                    $input.val($current.text());
					$optionlist.find('.' + clsoptslt).removeClass(sltoptcls);
                    $current.addClass(sltoptcls);
                    $(element.select).val(newval).trigger('change');
                }
            };
            evtmap['mouseenter ' + sltslt]
                = evtmap['mouseleave ' + sltslt] = function (e) {
                $(e.currentTarget).toggleClass(style.selectHover, e.type === 'mouseenter');
            };
            evtmap['focus ' + sltslt] = function (e) {
                if (e.currentTarget.timer) {
                    clearTimeout(e.currentTarget.timer);
                    e.currentTarget.timer = undefined;
                }
                var $current = $(e.currentTarget), select = e.currentTarget.select;
                if (!$current.hasClass(style.selectFocus)) {
                    this.select2(select, 'focus');
                }
            };
            evtmap['blur ' + sltslt] = function (e) {
                var
                    self = this,
                    select = e.currentTarget.select;
                // Async, Anti-Flicker
                e.currentTarget.timer = setTimeout(function () {
                    self.select2(select, 'blur');
                    $(e.currentTarget.optionlist).css('zIndex', 'auto');
                    clearTimeout(e.currentTarget.timer);
                    e.currentTarget.timer = undefined;
                }, 0);
            };

            this._on(evtmap);
            this.on('option.add option.remove', sltslt, function (e, settings) {
                // do something
            });
        },
        _draw: function (models) {
            //this.$('input[type=checkbox]:not([vui-enhanced])').checkbox();
            //this.$('input[type=radio]:not([vui-enhanced])').radio();
            this.$('select:not([vui-enhanced])')
                .not(':hidden')
                .filter(function () {
                    return $(this).css('visibility') !== 'hidden';
                }).select2();
        },

        // Checkbox
        // settings: {checked: false, disabled: false}
        checkbox2: function (selector, settings) {
            var
                self = this,
                options = this.options,
                style = options.themes[options.theme].style,
                clspfx = this.namespace + '-' + options.prefix,
                clschkbx = clspfx + '-checkbox',
                $checkbox = !(selector instanceof $) ? $(selector) : selector,
                $element = null;
            $checkbox.each(function () {
                var $this = $(this);
                if (!$.nodeName($this[0], 'input') || !$this.is('[type=checkbox]')) return;

                $element = $this.parent();
                settings = $.extend({}, {disabled: $this.prop('disabled'), checked: $this.prop('checked')}, settings);

                if (!$this.attr('vui-enhanced')) {
                    // New created checkbox
                    $element = $('<span class="' + clschkbx + ' ' + style.checkbox + '"/>');
                    $element.insertAfter($this).append($this.hide());
                    $this.attr('vui-enhanced', 'vui-enhanced');
                    $element[0].checkbox = $this[0];
                }

                $element.toggleClass(style.checkboxDisabled, settings.disabled);
                $this.prop('disabled', settings.disabled);
                $element.toggleClass(style.checkboxChecked, settings.checked);
                $this.prop('checked', settings.checked);
            });
        },

        /**
         * Simulate select
         *
         * @param {Object} settings: {
		 *      // Priority is greater than the form's theme
		 *  	theme: '', 
		 *	    // Datasource
		 *      data: url || [{
		 *			text: '', 
		 *			value: '', 
		 *			selected: false
		 *		}], 
		 *      // Read or write selected index
		 *		selectedIndex: number, 
		 *      // Read or write disabled prop
		 *		disabled: boolean, 
		 *      // Read or write multiple prop
		 *		multiple: boolean, 
		 *      // Whether editable or not
		 *		combox: boolean
		 *      // Read or write visible items
		 *      size: number
		 *		// Read or write id prop
		 *		id: string
		 *      // Read or write name prop
		 *      name: string
		 *	}
         * @method {Function} add, blur, focus, remove
         * @event {Event} option.add, option.remove
         * @return {Form}
         */
        select2: function (selector, settings) {
            var
                self = this,
                defaults = settings,
                options = this.options,
                clspfx = options.classPrefix,
                clsslt = clspfx + '-select',
                clscbx = clspfx + '-select-combox',
                clsipt = clspfx + '-select-input',
                clsarw = clspfx + '-select-arrow',
                clslst = clspfx + '-select-option-list',
                clsopt = clspfx + '-select-option',
                clsoptslt = clspfx + '-select-option-selected',
                $select = !(selector instanceof $) ? $(selector) : selector,
                implementing = {'add': true, 'remove': true, 'focus': true, 'blur': true},
                method, args;
            // Method
            if ($.type(settings) === 'string') {
                if (!(settings in implementing)) {
                    return $.error('Method ' + settings + ' is not supported');
                }
                method = settings;
                args = [].slice.call(arguments, 2);
            }

            $select.each(function () {
                var
                    _defaults,
                    htmllist = '',
                    selectedText = [],
                    supportedMethods = {'add': add, 'remove': remove, 'focus': focus, 'blur': blur},
                    $this = $(this), $element, $combox, $optionlist, $input, $btmli,
                    theme = ('object' === typeof defaults && defaults.theme) || $this.attr('vui-theme') || options.theme,
                    style = options.themes[theme].style,
                    sltoptcls = style.selectOptionSelected + ' ' + clsoptslt,
                    dim, pos, css,
                    delimiter = ', ',
                    select = $this.attr('vui-theme', theme).get(0);

                if (!$.nodeName($this[0], 'select')) return;
                if (defaults && ('array' === $.type(defaults.data))) {
                    _defaults = defaults;
                    select.innerHTML = '';
                    $.each(_defaults.data, function (idx) {
                        select.add($('<option />').text(this.text).val(this.value).prop('selected', !!this.selected).get(0), select.options[idx]);
                    });
                    if (select.selectedIndex < 0) {
                        select.options[0].selected = true;
                    }
                    delete _defaults.data;
                }
                settings = $.extend({}, {
                    // attributes(html5 && html4)
                    // form(html5 attribute)(Non-Option)
                    autofocus: $this.attr('autofocus'),
                    data: select.options.length ? select.options : $this.attr('data'),
                    disabled: select.disabled,
                    multiple: select.multiple,
                    size: select.size,
                    tabIndex: select.tabIndex
                }, {
                    combox: false,
                    tabIndex: 1,
                    maxSize: 20 // chrome: 20, ie: 30
                }, _defaults || defaults);

                if (!settings.size) settings.size = settings.maxSize;
                settings.size = Math.min(settings.size, settings.maxSize);
                // There have two error types order by service targets corresponds to user and developer respectively
                if (!settings.size) {
                    throw 'Size cannot be zero.';
                }

                if ($this.attr('vui-enhanced') && !method) {
                    $this.parent().after($this).remove();
                    $this.removeAttr('vui-enhanced').show();
                }

                if (!$this.attr('vui-enhanced')) {
                    // Get the raw select's layout info
                    css = $this.css(['display', 'float', 'top', 'left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left']);

                    // New created select
                    $element = $('<div tabindex="' + settings.tabIndex + '" class="' + clsslt + ' ' + style.select + ' ' + (settings.multiple ? style.selectOpen : style.selectClose) + '"/>');

                    $element
                        .insertAfter($this)
                        .append($this.hide());

                    $combox = $('<div style="position:relative;" class="' + clscbx + ' ' + style.selectCombox + '"/>');
                    $input = $('<input style="position:absolute;left:0;top:0;" type="text" class="' + style.selectInput + ' ' + clsipt + '" ' + (settings.combox ? '' : 'readonly ') + '/>').appendTo($combox);
                    // Set tabindex to value less than zero will make the element focusable but escape from TAB navigation
                    $arrow = $('<a tabindex="-1" style="position:absolute;top:0;right:0;" href="javascript:;" class="' + clsarw + ' ' + style.selectArrow + '"/>').appendTo($combox);
                    $element.append($combox);

                    $optionlist = $('<ul class="' + style.selectOptionList + ' ' + clslst + '"/>').css({'position': 'absolute', left: 0});
                    if ($.type(settings.data) === 'string') {
                        /*
                         $.ajax({
                         url: settings.data
                         }).done(function(data) {
                         // Two scenes: 1. select don't data attribute; 2. Set settings.data to override select.options
                         $.each(data, function() {
                         select.add($('<option />').text(option.text).val(option.value).get(0), this.options[index]);
                         });
                         settings.data = select.options;
                         });
                         */
                    }
                    settings.data = settings.data || [];
                    $.each(settings.data, function (idx) {
                        if (this.selected) {
                            selectedText.push(this.text);
                        }
                        htmllist += _createOption(this);
                    });
                    $input.val(selectedText.join(delimiter));

                    dim = {width: $this.outerWidth(), height: $this.outerHeight()};
                    $element.css(css);
                    $element
                        .dimWidth(dim.width)
                        .dimHeight(dim.height);

                    pos = $this.css('position');
                    $element.css({'position': (!~('relative, absolute, fixed'.indexOf(pos)) ? 'relative' : pos)})
                    $element.css('line-height', $element.height() + 'px');
                    // $combox relative to $element
                    // Since $combox is relative, use $element's content height
                    $combox.dimHeight($element.height());
                    // $arrow relative to $combox
                    // Since $arrow is absolute, use $combox's visual height
                    //$arrow.css({height: css.height, width: 17});
                    $arrow.dimHeight($combox.outerHeight());
                    // $input is same as $arrow
                    // NB: input element's box-sizing behaviour is border-box like
                    $input
                        .dimWidth(
                            $combox.outerWidth()
                            - $arrow.outerWidth(true)
                            - parseInt($input.css('paddingLeft'))
                            - parseInt($input.css('paddingRight'))
                    )
                        .dimHeight(
                            $combox.outerHeight()
                            - parseInt($input.css('paddingTop'))
                            - parseInt($input.css('paddingBottom'))
                    );


                    $element.append($optionlist.append(htmllist));
                    $btmli = $optionlist.find('li:nth-child(' + Math.min(settings.data.length, settings.size) + ')');

                    $optionlist
                        .dimWidth(dim.width)
                        // An element is said to be positioned if it has a CSS position attribute of relative, absolute, or fixed.
                        .css('height', ($btmli.length ? ($btmli.position().top + $btmli.outerHeight(true)) : 0) + 'px')
                        .hide();

                    if (settings.disabled) {
                        // <IE8 don't support bottom and right position
                        $mask = $('<div style="position:absolute;left:0;top:0;width:100%;height:100%;"/>').appendTo($element);
                    }

                    if (settings.autofocus) focus();

                    $element[0].select = select;
                    $element[0].input = $input[0];
                    $element[0].optionlist = $optionlist[0];
                    $this
                        .attr('disabled', settings.disabled)
                        .attr('multiple', settings.multiple)
                        .attr('size', settings.size);
                    $this.addAttr('vui-enhanced', 'vui-enhanced');
                } else {
                    $element = $this.parent();
                    $combox = $element.find('.' + clscbx);
                    $optionlist = $element.find('.' + clslst);
                    $input = $element.find('.' + clsipt);
                }

                if (method) {
                    supportedMethods[method].apply(select, args);
                }

                // Method
                function _createOption(option) {
                    var attrs = '', cls = '';
                    if ($.type(option) !== 'object') return '';
                    if (option.attributes) {
                        $.each(option.attributes, function () {
                            var value = (this.value || this.nodeValue);
                            if (this.nodeName === 'class') cls = value;
                            attrs += ' ' + this.nodeName + '="' + value + '"';
                        });
                    }
                    return '<li class="' + cls + ' ' + (option.selected ? sltoptcls : '') + ' ' + style.selectOption + ' ' + clsopt + '"' + attrs + '><a href="javascript:return false;">' + (settings.multiple ? ('<label><input type="checkbox" />' + option.text + '</label>') : option.text) + '</a></li>';
                }

                // Add an option, index from zero, compatible with negative
                function add(option, index) {
                    if (!this.options.length) option.selected = true;
                    var len = this.options.length || 0, selectedText = [], selectedIndex;
                    if (index < 0) {
                        index = Math.max(index + len + 1, 0);
                    }
                    index = Math.min(index, len);
                    index
                        ? $optionlist.find('li:nth-child(' + index + ')').after(_createOption(option))
                        : $optionlist.prepend(_createOption(option));
                    // May be -1
                    selectedIndex = this.selectedIndex;
                    this.add($('<option />').text(option.text).val(option.value).prop('selected', !!option.selected).get(0), this.options[index]);
                    if (option.selected) {
                        if (!settings.multiple) {
                            $optionlist.find('li:nth-child(' + (selectedIndex + 1) + ')').removeClass(sltoptcls);
                        }
                        $.each(this.options, function () {
                            if (this.selected) {
                                selectedText.push(this.text);
                            }
                        });
                        $input.val(selectedText.join(delimiter));
                    }
                    $element.trigger('option.add', settings);
                    // $(this).trigger('option.add' + self.eventNamespace, settings);
                }

                // Delete an option
                // selectObject.remove(index): if the specified index less than zero or greater than or equiv to the options's length, invoke remove will do nothing
                function remove(index) {
                    if (!this.options.length) return;
                    var len = this.options.length - 1, option, selectedText = [];
                    if (index < 0) {
                        index = Math.max(index + len + 1, 0);
                    }
                    index = Math.min(index, len);
                    option = this.options[index];
                    $optionlist.find('li:nth-child(' + (index + 1) + ')').remove();

                    this.remove(index);

                    if (option.selected) {
                        if (!settings.multiple) {
                            $optionlist.find('li:first').addClass(sltoptcls);
                            this.options.length && (this.options[0].selected = true);
                        }
                        $.each(this.options, function () {
                            if (this.selected) {
                                selectedText.push(this.text);
                            }
                        });
                        $input.val(selectedText.join(delimiter));
                    }

                    $element.trigger('option.remove', settings);
                }

                // focus
                // IE7及以上版本, 现代浏览器激活到页面所在视窗(或标签)会重新定位光标, 从而触发focus动作
                // 不同浏览器对"激活"的定义不同(最小化与最大化, 标签切换, alert弹出框等)
                function focus() {

                    $element.addClass(style.selectFocus);
                    // To run an hidden element's focus event handlers:
                    // 1.$(this).focus() vs. 2.$(this).trigger('focus') vs. 3.$(this).triggerHandler('focus')
                    // IE6 support 1, 2, 3; others support 3
                    // focus event don't bubble in all browsers, delegate focusin event to complete this
                    $(this).triggerHandler('focus');
                }

                // blur
                function blur() {
                    $element.removeClass(style.selectFocus + ' ' + style.selectOpen);
                    $element.addClass(style.selectClose);
                    $optionlist.hide();
                    $(this).triggerHandler('blur');
                }
            });
        },
        // Supported types: date datetime datetime-local month range time week
        input2: function (selector, settings) {
        },
        // Radio
        radio2: function (selector, settings) {
        }
    });

    // Descendable $.fn
    $.map(['checkbox2', 'radio2', 'select2', 'input2'], function (method) {
        $.fn[method] = function () {
            if (!this.length) return;
            var args = [].slice.apply(arguments), context = $(this[0].form).data('vui-form');
            context[method].apply(context, [].concat(this, args));
            return this;
        }
    });
});