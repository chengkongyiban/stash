/****************************
原脚本作者@小白脸 脚本修改@chengkongyiban
感谢@xream 的指导
说明
   ${noteKn6} = \n#?六个空格
   ${noteKn4} = \n#?四个空格
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
let req = $request.url.replace(/qx.stoverride$|qx.stoverride\?.*/,'');
let urlArg = $request.url.replace(/.+qx.stoverride(\?.*)/,'$1');
var original = [];//用于获取原文行号
//获取参数
var nName = urlArg.indexOf("n=") != -1 ? (urlArg.split("n=")[1].split("&")[0].split("+")) : null;
var Pin0 = urlArg.indexOf("y=") != -1 ? (urlArg.split("y=")[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
var Pout0 = urlArg.indexOf("x=") != -1 ? (urlArg.split("x=")[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
//修改名字和简介
if (nName === null){
	name = req.match(/.+\/(.+)\.(conf|js|snippet|txt)/)?.[1] || '无名';
    desc = name;
}else{
	name = nName[0] != "" ? nName[0] : req.match(/.+\/(.+)\.(conf|js|snippet|txt)/)?.[1];
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
	body = body.match(/[^\n]+/g);
let script = [];
let URLRewrite = [];
let HeaderRewrite = [];
let cron = []; 
let providers = [];  
let others = [];     //不支持的内容
let MITM = "";

body.forEach((x, y, z) => {
	x = x.replace(/^(#|;|\/\/)/gi,'#').replace(/\x20{2,}/g," ");

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
		/\x20url\x20script-|enabled=|\x20url\x20reject|\x20echo-response\x20|\-header\x20|^hostname|\x20url\x2030|\x20(request|response)-body/
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
//远程脚本			
			case " url script-":
				z[y - 1]?.match(/^#/) && script.push("    " + z[y - 1]);
				
				let sctype = x.match('script-response') ? 'response' : 'request';
				
				let rebody = x.match('-body|-analyze') ? 'require-body: true' : '';
				
				let size = x.match('-body|-analyze') ? 'max-size: 3145728' : '';
				
				let proto = x.match('proto.js') ? 'binary-mode: true' : '';
				
				let urlInNum = x.split(" ").indexOf("url");
				
				let ptn = x.split(" ")[urlInNum - 1].replace(/#/,"");
				
				let js = x.split(" ")[urlInNum + 2];
				
				let scname = js.substring(js.lastIndexOf('/') + 1, js.lastIndexOf('.') );
				
				script.push(
					x.replace(
						/.+script-.+/,
						`${noteK4}- match: ${ptn}${noteKn6}name: ${scname}_${y}${noteKn6}type: ${sctype}${noteKn6}timeout: 30${noteKn6}${rebody}${noteKn6}${size}${noteKn6}${proto}`
					),
				);
				providers.push(
					x.replace(
						/.+script-.+/,
						`${noteK2}${scname}_${y}:${noteKn4}url: ${js}${noteKn4}interval: 86400`
					),
				);
				break;
				
//定时任务

			case "enabled=":
				z[y - 1]?.match(/^#/) && cron.push("    " + z[y - 1]);
				
				let cronExp = x.split(" http")[0].replace(/[^\s]+ ([^\s]+ [^\s]+ [^\s]+ [^\s]+ [^\s]+)/,'$1').replace(/#/,'');
				
				let cronJs = x.split("://")[1].split(",")[0].replace(/(.+)/,'https://$1');
				
				let croName = x.split("tag=")[1].split(",")[0];
				
				cron.push(
					x.replace(
						/.+enabled=.+/,
						`${noteK4}- name: ${croName}${noteKn6}cron: "${cronExp}"${noteKn6}timeout: 60`,
					),
				);
				providers.push(
					x.replace(
						/.+enabled.+/,
						`${noteK2}${croName}:${noteKn4}url: ${cronJs}${noteKn4}interval: 86400`
					),
				);
				break;

//reject

			case " url reject":
			
				z[y - 1]?.match(/^#/) && URLRewrite.push("    " + z[y - 1]);
				URLRewrite.push(x.replace(/(#)?(.*?)\x20url\x20(reject-200|reject-img|reject-dict|reject-array|reject)/, `${noteK4}- $2 - $3`));
				break;
				
//(request|response)-header

			case "-header ":
				z[y - 1]?.match(/^#/) && script.push(z[y - 1]);
				
				let reHdType = x.match(' response-header ') ? 'response' : 'request';
				
				let reHdPtn = x.split(" url re")[0].replace(/^#/,"");
				
				let reHdArg1 = x.split(" " + reHdType + "-header ")[1];
				
				let reHdArg2 = x.split(" " + reHdType + "-header ")[2];
				
				script.push(`${noteK4}- match: ${reHdPtn}${noteKn6}name: replaceHeader_${y}${noteKn6}type: ${reHdType}${noteKn6}timeout: 30${noteKn6}argument: |-${noteKn8}${reHdArg1}->${reHdArg2}`)
				
				providers.push(`${noteK2}replaceHeader_${y}:${noteKn4}url: https://raw.githubusercontent.com/xream/scripts/main/surge/modules/replace-header/index.js${noteKn4}interval: 86400`	);
				
				break;
				
			case " echo-response ":
			
				let arg = x.split(" echo-response ")[2];
			
			if(/^(https?|ftp|file):\/\/.*/.test(arg)){
				
				z[y - 1]?.match(/^#/) && script.push("    " + z[y - 1]);
				
				let urlInNum = x.split(" ").indexOf("url");
				
				let ptn = x.split(" ")[urlInNum - 1].replace(/#/,"");
				
				let scname = arg.substring(arg.lastIndexOf('/') + 1, arg.lastIndexOf('.') );
				
				script.push(x.replace(/.*echo-response.*/,`${noteK4}- match: ${ptn}${noteKn6}name: ${scname}_${y}${noteKn6}type: request${noteKn6}timeout: 30${noteKn6}argument: |-${noteKn8}type=text/json&url=${arg}`))
				
				providers.push(
						x.replace(
							/.*echo-response.*/,
							`${noteK2}${scname}_${y}:${noteKn4}url: https://raw.githubusercontent.com/xream/scripts/main/surge/modules/echo-response/index.js${noteKn4}interval: 86400`,
						),
					);
				
			}else{
let lineNum = original.indexOf(x) + 1;
others.push(lineNum + "行" + x)}
			
				break;
				
//mitm		
			case "hostname":
				MITM = x.replace(/,$/,'').replace(/.*hostname\x20?=(.*)/, `t&2;mitm:\nt&hn;"$1"`);
				break;
				
//302/307				
			case " url 30":
				z[y - 1]?.match(/^#/) && URLRewrite.push("    " + z[y - 1]);
					URLRewrite.push(x.replace(/(#)?(.*?)\x20url\x20(302|307)\x20(.+)/, `${noteK4}- $2 $4 $3`));
				break;

//带参数脚本				
			default:
					z[y - 1]?.match(/^#/) && script.push("    " + z[y - 1]);
					script.push(
						x.replace(
							/^#?([^\s]+)\x20url\x20(response|request)-body\x20(.+)\x20\2-body\x20(.+)/,
							`${noteK4}- match: $1${noteKn6}name: replaceBody_${y}${noteKn6}type: $2${noteKn6}timeout: 30${noteKn6}require-body: true${noteKn6}max-size: 3145728${noteKn6}argument: |-${noteKn8}$3->$4`,
						),
					);
					providers.push(
						x.replace(
							/^#?([^\s]+)\x20url\x20(response|request)-body\x20(.+)\x20\2-body\x20(.+)/,
							`${noteK2}replaceBody_${y}:${noteKn4}url: https://raw.githubusercontent.com/mieqq/mieqq/master/replace-body.js${noteKn4}interval: 86400`,
						),
					);


				
		} //switch结束
	}
}); //循环结束

script = (script[0] || '') && `  script:\n${script.join("\n")}`;

providers = (providers[0] || '') && `script-providers:\n${providers.join("\n")}`;

cron = (cron[0] || '') && `cron:\n  script:\n${cron.join("\n")}`;

URLRewrite = (URLRewrite[0] || '') && `  rewrite:\n${URLRewrite.join("\n")}`;

HeaderRewrite = (HeaderRewrite[0] || '') && `  header-rewrite:\n${HeaderRewrite.join("\n")}`;


others = (others[0] || '') && `${others.join("\n\n")}`;

MITM = MITM.replace(/\x20/g,'')
           .replace(/\,/g,'"\n    - "')
		   .replace(/t&2;/g,'  ')
		   .replace(/t&hn;/g,'    - ')

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
		.replace(/->(")\n/g,"->$1$1\n")
		.replace(/script-providers:\n+$/g,'')
		.replace(/#      \n/gi,'\n')
		.replace(/      \n/g,"")
		.replace(/(#.+\n)\n/g,'$1')
		.replace(/\n{2,}/g,'\n\n')

if (isSurgeiOS || isStashiOS) {
           others !="" && $notification.post("不支持的类型已跳过","第" + others,"点击查看原文，长按可展开查看跳过行",{url:req});
        } else{if (isLooniOS || isShadowrocket) {
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