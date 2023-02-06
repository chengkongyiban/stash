/****************************
原脚本作者@小白脸 脚本修改@chengkongyiban
感谢@xream 的指导
说明
   支持QX & Surge & clash 规则集解析
   适用app: Surge Shadowrocket Stash Loon
***************************/
const ua = $request.headers['User-Agent'] || $request.headers['user-agent']
const isStashiOS = 'undefined' !== typeof $environment && $environment['stash-version'] && ua.indexOf('Macintosh') === -1
const isSurgeiOS = 'undefined' !== typeof $environment && $environment['surge-version'];
const isShadowrocket = 'undefined' !== typeof $rocket;
const isLooniOS = 'undefined' != typeof $loon && /iPhone/.test($loon);

let req = $request.url.replace(/r_parser.list$|r_parser.list\?.+/,'');
let urlArg = $request.url.replace(/.+r_parser.list(\?.*)/,"$1");
var original = [];//用于获取原文行号
//获取参数
var Rin0 = urlArg.indexOf("y=") != -1 ? (urlArg.split("y=")[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
var Rout0 = urlArg.indexOf("x=") != -1 ? (urlArg.split("x=")[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
//修改名字和简介

!(async () => {
  let body = await http(req);
//判断是否断网
if(body == null){if(isSurgeiOS || isStashiOS){
	$notification.post("重写转换：未获取到body","请检查网络及节点是否畅通","认为是bug?点击通知反馈",{url:"https://t.me/zhangpeifu"})
 $done({ response: { status: 404 ,body:{} } });}else{$notification.post("重写转换：未获取到body","请检查网络及节点是否畅通","认为是bug?点击通知反馈","https://t.me/zhangpeifu")
 $done({ response: { status: 404 ,body:{} } });
}//识别客户端通知
}else{//以下开始规则集解析

original = body.replace(/^ *(#|;|\/\/)/g,'#').replace(/  - /g,'').replace(/(^[^#].+)\x20+\/\/.+/g,'$1').replace(/\x20/g,'').replace(/(\{[0-9]+)\,([0-9]*\})/g,'$1t&zd;$2').replace(/^host-wildcard/gi,'HO-ST-WILDCARD').replace(/^dest-port/gi,'DST-PORT').split("\n");
	body = body.match(/[^\r\n]+/g);
	
let others = [];
let ruleSet = [];

body.forEach((x, y, z) => {
	x = x.replace(/^payload:/,'').replace(/^ *(#|;|\/\/)/,'#').replace(/  - /,'').replace(/(^[^#].+)\x20+\/\/.+/,'$1').replace(/\x20/g,'').replace(/(\{[0-9]+)\,([0-9]*\})/g,'$1t&zd;$2');
	
//去掉注释
if(Rin0 != null)	{
	for (let i=0; i < Rin0.length; i++) {
  const elem = Rin0[i];
	if (x.indexOf(elem) != -1){
		x = x.replace(/^#/,"")
	}else{};
};//循环结束
}else{};//去掉注释结束

//增加注释
if(Rout0 != null){
	for (let i=0; i < Rout0.length; i++) {
  const elem = Rout0[i];
	if (x.indexOf(elem) != -1){
		x = x.replace(/(.+)/,"#$1")
	}else{};
};//循环结束
}else{};//增加注释结束

	x = x.replace(/^#.+/,'').replace(/^host-wildcard/i,'HO-ST-WILDCARD').replace(/^host/i,'DOMAIN').replace(/^dest-port/i,'DST-PORT').replace(/^ip6-cidr/i,'IP-CIDR6')
	
	if (isStashiOS){
	
	if (x.match(/^(HO-ST|U|PROTOCOL|PROCESS-NAME)/i)){
		
		let lineNum = original.indexOf(x) + 1;
		others.push("原文第" + lineNum + "行" + x.replace(/^HO-ST/i,'HOST'))

	}else if (x!=""){
		
		let noResolve = x.match(/,no-resolve/i) ? ",no-resolve" : '';
		
		let ruleType = x.split(",")[0].toUpperCase();
		
		let ruleValue = x.split(",")[1];
		
		ruleSet.push(
			`  - ${ruleType},${ruleValue}${noResolve}`
			)
	};
	}else if (isLooniOS){
	
	if (x.match(/^(HO-ST|DST-PORT|PROTOCOL|PROCESS-NAME)/i)){
		
		let lineNum = original.indexOf(x) + 1;
		others.push(lineNum + "行" + x.replace(/^HO-ST/i,'HOST'))

	}else if (x!=""){
		
		let noResolve = x.match(/,no-resolve/i) ? ",no-resolve" : '';
		
		let ruleType = x.split(",")[0].toUpperCase();
		
		let ruleValue = x.split(",")[1];
		
		ruleSet.push(
			`${ruleType},${ruleValue}${noResolve}`
			)
	};
	}else if (isSurgeiOS || isShadowrocket){
		if (x.match(/^(HO-ST|PROCESS-NAME)/i)){
		
		let lineNum = original.indexOf(x) + 1;
		others.push(lineNum + "行" + x.replace(/^HO-ST/i,'HOST'))

	}else if (x!=""){
		
		let noResolve = x.match(/,no-resolve/i) ? ",no-resolve" : '';
		
		let ruleType = x.split(",")[0].toUpperCase().replace(/DST-PORT/,"DEST-PORT");
		
		let ruleValue = x.split(",")[1];
		
		ruleSet.push(
			`${ruleType},${ruleValue}${noResolve}`)
	};
	};
	
}); //循环结束

let ruleNum = ruleSet.length;
let notSupport = others.length;
others = (others[0] || '') && `#${others.join("\n#")}`;

if (isStashiOS){
	ruleSet = (ruleSet[0] || '') && `#规则数量:${ruleNum}\n#不支持的规则数量:${notSupport}\n#不支持的规则:\n${others}\n #----------------以下为解析后的规则----------------#\n\npayload:\n${ruleSet.join("\n")}`;
}else{
	ruleSet = (ruleSet[0] || '') && `#规则数量:${ruleNum}\n#不支持的规则数量:${notSupport}\n#不支持的规则:\n${others}\n #----------------以下为解析后的规则----------------#\n\n${ruleSet.join("\n")}`;
}

body = `${ruleSet}`.replace(/t&zd;/g,',');

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