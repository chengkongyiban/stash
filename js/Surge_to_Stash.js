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
original = body.split("\n");
	body = body.match(/[^\n]+/g);

let script = [];
let URLRewrite = [];
let HeaderRewrite = [];
let cron = [];
let providers = [];
let MITM = "";
let others = [];          //不支持的内容
//let MapLocal = [];

body.forEach((x, y, z) => {
	x = x.replace(/^(#|;|\/\/)/gi,'#').replace(/(\{.*?)\,(.*?\})/gi,'$1t&zd;$2').replace(" _ reject"," - reject");
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
		/http-re|cronexp|\x20-\x20reject|URL-REGEX|\x20data=|^hostname|\x20(302|307|header)$/
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
			if (x.match(/=http-re|= http-re/)) {
				

	x = x.replace(/\x20/gi,'');
				z[y - 1]?.match(/^#/) && script.push("    " + z[y - 1]);
				
				let sctype = x.match('http-response') ? 'response' : 'request';
				
				let rebody = x.match('requires-body=(true|1)') ? 'require-body: true' : '';
				
				let size = x.match('requires-body=(true|1)') ? 'max-size: 3145728' : '';
				
				let proto = x.match('binary-body-mode=(true|1)') ? 'binary-mode: true' : '';
				
				let scname = x.replace(/\x20/gi,'').split("=")[0].replace(/#/,'');
				
				let ptn = x.replace(/\s/gi,"").split("pattern=")[1].split(",")[0].replace(/\"/gi,'');
				
				let js = x.replace(/\s/gi,"").split("script-path=")[1].split(",")[0];
				
				let arg = [];
				
				if (x.match("argument")){
			arg = `${noteKn6}argument: |-${noteKn8}` +  x.replace(/argument\x20=/gi,"argument=").split("argument=")[1].split(",")[0];
			}else{}
			
				script.push(
					x.replace(
						/[^\s]+http-re[^\s]+/,
						`${noteKn4}- match: ${ptn}${noteKn6}name: ${scname}_${y}${noteKn6}type: ${sctype}${noteKn6}timeout: 30${noteKn6}${rebody}${noteKn6}${size}${arg}${noteKn6}${proto}`
					),
				);
				providers.push(
					x.replace(
						/[^\s]+http-re[^\s]+/,
						`${noteK2}${scname}_${y}:${noteKn4}url: ${js}${noteKn4}interval: 86400`
					),
				);
				}else{
//HeaderRewrite					
				if (x.match(/\x20header-/)){
					
					z[y - 1]?.match(/^#/) &&  HeaderRewrite.push("    " + z[y - 1]);
			
			let hdtype = x.match(/http-response/) ?
'response ' : 'request';
			
			HeaderRewrite.push(`${noteK4}- ` + x.replace(/#?http-(response|request)\x20/,"").replace("\x20header-",`\x20${hdtype}-`))
				}else{
//Surge4脚本						
					z[y - 1]?.match(/^#/) && script.push("    " + z[y - 1]);
					
				let proto = x.replace(/\x20/gi,'').match('binary-body-mode=(true|1)') ? 'binary-mode: true' : '';
				
				let rebody = x.replace(/\x20/gi,'').match('requires-body=(true|1)') ? 'require-body: true' : '';
				
				let size = x.replace(/\x20/gi,'').match('requires-body=(true|1)') ? 'max-size: 3145728' : '';
				
				let ptn = x.split(" ")[1].replace(/\"/gi,'');
				
				let js = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0];
				
				let sctype = x.match('http-response') ? 'response' : 'request';
				
				let scname = js.substring(js.lastIndexOf('/') + 1, js.lastIndexOf('.') );
					
				let arg = [];
				
				if (x.match("argument")){
			arg = `${noteKn6}argument: |-${noteKn8}` +  x.replace(/argument\x20=/gi,'argument=').split("argument=")[1].split(",")[0];
			}else{}
					
				script.push(
					x.replace(
						/.*http-(response|request)\x20.+/,
						`${noteKn4}- match: ${ptn}${noteKn6}name: ${scname}_${y}${noteKn6}type: ${sctype}${noteKn6}timeout: 30${noteKn6}${rebody}${noteKn6}${size}${arg}${noteKn6}${proto}`
					),
				);
				providers.push(
					x.replace(
						/.*http-(response|request)\x20.+/,
						`${noteK2}${scname}_${y}:${noteKn4}url: ${js}${noteKn4}interval: 86400`
					),
				);
				}
				}//整个http-re结束
				break;
//定时任务
			case "cronexp":
			
				let croName = x.replace(/\x20/gi,"").split("=")[0].replace(/#/,'')
				
				let cronJs = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0]
				
				let cronExp = x.replace(/(.+cronexpr?=.+)/,"$1,").replace(/.+cronexpr?=(.+\x20.+?),.*/,"$1").replace(/[^\s]+ ([^\s]+ [^\s]+ [^\s]+ [^\s]+ [^\s]+)/,'$1')
				
				cron.push(
					x.replace(
						/.+cronexp.+/,
						`${noteKn4}- name: ${croName}${noteKn6}cron: "${cronExp}"${noteKn6}timeout: 60`,
					),
				);
				providers.push(
					x.replace(
						/.+cronexp.+/,
						`${noteK2}${croName}:${noteKn4}url: ${cronJs}${noteKn4}interval: 86400`
					),
				);
				
				
				break;

//REJECT

			case "\x20-\x20reject":

				z[y - 1]?.match(/^#/) && URLRewrite.push("    " + z[y - 1]);
				
				URLRewrite.push(x.replace(/(#)?(.+?)\x20-\x20(reject-200|reject-img|reject-dict|reject-array|reject)/, `${noteKn4}- $2 - $3`));
				break;
				
//URL-REGEX转reject，排除非REJECT类型

			case "URL-REGEX":
			
			if (x.match(/,REJECT/i)){
				
				z[y - 1]?.match(/^#/) && URLRewrite.push("    " + z[y - 1]);
				
				let Urx2Dict = x.match('DICT') ? '-dict' : '';
				
				let Urx2Array = x.match('ARRAY') ? '-array' : '';
				
				let Urx2200 = x.match('200') ? '-200' : '';
				
				let Urx2Img = x.match('(IMG|GIF)') ? '-img' : '';
				
				URLRewrite.push(
					x.replace(/.*URL-REGEX,([^\s]+),.+/,
					`${noteKn4}- $1 - reject${Urx2Dict}${Urx2Array}${Urx2200}${Urx2Img}`)
				);
				}else{
					let lineNum = original.indexOf(x) + 1;
	others.push(lineNum + "行" + x)};
				
				break;

//Mock统统转reject，其他作用的Mock Stash无法实现

			case " data=":
				z[y - 1]?.match(/^#/) && URLRewrite.push("    " + z[y - 1]);
				
				let mock2Dict = x.match('dict') ? '-dict' : '';
				let mock2Array = x.match('array') ? '-array' : '';
				let mock2200 = x.match('200') ? '-200' : '';
				let mock2Img = x.match('(img|png|gif)') ? '-img' : '';
				let mock2Other = x.match('dict|array|200|img|png|gif') ? '' : '-200';
				URLRewrite.push(
					x.replace(
						/(#)?(.+)data=.+/,
						`${noteKn4}- $2- reject${mock2Dict}${mock2Array}${mock2200}${mock2Img}${mock2Other}`
					),
				);
				
				break;
				
//hostname				
			case "hostname":
			x = x.replace(/\x20/gi,'');
				MITM = x.replace(/,$/,'').replace(/.*hostname=(%.+%)?(.*)/, `t&2;mitm:\nt&hn;"$2"`);
				break;
				
			default:
//重定向			
				if (type.match(" (302|307|header)")) {
				z[y - 1]?.match(/^#/)  && URLRewrite.push("    " + z[y - 1]);
				
					URLRewrite.push(x.replace(/(#)?(.+?)\x20(.+?)\x20(302|307|header)/, `${noteKn4}- $2 $3 $4`));
				} else {
					let lineNum = original.indexOf(x) + 1;
	others.push(lineNum + "行" + x)}
				
				
		} //switch结束
	}
}); //循环结束

script = (script[0] || '') && `  script:\n${script.join("\n")}`;

providers = (providers[0] || '') && `script-providers:\n${providers.join("\n")}`;

cron = (cron[0] || '') && `cron:\n  script:\n${cron.join("\n")}`;

URLRewrite = (URLRewrite[0] || '') && `  rewrite:\n${URLRewrite.join("\n")}`;

URLRewrite = URLRewrite.replace(/"/gi,'')

HeaderRewrite = (HeaderRewrite[0] || '') && `  header-rewrite:\n${HeaderRewrite.join("\n\n")}`;

HeaderRewrite = HeaderRewrite.replace(/"/gi,'')



/********
MapLocal = (MapLocal[0] || '') && `[MapLocal]\n${MapLocal.join("\n")}`;
********/

MITM = MITM.replace(/t&2;/g,'  ')
           .replace(/t&hn;/g,'    - ')
           .replace(/\,/g,'"\n    - "')



body = `${name}
${desc}

http:
${URLRewrite}

${HeaderRewrite}

${script}

${MITM}

${cron}

${providers}`
		.replace(/t&zd;/g,',')
		.replace(/"{2,}/g,'"')
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