// NicoRequest�̐ݒ�Q
// ���̃t�@�C����Javascript�Ƃ��ēǂݍ��܂�܂�
// ����ɕҏW�����NicoRequest���G���[�f���܂�
var settings = new Object();

// =====================================================================================================================
// �f�o�b�O

settings["Debug"] = false;

// =====================================================================================================================
// �g�p�u���E�U

// �j�R�j�R����Ƀ��O�C�����Ă���u���E�U��ݒ肵�܂�
// ��IE�R���|�[�l���g�u���E�U�Ń��O�C�����Ă���ꍇ��false�ɐݒ肵�Ă�������
// Windows Vista����IE�̕ی샂�[�h���L���̏ꍇ��false�ɐݒ肵�Ă�������
// false�ɐݒ肷���NicoRequest���������[�h�œ��삷��悤�ɂȂ�܂�
//add start
// �Ȃ��ANiconicoCookieImporter��ʓr���肵�Ďg�p���邱�ƂŁA��IE����true�ݒ�ł����삷��悤�ɂȂ�܂����B
//add end
settings["UseIE"] = true;

// =====================================================================================================================
// �E�B���h�E�̃T�C�Y

// �N�����̃E�B���h�E�̃T�C�Y��ݒ肵�܂�
// ���ݒ肻�̂܂܂̂��߁A���l���������Ȃ��ƂɁE�E�E�s���Ȃ琔�l�ύX�𐄏���
settings["WindowWidth"] = 344;
settings["WindowHeight"] = 720;

// =====================================================================================================================
// �E�B���h�E�̈ʒu

// �N�����̃E�B���h�E�̈ʒu��ݒ肵�܂�
// -1���w�肵���ꍇ�f�X�N�g�b�v�̒����ɂȂ�܂�
settings["WindowX"] = 0;
settings["WindowY"] = 0;

// =====================================================================================================================
// �E�B���h�E����ɍőO�ʂɕ\������

// �E�B���h�E����ɍőO�ʂɕ\�����܂�
//del settings["TopMost"] = false;
//add start
settings["TopMost"] = false;

// =====================================================================================================================
// �N�������O�I�t�`�F�b�N

// �c�[���N�����ɂ����Ƀ��O�C����ʂ�\�����邩��ݒ肵�܂�
// true=�\������@false=�\�����Ȃ�
settings["logoffCheck"] = false;
//add end

// =====================================================================================================================
// �Đ��؂�ւ�����

// �Đ��؂�ւ�������ݒ肵�܂�
// 0:�ʏ�̐؂�ւ�
// 1:�X���C�h���؂�ւ�(/swap��/play ID��3�b�ҋ@��/stop sub)
// ����𗬂��؂�^�C�v�̐������E����ʂ�p���鐶�����ł͒ʏ�̐؂�ւ��ɐݒ肵�Ă�������
settings["PlayMode"] = 0;

// =====================================================================================================================
// �T���l�C���摜�\�� by saihane

// �T���l�C���摜��\��������@��ݒ肵�܂�
// ��̓I�ɂ́A{#ThumbURL} ��URL���Z�b�g���邩�ǂ������w�肵�܂��B
// ��������̓���i�P�O�O�ȏ�j���w�肷��ƌł܂�炵���̂ŁA�����������g����������ꍇ��
// �I�t�ɂ����ق����悳�����ł��B
// 1: �_�~�[�̃T���l�C���摜��\�����ĕ��ׂ�������
// 2: �T���l�C���摜���l�b�g����擾���ĕ\������i�f�t�H���g�j
settings["ShowThumbnailType"] = 2;
settings["ThumbnailDummyImagePath"] = 'System/assets/nico_dummy.png';    // NicoRequest.hta ����̑���URL

// =====================================================================================================================
// �~�N�m�x by saihane

// �~�N�m�x���T�[�o�ɖ₢���킹�邩�ǂ�����ݒ肵�܂�
// ��̓I�ɂ́A{#Count} �ɒl�����邩�ǂ��������߂܂��B
// ��������̓���i�P�O�O�ȏ�j���w�肷��ƌł܂�炵���̂ŁA�����������g����������ꍇ��
// �I�t�ɂ����ق����悳�����ł��B
// 0: �擾���Ȃ��i��Ɂu-�v�ɂȂ�j
// 1: �擾����i��������ΐ����A���s����΁u?�v������j
settings["GetMikunopopCount"] = 1;

// =====================================================================================================================
// ���N�G�X�g�ǉ����i�����I�B���@�\�j by saihane

