// NicoRequestの設定群
// このファイルはJavascriptとして読み込まれます
// 下手に編集するとNicoRequestがエラー吐きます
var settings = new Object();

// =====================================================================================================================
// デバッグ

settings["Debug"] = false;

// =====================================================================================================================
// 一時設定保存ファイル

settings["ConfigFile"] = '\\System\\caches\\config.json';

// =====================================================================================================================
// 使用ブラウザ

// ニコニコ動画にログインしているブラウザを設定します
// 非IEコンポーネントブラウザでログインしている場合はfalseに設定してください
// Windows Vista環境でIEの保護モードが有効の場合はfalseに設定してください
// falseに設定するとNicoRequestが制限モードで動作するようになります
// なお、NiconicoCookieImporterを別途入手して使用することで、非IEかつtrue設定でも動作するようになりました。
settings["UseIE"] = true;

// =====================================================================================================================
// ウィンドウのサイズ

// 起動時のウィンドウのサイズを設定します
// 俺設定そのままのため、数値がおかしなことに・・・不安なら数値変更を推奨ｗ
settings["WindowWidth"] = 344;
settings["WindowHeight"] = 720;

// =====================================================================================================================
// ウィンドウの位置

// 起動時のウィンドウの位置を設定します
// -1を指定した場合デスクトップの中央になります
settings["WindowX"] = 0;
settings["WindowY"] = 0;

// =====================================================================================================================
// ウィンドウを常に最前面に表示する

// ウィンドウを常に最前面に表示します
settings["TopMost"] = false;

// =====================================================================================================================
// 起動時ログオフチェック

// ツール起動時にすぐにログイン画面を表示するかを設定します
// true=表示する　false=表示しない
settings["logoffCheck"] = false;

// =====================================================================================================================
// 再生切り替え方式

// 再生切り替え方式を設定します
// 0:通常の切り替え
// 1:スライド式切り替え(/swap→/play ID→3秒待機→/stop sub)
// 動画を流し切るタイプの生放送・小画面を用いる生放送では通常の切り替えに設定してください
settings["PlayMode"] = 0;

// =====================================================================================================================
// サムネイル画像表示 by saihane

// サムネイル画像を表示する方法を設定します
// 具体的には、{#ThumbURL} にURLをセットするかどうかを指定します。
// たくさんの動画（１００以上）を指定すると固まるらしいので、そういった使い方をする場合は
// オフにしたほうがよさそうです。
// 1: ダミーのサムネイル画像を表示して負荷を下げる
// 2: サムネイル画像をネットから取得して表示する（デフォルト）
settings["ShowThumbnailType"] = 2;
settings["ThumbnailDummyImagePath"] = 'System/assets/nico_dummy.png';    // NicoRequest.hta からの相対URL
settings["ThumbnailNoLiveImagePath"] = 'System/assets/nico_nolive.png';    // NicoRequest.hta からの相対URL
settings["ThumbnailNGIDImagePath"] = 'System/assets/nico_ngid.png';    // NicoRequest.hta からの相対URL

// =====================================================================================================================
// ミクノ度 by saihane

// ミクノ度をサーバに問い合わせるかどうかを設定します
// 具体的には、{#Count} に値を入れるかどうかを決めます。
// たくさんの動画（１００以上）を指定すると固まるらしいので、そういった使い方をする場合は
// オフにしたほうがよさそうです。
// 0: 取得しない（常に「-」になる）
// 1: 取得する（成功すれば数字、失敗すれば「?」が入る）
settings["GetMikunopopCount"] = 1;

// =====================================================================================================================
// リクエスト追加順（実験的隠し機能） by saihane

// 実験的機能です。必ずテストして納得の上で使用してください。
// いろいろな問題点をクリアするだけの時間が取れないので、このまま放置される可能性が高いです。
// 
// 動画リクエストや放送主による動画の追加の際に、リストの最初に加えるか最後に加えるかを選びます。
// これは、リスナーからのリクエストがリストの末尾にくるとわかりにくいため、
// リストの頭に現れるようにしたら楽じゃないか、という発想による実験的機能です。
// ただし、一番上の動画を再生しようとした瞬間にリクがあった場合の誤操作にご注意を。
// 使用するなら、リスナーからのリクエストの場合のみtopを指定するのをおすすめします。
// bottom: リクエストリストの末尾に追加されます（従来通り）
// top   : リクエストリストの先頭に追加されます

