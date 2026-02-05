(function ($) {
  'use strict';

  var $inputArea = $('.contact-input-area');
  var $confirmArea = $('.contact-confirm-area');
  var $errorArea = $('.contact-input-area');


  // 全角を半角に自動変換
  $('input[name="email"]').change(function () {
    var zenkigou = "＠－ー＋＿．，、";
    var hankigou = "@--+_...";
    var data = $(this).val();
    var str = "";

    // 指定された全角記号のみを半角に変換
    var i;
    for (i = 0; i < data.length; i++) {
      var dataChar = data.charAt(i);
      var dataNum = zenkigou.indexOf(dataChar, 0);
      if (dataNum >= 0) dataChar = hankigou.charAt(dataNum);
      str += dataChar;
    }
    // アルファベットと数字の変換処理
    var hankaku = str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
    });
    $(this).val(hankaku);
  });


  // function
  var langMap = {
    ja: 'ja-JP',
    en: 'en-US',
    ko: 'ko-KR',
    cn: 'zh-CN',
    tw: 'zh-TW',
  };

  // body class から言語取得
  var lang = Object.keys(langMap).find(function (key) {
    return document.body.classList.contains(key);
  }) || 'ja';
  var basePath = '/' + langMap[lang] + '/';
  console.log(basePath);

  var donePost = function (data) {
    sessionStorage.setItem('redirect', 'true');
    location.href = basePath + 'contact/thanks.html';
  };

  var failPost = function (data) {
    console.log(data);
    console.log('fail ajax : ' + JSON.stringify(data, 'null', 4));

    $confirmArea.fadeOut(function () {
      $errorArea.fadeIn();
    });
  };

  // post
  var dataPost = {
    url: basePath + 'contact/contact.php',
    type: 'POST',
    timeout: 10000,
    data: {}
  };


  // validate
  var messages = {
    whichrequired: '電話番号は自宅か携帯かどちらかを入力してください',
    required: '必須項目が入力されていません'
  };

  var options = {
    changeEvent: true,
    submitEvent: true,
    beforeSubmit: function () {
      return true;
    },
    notFalseSubmit: function () {
      $('.confirm-name').text($('#form input[name="name"]').val());
      $('.confirm-email').text($('#form input[name="email"]').val());
      $('.confirm-content').html($('#form textarea[name="content"]').val().replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />"));
      $inputArea.fadeOut(function () {
        $confirmArea.fadeIn();
      });

      $('html,body').animate({
        scrollTop: $inputArea.offset().top - $('#header').height() - 10
      }, 100, 'swing');

      return false;
    }
  };

  $('#form').formValidate(messages, options);

  // 戻るボタン
  $('.contact-confirm-area .back').click(function () {
    $confirmArea.fadeOut(function () {
      $inputArea.fadeIn();
    });
    $('html,body').animate({
      scrollTop: $confirmArea.offset().top - $('#header').height() - 10
    }, 100, 'swing');
    return false;
  });


  // 送信ボタン
  $('.contact-confirm-area .submit').click(function () {
    dataPost.data['name'] = $('#form input[name="name"]').val();
    dataPost.data['email'] = $('#form input[name="email"]').val();
    dataPost.data['content'] = $('#form textarea[name="content"]').val();
    $.ajax(dataPost).done(donePost).fail(failPost);
  });

})(jQuery);