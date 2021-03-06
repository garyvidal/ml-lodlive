'use strict';

(function () {
    
  var LodLiveUtils = {};

  var _translations = {};

  LodLiveUtils.getSparqlConf = function(what, where, lodLiveProfile) {
    return where.sparql && where.sparql[what] ? where.sparql[what] : lodLiveProfile['default'].sparql[what];
  };

  /**
    * Register a set of translations, for example ('en-us', { greeting: 'Hello' })
  **/
  LodLiveUtils.registerTranslation = function(langKey, data) {
    _translations[langKey] = data;
  };

  LodLiveUtils.setDefaultTranslation = function(langKey) {
    _translations['default'] = _translations[langKey] || _translations['default'];
  };

  LodLiveUtils.lang = function(obj, langKey) {
    var lang = langKey ? _translations[langKey] || _translations['default'] : _translations['default'];
    return (lang && lang[obj]) || obj;
  };

  LodLiveUtils.isSameAsLine = function(label, x1, y1, x2, y2, canvas, toId) {

    // eseguo i calcoli e scrivo la riga di connessione tra i cerchi
    var lineangle = (Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI) + 180;
    var x2bis = x1 - Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) + 60;
    //canvas.detectPixelRatio();
    canvas.rotateCanvas({
      rotate : lineangle,
      x : x1,
      y : y1
    }).drawLine({
      strokeStyle : "#000",
      strokeWidth : 1,
      strokeCap : 'bevel',
      x1 : x1 - 60,
      y1 : y1,
      x2 : x2bis,
      y2 : y1
    });

    if (lineangle > 90 && lineangle < 270) {
      canvas.rotateCanvas({
        rotate : 180,
        x : (x2bis + x1) / 2,
        y : (y1 + y1) / 2
      });
    }
    label = $.trim(label).replace(/\n/g, ', ');
    canvas.drawText({// inserisco l'etichetta
      fillStyle : "#000",
      strokeStyle : "#000",
      x : (x2bis + x1 + ((x1 + 60) > x2 ? -60 : +60)) / 2,
      y : (y1 + y1 - ((x1 + 60) > x2 ? 18 : -18)) / 2,
      text : ((x1 + 60) > x2 ? " « " : "") + label + ((x1 + 60) > x2 ? "" : " » "),
      align : "center",
      strokeWidth : 0.01,
      fontSize : 11,
      fontFamily : "'Open Sans',Verdana"
    }).restoreCanvas().restoreCanvas();

    // ed inserisco la freccia per determinarne il verso della
    // relazione
    lineangle = Math.atan2(y2 - y1, x2 - x1);
    var angle = 0.79;
    var h = Math.abs(8 / Math.cos(angle));
    var fromx = x2 - 60 * Math.cos(lineangle);
    var fromy = y2 - 60 * Math.sin(lineangle);
    var angle1 = lineangle + Math.PI + angle;
    var topx = (x2 + Math.cos(angle1) * h) - 60 * Math.cos(lineangle);
    var topy = (y2 + Math.sin(angle1) * h) - 60 * Math.sin(lineangle);
    var angle2 = lineangle + Math.PI - angle;
    var botx = (x2 + Math.cos(angle2) * h) - 60 * Math.cos(lineangle);
    var boty = (y2 + Math.sin(angle2) * h) - 60 * Math.sin(lineangle);

    canvas.drawLine({
      strokeStyle : "#000",
      strokeWidth : 1,
      x1 : fromx,
      y1 : fromy,
      x2 : botx,
      y2 : boty
    });
    canvas.drawLine({
      strokeStyle : "#000",
      strokeWidth : 1,
      x1 : fromx,
      y1 : fromy,
      x2 : topx,
      y2 : topy
    });
  };

  LodLiveUtils.customLines = function(context, method) {
    console.log('customLines', method);
    if (LodLiveUtils[method]) {
      return LodLiveUtils[method].apply(this, Array.prototype.slice.call(arguments, 2));
    }
  };

  if (!window.LodLiveUtils) {
    window.LodLiveUtils = LodLiveUtils;
  }

})();

// a causa di un baco di opera e firefox implmento una funzione apposita per
// settare la posizione dei background
$.fn.setBackgroundPosition = function(pos) {
	var backPos = $.trim(this.css('background-position'));
	var hasString = backPos.indexOf('left') == -1 ? false : true;
	//added fix for chrome 25
	backPos = backPos.replace(/top/gi, '').replace(/left/gi, '');
	backPos = $.trim(backPos.replace(/  /g, ' '));

	try {
		var backPosArray = backPos.split(" ");
		if (pos.x || pos.x == 0) {
			backPosArray[0] = pos.x + 'px';
		}
		if (pos.y || pos.y == 0) {
			backPosArray[1] = pos.y + 'px';
		}
		if (hasString) {
			backPos = "left " + backPosArray[0] + " top " + backPosArray[1];
		} else {
			backPos = backPosArray[0] + " " + backPosArray[1];
		}
	} catch (e) {
		alert(e);
	}
	this.css({
		'background-position' : backPos
	});
	return this;
};