// 放送主（あなた）が加えた場合
settings["RequestListOrderAdmin"] = 'bottom';    // 従来通り

// stock.txtを読む場合
settings["RequestListOrderStock"] = 'bottom';    // 従来通り

// リスナーからのリクエストの場合
settings["RequestListOrderListener"] = 'bottom';    //  従来通り

// =====================================================================================================================
// 再生時間の表示タイプ by saihane

// 曲の再生時間をカウントダウン方式にします。
// サーバが重くなければわりと正確のようです。
// どちらにせよ再生タイミングのずれにより正確な時間は出せないので概算となります。
// 0: カウントアップ方式
// 1: カウントダウン方式（デフォルト）

// 再生時間の表示タイプを指定
settings["TimeLeftCountdown"] = 1;

// =====================================================================================================================
// マイリスト情報のキャッシュ機能 by saihane

// 0: 無効（毎回ネットから取得、とても重い処理）
// 1: 有効（あればローカルのファイルを読み、無ければネットから取得してローカルに保存する）
settings["UseMylistInfoCache"] = 1;

// キャッシュする時間
settings["MylistInfoCacheExpireHour"] = 3 * 24;    // 3 day

// =====================================================================================================================
// 動画情報のキャッシュ機能 by saihane
// サーバから得た動画の情報をローカルにキャッシュします。
// 一定以上古くなると改めて取得します。
// 私の環境ではアプリ動作速度的な恩恵はありませんが、将来的なことも考えてとりあえず実装しました。

// 0: 無効（毎回ネットから取得）
// 1: 有効（あればローカルのファイルを読み、無ければネットから取得してローカルに保存する）
settings["UseVideoInfoCache"] = 1;

// キャッシュする時間
settings["VideoInfoCacheExpireHour"] = 12;

// 動画情報の取得の待機時間をミリ秒単位で設定します
// （おそらくほとんど意味をなしません）
settings["ThumbInfoTaskWaitCached"] = 50;

// =====================================================================================================================
// 重複動画のアラート表示 by saihane
// すでにストックにある動画がリクエストされた際にメッセージを表示します。

settings["showStockDuplicatedAlert"] = true;

// =====================================================================================================================
// １人複数リクエストの禁止 by saihane
// 枠内で、１人がリクエストできる曲数の上限を設定します。
// 
// -> ツール上から自動保存するようになりました

// =====================================================================================================================
// stock.txt 自動保存 by saihane
// ストックリストに変化（曲の増減）があれば自動で保存します。

// true: 保存しない（従来通り）
// false: 保存する（デフォルト）

settings["autoSaveStockFile"] = true;

// =====================================================================================================================
// 副管理者コメントの表示方法 by saihane
// 通常の管理者コメントあるいは BSP コメントを指定します。
// テスト運用の結果、現状ではいろいろ問題があるので隠し機能扱いとします。

// true: BSP コメント（青字）
// false: 従来通りの管理者コメント（赤字）
settings["dummyAdminCommentIsBSPStyle"] = false;

// =====================================================================================================================
// サムネイル画像サービスのアドレス by saihane

settings["VideoThumbnailURL"] = "http://niconail.in/%s";    // sprintf.js format

// =====================================================================================================================
// 総放送時間の非表示 by saihane
// テスト時間ができてから総放送時間はあてにならなくなったので、デフォルトで
// 非表示にします。

// true: 表示（従来通り）
// false: 表示しない
settings["showTimeLeft"] = false;

// =====================================================================================================================
// 動画リストHTML