// �����I�@�\�ł��B�K���e�X�g���Ĕ[���̏�Ŏg�p���Ă��������B
// ���낢��Ȗ��_���N���A���邾���̎��Ԃ����Ȃ��̂ŁA���̂܂ܕ��u�����\���������ł��B
// 
// ���惊�N�G�X�g�������ɂ�铮��̒ǉ��̍ۂɁA���X�g�̍ŏ��ɉ����邩�Ō�ɉ����邩��I�т܂��B
// ����́A���X�i�[����̃��N�G�X�g�����X�g�̖����ɂ���Ƃ킩��ɂ������߁A
// ���X�g�̓��Ɍ����悤�ɂ�����y����Ȃ����A�Ƃ������z�ɂ������I�@�\�ł��B
// �������A��ԏ�̓�����Đ����悤�Ƃ����u�ԂɃ��N���������ꍇ�̌둀��ɂ����ӂ��B
// �g�p����Ȃ�A���X�i�[����̃��N�G�X�g�̏ꍇ�̂�top���w�肷��̂��������߂��܂��B
// bottom: ���N�G�X�g���X�g�̖����ɒǉ�����܂��i�]���ʂ�j
// top   : ���N�G�X�g���X�g�̐擪�ɒǉ�����܂�

// ������i���Ȃ��j���������ꍇ
settings["RequestListOrderAdmin"] = 'bottom';    // �]���ʂ�

// stock.txt��ǂޏꍇ
settings["RequestListOrderStock"] = 'bottom';    // �]���ʂ�

// ���X�i�[����̃��N�G�X�g�̏ꍇ
settings["RequestListOrderListener"] = 'bottom';    //  �]���ʂ�

// =====================================================================================================================
// �Đ����Ԃ̕\���^�C�v by saihane

// �Ȃ̍Đ����Ԃ��J�E���g�_�E�������ɂ��܂��B
// �T�[�o���d���Ȃ���΂��Ɛ��m�̂悤�ł��B
// �ǂ���ɂ���Đ��^�C�~���O�̂���ɂ�萳�m�Ȏ��Ԃ͏o���Ȃ��̂ŊT�Z�ƂȂ�܂��B
// 0: �J�E���g�A�b�v����
// 1: �J�E���g�_�E�������i�f�t�H���g�j

// �Đ����Ԃ̕\���^�C�v���w��
settings["TimeLeftCountdown"] = 1;

// =====================================================================================================================
// �}�C���X�g���̃L���b�V���@�\ by saihane

// 0: �����i����l�b�g����擾�A�ƂĂ��d�������j
// 1: �L���i����΃��[�J���̃t�@�C����ǂ݁A������΃l�b�g����擾���ă��[�J���ɕۑ�����j
settings["UseMylistInfoCache"] = 1;

// �L���b�V�����鎞��
settings["MylistInfoCacheExpireHour"] = 3 * 24;    // 3 day

// =====================================================================================================================
// ������̃L���b�V���@�\ by saihane
// �T�[�o���瓾������̏������[�J���ɃL���b�V�����܂��B
// ���ȏ�Â��Ȃ�Ɖ��߂Ď擾���܂��B
// ���̊��ł̓A�v�����쑬�x�I�ȉ��b�͂���܂��񂪁A�����I�Ȃ��Ƃ��l���ĂƂ肠�����������܂����B

// 0: �����i����l�b�g����擾�j
// 1: �L���i����΃��[�J���̃t�@�C����ǂ݁A������΃l�b�g����擾���ă��[�J���ɕۑ�����j
settings["UseVideoInfoCache"] = 1;

// �L���b�V�����鎞��
settings["VideoInfoCacheExpireHour"] = 2 * 24;    // a day

// ������̎擾�̑ҋ@���Ԃ��~���b�P�ʂŐݒ肵�܂�
// �i�����炭�قƂ�ǈӖ����Ȃ��܂���j
settings["ThumbInfoTaskWaitCached"] = 50;

// =====================================================================================================================
// �d������̃A���[�g�\�� by saihane
// ���łɃX�g�b�N�ɂ��铮�悪���N�G�X�g���ꂽ�ۂɃ��b�Z�[�W��\�����܂��B

settings["showStockDuplicatedAlert"] = true;

// =====================================================================================================================
// �P�l�������N�G�X�g�̋֎~ by saihane
// �g���ŁA�P�l�����N�G�X�g�ł���Ȑ��̏����ݒ肵�܂��B

// 0: �`�F�b�N���Ȃ��i��l���Ȃł����N�G�X�g�\�j�@�f�t�H���g
// ����: ��l���Ȃ܂Ń��N�G�X�g�\�B���Ƃ��΂P���ƂP�ȁA�Q���ƂQ�ȁB

settings["multiRequestLimit"] = 0;    // �`�F�b�N���Ȃ�
//settings["multiRequestLimit"] = 1;    // �P�l�P�Ȃ܂�

// =====================================================================================================================
// ���惊�X�gHTML

