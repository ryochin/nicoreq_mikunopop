// NicoRequestの設定群
// このファイルはJavascriptとして読み込まれます
// 下手に編集するとNicoRequestがエラー吐きます
var settings = new Object();

// =====================================================================================================================
// 使用ブラウザ

// ニコニコ動画にログインしているブラウザを設定します
// 非IEコンポーネントブラウザでログインしている場合はfalseに設定してください
// Windows Vista環境でIEの保護モードが有効の場合はfalseに設定してください
// falseに設定するとNicoRequestが制限モードで動作するようになります
//add start
// なお、NiconicoCookieImporterを別途入手して使用することで、非IEかつtrue設定でも動作するようになりました。
//add end
settings["UseIE"] = true;

// =====================================================================================================================
// ウィンドウのサイズ

// 起動時のウィンドウのサイズを設定します
// 俺設定そのままのため、数値がおかしなことに・・・不安なら数値変更を推奨ｗ
settings["WindowWidth"] = 320;
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
//del settings["TopMost"] = false;
//add start
settings["TopMost"] = false;

// =====================================================================================================================
// 起動時ログオフチェック

// ツール起動時にすぐにログイン画面を表示するかを設定します
// true=表示する　false=表示しない
settings["logoffCheck"] = false;
//add end

// =====================================================================================================================
// 再生切り替え方式

// 再生切り替え方式を設定します
// 0:通常の切り替え
// 1:スライド式切り替え(/swap→/play ID→3秒待機→/stop sub)
// 動画を流し切るタイプの生放送・小画面を用いる生放送では通常の切り替えに設定してください
settings["PlayMode"] = 0;

// =====================================================================================================================
// サムネイル画像表示

// サムネイル画像を表示する方法を設定します
// 具体的には、{#ThumbURL} にURLをセットするかどうかを指定します。
// たくさんの動画（１００以上）を指定すると固まるらしいので、そういった使い方をする場合は
// オフにしたほうがよさそうです。
// 1: ダミーのサムネイル画像を表示して負荷を下げる
// 2: サムネイル画像をネットから取得して表示する（デフォルト）
settings["ShowThumbnailType"] = 1;
settings["ThumbnailDummyImagePath"] = 'System/nico_dummy.png';    // NicoRequest.hta からの相対URL

// =====================================================================================================================
// ミクノ度

// ミクノ度をサーバに問い合わせるかどうかを設定します
// 具体的には、{#Count} に値を入れるかどうかを決めます。
// たくさんの動画（１００以上）を指定すると固まるらしいので、そういった使い方をする場合は
// オフにしたほうがよさそうです。
// 0: 取得しない（常に「-」になる）
// 1: 取得する（成功すれば数字、失敗すれば「?」が入る）
settings["GetMikunopopCount"] = 0;

// =====================================================================================================================
// 動画リストHTML

