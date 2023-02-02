/****************************
原脚本作者@小白脸 脚本修改@chengkongyiban
感谢@xream 的指导
说明
   ${noteKn6} = \n六个空格
   ${noteKn4} = \n四个空格
   t&2; = 两个空格
   t&hn; = 四个空格 - 一个空格
   t&zd; = {  , }  花括号中的逗号

***************************/
const ua = $request.headers['User-Agent'] || $request.headers['user-agent']
const isStashiOS = 'undefined' !== typeof $environment && $environment['stash-version'] && ua.indexOf('Macintosh') === -1
const isSurgeiOS = 'undefined' !== typeof $environment && $environment['surge-version'];
const isShadowrocket = 'undefined' !== typeof $rocket;
const isLooniOS = 'undefined' != typeof $loon && /iPhone/.test($loon);

var name = "";
var desc = "";
let req = $request.url.replace(/sg.stoverride$|sg.stoverride\?.*/,'');
let urlArg = $request.url.replace(/.+sg.stoverride(\?.*)/,'$1');
var original = [];//用于获取原文行号
//获取参数
var nName = urlArg.indexOf("n=") != -1 ? (urlArg.split("n=")[1].split("&")[0].split("+")) : null;
var Pin0 = urlArg.indexOf("y=") != -1 ? (urlArg.split("y=")[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
var Pout0 = urlArg.indexOf("x=") != -1 ? (urlArg.split("x=")[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
//修改名字和简介
if (nName === null){
	name = req.match(/.+\/(.+)\.(module|js|sgmodule)/)?.[1] || '无名';
    desc = name;
}else{
	name = nName[0] != "" ? nName[0] : req.match(/.+\/(.+)\.(module|js|sgmodule)/)?.[1];
	desc = nName[1] != undefined ? nName[1] : nName[0];
};
name = "name: " + decodeURIComponent(name);
desc = "desc: " + decodeURIComponent(desc);


!(async () => {
  let body = await http(req);
//判断是否断网
if(body == null){if(isSurgeiOS || isStashiOS){
	$notification.post("重写转换：未获取到body","请检查网络及节点是否畅通","认为是bug?点击通知反馈",{url:"https://t.me/zhangpeifu"})
 $done({ response: { status: 404 ,body:{} } });}else{$notification.post("重写转换：未获取到body","请检查网络及节点是否畅通","认为是bug?点击通知反馈","https://t.me/zhangpeifu")
 $done({ response: { status: 404 ,body:{} } });
}//识别客户端通知
}else{//以下开始重写及脚本转换
	
original = body.split("\n");
	body = body.match(/[^\r\n]+/g);

let rules = [];
let script = [];
let URLRewrite = [];
let HeaderRewrite = [];
let cron = [];
let providers = [];
let MITM = "";
let others = [];          //不支持的内容

body.forEach((x, y, z) => {
	x = x.replace(/^(#|;|\/\/)/gi,'#').replace(/(\{.*?)\,(.*?\})/gi,'$1t&zd;$2').replace(" _ reject"," - reject").replace(/(^[^#].+)\x20+\/\/.+/,"$1");
//去掉注释
if(Pin0 != null)	{
	for (let i=0; i < Pin0.length; i++) {
  const elem = Pin0[i];
	if (x.indexOf(elem) != -1){
		x = x.replace(/^#/,"")
	}else{};
};//循环结束
}else{};//去掉注释结束

//增加注释
if(Pout0 != null){
	for (let i=0; i < Pout0.length; i++) {
  const elem = Pout0[i];
	if (x.indexOf(elem) != -1 && x.indexOf("hostname") == -1){
		x = x.replace(/(.+)/,"#$1")
	}else{};
};//循环结束
}else{};//增加注释结束
	
	let type = x.match(
		/http-re|\x20header-|cronexp|\x20-\x20reject|URL-REGEX|\x20data=|^hostname|\x20(302|307|header)$|(USER-AGENT|IP-CIDR|GEOIP|IP-ASN|DOMAIN|DEST-PORT|RULE-SET)/
	)?.[0];
//判断注释
	
	if (x.match(/^[^#]/)){
	var noteKn8 = "\n        ";
	var noteKn6 = "\n      ";
	var noteKn4 = "\n    ";
	var noteK4 = "    ";
	var noteK2 = "  ";
	}else{
	var noteKn8 = "\n#        ";
	var noteKn6 = "\n#      ";
	var noteKn4 = "\n#    ";
	var noteK4 = "#    ";
	var noteK2 = "#  ";
	};
	
	if (type) {
		switch (type) {
			case "http-re":
//Surge5脚本			
			if (x.match(/=\x20*http-re/)) {
				z[y - 1]?.match(/^#/) && script.push("    " + z[y - 1]);
				
				let sctype = x.replace(/\x20/gi,'').match('http-response') ? 'response' : 'request';
				
				let rebody = x.replace(/\x20/gi,'').match('requires-body=(true|1)') ? 'require-body: true' : '';
				
				let size = x.replace(/\x20/gi,'').match('requires-body=(true|1)') ? 'max-size: 3145728' : '';
				
				let proto = x.replace(/\x20/gi,'').match('binary-body-mode=(true|1)') ? 'binary-mode: true' : '';
				
				let scname = x.replace(/\x20/gi,'').split("=")[0].replace(/^#/,'');
				
				let ptn = x.replace(/\x20/gi,"").split("pattern=")[1].split(",")[0].replace(/"/gi,'');
				
				let js = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0];
				
				let arg = [];
				
				if (x.match(/argument\x20*?=.+/)){
					if (x.match(/(argument\x20*=\x20*"+.*?,.*?"+)\x20*(,\x20*\w+|$)/)
){
			arg = `${noteKn6}argument: |-${noteKn8}` + x.match(/argument\x20*=\x20*("+.*?,.*?"+)\x20*(,\x20*\w+|$)/)[1];
}else{
			arg = `${noteKn6}argument: |-${noteKn8}` + x.replace(/argument\x20+=/gi,"argument=").split("argument=")[1].split(",")[0];}
			}else{}
			
				script.push(
					
						`${noteKn4}- match: ${ptn}${noteKn6}name: ${scname}_${y}${noteKn6}type: ${sctype}${noteKn6}timeout: 30${noteKn6}${rebody}${noteKn6}${size}${arg}${noteKn6}${proto}`
				);
				providers.push(
						`${noteK2}${scname}_${y}:${noteKn4}url: ${js}${noteKn4}interval: 86400`
				);
				}else{
//HeaderRewrite					
				if (x.match(/\x20header-/)){
					
					z[y - 1]?.match(/^#/) &&  HeaderRewrite.push("    " + z[y - 1]);
			
			let hdtype = x.match(/http-response/) ?
'response ' : 'request';
			
			HeaderRewrite.push(`${noteK4}- ` + x.replace(/#?http-(response|request)\x20+/,"").replace("\x20header-",`\x20${hdtype}-`))
				}else{
					
				if (x.match(/http-(response|request)\x20/)){
//surge4脚本								
					z[y - 1]?.match(/^#/) && script.push("    " + z[y - 1]);
					
				let proto = x.replace(/\x20/gi,'').match('binary-body-mode=(true|1)') ? 'binary-mode: true' : '';
				
				let rebody = x.replace(/\x20/gi,'').match('requires-body=(true|1)') ? 'require-body: true' : '';
				
				let size = x.replace(/\x20/gi,'').match('requires-body=(true|1)') ? 'max-size: 3145728' : '';
				
				let ptn = x.replace(/\x20{2,}/g," ").split(" ")[1].replace(/"/gi,'');
				
				let js = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0];
				
				let sctype = x.match('http-response') ? 'response' : 'request';
				
				let scname = js.substring(js.lastIndexOf('/') + 1, js.lastIndexOf('.') );
					
				let arg = [];
				
				if (x.match(/argument\x20*?=.+/)){
					if (x.match(/(argument\x20*=\x20*"+.*?,.*?"+)\x20*(,\x20*\w+|$)/)
){
			arg = `${noteKn6}argument: |-${noteKn8}` + x.match(/argument\x20*=\x20*("+.*?,.*?"+)\x20*(,\x20*\w+|$)/)[1];
}else{
			arg = `${noteKn6}argument: |-${noteKn8}` + x.replace(/argument\x20+?=/gi,"argument=").split("argument=")[1].split(",")[0];}
			}else{}
					
				script.push(
						`${noteKn4}- match: ${ptn}${noteKn6}name: ${scname}_${y}${noteKn6}type: ${sctype}${noteKn6}timeout: 30${noteKn6}${rebody}${noteKn6}${size}${arg}${noteKn6}${proto}`
				);
				providers.push(
						`${noteK2}${scname}_${y}:${noteKn4}url: ${js}${noteKn4}interval: 86400`
				);

				}else{
let lineNum = original.indexOf(x) + 1;
others.push(lineNum + "行" + x)}
				}
				}//整个http-re结束
				break;
				
//非http-re开头的HeaderRewrite			
			case " header-":
					
					z[y - 1]?.match(/^#/) &&  HeaderRewrite.push("    " + z[y - 1]);
			
			let hdtype = x.match(/http-response/) ?
'response ' : 'request';
			
			HeaderRewrite.push(`${noteK4}- ` + x.replace(/#?http-(response|request)\x20+/,"").replace("\x20header-",`\x20${hdtype}-`))
				break;
							
//定时任务
			case "cronexp":
			x = x.replace(/cronexpr/gi,'cronexp').replace(/"/g,'');
			
				let croName = x.replace(/\x20/gi,"").split("=")[0].replace(/^#/,'')
				
				let cronJs = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0]
				
				let cronExp = x.replace(/(.+cronexp\x20*=.+)/,"$1,").replace(/.+cronexp\x20*=\x20*(.+\x20.+?),.*/,"$1").replace(/[^\s]+ ([^\s]+ [^\s]+ [^\s]+ [^\s]+ [^\s]+)/,'$1')
				
				cron.push(
						`${noteKn4}- name: ${croName}${noteKn6}cron: "${cronExp}"${noteKn6}timeout: 60`
				);
				providers.push(
						`${noteK2}${croName}:${noteKn4}url: ${cronJs}${noteKn4}interval: 86400`
				);
				break;

//REJECT

			case "\x20-\x20reject":

				z[y - 1]?.match(/^#/) && URLRewrite.push("    " + z[y - 1]);
				
				URLRewrite.push(x.replace(/\x20{2,}/g," ").replace(/(^#)?(.+?)\x20-\x20(reject-200|reject-img|reject-dict|reject-array|reject)/, `${noteKn4}- $2 - $3`));
				break;
				
//URL-REGEX转reject，排除非REJECT类型

			case "URL-REGEX":
			x = x.replace(/\x20/g,"");
			if (x.match(/,REJECT/i)){
				
				z[y - 1]?.match(/^#/) && URLRewrite.push("    " + z[y - 1]);
				
				let Urx2Dict = x.match(/DICT$/i) ? '-dict' : '';
				
				let Urx2Array = x.match(/ARRAY$/i) ? '-array' : '';
				
				let Urx2200 = x.match(/200$/) ? '-200' : '';
				
				let Urx2Img = x.match(/(IMG|GIF)$/i) ? '-img' : '';
				
				URLRewrite.push(
					x.replace(/.*URL-REGEX,([^\s]+),.+/,
					`${noteKn4}- $1 - reject${Urx2Dict}${Urx2Array}${Urx2200}${Urx2Img}`)
				);
				}else{
					let lineNum = original.indexOf(x) + 1;
	others.push(lineNum + "行" + x)};
				
				break;
			
//Mock转reject/request

			case " data=":
				
					let ptn = x.replace(/\x20{2,}/g," ").split(" data=")[0].replace(/^#|"/g,"");
					let arg = x.split(' data="')[1].split('"')[0];
					let scname = arg.substring(arg.lastIndexOf('/') + 1, arg.lastIndexOf('.') );
					
				if (arg.match(/(img\.|dict\.|array\.|200\.|blank\.)/i)){
				z[y - 1]?.match(/^#/) && URLRewrite.push(z[y - 1]);
					
				let mock2Dict = arg.match(/dict\./) ? '-dict' : '';
				let mock2Array = arg.match(/array\./) ? '-array' : '';
				let mock2200 = arg.match(/200\.|blank\./) ? '-200' : '';
				let mock2Img = x.match(/img\./) ? '-img' : '';
				URLRewrite.push(
						`${noteKn4}- ${ptn} - reject${mock2Dict}${mock2Array}${mock2200}${mock2Img}`
				);
				}else{
					
				z[y - 1]?.match(/^#/) && script.push("    " + z[y - 1]);
		
		script.push(
			`${noteK4}- match: ${ptn}${noteKn6}name: ${scname}_${y}${noteKn6}type: request${noteKn6}timeout: 30${noteKn6}argument: |-${noteKn8}type=text/json&url=${arg}`)
				
				providers.push(
							`${noteK2}${scname}_${y}:${noteKn4}url: https://raw.githubusercontent.com/xream/scripts/main/surge/modules/echo-response/index.js${noteKn4}interval: 86400`
					);
					
				}
				
				break;
				
//hostname				
			case "hostname":
			x = x.replace(/\x20/gi,'');
				MITM = x.replace(/,$/,'').replace(/.*hostname=(%.+%)?(.*)/, `t&2;mitm:\nt&hn;"$2"`);
				break;
				
			default:
//重定向			
				if (type.match(/ (302|307|header)/)) {
				z[y - 1]?.match(/^#/)  && URLRewrite.push("    " + z[y - 1]);
				
					URLRewrite.push(x.replace(/\x20{2,}/g," ").replace(/(^#)?(.+?)\x20(.+?)\x20(302|307|header)/, `${noteKn4}- $2 $3 $4`));
				} else if (type.match(/(IP-CIDR|GEOIP|IP-ASN|DOMAIN|DEST-PORT)/)){
					
				z[y - 1]?.match(/^#/)  && rules.push("    " + z[y - 1]);
					
					rules.push(
						x.replace(/\x20/g,"")
						 .replace(/.*DOMAIN-SET.+/,"")
						 .replace(/,REJECT.+/,",REJECT")
						 .replace(/DEST-PORT/,"DST-PORT")
						 .replace(/^#?(.+)/,`${noteK2}- $1`)
						)
					
				}else{
					let lineNum = original.indexOf(x) + 1;
	others.push(lineNum + "行" + x)}
				
				
		} //switch结束
	}
}); //循环结束

rules = (rules[0] || '') && `rules:\n${rules.join("\n")}`;

script = (script[0] || '') && `  script:\n${script.join("\n")}`;

providers = (providers[0] || '') && `script-providers:\n${providers.join("\n")}`;

cron = (cron[0] || '') && `cron:\n  script:\n${cron.join("\n")}`;

URLRewrite = (URLRewrite[0] || '') && `  rewrite:\n${URLRewrite.join("\n")}`;

URLRewrite = URLRewrite.replace(/"/gi,'')

HeaderRewrite = (HeaderRewrite[0] || '') && `  header-rewrite:\n${HeaderRewrite.join("\n\n")}`;

HeaderRewrite = HeaderRewrite.replace(/"/gi,'')

others = (others[0] || '') && `${others.join("\n")}`;

MITM = MITM.replace(/t&2;/g,'  ')
           .replace(/t&hn;/g,'    - ')
           .replace(/\,/g,'"\n    - "')



body = `${name}
${desc}

${rules}

http:
${URLRewrite}

${HeaderRewrite}

${script}

${MITM}

${cron}

${providers}`
		.replace(/t&zd;/g,',')
		.replace(/script-providers:\n+$/g,'')
		.replace(/#      \n/gi,'\n')
		.replace(/      \n/g,"")
		.replace(/(#.+\n)\n/g,'$1')
		.replace(/\n{2,}/g,'\n\n')

if (isSurgeiOS || isStashiOS) {
           others !="" && $notification.post("不支持的类型已跳过","第" + others,"点击查看原文，长按可展开查看跳过行",{url:req});
        } else {if (isLooniOS || isShadowrocket) {
       others !="" && $notification.post("不支持的类型已跳过","第" + others,"点击查看原文，长按可展开查看跳过行",req);}};

 $done({ response: { status: 200 ,body:body ,headers: {'Content-Type': 'text/plain; charset=utf-8'} } });
}//判断是否断网的反括号

})()
.catch((e) => {
		$notification.post(`${e}`,'','');
		$done()
	})


function http(req) {
  return new Promise((resolve, reject) =>
    $httpClient.get(req, (err, resp,data) => {
  resolve(data)
  })
)
}