// NicoRequest���̃��N�G�X�g���X�g��HTML���\�����܂�
// �ȉ��̓��ꕶ������L�q����Ƃ��̕����𓮉���ɏ��������ĕ\�����܂�
// {#ID}:����ID, {#Title}:�^�C�g��, {#View}:�Đ���, {#Comm}:�R�����g��, {#List}:�}�C���X�g��, {#Tags} ����̃^�O���X�g, {#Date} ���e����, {#Time} �Đ�����, {#CTime} �ݐώ���
// {#Date}�͍X��settings["ItemHTMLDate"]�Ńt�H�[�}�b�g���w��ł��܂�
// {#Date}�̓��ꕶ����: yyyy, yy, mm, dd, dy, hh, nn, ss
// ����R�~�������̓��ꕶ����Ƃ��Ĉȉ��̂��̂�����܂�
//del // {#PName}:P�l�[��, {#JASCode}, JAS�R�[�h
//del settings["ItemHTML"] = "{#Title}<br><b>��/</b>{#View} <b>�R/</b>{#Comm} <b>�}/</b>{#List} <b>��/</b>{#Time} <b>��/</b>{#CTime} {<b>JAS/</b>#JASCode}";
//del settings["ItemHTMLDate"] = "yy/mm/dd hh:nn:ss";
//add start
// {#PName}:P�l�[��, {#JASCode}:JAS�R�[�h, {#Type}:�^�C�v����, {#Kiki}:��������x, {#Myri}:�}�C���X��, {#Hiky}:���`�x�i�ڂ����␳�j
//settings["ItemHTML"] = "{#Type}{#Title}<br><b>P��/</b>{#PName} <b>JAS-C/</b>{#JASCode}<br><b>��/</b>{#View} <b>�R/</b>{#Comm} <b>�}/</b>{#List} <b>��/</b>{#Time} <b>��/</b>{#CTime}<br><b>���e��/</b>{#Date}<br><b>��������x/</b>{#Kiki} <b>�}�C���X�g��/</b>{#Myri}% <b>���`�l/</b>{#Hiky}";
//settings["ItemHTML"] = "{#Type}{#Title}<br>"
settings["ItemHTML"] = ""
//	+ "<img src=\"http://tn-skr4.smilevideo.jp/smile?i={#IDNO}\" width=65 height=50 align=left>"
	+ "{#ThumbURL}"
	+ '<span class="subtitle">�o </span>{#PName}<br>'
	+ '<span class="subtitle">�� </span>{#Date}<br>'
	+ '<span class="subtitle">�� </span>{#View} <span class="subtitle">�R </span>{#Comm} <span class="subtitle">�} </span>{#List}<br>'
	+ '<span class="subtitle">�c </span><span class="count">{#Count}</span>&nbsp; <span class="subtitle">�� </span>{#Time}&nbsp; <span class="subtitle">�v </span>{#CTime}<br>'
	+ '<span class="genre">{#Genre}</span>';
//settings["ItemHTMLDate"] = "yyyy�Nmm��dd�� hh��nn��ss�b";
settings["ItemHTMLDate"] = "yyyy�Nmm��dd��";
//add end

// =====================================================================================================================
// ���R�����g

// ����Đ����ɕ\������������R�����g���\�����܂�
// ��{�I�ɓ��惊�X�gHTML�Ɠ����ł����A�ꕔ�g�p�ł��Ȃ����ꕶ��������݂��܂�
// InfoComment�̕\������InfoCommentTimer�~���b���InfoComment2��\�����܂�
// InfoComment2�̕��������ɂ����ꍇ�͂��̋@�\�͖����ƂȂ�܂�
//del settings["InfoComment"] = "�@{#Title}�@<br>�@��/{#View} �R/{#Comm} �}/{#List} ��/{#Time}�@";
//del settings["InfoComment2"] = "";
//del settings["InfoCommentTimer"] = 8000;// �~���b
//del settings["InfoCommentDate"] = "yy/mm/dd hh:nn:ss";
//add start
//settings["InfoComment"] = "�Đ�/{#View} ����/{#Comm} ϲؽ�/{#List} ����/{#Time}�@<br>��������x/{#Kiki} ϲؽė�/{#Myri}% ���`�l/{#Hiky}";
//settings["InfoComment2"] = "{#Title}�@<br>JAS����/{#JASCode}�@P��/{#PName}�@���e����/{#Date}";
settings["InfoComment"] = 
	  '<font color="#000000">��</font>'
	+ '<font color="#acacec">{#Title}</font> <br>'
	+ '<font color="#000000">��</font>'
//	+ '<font color="#999999"> by</font> '
	+ '<font color="#ecccac"> {#PName}</font>';
settings["InfoComment2"] = 
	  '<font color="#000000">��</font>'
	+ '<font color="#acacec">{#Date}</font> '
	+ '<font color="#aaaaaa">��/</font><font color="#b9f6b9">{#Time}</font> '
	+ '<font color="#ecccac">�c</font><font color="#aaaaaa">/</font><font color="#f3aaaa">{#Count}</font> '
	+ '<font color="#000000">��</font>'
	+ '<font color="#aaaaaa">��/</font><font color="#b9f6b9">{#View}</font> '
	+ '<font color="#aaaaaa">�R/</font><font color="#b9f6b9">{#Comm}</font> '
	+ '<font color="#aaaaaa">�}/</font><font color="#b9f6b9">{#List} ({#Myri}%) </font>';
settings["InfoCommentTimer"] = 8000;// �~���b �Z����������ƁA�����̃R�����g���A���K�������\��������̂Œ���
//settings["InfoCommentDate"] = "yy�Nmm��dd�� hh��nn��ss�b";
settings["InfoCommentDate"] = "20yy.mm.dd";
//add end

// =====================================================================================================================
// �펞�R�����g
// �󂶂�Ȃ������񂪐ݒ肳�ꂽ��A�ȏ��\����ɉi������\�����܂�

