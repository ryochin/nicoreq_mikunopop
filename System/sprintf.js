//  Copyright (c) 2002 M.Inamori,All rights reserved.
//  Coded 2/26/02
//
//	sprintf()

// * omitted some floating point and exponential related functions to avoid errors, by saihane

function sprintf() {
	var argv = sprintf.arguments;
	var argc = argv.length;
	if(argc == 0)
		return "";
	var result = "";
	var format = argv[0];
	var format_length = format.length;
	
	var flag, width, precision;
	flag = 0;
	
	var index = 1;
	var mode = 0;
	var tmpresult;
	var buff;
	for(var i = 0; i < format_length; i++) {
		var c = format.charAt(i);
		switch(mode) {
		case 0:		//normal
			if(c == '%') {
				tmpresult = c;
				mode = 1;
				buff = "";
			}
			else
				result += c;
			break;
		case 1:		//after '%'
			if(c == '%') {
				result += c;
				mode = 0;
				break;
			}
			if(index >= argc)
				argv[argc++] = "";
			width = 0;
			precision = -1;
			switch(c) {
			case '-':
				flag |= 1;
				mode = 1;
				break;
			case '+':
				flag |= 2;
				mode = 1;
				break;
			case '0':
				flag |= 4;
				mode = 2;
				break;
			case ' ':
				flag |= 8;
				mode = 1;
				break;
			case '#':
				flag |= 16;
				mode = 1;
				break;
			case '1': case '2': case '3': case '4': case '5':
			case '6': case '7': case '8': case '9':
				width = parseInt(c);
				mode = 2;
				break;
			case '-':
				flag = 1;
				mode = 2;
				break;
			case '.':
				width = "";
				precision = 0;
				mode = 3;
				break;
			case 'd':
				result += toInteger(argv[index], flag, width, precision);
				index++;
				mode = 0;
				break;
//			case 'f':
//				result += toFloatingPoint(argv[index], flag, width, 6);
//				index++;
//				mode = 0;
//				break;
//			case 'e':
//				result += toExponential(argv[index], flag, width, 6, 'e');
//				index++;
//				mode = 0;
//				break;
//			case 'E':
//				result += toExponential(argv[index], flag, width, 6, 'E');
//				index++;
//				mode = 0;
//				break;
			case 's':
				result += argv[index];
				index++;
				mode = 0;
				break;
			default:
				result += buff + c;
				mode = 0;
				break;
			}
			break;
		case 2:		//while defining width
			switch(c) {
			case '.':
				precision = 0;
				mode = 3;
				break;
			case '0': case '1': case '2': case '3': case '4':
			case '5': case '6': case '7': case '8': case '9':
				width = width * 10 + parseInt(c);
				mode = 2;
				break;
			case 'd':
				result += toInteger(argv[index], flag, width, precision);
				index++;
				mode = 0;
				break;
//			case 'f':
//				result += toFloatingPoint(argv[index], flag, width, 6);
//				index++;
//				mode = 0;
//				break;
//			case 'e':
//				result += toExponential(argv[index], flag, width, 6, 'e');
//				index++;
//				mode = 0;
//				break;
//			case 'E':
//				result += toExponential(argv[index], flag, width, 6, 'E');
//				index++;
//				mode = 0;
//				break;
			case 's':
				result += toFormatString(argv[index], width, precision);
				index++;
				mode = 0;
				break;
			default:
				result += buff + c;
				mode = 0;
				break;
			}
			break;
		case 3:		//while defining precision
			switch(c) {
			case '0': case '1': case '2': case '3': case '4':
			case '5': case '6': case '7': case '8': case '9':
				precision = precision * 10 + parseInt(c);
				break;
			case 'd':
				result += toInteger(argv[index], flag, width, precision);
				index++;
				mode = 0;
				break;
//			case 'f':
//				result += toFloatingPoint(argv[index], flag, width, precision);
//				index++;
//				mode = 0;
//				break;
//			case 'e':
//				result += toExponential(argv[index], flag, width, precision, 'e');
//				index++;
//				mode = 0;
//				break;
//			case 'E':
//				result += toExponential(argv[index], flag, width, precision, 'E');
//				index++;
//				mode = 0;
//				break;
			case 's':
				result += toFormatString(argv[index], width, precision);
				index++;
				mode = 0;
				break;
			default:
				result += buff + c;
				mode = 0;
				break;
			}
			break;
		default:
			return "error";
		}
		
		if(mode)
			buff += c;
	}
	
	return result;
}

function toInteger(n, f, w, p) {
	if(typeof n != "number") {
		if(typeof n == "string") {
			n = parseFloat(n);
			if(isNaN(n))
				n = 0;
		}
		else
			n = 0;
	}
	
	var str = n.toString();
	
	//to integer if decimal
	if(-1 < n && n < 1)
		str = "0";
	else {
		if(n < 0)
			str = str.substring(1);
		var pos_e = str.indexOf('e');
		if(pos_e != -1) {		//指数
			var exp = parseInt(str.substring(pos_e + 2));
			var pos_dot = str.indexOf('.');
			if(pos_dot == -1) {
				str = str.substring(0, pos_e) + "000000000000000000000";
				exp -= 21;
			}
			else {
				str = str.substring(0, pos_dot)
							+ str.substring(pos_dot + 1, pos_e) + "00000";
				exp -= str.length - pos_dot;
			}
			for( ; exp; exp--)
				str += "0";
		}
		else {
			var pos_dot = str.indexOf('.');
			if(pos_dot != -1)
				str = str.substring(0, pos_dot);
		}
	}
	
	//精度
	var len = str.length;
	if(len < p) {
		var c = "0";
		for(var i = p - len; i; i--)
			str = c + str;
		len = p;
	}
	
	//フラグの処理
	return ProcFlag(str, f, w - len, n >= 0);
}

function toFormatString(s, w, p) {
	if(typeof s != "string")
		s = s.toString();
	
	var len = s.length;
	if(p >= 0) {
		if(p < len) {
			s = s.substring(0, p);
			len = p;
		}
	}
	if(len < w) {
		var c = " ";
		for(var i = w - len; i; i--)
			s = c + s;
	}
	
	return s;
}

function ProcFlag(str, f, extra, b) {
	var minus = f & 1;
	var plus = f & 2;
	var space = f & 8;
	if(space)			//with ' '
		extra--;
	extra -= !b + plus > 0;
	if((f & 4) > 0 && !minus) {	//with 0 and not -
		if(extra > 0) {
			var c = "0";
			for(var i = extra; i; i--)
				str = c + str;
		}
		if(!b)
			str = "-" + str;
		else if(plus)
			str = "+" + str;
	}
	else {					//without 0 or with -
		if(!b)
			str = "-" + str;
		else if(plus)
			str = "+" + str;
		var c = " ";
		if(extra > 0) {
			var c = " ";
			if(minus)
				for(var i = extra; i; i--)
					str += c;
			else
				for(var i = extra; i; i--)
					str = c + str;
		}
	}
	if(space)
		str = " " + str;
	
	return str;
}
