/** �ϴ���� 
 ʹ�÷���: 
 * $('xxx').uploader(options)
 �¼�:
 * uploadselect
 */
(function($) {
	$.widget('hijax.uploader', $.hijax.widget, {
		options: {
			// Զ�̷�������ַ
			url: '', 
			// ��������ʹ�õ��ֶ���
			field: 'files', 
			// ֧���ļ�����
			exts: '', 
			// ֧���ļ���С, ��λ: Mb
			size: 0, 
			// �Զ��ϴ�
			manully: false, 
			// �����ϴ�
			multiple: false, 
			// ��ȡ���ϴ�
			cancelable: true, 
			// �������ϴ�
			reuploadable: true, 
			$filelist: null, 
			// �����ļ�DOM	
			fileTemplate: '<li id="">' 
				+ '<div class="{uploaderFileInfo}"><span class="{uploaderFileName}"></span><span class="{uploaderFileSize}"></span></div>' 
				+ '<div class="{uploaderProgressBar}"><div class="{uploaderProgressBarThumb}"></div></div>' 
				+ '<div class="{uploaderFileHandler}"></div>' 
				+ '<div class="{uploaderFileStatus}"></div>'
				+ '</li>', 
			message: {
				typeError: "{file} ��֧�ֵ�����. ��֧�� {extensions}",
				sizeError: "{file} ��С��Ӧ���� {sizeLimit}",
				minSizeError: "{file} ��С��ӦС�� {minSizeLimit}",
				emptyError: "{file} ��СΪ0",
				onLeave: "��ǰ�������ϴ����ļ�, ��ȷ��Ҫ�뿪"		
			}				
		},  
		widgetEventPrefix: 'upload', 	
		_attachEvent: function() {
			this._on(this.$filelist, {
				'click a[href], button[href]': function(e) {
					var $target = $(e.target), 
						scheme = 'javascript:', fn, 
						href = $target.attr('href'), 
						js = href.indexOf(scheme), 
						context = options.context || this, 
						id;
						
					if (~$.inArray(href, ['', '#'])) return _leave();
					
					id = $target.closest('tr').find('input[type=checkbox]:first').val() || 
						(this.tbodys[this.page - 1] && this.tbodys[this.page - 1].find('input:checked:first').val());
					
					// if (id === undefined) return;
					
					if (~js) {
						fn = href.slice(scheme.length);
						~fn.lastIndexOf(';') && (fn = fn.slice(0, -1));
						fn && context[fn] && context[fn](e, id);
						e.preventDefault();
					} else {
						$target.attr('href', href + (~href.indexOf('?') ? '&' : '?') + dict.id + '=' + id + '&' + dict.page + '=' + self.page);
						return _leave();
					}
					function _leave() {
						var evt = $.Event(e);
						evt.type = 'leave';
						// ����������gridleave�¼�������Ĭ����Ϊ
						self._trigger(evt, id);
						return !evt.isDefaultPrevented();						
					}
				}
			});			
			
		}, 
		_paint: function(models) {
			var 
            options = this.options, 
            style = options.themes[options.theme].style, 
			clspfx = this.namespace + '-' + options.prefix,
			clsflst = clspfx + '-filelist', 
			html = '<div class="{uploader}">' 
				+ '<a href="javascript:;" class="{uploaderButton}">�ϴ�</a>' 
				+ '<ul class="{uploaderFilelist}"></ul></div>';
			var $parent = this.element.parent();
			if (!options.$filelist) {
				this.$filelist = $('<ul class="' + clsflst + '"/>', {'position': 'absolute', 'display': 'none'}).after(this.element)
			}
			// ����flash object
			swfobject.embedSWF('', $parent.).css({
				'position': 'absolute', 
				'left':, 
				'top':, 
				'width':, 
				'height':
			});

		}, 
		// ȡ���ϴ�
		cancel: function() {},
		//  id: file.id, size: file.size, error: error
		select: function(files) {
			
		},
		// �ϴ�
		upload: function() {},
		leave: function() {}		
	});
})(jQuery);