// ���񂹂̗�
//settings["PermComment"] = 
//	  '<font color="#999999">�@�c</font><font color="#f3aaaa">{#Count}</font><font color="#acacec">�@�@{#Title}</font><font color="#000000">{#PName}�@�@</font><br>'
//	+ '<font color="#000000">�@�c</font><font color="#000000">{#Count}</font><font color="#ecccac">�@�@{#PName}</font><font color="#000000">{#Title}�@�@</font>';
//settings["PermCommentCmd"] = 'hidari';

// �E�悹�̗� a.k.a. boro (original by A*Ster) ����d�l
//settings["PermComment"] = 
//	  '<br>'
//	+ '<font color="#000000">{#PName}</font><font color="#a3a3a3">{#Title}</font><br>'
//	+ '<font color="#000000">{#Title}</font><font color="#f3f3f3">{#PName}</font>';
//settings["PermCommentCmd"] = 'migi';

// =====================================================================================================================
// �Đ�����p������

// �Đ����̗������\�����܂�
// ��{�I�ɓ��惊�X�gHTML�Ɠ����ł����A�ꕔ�g�p�ł��Ȃ����ꕶ��������݂��܂�
//settings["PlayLog"] = "{#ID}�@{#Title}�@{#JASCode}";
settings["PlayLog"] = "{#ID}�@{#Title}";

// =====================================================================================================================
// �R�����g���OHTML

// �R�����g�^�u�ɕ\�������HTML���\�����܂�
// �ȉ��̓��ꕶ������L�q����Ƃ��̕������R�����g���ɏ��������ĕ\�����܂�
// {#No}:�R�����g�i���o�[, {#Text}:�R�����g�e�L�X�g, {#ID}: ���[�U�[ID
//add start
// {#No}:�R�����g�i���o�[, {#Text}:�R�����g�e�L�X�g, {#ID}: ���[�U�[ID, {#Date}:�R�����g���ꂽ����
// �������A�����ł́A{#Date}���w�肷��ꍇ�A���t��\������ݒ�ɂ��Ȃ��ƁA
// �����\�������܂������Ȃ��悤�ł�orz �N�������@������plz
//
//add end
// ���ׂ����J�X�^�}�C�Y���������ꍇ��Comment.js�����������Ă�������
//del settings["CommentLogHTML"] = "<b>{#No}</b> :{#Text}<br>[{#ID}]<hr>";
//add start
settings["CommentLogHTML"] = '<span class="no">{#No}</span> <span class="date">{#Date}</span> &nbsp; <span class="id">by {#ID} [{#Mail}]</span><br>'
							+ '{#Text}<hr>';
//settings["CommentLogDate"] = "yyyy�Nmm��dd���@dy�j���@hh��nn��ss�b";
settings["CommentLogDate"] = "hh:nn:ss";
//add end

// �R�����g�^�u�ɃT���l�C���摜��\�����邩�ǂ���
settings["showCommentTabVideoThumbnail"] = true;

// =====================================================================================================================
// �����Đ����̃��O�΍��p����

// �����Đ����ɋ����I�ɑҋ@���鎞�Ԃ�ݒ肵�܂�
//add start
// sm����̍Đ��̌��settings["AutoPlayMargin"]�b�ҋ@���܂��B
// nm����̍Đ��̌��settings["AutoPlayMargin_nm"]�b�ҋ@���܂��B
//add end
// ����󋵂Ȃǂɂ���čœK�Ȓl�͈قȂ�܂�
//del settings["AutoPlayMargin"] = 10;
//add start
settings["AutoPlayMargin"] = 3;
settings["AutoPlayMargin_nm"] = 3;

// =====================================================================================================================
//�^�C�v�ő吔

settings["typeMax"] = 2;

// =====================================================================================================================
//STR:����p������

// �����Őݒ肳�ꂽ�����������["type1"]["type2"]����Ώۓ����������āA�Y�������ꍇ["type1"]["type2"]�̕\�������܂�
// �P���Ȍ����ł��̂Łu["type1"]�ł͂Ȃ��v�̂悤�Ȕے�I�\�������Ă���ꍇ��["type1"]�ɊY��������̂Ƃ��܂�
//name:�\���p������
// �����Őݒ肳�ꂽ�����񂪃c�[����ɕ\������܂�
//color:�����F�@backgroundColor:�w�i�F
// �����Őݒ肳�ꂽ�F�������Ɣw�i�ɓK�p����܂�
// �w��\�L��16�i���A������ǂ�����Ή����Ă��܂�
//�^�C�v����P
settings["type1STR"] = ["�I���W�i��", "���肶�Ȃ�", "�I����", "�Z���t�J�o�[", "����"];
settings["type1Text"] =  "�I���W�i��";
settings["type1color"] =  "#ffffff";
settings["type1backgroundColor"] =  "blue";
//�^�C�v����Q
settings["type2STR"] = ["�J�o�[", "���΁[", "�R�s�[", "���ҁ[", "�ւ���", "����", "�A�C�}�X", "�A�C�h���}�X�^�["];
settings["type2Text"] =  "�J�o�[";
settings["type2color"] =  "#ffffff";
settings["type2backgroundColor"] =  "red";