// NicoRequest内のリクエストリストのHTMLを構成します
// 以下の特殊文字列を記述するとその部分を動画情報に書き換えて表示します
// {#ID}:動画ID, {#Title}:タイトル, {#View}:再生数, {#Comm}:コメント数, {#List}:マイリスト数, {#Tags} 動画のタグリスト, {#Date} 投稿日時, {#Time} 再生時間, {#CTime} 累積時間
// {#Date}は更にsettings["ItemHTMLDate"]でフォーマットを指定できます
// {#Date}の特殊文字列: yyyy, yy, mm, dd, dy, hh, nn, ss
// 特定コミュ向けの特殊文字列として以下のものがあります
// {#PName}:Pネーム, {#JASCode}:JASコード, {#Type}:タイプ判定, {#Kiki}:聞き入り度, {#Myri}:マイリス率, {#Hiky}:正義度（ぼからん補正）
//settings["ItemHTML"] = "{#Type}{#Title}<br><b>P名/</b>{#PName} <b>JAS-C/</b>{#JASCode}<br><b>再/</b>{#View} <b>コ/</b>{#Comm} <b>マ/</b>{#List} <b>時/</b>{#Time} <b>累/</b>{#CTime}<br><b>投稿日/</b>{#Date}<br><b>聴き入り度/</b>{#Kiki} <b>マイリスト率/</b>{#Myri}% <b>正義値/</b>{#Hiky}";
//settings["ItemHTML"] = "{#Type}{#Title}<br>"
settings["ItemHTML"] = ""
	+ "{#ThumbURL}"
	+ '<span class="subtitle">Ｐ </span><span title="ダブルクリックして名前を編集">{#PName}</span><br>'
	+ '<span class="subtitle">投 </span>{#Date}<br>'
	+ '<span class="subtitle">再 </span>{#View} <span class="subtitle">コ </span>{#Comm} <span class="subtitle">マ </span>{#List}<br>'
	+ '<span class="subtitle">彡 </span><span class="count">{#Count}</span>&nbsp; <span class="subtitle">時 </span>{#Time}&nbsp; <span class="subtitle">計 </span>{#CTime}<br>'
	+ '<span class="genre">{#Genre}</span>';
//settings["ItemHTMLDate"] = "yyyy年mm月dd日 hh時nn分ss秒";
settings["ItemHTMLDate"] = "yyyy年mm月dd日";

// =====================================================================================================================
// 情報コメント

// 動画再生時に表示される放送主コメントを構成します
// 基本的に動画リストHTMLと同じですが、一部使用できない特殊文字列も存在します
// InfoCommentの表示からInfoCommentTimerミリ秒後にInfoComment2を表示します
// InfoComment2の文字列を空にした場合はこの機能は無効となります

// original
//settings["InfoComment"] = "再生/{#View} ｺﾒﾝﾄ/{#Comm} ﾏｲﾘｽﾄ/{#List} 時間/{#Time}　<br>聴き入り度/{#Kiki} ﾏｲﾘｽﾄ率/{#Myri}% 正義値/{#Hiky}";
//settings["InfoComment2"] = "{#Title}　<br>JASｺｰﾄﾞ/{#JASCode}　P名/{#PName}　投稿日時/{#Date}";

// １番目
settings["InfoComment"] = 
	  '<font color="#000000">■</font>'
	+ '<font color="#acacec">{#Title}</font> <br>'
	+ '<font color="#000000">■</font>'
//	+ '<font color="#999999"> by</font> '
	+ '<font color="#ecccac"> {#PName}</font>';

// ２番目
settings["InfoComment2"] = 
	  '<font color="#000000">■</font>'
	+ '<font color="#acacec">{#Date}</font> '
	+ '<font color="#aaaaaa">時/</font><font color="#b9f6b9">{#Time}</font> '
	+ '<font color="#ecccac">彡</font><font color="#aaaaaa">/</font><font color="#f3aaaa">{#Count}</font> '
	+ '<font color="#aaaaaa">リ/</font><font color="#ecccac">{#ReqInfo}</font>'
//	+ '<font color="#aaaaaa">リ/</font><font color="#b9f6b9">{#ReqInfo}</font><br> '
	+ '<font color="#000000">◆</font>'
	+ '<font color="#aaaaaa">再/</font><font color="#b9f6b9">{#View}</font> '
//	+ '<font color="#aaaaaa">コ/</font><font color="#b9f6b9">{#Comm}</font> '
	+ '<font color="#aaaaaa">マ/</font><font color="#b9f6b9">{#List} ({#Myri}%) </font>';

// 日付の表示
//settings["InfoCommentDate"] = "yy年mm月dd日 hh時nn分ss秒";
settings["InfoCommentDate"] = "20yy.mm.dd";

// リクエスト元の表示 by Mint=Rabbit
settings["RequesterAdminStr"]    = "主セレ";    // 主セレ
settings["RequesterListenerStr"] = "{#ReqCommentNum}さん";    // リクエスト {#ReqCommentNum}がコメNoに置換される
//settings["RequesterListenerStr"] = ">>{#ReqCommentNum}さん";

