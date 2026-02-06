<?php
/**
 * お問い合わせ メール送信
 */

/*** 定数 ***/

$dummy_mail = "info@jimotravel.jp";  // 利用者へ届く確認メールの送信元
$my_mail_1 = "info@jimotravel.jp";  // 確認メールの送信先アドレス
$my_mail_return = "info@jimotravel.jp";  // メーラーで発生するエラーが飛ぶアドレス


/*** POST情報取得 ***/

$post_name = $_POST["name"];
$post_email = $_POST["email"];
$post_content = $_POST["content"];


/******************** メール送信 *********************/

// 手順通りにこのページに遷移していない場合エラーメッセージ

if (strcmp($post_name,"") == 0) {
  print "[NG] : 不正なページ遷移です";
  //errorMsgPage();
}
else{
  // オーナー用メール内容をセット
  $owner_subject = "【ジモトラベル】HPからのお問い合わせがありました";
  $user_subject = "[지모트래블] 문의해 주셔서 감사합니다.";

  $content_message = "
【 이름 】 " . $post_name  . "
【 이메일 주소 】 " . $post_email  . "
【 문의 내용 】
" . $post_content  . "

------------------------------------------------";

$content_owner_message = "
【 お名前 】 " . $post_name  . "
【 メールアドレス 】 " . $post_email  . "
【 ご質問内容 】
" . $post_content  . "

------------------------------------------------";
}

  $owner_message = "内容は以下の通りです。
------------------------------------------------
" . $content_owner_message;

$user_message = "

" . $post_name . " 님
──────────────────────────

문의해 주셔서 진심으로 감사드립니다.
담당자가 확인 후 연락드리겠습니다.

--전송 내용 확인----------------------
" . $content_message . "

━━━━━━━━━━━━━━━━━━━━━━━━━━
　　지모트래블
　　https://jimotravel.jp/ko-KR/
━━━━━━━━━━━━━━━━━━━━━━━━━━
";


  // メール設定
  mb_language("uni");
  mb_internal_encoding("UTF-8");

  $mail_header  = "From: " . $post_email . "\n";
  $mail_header .= "Return-Path: " . $my_mail_return . "\n";

  // オーナーへメール送信
  if (!mb_send_mail($my_mail_1, $owner_subject, $owner_message, $mail_header, "-f".$my_mail_return)) {
  // メール送信 失敗
  print "[NG] : オーナーへメール送信 失敗";
     // errorMsgSend();
  }

  if ( $post_email !== '' ) {
    mb_internal_encoding("UTF-8");

    $mail_header  = "From: " . $dummy_mail . "\n";
    $mail_header .= "Return-Path: " . $my_mail_return . "\n";
    $mail_header .= "MIME-Version: 1.0\r\n";
    $mail_header .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $mail_header .= "Content-Transfer-Encoding: 8bit\r\n";
    // ユーザへメール送信
    if (!mb_send_mail($post_email, $user_subject, $user_message, $mail_header, "-f".$my_mail_return)) {
    // メール送信 失敗
    print "[NG] : ユーザへメール送信 失敗";
       // errorMsgSend();
    }
  }

?>