// =====================================================================================================================
// �^�C�v����Ώۍ���

// ������true�ɐݒ肳�ꂽ���ڂ̕������ΏۂɃ^�C�v����̃`�F�b�N�����܂�
// �^�C�v����̃`�F�b�N���K�v�Ȃ��ꍇ�A�S�Ă�false�ɐݒ肵�Ă�������
//����^�C�g��
settings["typeTITLE"] =  false;
//���������
settings["typeDESCRIPTION"] = false;
//����^�O
settings["typeTAG"] = false;

// =====================================================================================================================
// �V���m�F�t���O

// ���N���ꂽ���悪�V�����ǂ������m�F���邩�ǂ����������Őݒ肵�܂��B
settings["CheckNew"] = true;

// =====================================================================================================================
// NG���X�g�Ɉꎞ�I�ɒǉ�

// �j�R���N�N�����A�P�x�Đ�����������A�Q�x�����Ȃ��悤NG���X�g�Ɉꎞ�I�ɒǉ����邩�ǂ���
// �������A��Z���̏ꍇ�͏��O�Ƃ���B
settings["AddPlayedVideoId2NGIDs"] = true;

// =====================================================================================================================
// �Đ�����Ă��铮�悪�}�C���X�g�ɓo�^����Ă��邩�ǂ����A

// �`�F�b�N�����邩�ǂ����������Őݒ�ł��܂��B
// �������Atrue�ɐݒ肷��ƁA�܂�Ƀ}�C���X�ꗗ�̎擾�Ɏ��s����ꍇ������悤�ł�orz
settings["CheckPlayedVideoIdIsAdd2Mylists"] = true;

// =====================================================================================================================
// �Đ��E�����������t�@�C���֕ۑ�����^�C�~���O�̎w��

// �������j�R���N�I�����iAtEnd�j�ɕۑ����邩�A����Đ����iAtPlay�j�ɕۑ����邩��ݒ肵�܂��B
// �L���l�́uAtEnd�v�uAtPlay�v�݂̂ŁA����ȊO���ƃt�@�C���ւ̕ۑ��͂��܂���B
settings["SaveLogTiming"] = "AtPlay";

// =====================================================================================================================
// �N�����Ƀ��O�t�@�C�����c���Ă����ꍇ�ɍ폜���邩�ǂ���

// �j�R���N���r���ŗ����čēx�N��������ꍇ�ɂ�false�ɐݒ肵�Ă������Ƃ��I�X�X�����܂��B
settings["DeleteLogWhenOpen"] = false;

// =====================================================================================================================
// ���������𒼐ړ��e�\�ɂ��邩�ǂ���

// true�ɐݒ肵���ꍇ�A���N�G�X�g���Đ��i�����j�����̏o�͂ŏo��E�B���h�E����
// ���ڃv���C���X�g�ɓ��e�ł���悤�ɂȂ�܂��B
settings["Enable2PostHistory"] = false;

// =====================================================================================================================
// �v���C���X�g���e���̖��O���A�����A�h���ɓ��͂��镶����ݒ肵�܂��B
settings["PlayListSiteName"] = "";
settings["PlayListSiteMail"] = "sage";

// =====================================================================================================================
// stock.txt������ꍇ�A�N�����ɂ��̓��e��ǂނ��ǂ���

settings["AutoLoadStock"] = true;

// =====================================================================================================================
// �I�����ɃX�g�b�N��ۑ����邩�ǂ���

settings["AutoSaveStock"] = true;
// �Ȃ��Astock.txt�̃t�H�[�}�b�g�͂P�s��sm/nm����ID�݂̂ō\�������e�L�X�g�t�@�C���ł��B
// JAS�R�[�h���o�^�ł���悤�ɂł��邩�ȁH

// =====================================================================================================================
// �E�B���h�E�̈ʒu�E�T�C�Y��settings.js�ɔ��f�����邩�ǂ���

// ������vista�ł͂Ȃ��������Y����orz
settings["AutoSaveWindowParams"] = false;

// =====================================================================================================================
// �������Ԃ̐ݒ�

settings["LimitTime"] = 1800;
//settings["LimitTime"] = 3600;

// =====================================================================================================================
// �W���O������ID�ꗗ
// -> see jingles.json

// =====================================================================================================================
// �W���O���p�R�����g by saihane

settings["JingleComment"] = 
	'<font color="#000000">��</font>'
	+ '{#longname}<br>'
	+ '<font color="#000000">��</font> '
	+ '<font color="#acacec">{#no} '
	+ '<font color="#999999">presented by</font> '
	+ '<font color="#ecccac">{#author}</font>';

// =====================================================================================================================
// �ȉ�NicoCookieImporter�֘A

// �u���E�U�̎�ނ������Őݒ肵�܂��B
//�@IE6�܂���IE7(XP) = 0
//�@IE7 Vista        = 1
//�@FireFox 3        = 2
//�@Opera            = 3
//�@Safari           = 4
//�@Google Chorme    = 5
settings["browserType"] = 0;