// 次の情報を表示するまでの時間
settings["InfoCommentTimer"] = 8000;    // ミリ秒 短くしすぎると、自分のコメントが連投規制される可能性があるので注意

// =====================================================================================================================
// 常時コメント
// 空じゃない文字列が設定されたら、曲情報表示後に永続情報を表示します

// 左寄せの例
//settings["PermComment"] = 
//	  '<font color="#999999">　彡</font><font color="#f3aaaa">{#Count}</font><font color="#acacec">　　{#Title}</font><font color="#000000">{#PName}　　</font><br>'
//	+ '<font color="#000000">　彡</font><font color="#000000">{#Count}</font><font color="#ecccac">　　{#PName}</font><font color="#000000">{#Title}　　</font>';
//settings["PermCommentCmd"] = 'hidari';

// 右よせの例 a.k.a. boro (original by A*Ster) さん仕様
//settings["PermComment"] = 
//	  '<br>'
//	+ '<font color="#000000">{#PName}</font><font color="#a3a3a3">{#Title}</font><br>'
//	+ '<font color="#000000">{#Title}</font><font color="#f3f3f3">{#PName}</font>';
//settings["PermCommentCmd"] = 'migi';

// =====================================================================================================================
// 再生履歴用文字列

// 再生時の履歴を構成します
// 基本的に動画リストHTMLと同じですが、一部使用できない特殊文字列も存在します
settings["PlayLog"] = "{#ID}　{#Title}";

// =====================================================================================================================
// コメントログHTML

// コメントタブに表示されるHTMLを構成します
// 以下の特殊文字列を記述するとその部分をコメント情報に書き換えて表示します
// {#No}:コメントナンバー, {#Text}:コメントテキスト, {#ID}: ユーザーID, {#Date}:コメントされた日時
// ただし、当環境では、{#Date}を指定する場合、日付を表示する設定にしないと、
// 時刻表示がうまくいかないようですorz 誰か解決法教えてplz
//
// より細かいカスタマイズをしたい場合はComment.jsを書き換えてください
settings["CommentLogHTML"] = '<span class="no">{#No}</span> <span class="date">{#Date}</span> &nbsp; <span class="id">by {#ID} [{#Mail}]</span><br>'
							+ '{#Text}<hr>';
//settings["CommentLogDate"] = "yyyy年mm月dd日　dy曜日　hh時nn分ss秒";
settings["CommentLogDate"] = "hh:nn:ss";

// コメントタブにサムネイル画像を表示するかどうか
settings["showCommentTabVideoThumbnail"] = true;

// =====================================================================================================================
// 自動再生時のラグ対策用時間

// 自動再生時に強制的に待機する時間を設定します
// smまたはso動画の再生の後はsettings["AutoPlayMargin"]秒待機します。
// nm動画の再生の後はsettings["AutoPlayMargin_nm"]秒待機します。
// 回線状況などによって最適な値は異なります

settings["AutoPlayMargin"] = 3;
settings["AutoPlayMargin_nm"] = 3;

// =====================================================================================================================
//タイプ最大数

settings["typeMax"] = 2;

// =====================================================================================================================
//STR:判定用文字列

// ここで設定された文字列を元に["type1"]["type2"]判定対象内を検索して、該当した場合["type1"]["type2"]の表示をします
// 単純な検索ですので「["type1"]ではない」のような否定的表現をしている場合も["type1"]に該当するものとします
//name:表示用文字列
// ここで設定された文字列がツール上に表示されます
//color:文字色　backgroundColor:背景色
// ここで設定された色が文字と背景に適用されます
// 指定表記は16進数、文字列どちらも対応しています
//タイプ判定１
//settings["type1STR"] = ["オリジナル", "おりじなる", "オリ曲", "セルフカバー", "自作"];
//settings["type1Text"] =  "オリジナル";
//settings["type1color"] =  "#ffffff";
//settings["type1backgroundColor"] =  "blue";
//タイプ判定２
//settings["type2STR"] = ["カバー", "かばー", "コピー", "こぴー", "替え歌", "東方", "アイマス", "アイドルマスター"];
//settings["type2Text"] =  "カバー";
//settings["type2color"] =  "#ffffff";
//settings["type2backgroundColor"] =  "red";

// =====================================================================================================================
// タイプ判定対象項目

