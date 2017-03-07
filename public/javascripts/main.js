// 标签
var i_input;
var ta_code, ta_output;

var polling;
var xmlHttp;

function GetXmlHttpObject(){
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	return xmlhttp; 
}
function init() {
	i_input = document.getElementById('input');
	ta_code = document.getElementById('code');
	ta_output = document.getElementById('output');
	xmlHttp = GetXmlHttpObject();
	resize();
}

function resize() {
	var body= document.getElementsByTagName('body')[0];
	var cheight = body.clientHeight;
	var cwidth = body.clientWidth;
	var container = document.getElementById('container');
	container.style.height = (cheight - 48) + 'px';
	container.style.width = (cwidth * 0.96 + 4) + 'px';
	var btn_input = document.getElementById('btn_input');
	if (cwidth < 377)
		btn_input.style.display = 'none';
	else
		btn_input.style.display = null;
}

function compile() {
	if(polling) return;
	getRequest('/compile?code=' + getCode(), function(res) {
		startPoll();
	});
}

function run() {
	if(polling) return;
	getRequest('/run?code=' + getCode(), function(res) {
		startPoll();
	});
}

function getCode() {
	return ta_code.innerText.replace(/\n/g,'%0d');
}

function input() {
	getRequest('/input?content=' + i_input.value);
}

function getRequest(url, onRes) {
	if (! xmlHttp) return;
	xmlHttp.open('GET', url, true);
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200) {
				if (onRes)
					onRes(xmlHttp.responseText);
			} else {
				alert('Error:'+xmlHttp.status+','+xmlHttp.responseText);
			}
		}
	}
	xmlHttp.send();
}

function startPoll() {
	polling = setInterval(function() {
		getRequest('/poll', function(res) {
			if (! res || res.length <= 0) return;
			var output = res.split('\n');
			for (var i = 0; i < output.length; i ++) {
				if(output[i] == '**##*#*#finished**##*#*#') {
					clearInterval(polling);
					polling = null;
					return;
				}
				ta_output.innerText += output[i] + '\r\n';
			}
		});
	}, 300);
}