//�N�b�L�[�̎���(�P�ʂ͎���  0�ɂ���Ɩ�����)
settings["cookieLifeSpan"] = 0;

//add end

// =====================================================================================================================
// ��������g���ݒ�
// �g���@�\���g�p���Ȃ��ꍇ�͎g�p���Ȃ��ݒ�ł�

// SofTalk���샂�[�h
// SofTalk�ɂ��R�����g�ǂݏグ�̓��샂�[�h��ݒ肵�܂�
// ���݂͈ȉ��̃��[�h���p�ӂ���Ă��܂�
// -1:OFF, SofTalk�g���@�\��OFF�ɂ��܂�
//  0:�G���^�����[�h, �����̎�ށE�X�s�[�h�������_���ɐݒ肳��A�R�����g�����e����邽�тɓǂݏグ�܂�
//  1:���p���[�h,     �����̎�ށE�X�s�[�h�������₷�����̂Ɍ��肳��A1�̃R�����g��ǂݏI����܂ő��̃R�����g��ҋ@�����܂�
//  2:�������[�h,     �����̎�ށE�X�s�[�h�������₷�����̂Ɍ��肳��A�R�����g�����e����邽�тɓǂݏグ�܂�
//del settings["SofTalkMode"] = 1;
//add start
settings["SofTalkMode"] = -1;
//add end

// SofTalk���E�R�����g��
// SofTalk�œǂݏグ��R�����g�̒����̌��E��ݒ肵�܂�
// �S�p���������p�����Ɠ��l�ɒ�����1�ƃJ�E���g����܂�
// �ݒ肵�������𒴂����ꍇ�A����ȍ~���폜���āu�ȉ��ȗ��v�Ɠǂݏグ�܂�
settings["SofTalkCommentLimit"] = 40;

// SofTalk�����N����
// SofTalk�G���^�����[�h�œ����ɋN������SofTalk�̌��E����ݒ肵�܂�
// �����N�����𑽂�����Ɠ��삪�s����ɂȂ鋰�ꂪ����܂�
// 0�ɐݒ肵�Ă�1�v���Z�X�͋N�����܂�
settings["SofTalkProcessLimit"] = 10;

// SofTalk�R�����g�X�g�b�N���E��
// SofTalk���p���[�h�ŃX�g�b�N����R�����g�̌��E����ݒ肵�܂�
// ���E���𒴂����ꍇ�͌��ݓǂݏグ�Ă�R�����g�������I�����Ď��̃R�����g��ǂݎn�߂܂�
settings["SofTalkStockLimit"] = 20;

// Twitter���e�@�\
// ���ݍĐ����̓������Twitter�ɓ��e���܂�
// �y���Ӂz�A�J�E���g�����e�L�X�g�Ƃ��ĕۑ�����Ƃ������̈Ӗ����\���ɗ������Ă�������
settings["Twitter"] = false;
settings["Twitter_Mail"] = "example@example.com";
settings["Twitter_Pass"] = "example";


// =====================================================================================================================
// ��������񐄏��ݒ�
// ����R�~�������̐ݒ�E������x�v���O�����̒m����v����ݒ�E�����ۏ؂��Ȃ��ݒ�ł�

// �������O�C��
// NicoRequest�Ńj�R�j�R����Ƀ��O�C�����܂�
// settings["UseIE"]��false�ɂ��Ȃ��Ƃ����Ȃ����ł�true�ɐݒ�ł��܂�
// �������u���E�U������x�ؒf�����̂ōă��O�C�����Ȃ��Ă͂Ȃ�Ȃ��Ȃ镛��p������܂�
// �y���Ӂz�A�J�E���g�����e�L�X�g�Ƃ��ĕۑ�����Ƃ������̈Ӗ����\���ɗ������Ă�������
settings["EnforceLogin"] = false;
settings["Login_Mail"] = "example@example.com";
settings["Login_Pass"] = "example";

// �L�[�{�[�h�V���[�g�J�b�g�̐ݒ�ł�
// �L�[�R�[�h�Ƃ���ɑΉ�����@�\���L�q���܂�
settings["key"] = {
	27/*Esc*/: function(){window.close();},
	112/*F1*/: function(){NicoLive.postComment("�g�Ƃ��Ă���", "");},
	113/*F2*/: function(){NicoLive.postComment("�������X�g", "");},
	114/*F3*/: function(){NicoLive.postComment("���̓���͂��܂����烊�N�J�n", "");},
	115/*F4*/: function(){NicoLive.postComment("������肵�Ă����ĂˁI", "");},
//	116/*F5*/: function(){NicoLive.postComment("���݂̃X�g�b�N�F"+RequestManager.RequestQueues.length, "");},
	116/*F5*/: function(){NicoLive.postComment("���݂̃X�g�b�N�F"+RequestManager.RequestQueues.length + "��", "");},
	0/*dummy*/: function(){}
};

// �ҋ@����
// ������̎擾�̑ҋ@���Ԃ��~���b�P�ʂŐݒ肵�܂�
// 0�~���b�ɐݒ肷��Ɛ���ɓ��삵�܂���
// ���삪���肵�Ȃ��ꍇ�͑ҋ@���Ԃ𒷂����Ă݂Ă�������
// �ҋ@���Ԃ�Z������Ɛ���ɓ��삵�Ȃ��Ȃ鋰�ꂪ����܂�
settings["ThumbInfoTaskWait"] = 250;