// ここでtrueに設定された項目の文字列を対象にタイプ判定のチェックをします
// タイプ判定のチェックが必要ない場合、全てをfalseに設定してください
//動画タイトル
settings["typeTITLE"] =  false;
//動画説明文
settings["typeDESCRIPTION"] = false;
//動画タグ
settings["typeTAG"] = false;

// =====================================================================================================================
// 新着確認フラグ

// リクされた動画が新着かどうかを確認するかどうかをここで設定します。
settings["CheckNew"] = false;

// =====================================================================================================================
// NGリストに一時的に追加

// ニコリク起動中、１度再生した動画を、２度流さないようNGリストに一時的に追加するかどうか
// ただし、主セレの場合は除外とする。
settings["AddPlayedVideoId2NGIDs"] = true;

// =====================================================================================================================
// 再生されている動画がマイリストに登録されているかどうか、

// チェックさせるかどうかをここで設定できます。
// ただし、trueに設定すると、まれにマイリス一覧の取得に失敗する場合があるようですorz
settings["CheckPlayedVideoIdIsAdd2Mylists"] = true;

// =====================================================================================================================
// 再生・視聴履歴をファイルへ保存するタイミングの指定

// 履歴をニコリク終了時（AtEnd）に保存するか、動画再生時（AtPlay）に保存するかを設定します。
// 有効値は「AtEnd」「AtPlay」のみで、それ以外だとファイルへの保存はしません。
settings["SaveLogTiming"] = "AtPlay";

// =====================================================================================================================
// 起動時にログファイルが残っていた場合に削除するかどうか

// ニコリクが途中で落ちて再度起動させる場合にはfalseに設定しておくことをオススメします。
settings["DeleteLogWhenOpen"] = false;

// =====================================================================================================================
// 放送履歴を直接投稿可能にするかどうか

// trueに設定した場合、リクエスト→再生（視聴）履歴の出力で出るウィンドウから
// 直接プレイリストに投稿できるようになります。
settings["Enable2PostHistory"] = false;

// =====================================================================================================================
// プレイリスト投稿時の名前欄、メルアド欄に入力する文字を設定します。
settings["PlayListSiteName"] = "";
settings["PlayListSiteMail"] = "sage";

// =====================================================================================================================
// stock.txtがある場合、起動時にその内容を読むかどうか

settings["AutoLoadStock"] = true;

// =====================================================================================================================
// 終了時にストックを保存するかどうか

settings["AutoSaveStock"] = true;
// なお、stock.txtのフォーマットは１行がsm/nm動画IDのみで構成されるテキストファイルです。

// =====================================================================================================================
// ウィンドウの位置・サイズをsettings.jsに反映させるかどうか

// うちのvistaではなぜか少しズレるorz
settings["AutoSaveWindowParams"] = false;

// =====================================================================================================================
// 放送時間の設定

settings["LimitTime"] = 1800;
//settings["LimitTime"] = 3600;

// =====================================================================================================================
// ジングル動画ID一覧
// -> see jingles.json

// =====================================================================================================================
// ジングル用コメント by saihane

settings["JingleComment"] = 
	'<font color="#000000">■</font>'
	+ '{#longname}<br>'
	+ '<font color="#000000">◆</font> '
	+ '<font color="#acacec">{#no} '
	+ '<font color="#999999">presented by</font> '
	+ '<font color="#ecccac">{#author}</font>';

// =====================================================================================================================
// 以下NicoCookieImporter関連

// ブラウザの種類をここで設定します。
//　IE6またはIE7(XP) = 0
//　IE7 Vista        = 1
//　FireFox 3        = 2
//　Opera            = 3
//　Safari           = 4
//　Google Chorme    = 5
settings["browserType"] = 0;

//クッキーの寿命(単位は時間  0にすると無期限)
settings["cookieLifeSpan"] = 0;

// =====================================================================================================================
// ここから拡張設定
// 拡張機能を使用しない場合は使用しない設定です

// SofTalk動作モード
// SofTalkによるコメント読み上げの動作モードを設定します
// 現在は以下のモードが用意されています
// -1:OFF, SofTalk拡張機能をOFFにします
//  0:エンタメモード, 音声の種類・スピードがランダムに設定され、コメントが投稿されるたびに読み上げます
//  1:実用モード,     音声の種類・スピードが聞きやすいものに限定され、1つのコメントを読み終えるまで他のコメントを待機させます
//  2:半分モード,     音声の種類・スピードが聞きやすいものに限定され、コメントが投稿されるたびに読み上げます
settings["SofTalkMode"] = -1;