// NicoRequest内のリクエストリストのHTMLを構成します
// 以下の特殊文字列を記述するとその部分を動画情報に書き換えて表示します
// {#ID}:動画ID, {#Title}:タイトル, {#View}:再生数, {#Comm}:コメント数, {#List}:マイリスト数, {#Tags} 動画のタグリスト, {#Date} 投稿日時, {#Time} 再生時間, {#CTime} 累積時間
// {#Date}は更にsettings["ItemHTMLDate"]でフォーマットを指定できます
// {#Date}の特殊文字列: yyyy, yy, mm, dd, dy, hh, nn, ss
// 特定コミュ向けの特殊文字列として以下のものがあります
//del // {#PName}:Pネーム, {#JASCode}, JASコード
//del settings["ItemHTML"] = "{#Title}<br><b>再/</b>{#View} <b>コ/</b>{#Comm} <b>マ/</b>{#List} <b>時/</b>{#Time} <b>累/</b>{#CTime} {<b>JAS/</b>#JASCode}";
//del settings["ItemHTMLDate"] = "yy/mm/dd hh:nn:ss";
//add start
// {#PName}:Pネーム, {#JASCode}:JASコード, {#Type}:タイプ判定, {#Kiki}:聞き入り度, {#Myri}:マイリス率, {#Hiky}:正義度（ぼからん補正）
//settings["ItemHTML"] = "{#Type}{#Title}<br><b>P名/</b>{#PName} <b>JAS-C/</b>{#JASCode}<br><b>再/</b>{#View} <b>コ/</b>{#Comm} <b>マ/</b>{#List} <b>時/</b>{#Time} <b>累/</b>{#CTime}<br><b>投稿日/</b>{#Date}<br><b>聴き入り度/</b>{#Kiki} <b>マイリスト率/</b>{#Myri}% <b>正義値/</b>{#Hiky}";
settings["ItemHTML"] = "{#Type}{#Title}<br>"
//	+ "<img src=\"http://tn-skr4.smilevideo.jp/smile?i={#IDNO}\" width=65 height=50 align=left>"
	+ "{#ThumbURL}"
	+ "<b>Ｐ/</b>{#PName}<br>"
	+ "<b>投/</b>{#Date}<br>"
	+ "<b>再/</b>{#View} <b>コ/</b>{#Comm} <b>マ/</b>{#List}<br>"
	+ "<b>彡/</b>{#Count} <b>時/</b>{#Time} <b>計/</b>{#CTime}";
//settings["ItemHTMLDate"] = "yyyy年mm月dd日 hh時nn分ss秒";
settings["ItemHTMLDate"] = "yyyy年mm月dd日";
//add end

// =====================================================================================================================
// 情報コメント

// 動画再生時に表示される放送主コメントを構成します
// 基本的に動画リストHTMLと同じですが、一部使用できない特殊文字列も存在します
// InfoCommentの表示からInfoCommentTimerミリ秒後にInfoComment2を表示します
// InfoComment2の文字列を空にした場合はこの機能は無効となります
//del settings["InfoComment"] = "　{#Title}　<br>　再/{#View} コ/{#Comm} マ/{#List} 時/{#Time}　";
//del settings["InfoComment2"] = "";
//del settings["InfoCommentTimer"] = 8000;// ミリ秒
//del settings["InfoCommentDate"] = "yy/mm/dd hh:nn:ss";
//add start
//settings["InfoComment"] = "再生/{#View} ｺﾒﾝﾄ/{#Comm} ﾏｲﾘｽﾄ/{#List} 時間/{#Time}　<br>聴き入り度/{#Kiki} ﾏｲﾘｽﾄ率/{#Myri}% 正義値/{#Hiky}";
settings["InfoComment"] = "■{#Title} ■{#PName}<br>";
//settings["InfoComment2"] = "{#Title}　<br>JASｺｰﾄﾞ/{#JASCode}　P名/{#PName}　投稿日時/{#Date}";
settings["InfoComment2"] = "■{#Date} 時/{#Time} 彡/{#Count} ◆再/{#View} コ/{#Comm} マ/{#List} ({#Myri}%)";
settings["InfoCommentTimer"] =3000;// ミリ秒
//settings["InfoCommentDate"] = "yy年mm月dd日 hh時nn分ss秒";
settings["InfoCommentDate"] = "20yy.mm.dd";
//add end

// =====================================================================================================================
// 再生履歴用文字列

// 再生時の履歴を構成します
// 基本的に動画リストHTMLと同じですが、一部使用できない特殊文字列も存在します
//settings["PlayLog"] = "{#ID}　{#Title}　{#JASCode}";
settings["PlayLog"] = "{#ID}　{#Title}";

// =====================================================================================================================
// コメントログHTML

// コメントタブに表示されるHTMLを構成します
// 以下の特殊文字列を記述するとその部分をコメント情報に書き換えて表示します
// {#No}:コメントナンバー, {#Text}:コメントテキスト, {#ID}: ユーザーID
//add start
// {#No}:コメントナンバー, {#Text}:コメントテキスト, {#ID}: ユーザーID, {#Date}:コメントされた日時
// ただし、当環境では、{#Date}を指定する場合、日付を表示する設定にしないと、
// 時刻表示がうまくいかないようですorz 誰か解決法教えてplz
//
//add end
// より細かいカスタマイズをしたい場合はComment.jsを書き換えてください
//del settings["CommentLogHTML"] = "<b>{#No}</b> :{#Text}<br>[{#ID}]<hr>";
//add start
settings["CommentLogHTML"] = "<b>{#No}</b> ({#Date})<br>[{#Mail}]{#Text}<br>[{#ID}]<hr>";
settings["CommentLogDate"] = "yyyy年mm月dd日　dy曜日　hh時mm分ss秒";
//add end