// ����^�C�g������폜���镶����
// ����^�C�g����Z�k���邽�߂ɗp���܂�
// �����ɋL�q���ꂽ������͑S�č폜����܂�
//settings["TitleDeleteTargets"] = [/^�A�C�h���}�X�^�[[\s�@]+/, /((��|��)?(�����~�N|�M���J�N����)+[\s�@]*��[\s�@]*(�I���W�i��|�J�o�[|.*�̑ւ���)?(��|�Ȃ�|�Ȃ�)?)+[\s�@]*/g, /((��|��)?(��|�S)+(���܂���|���܂���|���₪����|��|���Ă��ꂽ|���Ă���܂���|���Ă݂�)+(��|��)?)+[\s�@]*/g, /(��+[\s�@]*)$/, /(�I+[\s�@]*)$/];
settings["TitleDeleteTargets"] = [];

// �j�R�}�X�E�{�J��������OP�l�[��
// P�l�[����\���^�O���̖�����P�܂��͎��܂��͍�i�łȂ��ꍇ�͂����ɋL�q���܂�
// �ŏ��ƍŌ�̓_�~�[�Ƃ��ċ�("")��ݒ肵�Ă�������
//settings["exceptionPTagsIM"] = ["", "���ԓۂ�", "ayakanP(����)", "GazL", "hbrk", "7�C���`", "�`���̂��₵����", "�Ƃ��������h", "����P�i���j", "������P�i���j", "�������Y", ""];
settings["exceptionPTagsIM"] = ["", ""];
//settings["exceptionPTagsVO"] = ["", "OSTER_project", "ika", "kz", "ryo", "KEI", "masquer", "�{�J���ݏ���", "AEGIS", "andromeca", "awk", "Azell", "cokesi", "DARS", "DixieFlatline", "GonGoss", "G-Fac.", "halyosy", "haruna808", "HMO�Ƃ��̒��̐l", "IGASIO", "inokix", "iroha(sasaki)", "Karimono", "kashiwagi��", "kotaro", "kous", "KuKuDoDo", "LOLI.COM", "MAX_VEGETABLE", "Masuda_K", "MineK", "No.D", "OPA", "otetsu", "Otomania", "AETA(�C�[�^)", "cosMo(�\��P)", "doriko", "PENGUINS_PROJECT", "Re:nG", "ShakeSphere", "samfree", "Shibayan", "SHIKI", "snowy*", "takotakoagare�����y�c", "Tatsh", "Treow(�t�Փ�P)", "Tripshots", "TuKuRu", "UPNUSY", "VIVO", "wintermute", "X-Plorez", "YAMADA-SUN", "yukiwo", "�J���X�}�u���C�N�ɒ�]�̂��邤P��", "[TEST]", "�ǂ���", "Dog tails", "�̘a�T�N��", "����", "�琂̒��̐l", "�앺�q", "������", "���̂�", "���уI�j�L�X", "�c���a�v", "���႟", "�`���R�p����P(�p�e�B�V�G)", "�e�B�b�V���P", "�e���l��", "�Ƃ����ł�������f���V�I��", "�g�}����", "�i�c�J�[P(Tastle)", "���[��", "����", "�X��P���V���E", "�R�{���V", "�R�{�j���[", "�ь�", "���C�����[�h", "164", "��studio", "uunnie", "������", "madamxx", "mijinko3", "DECO*27", "��������", "���[���t��g����", "GlassOnion", "bothneco", "yu", "m@rk", "shin", "kame", "�����ǂ�", "nof", "YYMIKUYY", "Zekky", "HironoLin", "�X�^�W�I���邩�̂�", "PEG", "meam", "�w�f����������", "�܂͂�", "nankyoku", "�i�d�L", "Nen-Sho-K", "Sat4", "suzy", "�ۂҁ[", "���S2000�n", "Noya", "����", "�����", "����ς�", "���ǂ݂͂�", "analgesic_agents", "�s�m�薼�Fproducer�i1�j", "takuyabrian", "kuma", "tomo", "nabe_nabe", "���֎q", "river", "�ꂢ�E�ځ[��", "�N���AP(YS)", "usuki", "OperaGhost", "instinctive", "��F�̐l", "pan", "���O", "AVTechNO", "���e���s�R�X", "�т�", "shin", "�������", "�������[", "�~�i�O", "LIQ", "�܂䂽��", "�`�[���ق�����", "WEB-MIX", "ukey", "Phantasma", "Kossy", "mintiack", "Yoshihi", "�ς���", "��������EKO��GP1", "Neri_McMinn", "�ڂ���", "Harmonia", "Rock", "TACHE", "cmmz", "BIRUGE", "m_yus", "����chan", "CleanTears", "Lue", "FuMay", "SHUN", "�֐����ς�`", "�Ö�", "�ǂԃE�T�M", "bestgt", "IGASI��", "�����l�[�h(��)", "ICEproject", "�ς�̂�������ψ���", "�����͂�", "MikSolodyne-ts", "Yossy", "����������", "�^�C�X�P", ""];
//settings["exceptionPTagsVO"] = ["","OSTER_project","ika","kz","ryo","KEI","masquer","�{�J���ݏ���","AEGIS","andromeca","awk","Azell","cokesi","DARS","DixieFlatline","GonGoss","G-Fac.","halyosy","haruna808","HMO�Ƃ��̒��̐l","IGASIO","inokix","iroha(sasaki)","Karimono","kashiwagi��","kotaro","kous","KuKuDoDo","LOLI.COM","MAX_VEGETABLE","Masuda_K","MineK","No.D","OPA","otetsu","Otomania","AETA(�C�[�^)","cosMo(�\��P)","doriko","PENGUINS_PROJECT","Re:nG","ShakeSphere","samfree","Shibayan","SHIKI","snowy*","takotakoagare�����y�c","Tatsh","Treow(�t�Փ�P)","Tripshots","TuKuRu","UPNUSY","VIVO","wintermute","X-Plorez","YAMADA-SUN","yukiwo","�J���X�}�u���C�N�ɒ�]�̂��邤P��","[TEST]","�ǂ���","Dog tails","�̘a�T�N��","����","�琂̒��̐l","�앺�q","������","���̂�","���уI�j�L�X","�c���a�v","���႟","�`���R�p����P(�p�e�B�V�G)","�e�B�b�V���P","�e���l��","�Ƃ����ł�������f���V�I��","�g�}����","�i�c�J�[P(Tastle)","���[��","����","�X��P���V���E","�R�{���V","�R�{�j���[","�ь�","���C�����[�h","164","��studio","uunnie","������","madamxx","mijinko3","DECO*27","��������","���[���t��g����","GlassOnion","bothneco","yu","m@rk","shin","kame","�����ǂ�","nof","YYMIKUYY","Zekky","HironoLin","�X�^�W�I���邩�̂�","PEG","meam","�w�f����������","�܂͂�","nankyoku","�i�d�L","Nen-Sho-K","Sat4","suzy","�ۂҁ[","���S2000�n","Noya","����","�����","����ς�","���ǂ݂͂�","analgesic_agents","takuyabrian","kuma","tomo","nabe_nabe","���֎q","river","�ꂢ�E�ځ[��","�N���AP(YS)","usuki","OperaGhost","instinctive","��F�̐l","pan","���O","AVTechNO","���e���s�R�X","�т�","shin","�������","�������[","�~�i�O","LIQ","�܂䂽��","�`�[���ق�����","WEB-MIX","ukey","Phantasma","Kossy","mintiack","Yoshihi","�ς���","��������EKO��GP1","Neri_McMinn","�ڂ���","Harmonia","Rock","TACHE","cmmz","BIRUGE","m_yus","����chan","CleanTears","Lue","FuMay","SHUN","�֐����ς�`","�Ö�","�ǂԃE�T�M","bestgt","IGASI��","�����l�[�h(��)","ICEproject","�ς�̂�������ψ���","�����͂�","MikSolodyne-ts","Yossy","����������","�^�C�X�P","P��Rhythmatiq","����","Rin","hapi��","microgroover","Studio_IIG","cenozoic","miumix","U-ji","aquascape","deathpiyo","Fraidy-fraidy","���̂��","DATEKEN","����","��",""];