var MD5 = function(str) {
	if (!str) {
		return "";
	}
	str = str.replace(/http:\/\/.+~~/g, '');
	str = str.replace(/nodeID:\/\/.+~~/g, '');
	str = str.replace(/_:\/\/.+~~/g, '');
	function RotateLeft(lValue, iShiftBits) {
		return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
	}

	function AddUnsigned(lX, lY) {
		var lX4, lY4, lX8, lY8, lResult;
		lX8 = (lX & 0x80000000);
		lY8 = (lY & 0x80000000);
		lX4 = (lX & 0x40000000);
		lY4 = (lY & 0x40000000);
		lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
		if (lX4 & lY4) {
			return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
		}
		if (lX4 | lY4) {
			if (lResult & 0x40000000) {
				return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			}
		} else {
			return (lResult ^ lX8 ^ lY8);
		}
	}

	function F(x, y, z) {
		return (x & y) | ((~x) & z);
	}

	function G(x, y, z) {
		return (x & z) | (y & (~z));
	}

	function H(x, y, z) {
		return (x ^ y ^ z);
	}

	function I(x, y, z) {
		return (y ^ (x | (~z)));
	}

	function FF(a, b, c, d, x, s, ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	}

	;

	function GG(a, b, c, d, x, s, ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	}

	;

	function HH(a, b, c, d, x, s, ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	}

	;

	function II(a, b, c, d, x, s, ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	}

	;

	function ConvertToWordArray(string) {
		var lWordCount;
		var lMessageLength = string.length;
		var lNumberOfWords_temp1 = lMessageLength + 8;
		var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
		var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
		var lWordArray = Array(lNumberOfWords - 1);
		var lBytePosition = 0;
		var lByteCount = 0;
		while (lByteCount < lMessageLength) {
			lWordCount = (lByteCount - (lByteCount % 4)) / 4;
			lBytePosition = (lByteCount % 4) * 8;
			lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
			lByteCount++;
		}
		lWordCount = (lByteCount - (lByteCount % 4)) / 4;
		lBytePosition = (lByteCount % 4) * 8;
		lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
		lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
		lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
		return lWordArray;
	}

	;

	function WordToHex(lValue) {
		var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
		for ( lCount = 0; lCount <= 3; lCount++) {
			lByte = (lValue >>> (lCount * 8)) & 255;
			WordToHexValue_temp = "0" + lByte.toString(16);
			WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
		}
		return WordToHexValue;
	}

	;

	function Utf8Encode(string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	}

	;

	var x = Array();
	var k, AA, BB, CC, DD, a, b, c, d;
	var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
	var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
	var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
	var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

	str = Utf8Encode(str);

	x = ConvertToWordArray(str);

	a = 0x67452301;
	b = 0xEFCDAB89;
	c = 0x98BADCFE;
	d = 0x10325476;

	for ( k = 0; k < x.length; k += 16) {
		AA = a;
		BB = b;
		CC = c;
		DD = d;
		a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
		d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
		c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
		b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
		a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
		d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
		c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
		b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
		a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
		d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
		c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
		b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
		a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
		d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
		c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
		b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
		a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
		d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
		c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
		b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
		a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
		d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
		c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
		b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
		a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
		d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
		c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
		b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
		a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
		d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
		c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
		b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
		a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
		d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
		c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
		b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
		a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
		d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
		c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
		b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
		a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
		d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
		c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
		b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
		a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
		d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
		c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
		b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
		a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
		d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
		c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
		b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
		a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
		d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
		c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
		b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
		a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
		d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
		c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
		b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
		a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
		d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
		c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
		b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
		a = AddUnsigned(a, AA);
		b = AddUnsigned(b, BB);
		c = AddUnsigned(c, CC);
		d = AddUnsigned(d, DD);
	}

	var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

	return temp.toLowerCase();

};

function lang(obj) {
	return $.jStorage.get('language')[$.jStorage.get('selectedLanguage')][obj];
}

function breakLines(msg) {
	msg = msg.replace(/\//g, '/<span style="font-size:1px"> </span>');
	msg = msg.replace(/&/g, '&<span style="font-size:1px"> </span>');
	msg = msg.replace(/%/g, '%<span style="font-size:1px"> </span>');
	return msg;
}
