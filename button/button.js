/** 
 *  VUI's `button` class
 *  
 *  Usage: 
 * 	$(selector).button(options)
 *  
 *  Event:
 *  buttonclick
 *
 *  Copyright(c) 2014 xx.com
 *  Copyright(c) 2014 Cherish Peng<cherish.peng@xx.com>
 *  MIT Licensed 
 */
define(function(require, exports) {
	var 
	$ = require('jquery');
	require('jquery.ui.widget');
	require('../vui.widget');
	require('jquery.fn.dimension');
	
	$.widget('vui.button', $.vui.widget, {
		options: {
			themes: {
				'default': {
					style: {
						// Button
						button: '', 
						btnDisabled: '', 
						btnHover: '', 
						btnActive: '', 
						btnLoading: ''
					}
				}
			}, 
			width: 0, 
			height: 0, 
			// Latency less than this value will not show loading state
			loadMsgDelay: 10, 
			// Whether prevent the raw button's default behaviour
			preventDefault: false, 
			// Click listener
			click: $.noop
		},  
		_createWidget: function(options, element) {
			// options.element must be jQuery object
			var node = (options && options.element && options.element[0]) || element;
			if (!($.nodeName(node, 'button') || $.nodeName(node, 'input'))) {
				return $.error("Only can initialize on button element");
			}
			this._super.apply(this, arguments);
		},
		_attachEvent: function() {
			var 
			options = this.options, 
			style = options.themes[options.theme].style, 
			clsbtn = options.classPrefix + '-button', 
			btnevtmap = {}, timer;
			
			btnevtmap['click'] = function(e) {
				if (e.target === e.currentTarget.button) {
					// Prevent raw button's default behaviour, eg: refresh page
					if (options.preventDefault) e.preventDefault();
					return;
				}
				if (e.target.loading) return;
				
				var $el = $(e.target), evt;
				// Trigger events were bound at the raw btn
				evt = $.Event('click');
				$(e.target.button).trigger(evt);
				// Prevent the repeat click in `loadMsgDelay` ms
				
				timer = setTimeout(function() {
					e.target.loading = true;
					$el.addClass(style.btnLoading);
				}, options.loadMsgDelay);
				// Track simulated button and raw button's tasks
				$.when(evt.result, options.click.call(this, e)).always(function() {
					if (timer) {
						e.target.loading = false;
						clearTimeout(timer);
						timer = undefined;
					}
					$el.removeClass(style.btnLoading);						
				});
			};
			this._on(this.$button, btnevtmap);
		},
		option: function() {
			if (this.options.optionChange) {
				this.$button.before(this.element).remove();
			}			
			this._super.apply(this, arguments);
			return this;
		}, 		
		enable: function() {
			var 
            options = this.options, 
            style = options.themes[options.theme].style;
			
			this.$button.removeClass(style.btnDisabled);
			this.element.prop('disabled', false);
			this._super.apply(this, arguments);
		}, 
		disable: function() {
			var 
            options = this.options, 
            style = options.themes[options.theme].style;
			
			this.$button.addClass(style.btnDisabled);
			this.element.prop('disabled', true);
			this._super.apply(this, arguments);
		}, 
		_draw: function(models) {
			var 
            options = this.options, 
            style = options.themes[options.theme].style, 
			clspfx = options.classPrefix, 
			clsbtn = clspfx + '-button',			
			$btn = this.element, 
			href = $btn.attr('href'), 
			css = {};
			
			$.extend(options, {disabled: $btn.prop('disabled')});

			// New created button
			this.$button = $('<a class="' + clsbtn + ' ' + style.button + '"' + (href ? (' href="' + href + '"') : '') + '>' + ($btn.text() || $btn.val()) + '</a>');
			css = $btn.css([
				'position', 'display', 'float', 'top', 'left', 
				'margin-top', 'margin-right', 'margin-bottom', 'margin-left'
			]);
			this.$button.insertAfter($btn).append($btn.hide());
			this.$button
				.dimWidth(options.width ? options.width : $btn.outerWidth())
				.dimHeight(options.height ? options.height : $btn.outerHeight());
			this.$button.css('line-height', this.$button.height() + 'px');
		
			this.$button[0].button = $btn[0];

			this.$button.toggleClass(style.btnDisabled, options.disabled);
		}
	});		
});		