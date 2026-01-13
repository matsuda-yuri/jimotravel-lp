(function ($) {
  'use strict';

// PC/SP判定
// スクロールイベント
// リサイズイベント
// スムーズスクロール

  /* ここから */
  var break_point = 767; //ブレイクポイント(767px以下でSP)
  var mql = window.matchMedia('screen and (max-width: '+break_point+'px)');//、MediaQueryListの生成
  var deviceFlag = mql.matches ? 1 : 0; // 0 : PC ,  1 : SP


// vh取得
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  const setVhOnLoad = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh-onload', `${vh}px`);
  };
  window.addEventListener('load', setVh);
  window.addEventListener('resize', setVh);
  window.addEventListener('load', setVhOnLoad);



// pagetop
  $(function () {
    const $pageTop = $('#pagetop');
    const $footer = $('#footer');
    let footHeight = parseInt($footer.innerHeight());

    // 初期は非表示
    $pageTop.hide();

    // 表示状態フラグ
    let isScrolled = false;
    let isInFooter = false;

    // 表示・位置を更新する関数
    function updateUIOnScroll() {
      if (isScrolled) {
        $pageTop.fadeIn();
      } else {
        $pageTop.fadeOut();
      }

      if (isInFooter) {
        $pageTop.css({
          'position': 'absolute',
          'bottom': footHeight + 'px'
        });
      } else {
        $pageTop.css({
          'position': 'fixed',
          'bottom': '20px'
        });
      }
    }

    // スクロール位置監視（100px地点）
    const border = 100; // $pagetopの表示タイミング
    const scrollObserver = new IntersectionObserver((entries) => {
      if (entries[0]) {
        isScrolled = !entries[0].isIntersecting;
        updateUIOnScroll();
      }
    }, {
      root: null,
      rootMargin: `${border}px 0px ${document.body.clientHeight}px 0px`,
      threshold: 1
    });
    scrollObserver.observe(document.body);

    // フッター監視
    const footerObserver = new IntersectionObserver((entries) => {
      if (entries[0]) {
        isInFooter = entries[0].isIntersecting;
        updateUIOnScroll();
      }
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0
    });
    footerObserver.observe($footer.get(0));

  });


// リサイズイベント

  var checkBreakPoint = function (mql) {
    deviceFlag = mql.matches ? 1 : 0;// 0 : PC ,  1 : SP
    // → PC
    if (deviceFlag == 0) {
    } else {
      // →SP
    }
  }

// ブレイクポイントの瞬間に発火
  mql.addListener(checkBreakPoint);//MediaQueryListのchangeイベントに登録

// 初回チェック
  checkBreakPoint(mql);


// スムーズスクロール
// #で始まるアンカーをクリックした場合にスムーススクロール
  $('a[href^="#"]').on('click', function (e) {
    var speed = 500;
    var offset = -80; // オフセット値（負の値で上に余白を作る）
    // アンカーの値取得
    var href = $(this).attr('href');
    // 移動先を取得
    var target = $(href == '#' || href == '' ? 'html' : href);
    // 移動先を数値で取得（オフセットを追加）
    var position = target.offset().top + offset;

    // スムーススクロール lazyload対策で実際には２回スムーススクロール実行
    $.when(
      $("html, body").animate({
        scrollTop: position
      }, 400, "swing"),
      e.preventDefault(),
    ).done(function() {
      var diff = target.offset().top + offset;
      if (diff === position) {
      } else {
        $("html, body").animate({
          scrollTop: diff
        }, 10, "swing");
      }
    });

    return false;
  });


  // ヘッダーのスクロール処理
  $(window).on('scroll', function () {
    var scroll = $(window).scrollTop();

    if (scroll > 100) {
      $('.c-header').addClass('is-scroll');
    } else {
      $('.c-header').removeClass('is-scroll');
    }
  });

    // ハンバーガーメニューの開閉
  $('.btn-menu').on('click', function () {
    $(this).toggleClass('is-open');
    $('.c-menu-wrap').toggleClass('is-open');

    if ($(this).hasClass('is-open')) {
      $('body').addClass('is-fixed'); // メニューを開いたときスクロール無効化
    } else {
      $('body').removeClass('is-fixed'); // メニューを閉じたときスクロール有効化
    }
  });

  // メニュー内のリンクをクリックしたらメニューを閉じる
  $('.c-menu a, .contact-btn').on('click', function () {
    $('.btn-menu').removeClass('is-open');
    $('.c-menu-wrap').removeClass('is-open');
    $('body').removeClass('is-fixed'); // スクロールを有効化
  });

  // ドロップダウン制御
  class Dropdown {
    constructor(dropdownElement) {
      this.dropdown = dropdownElement;
      this.button = this.dropdown.querySelector('.dropdown-button');
      this.menu = this.dropdown.querySelector('.dropdown-menu');
      this.selectedText = this.dropdown.querySelector('.selected-text');
      this.items = this.dropdown.querySelectorAll('.dropdown-item');

      this.init();
    }

    init() {
      // ボタンクリックでメニュー開閉
      this.button.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      // アイテム選択
      this.items.forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectItem(item);
        });
      });

      // 外側クリックで閉じる
      document.addEventListener('click', (e) => {
        if (!this.dropdown.contains(e.target)) {
          this.close();
        }
      });
    }

    toggle() {
      this.dropdown.classList.toggle('active');
    }

    close() {
      this.dropdown.classList.remove('active');
    }

    selectItem(item) {
      // 選択状態の更新
      this.items.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');

      // テキストの更新
      this.selectedText.textContent = item.textContent;

      // メニューを閉じる
      this.close();

      // カスタムイベントを発火（値の変更を通知）
      const value = item.getAttribute('data-value');
      this.dropdown.dispatchEvent(new CustomEvent('change', {
        detail: { value, text: item.textContent }
      }));
    }
  }

  // 使い方
  document.addEventListener('DOMContentLoaded', () => {
    // すべてのドロップダウンを初期化
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
      new Dropdown(dropdown);
    });

    // 値の変更を監視する場合
    const languageDropdown = document.getElementById('languageDropdown');
    if (languageDropdown) {
      languageDropdown.addEventListener('change', (e) => {
        console.log('選択された言語:', e.detail.value, e.detail.text);
      });
    }
  });





  // スライダー
  const swiper = new Swiper('.swiper', {
      slidesPerView: 'auto',
      spaceBetween: 20,
      centeredSlides: true,
      loop: true,
      autoplay: {
          delay: 3000,
          disableOnInteraction: false,
      },
      pagination: {
          el: '.swiper-pagination',
          clickable: true,
      },
      breakpoints: {
          320: {
              spaceBetween: 15
          },
          768: {
              spaceBetween: 20
          },
          1024: {
              spaceBetween: 25
          }
      }
  });


  $('.matchHeight').matchHeight();



})(jQuery);