// �j�R�}�X�E�{�J��������OP�l�[��
// �j�R�}�X�E�{�J���������OP�l�[��
// �^�O���̖�����P�ł�P���Ƃ��Ď擾���Ȃ��ꍇ�͂����ɋL�q���܂�
settings["NotPTagsIM"] = ["", "iM@SHUP", "�A�C�h���}�X�^�[SP", "PSP", ""];
settings["NotPTagsVO"] = ["", "MikuPOP", "RinPOP", "�A�j��OP", "�Q�[��OP", "�G���QOP", "�UOP", "J-POP", "���ꂩ���������baker�̉�P", "2STEP", "�~�[����Q��OP", "Human_Dump", "���O�͂�������ł���P", "�z���͂̕ς��Ȃ��B��̕@�����߂�P", ""];

// P�l�[���擾���s���̖��O
// �^�O����P�l�[�����擾�ł��Ȃ������ۂɗp�����镶������w�肵�܂�
// �󕶎�("")��ݒ肷��ƃ_�u���N���b�N�ɂ��P�l�[���ҏW�@�\���g���Ȃ��Ȃ�܂�
//del settings["NoPName"] = "P��?";
//add start
settings["NoPName"] = "P��?";
//settings["NoPName"] = "P���s���I ��񋁃��I";

// JASRAC�R�[�h���Ȃ�����{#JASCode}�̑�֕�����
settings["NoJASCode"] = "�R�[�h�Ȃ�";

//add end

// �擾����}�C���X�g�O���[�v���珜�O���閼�O
settings["MylistBlackList"] = ["", "�A�C�}�X", "MMD", "3D", "�ʂ�", "good", "�~�N�Q�[", "�Z�p��", "�G��", "_name_", ""];

// EOF