// =====================================================================================================================
// 自動再生時のラグ対策用時間

// 自動再生時に強制的に待機する時間を設定します
//add start
// sm動画の再生の後はsettings["AutoPlayMargin"]秒待機します。
// nm動画の再生の後はsettings["AutoPlayMargin_nm"]秒待機します。
//add end
// 回線状況などによって最適な値は異なります
//del settings["AutoPlayMargin"] = 10;
//add start
settings["AutoPlayMargin"] = 5;
settings["AutoPlayMargin_nm"] = 10;

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
settings["type1STR"] = ["オリジナル", "おりじなる", "オリ曲", "セルフカバー", "自作"];
settings["type1Text"] =  "オリジナル";
settings["type1color"] =  "#ffffff";
settings["type1backgroundColor"] =  "blue";
//タイプ判定２
settings["type2STR"] = ["カバー", "かばー", "コピー", "こぴー", "替え歌", "東方", "アイマス", "アイドルマスター"];
settings["type2Text"] =  "カバー";
settings["type2color"] =  "#ffffff";
settings["type2backgroundColor"] =  "red";

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
settings["CheckNew"] = true;

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
// JASコードも登録できるようにできるかな？

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

settings["jingles"] = ["",
 ["sm6789292","ジングル：Freestyle"],
 ["sm6789315","ジングル：近未来ラジオ"],
 ["sm6939234","ジングル：ミクノポップクエスト"],
 ["sm6981084","ジングル：近未来ラジオ"],
 ["sm7007629","ジングル：音楽が降りてくる"],
 ["sm7033805","ジングル：ミクノポップをきかないか？"],
 ["sm7075450","ジングル：円の中の世界"],
 ["sm7341325","第２回大賞：告知：悶さん"],
 ["sm7343558","第２回大賞：告知：きぬこもちさん"],
 ["sm7346152","第２回大賞：ＣＭ：さいはね"],
 ""];

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

//add end

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
//del settings["SofTalkMode"] = 1;
//add start
settings["SofTalkMode"] = -1;
//add end

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
	27/*Esc*/: function(){window.close();},
	112/*F1*/: function(){NicoLive.postComment("枠とってくる", "");},
	113/*F2*/: function(){NicoLive.postComment("次がラスト", "");},
	114/*F3*/: function(){NicoLive.postComment("次の動画はじまったらリク開始", "");},
	115/*F4*/: function(){NicoLive.postComment("ゆっくりしていってね！", "");},
//	116/*F5*/: function(){NicoLive.postComment("現在のストック："+RequestManager.RequestQueues.length, "");},
	116/*F5*/: function(){NicoLive.postComment("現在のストック："+RequestManager.RequestQueues.length + "曲", "");},
	0/*dummy*/: function(){}
};

// 待機時間
// 動画情報の取得の待機時間をミリ秒単位で設定します
// 0ミリ秒に設定すると正常に動作しません
// 動作が安定しない場合は待機時間を長くしてみてください
// 待機時間を短くすると正常に動作しなくなる恐れがあります
settings["ThumbInfoTaskWait"] = 250;

// 動画タイトルから削除する文字列
// 動画タイトルを短縮するために用います
// ここに記述された文字列は全て削除されます
settings["TitleDeleteTargets"] = [/^アイドルマスター[\s　]+/, /((を|で)?(初音ミク|ギロカクたん)+[\s　]*が[\s　]*(オリジナル|カバー|.*の替え歌)?(を|曲を|曲の)?)+[\s　]*/g, /((を|が)?(歌|唄)+(いました|いました|いやがった|う|ってくれた|ってくれました|ってみた)+(っ|よ)?)+[\s　]*/g, /(☆+[\s　]*)$/, /(！+[\s　]*)$/];

