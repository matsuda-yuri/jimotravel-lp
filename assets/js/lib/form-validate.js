(function ($) {
  'use strict';

  var BGValidateOffset = 0;

  // for legacy browser
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement) {
      for (var i = 0; i < this.length; i += 1) {
        if (this[i] === searchElement) return i;
      }
      return -1;
    }
  }

  // type name to use
  var typeNames = [
    'numeric',
    'alphabetic',
    'alphanumeric',
    'ascii',
    'mail',
    'hiragana',
    'katakana',
    'zenkaku'
  ];

  // check character
  var checkChar = {
    ascii: function (target) {
      return !target || (/^[\x20-\x7E]+$/).test(target);
    },

    numeric: function (target) {
      return !target || (/^[0-9\-]+$/).test(target);
    },

    alphabetic: function (target) {
      return !target || (/^[a-zA-Z]+$/).test(target);
    },

    alphanumeric: function (target) {
      return !target || (/^[a-zA-Z0-9]+$/).test(target);
    },

    hiragana: function (target) {
      return !target || (/^[ぁ-ん]+$/).test(target);
    },

    katakana: function (target) {
      return !target || (/^[ァ-ン]+$/).test(target);
    },

    mail: function (target) {
      return !target || (/^([a-zA-Z0-9])+([a-zA-Z0-9\+\._-])*@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/).test(target);
    },

    zenkaku: function (target) {
      var i, charCode;

      for (i = 0; i < target.length; i += 1) {
        charCode = target.charCodeAt(i);
        if (charCode < 256 || (charCode >= 0xff61 && charCode <= 0xff9f)) {
          return false;
        }
      }

      return true;
    },

    convertBreak: function (target) {
      return target.replace(/\r\n/g, '<br>').replace(/(\n|\r)/g, '<br>');
    }
  };

  var requiredFieldMessages = {
    ja: {
      name: 'お名前を入力してください。',
      email: 'Eメールアドレスを入力してください。',
      content: 'ご質問内容を入力してください。'
    },
    en: {
      name: 'Please enter your name.',
      email: 'Please enter your email address.',
      content: 'Please enter your message.'
    },
    ko: {
      name: '이름을 입력해 주세요.',
      email: '이메일 주소를 입력해 주세요.',
      content: '문의 내용을 입력해 주세요.'
    },
    cn: {
      name: '请输入您的姓名。',
      email: '请输入您的电子邮箱。',
      content: '请输入您的咨询内容。'
    },
    tw: {
      name: '請輸入您的姓名。',
      email: '請輸入您的電子信箱。',
      content: '請輸入您的諮詢內容。'
    }
  };

  // check required
  var checkRequired = function ($el, msg) {
    var result = false;
    var node = $el[0].nodeName.toLowerCase();
    var type = $el.attr('type');
    var name = $el.attr('name');
    var lang = getLang();
    if (
      requiredFieldMessages[lang] &&
      requiredFieldMessages[lang][name]
    ) {
      msg = requiredFieldMessages[lang][name];
    }

    // select
    if (node === 'select') {
      result = $el.val() !== '' ? checkOK($el) : checkNG($el, msg);

      // input or textarea
    } else if (node === 'input' || node === 'textarea') {
      if (type === 'checkbox') {
        result = $el.prop('checked') ? checkOK($el) : checkNG($el, msg);

      } else if (type === 'radio') { // radio ボタンが class しかないから無理やりの処理
        result = $('input[name="class"]').is(':checked') ? checkOK($el) : checkNG($el, msg);

      } else {
        result = $.trim($el.val()) !== '' ? checkOK($el) : checkNG($el, msg);
      }
    }

    // set result
    $el.data('required', result);

    return result;
  };

  // check whichrequired
  var checkWhichRequired = function ($el, msg) {
    var result = false;
    var resultFlag = false;
    var node = $el[0].nodeName.toLowerCase();
    var type = $el.attr('type');
    var which = $el.attr('whichrequired');

    $('[whichrequired="' + which + '"]').each(function () {
      resultFlag = $.trim($(this).val()) !== '' ? true : false;
      if (resultFlag) {
        return false;
      }
    });
    $('[whichrequired="' + which + '"]').each(function () {
      result = resultFlag === true ? checkOK($(this), msg) : checkNG($(this), msg);
    });


    // set result
    $el.data('whichrequired', result);

    return result;
  };

  // check input
  var checkInput = function ($el, type, msg) {
    var result = false;

    if ($el.data('required') !== false) {
      result = checkChar[type]($el.val()) ? checkOK($el) : checkNG($el, msg);

      // set data into this object
      $el.data('input', result);
    }

    return result;
  };

  // check minimum length
  var checkLength = function ($el, msg) {
    var result = false;

    if ($el.data('required') !== false && $el.data('input') !== false) {
      var length = $el.val().length;
      var minlength = $el.attr('minlength');

      msg = minlength + msg;
      if (length == 0) {
        result = checkOK($el);
      } else {
        result = length >= minlength ? checkOK($el) : checkNG($el, msg);
      }

      // set data into this object
      $el.data('minlength', result);
    }

    return result;
  };

  // check equal
  var checkEqual = function ($el, msg) {
    var result = false;

    if ($el.data('required') !== false && $el.data('input') !== false) {
      var equal = $el.val();
      var equalTarget = '#' + $el.attr('equal');
      var equalTargetStr = $(equalTarget).val();

      result = equal == equalTargetStr ? checkOK($el) : checkNG($el, msg);

      // set data into this object
      $el.data('equal', result);
    }

    return result;
  };

  // check nospace
  var checkNospace = function ($el, msg) {
    var result = false;

    result = $.trim($el.val()) !== '' ? checkOK($el) : ($el.val() === '' ? checkOK($el) : checkNG($el, msg));

    // set result
    $el.data('nospace', result);

    return result;
  };

  var checkOK = function ($el) {
    $el.parents('.validate-box').find('.validate-text').text('').hide();
    return true;
  };

  var checkNG = function ($el, text) {
    $el.parents('.validate-box').find('.validate-text').text(text).css("display", "inline-block");
    if (BGValidateOffset == 0) {
      BGValidateOffset = $el.closest('tr').offset().top - $('#header').height() - 10;
    }
    return false;
  };

  function getLang() {
    var langs = ['ja', 'en', 'ko', 'cn', 'tw'];
    for (var i = 0; i < langs.length; i++) {
      if (document.body.classList.contains(langs[i])) {
        return langs[i];
      }
    }
    return 'ja'; // default
  }

  var validateMessages = {
    ja: {
      whichrequired: 'どちらかを入力してください。',
      required: '入力してください。',
      numeric: '数字で入力してください。',
      alphabetic: 'アルファベットで入力してください。',
      alphanumeric: 'アルファベットか数字で入力してください。',
      ascii: '半角英数字で入力してください。',
      mail: '有効なEメールアドレスを入力してください。',
      hiragana: 'ひらがなで入力してください。',
      katakana: 'カタカナで入力してください。',
      zenkaku: '全角で入力してください。',
      minlength: '文字以上を入力してください。',
      equal: '入力内容が一致しません。',
      nospace: '空白文字だけの入力は出来ません。'
    },

    en: {
      whichrequired: 'Please fill in one of the fields.',
      required: 'This field is required.',
      numeric: 'Please enter numbers only.',
      alphabetic: 'Please enter alphabetic characters only.',
      alphanumeric: 'Please enter letters or numbers only.',
      ascii: 'Please use half-width alphanumeric characters.',
      mail: 'Please enter a valid email address.',
      hiragana: 'Please enter hiragana characters.',
      katakana: 'Please enter katakana characters.',
      zenkaku: 'Please enter full-width characters.',
      minlength: 'Please enter the minimum number of characters.',
      equal: 'The entered values do not match.',
      nospace: 'Spaces only are not allowed.'
    },

    ko: {
      whichrequired: '둘 중 하나를 입력해 주세요.',
      required: '필수 입력 항목입니다.',
      numeric: '숫자만 입력해 주세요.',
      alphabetic: '알파벳만 입력해 주세요.',
      alphanumeric: '알파벳 또는 숫자만 입력해 주세요.',
      ascii: '반각 영숫자로 입력해 주세요.',
      mail: '유효한 이메일 주소를 입력해 주세요.',
      hiragana: '히라가나로 입력해 주세요.',
      katakana: '가타카나로 입력해 주세요.',
      zenkaku: '전각 문자로 입력해 주세요.',
      minlength: '최소 문자 수 이상 입력해 주세요.',
      equal: '입력 내용이 일치하지 않습니다.',
      nospace: '공백만 입력할 수 없습니다.'
    },

    cn: { // 中国大陆（简体字）
      whichrequired: '请填写其中一项。',
      required: '此项为必填项。',
      numeric: '请输入数字。',
      alphabetic: '请输入英文字母。',
      alphanumeric: '请输入字母或数字。',
      ascii: '请输入半角字母或数字。',
      mail: '请输入有效的电子邮箱。',
      hiragana: '请输入平假名。',
      katakana: '请输入片假名。',
      zenkaku: '请输入全角字符。',
      minlength: '请输入规定的最少字符数。',
      equal: '输入内容不一致。',
      nospace: '不能只输入空格。'
    },

    tw: { // 台湾（繁體中文）
      whichrequired: '請填寫其中一項。',
      required: '此欄位為必填。',
      numeric: '請輸入數字。',
      alphabetic: '請輸入英文字母。',
      alphanumeric: '請輸入英文字母或數字。',
      ascii: '請輸入半形英數字。',
      mail: '請輸入有效的電子信箱。',
      hiragana: '請輸入平假名。',
      katakana: '請輸入片假名。',
      zenkaku: '請輸入全形字元。',
      minlength: '請輸入規定的最少字元數。',
      equal: '輸入內容不一致。',
      nospace: '不可只輸入空白字元。'
    }
  };


  // jQuery extend
  $.fn.formValidate = function (messages, options) {
    BGValidateOffset = 0;

    var lang = getLang();

    messages = $.extend({},
      validateMessages[lang],
      messages
    );

    // options and default
    options = $.extend({
      changeEvent: true,
      submitEvent: true
    }, options);

    return this.each(function () {
      // change event
      if (options.changeEvent) {
        var selectors = '.whichrequired, .required, .minlength, .' + typeNames.join(', .');

        $(this).find(selectors).change(function () {
          var $this = $(this);
          var i;

          // check whichrequired
          if ($this.hasClass('whichrequired')) {
            checkWhichRequired($this, messages.whichrequired);
          }

          // check required
          if ($this.hasClass('required')) {
            checkRequired($this, messages.required);
          }

          // check input
          for (i = 0; i < typeNames.length; i += 1) {
            var typeName = typeNames[i];
            var message = messages[typeName];

            if ($this.hasClass(typeName)) {
              checkInput($this, typeName, message);
            }
          }

          // check minimum length
          if ($this.hasClass('minlength')) {
            checkLength($(this), messages.minlength);
          }

          // check equal
          if ($this.hasClass('equal')) {
            checkEqual($this, messages.equal);
          }

          // check nospace
          if ($this.hasClass('nospace')) {
            checkNospace($this, messages.nospace);
          }
        });
      }

      // submit event
      $(this).submit(function () {
        var $this = $(this);
        var i, j = 0;
        var results = [];

        // check whichrequired
        $this.find('input.whichrequired,select.whichrequired,textarea.whichrequired').each(function () {
          results[j] = checkWhichRequired($(this), messages.whichrequired);
          j += 1;
        });

        // check required
        $this.find('.required').each(function () {
          results[j] = checkRequired($(this), messages.required);
          j += 1;
        });

        // check input
        for (i = 0; i < typeNames.length; i += 1) {
          var typeName = typeNames[i];
          var message = messages[typeName];

          $this.find('.' + typeName).each(function () {
            results[j] = checkInput($(this), typeName, message);
            j += 1;
          });
        }

        // check minimum length
        $this.find('.minlength').each(function (i) {
          results[j] = checkLength($(this), messages.minlength);
          j += 1;
        });

        // check equal
        $this.find('.equal').each(function (i) {
          results[j] = checkEqual($(this), messages.equal);
          j += 1;
        });

        // check nospace
        $this.find('.nospace').each(function (i) {
          results[j] = checkNospace($(this), messages.nospace);
          j += 1;
        });

        // handler at before submit
        if (results.indexOf(false) === -1) {
          if (options.beforeSubmit) {
            if (!options.beforeSubmit()) {
              return false;
            }
          }
        }

        if (BGValidateOffset != 0) {
          $('body,html').animate({
            scrollTop: BGValidateOffset
          }, 500);
        }
        BGValidateOffset = 0; // reset

        // handler at notFalseSubmit
        if (results.indexOf(false) === -1) {
          if (options.notFalseSubmit) {
            if (!options.notFalseSubmit()) {
              return false;
            }
          }
        }

        return options.submitEvent && (results.indexOf(false) === -1);
      });
    });

  }

})(jQuery);