// SofTalk限界コメント長
// SofTalkで読み上げるコメントの長さの限界を設定します
// 全角文字も半角文字と同様に長さは1とカウントされます
// 設定した長さを超えた場合、それ以降を削除して「以下省略」と読み上げます
settings["SofTalkCommentLimit"] = 40;

// SofTalk同時起動数
// SofTalkエンタメモードで同時に起動するSofTalkの限界数を設定します
// 同時起動数を多くすると動作が不安定になる恐れがあります
// 0に設定しても1プロセスは起動します
settings["SofTalkProcessLimit"] = 10;

// SofTalkコメントストック限界数
// SofTalk実用モードでストックするコメントの限界数を設定します
// 限界数を超えた場合は現在読み上げてるコメントを強制終了して次のコメントを読み始めます
settings["SofTalkStockLimit"] = 20;

// Twitter投稿機能
// 現在再生中の動画情報をTwitterに投稿します
// 【注意】アカウント情報をテキストとして保存するという事の意味を十分に理解してください
settings["Twitter"] = false;
settings["Twitter_Mail"] = "example@example.com";
settings["Twitter_Pass"] = "example";

// =====================================================================================================================
// ここから非推奨設定
// 特定コミュ向けの設定・ある程度プログラムの知識を要する設定・動作を保証しない設定です

// 強制ログイン
// NicoRequestでニコニコ動画にログインします
// settings["UseIE"]をfalseにしないといけない環境でもtrueに設定できます
// ただしブラウザ側が一度切断されるので再ログインしなくてはならなくなる副作用があります
// 【注意】アカウント情報をテキストとして保存するという事の意味を十分に理解してください
settings["EnforceLogin"] = false;
settings["Login_Mail"] = "example@example.com";
settings["Login_Pass"] = "example";

// キーボードショートカットの設定です
// キーコードとそれに対応する機能を記述します
settings["key"] = {
//	27/*Esc*/: function(){window.close();},
	112/*F1*/: function(){NicoLive.postComment("現在のストックは " + RequestManager.RequestQueues.length + " 曲です。", "");},
	0/*dummy*/: function(){}
};

// 待機時間
// 動画情報の取得の待機時間をミリ秒単位で設定します
// 0ミリ秒に設定すると正常に動作しません
// 動作が安定しない場合は待機時間を長くしてみてください
// 待機時間を短くすると正常に動作しなくなる恐れがあります
settings["ThumbInfoTaskWait"] = 250;

// Pネーム取得失敗時の名前
// タグからPネームを取得できなかった際に用いられる文字列を指定します
// 空文字("")を設定するとダブルクリックによるPネーム編集機能が使えなくなります
settings["NoPName"] = "P名?";
//settings["NoPName"] = "P名不明！ 情報求ム！";

// 取得するマイリストグループから除外する名前
settings["MylistBlackList"] = ["", "アイマス", "MMD", "3D", "ぬこ", "good", "ミクゲー", "技術部", "萌え", "_name_", ""];

// =====================================================================================================================
// リクエスト制限 by saihane
// 

settings["RequestLimitation"] = [];

// リクエスト制限標準タグ
settings["RequestLimitation"]["DefaultTags"] = [
	"テクノ",
	"テクノポップ",
	"ミクノ",
	"ミクノポップ",
	"ミクトランス",
	"ミクトロニカ",
	"ミクビエント",
	"MikuPOP",
	"MikuHouse",
	"VOCALOID-EUROBEAT",
	"ボカロコア",
	"ミックンベース",
	"ミクボッサ",
	"ボカノバ",
	"ミクウェーブ",
	"ポストミック",
	"ボカロラップ",
];

// リクエスト制限拡張タグ
settings["RequestLimitation"]["ExtraTags"] = [
	"ChipTune",
	"Instrumental",
	"ミニマル",
	"J-CORE",
	"テレパスミュージック",
	"アングーグラウンドボカロジャパン",
	"時田トリビュート",
	"ジャガボンゴ",
	"わりばしおんな。",
//	"ProjectDIVA-AC楽曲募集",
];

// EOF