// ニコマス・ボカロ向け例外Pネーム
// Pネームを表すタグ名の末尾がPまたは氏または作品でない場合はここに記述します
// 最初と最後はダミーとして空白("")を設定してください
settings["exceptionPTagsIM"] = ["", "がぶ呑み", "ayakanP(仮名)", "GazL", "hbrk", "7インチ", "伝説のもやしもん", "とかち未来派", "末期P（仮）", "モロ兵P（仮）", "うそ太郎", ""];
//settings["exceptionPTagsVO"] = ["", "OSTER_project", "ika", "kz", "ryo", "KEI", "masquer", "ボカロ互助会", "AEGIS", "andromeca", "awk", "Azell", "cokesi", "DARS", "DixieFlatline", "GonGoss", "G-Fac.", "halyosy", "haruna808", "HMOとかの中の人", "IGASIO", "inokix", "iroha(sasaki)", "Karimono", "kashiwagi氏", "kotaro", "kous", "KuKuDoDo", "LOLI.COM", "MAX_VEGETABLE", "Masuda_K", "MineK", "No.D", "OPA", "otetsu", "Otomania", "AETA(イータ)", "cosMo(暴走P)", "doriko", "PENGUINS_PROJECT", "Re:nG", "ShakeSphere", "samfree", "Shibayan", "SHIKI", "snowy*", "takotakoagare交響楽団", "Tatsh", "Treow(逆衝動P)", "Tripshots", "TuKuRu", "UPNUSY", "VIVO", "wintermute", "X-Plorez", "YAMADA-SUN", "yukiwo", "カリスマブレイクに定評のあるうP主", "[TEST]", "杏あめ", "Dog tails", "歌和サクラ", "裸時", "邂逅の中の人", "喜兵衛", "Φ串Φ", "このり", "小林オニキス", "田中和夫", "ちゃぁ", "チョコパ幻聴P(パティシエ)", "ティッシュ姫", "テンネン", "とおくできこえるデンシオン", "トマ豆腐", "ナツカゼP(Tastle)", "肉骸骨", "伴長", "森井ケンシロウ", "山本似之", "山本ニュー", "林檎", "レインロード", "164", "∀studio", "uunnie", "おいも", "madamxx", "mijinko3", "DECO*27", "さかきょ", "ちーむ炙りトロ丼", "GlassOnion", "bothneco", "yu", "m@rk", "shin", "kame", "たすどろ", "nof", "YYMIKUYY", "Zekky", "HironoLin", "スタジオいるかのゆ", "PEG", "meam", "ＸＧｗｏｒｋｓ", "まはい", "nankyoku", "ナヅキ", "Nen-Sho-K", "Sat4", "suzy", "ぽぴー", "名鉄2000系", "Noya", "さね", "きらら", "ごんぱち", "えどみはる", "analgesic_agents", "不確定名：producer（1）", "takuyabrian", "kuma", "tomo", "nabe_nabe", "桃茄子", "river", "れい・ぼーん", "クリアP(YS)", "usuki", "OperaGhost", "instinctive", "銀色の人", "pan", "龍徹", "AVTechNO", "●テラピコス", "びんご", "shin", "ゆよゆっぺ", "くっじー", "ミナグ", "LIQ", "まゆたま", "チームほしくず", "WEB-MIX", "ukey", "Phantasma", "Kossy", "mintiack", "Yoshihi", "ぱきら", "すたじおEKO＆GP1", "Neri_McMinn", "ぼか主", "Harmonia", "Rock", "TACHE", "cmmz", "BIRUGE", "m_yus", "たけchan", "CleanTears", "Lue", "FuMay", "SHUN", "関西芋ぱん伝", "静野", "どぶウサギ", "bestgt", "IGASI○", "メロネード(仮)", "ICEproject", "ぱんつのうた製作委員会", "さいはね", "MikSolodyne-ts", "Yossy", "あつぞうくん", "タイスケ", ""];
settings["exceptionPTagsVO"] = ["","OSTER_project","ika","kz","ryo","KEI","masquer","ボカロ互助会","AEGIS","andromeca","awk","Azell","cokesi","DARS","DixieFlatline","GonGoss","G-Fac.","halyosy","haruna808","HMOとかの中の人","IGASIO","inokix","iroha(sasaki)","Karimono","kashiwagi氏","kotaro","kous","KuKuDoDo","LOLI.COM","MAX_VEGETABLE","Masuda_K","MineK","No.D","OPA","otetsu","Otomania","AETA(イータ)","cosMo(暴走P)","doriko","PENGUINS_PROJECT","Re:nG","ShakeSphere","samfree","Shibayan","SHIKI","snowy*","takotakoagare交響楽団","Tatsh","Treow(逆衝動P)","Tripshots","TuKuRu","UPNUSY","VIVO","wintermute","X-Plorez","YAMADA-SUN","yukiwo","カリスマブレイクに定評のあるうP主","[TEST]","杏あめ","Dog tails","歌和サクラ","裸時","邂逅の中の人","喜兵衛","Φ串Φ","このり","小林オニキス","田中和夫","ちゃぁ","チョコパ幻聴P(パティシエ)","ティッシュ姫","テンネン","とおくできこえるデンシオン","トマ豆腐","ナツカゼP(Tastle)","肉骸骨","伴長","森井ケンシロウ","山本似之","山本ニュー","林檎","レインロード","164","∀studio","uunnie","おいも","madamxx","mijinko3","DECO*27","さかきょ","ちーむ炙りトロ丼","GlassOnion","bothneco","yu","m@rk","shin","kame","たすどろ","nof","YYMIKUYY","Zekky","HironoLin","スタジオいるかのゆ","PEG","meam","ＸＧｗｏｒｋｓ","まはい","nankyoku","ナヅキ","Nen-Sho-K","Sat4","suzy","ぽぴー","名鉄2000系","Noya","さね","きらら","ごんぱち","えどみはる","analgesic_agents","takuyabrian","kuma","tomo","nabe_nabe","桃茄子","river","れい・ぼーん","クリアP(YS)","usuki","OperaGhost","instinctive","銀色の人","pan","龍徹","AVTechNO","●テラピコス","びんご","shin","ゆよゆっぺ","くっじー","ミナグ","LIQ","まゆたま","チームほしくず","WEB-MIX","ukey","Phantasma","Kossy","mintiack","Yoshihi","ぱきら","すたじおEKO＆GP1","Neri_McMinn","ぼか主","Harmonia","Rock","TACHE","cmmz","BIRUGE","m_yus","たけchan","CleanTears","Lue","FuMay","SHUN","関西芋ぱん伝","静野","どぶウサギ","bestgt","IGASI○","メロネード(仮)","ICEproject","ぱんつのうた製作委員会","さいはね","MikSolodyne-ts","Yossy","あつぞうくん","タイスケ","P∴Rhythmatiq","ぎん","Rin","hapi⇒","microgroover","Studio_IIG",""];

// ニコマス・ボカロ向け例外Pネーム
// ニコマス・ボカロ向け除外Pネーム
// タグ名の末尾がPでもP名として取得しない場合はここに記述します
settings["NotPTagsIM"] = ["", "iM@SHUP", "アイドルマスターSP", "PSP", ""];
settings["NotPTagsVO"] = ["", "MikuPOP", "RinPOP", "アニメOP", "ゲームOP", "エロゲOP", "偽OP", ""];

// Pネーム取得失敗時の名前
// タグからPネームを取得できなかった際に用いられる文字列を指定します
// 空文字("")を設定するとダブルクリックによるPネーム編集機能が使えなくなります
//del settings["NoPName"] = "P名?";
//add start
//settings["NoPName"] = " ";
//settings["NoPName"] = "?";
settings["NoPName"] = "P名?";

// JASRACコードがない時の{#JASCode}の代替文字列
settings["NoJASCode"] = "コードなし";

//add end

// EOF
