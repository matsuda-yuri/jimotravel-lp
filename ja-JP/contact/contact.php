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
  $user_subject = "【ジモトラベル】お問い合わせありがとうございました。";

  $content_message = "
【 お名前 】 " . $post_name  . "
【 メールアドレス 】 " . $post_email  . "
【 ご質問内容 】
" . $post_content  . "

------------------------------------------------";
}

  $owner_message = "内容は以下の通りです。
------------------------------------------------
" . $content_message;

$user_message = "

" . $post_name . " 様
──────────────────────────

この度はお問い合わせ頂き誠にありがとうございました。
改めて担当者よりご連絡をさせていただきます。

--ご送信内容の確認----------------------
" . $content_message . "

━━━━━━━━━━━━━━━━━━━━━━━━━━
　　ジモトラベル WEBサイト
　　https://jimotravel.jp/ja-JP/
━━━━━━━━━━━━━━━━━━━━━━━━━━
";


  // メール設定
  mb_language("Japanese");
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
    $mail_header  = "From: " . $dummy_mail . "\n";
    $mail_header .= "Return-Path: " . $my_mail_return . "\n";
    // ユーザへメール送信
    if (!mb_send_mail($post_email, $user_subject, $user_message, $mail_header, "-f".$my_mail_return)) {
    // メール送信 失敗
    print "[NG] : ユーザへメール送信 失敗";
       // errorMsgSend();
    }
  }

?>