/****************************
支持将Surge重写解析至Loon Stash Surge Shadowrocket
说明
原脚本作者@小白脸 脚本修改@chengkongyiban
感谢@xream 提供的echo-response.js
插件图标用的 @Keikinn 的 StickerOnScreen项目 以及 @Toperlock 的图标库项目，感谢
***************************/
const isStashiOS = 'undefined' !== typeof $environment && $environment['stash-version'];
const isLooniOS = 'undefined' != typeof $loon;
const isSurgeiOS = 'undefined' !== typeof $environment && $environment['surge-version'];
const isShadowrocket = 'undefined' !== typeof $rocket;
const iconStatus = $persistentStore.read("启用插件随机图标") ?? "启用";
const iconReplace = $persistentStore.read("替换原始插件图标");
const iconLibrary1 = $persistentStore.read("插件随机图标合集") ?? "Doraemon(100P)";
const iconLibrary2 = iconLibrary1.split("(")[0];

var name = "";
var desc = "";
var req
var urlArg
if (isLooniOS || isSurgeiOS ||    isShadowrocket){
    req = $request.url.replace(/sg$|sg\?.*/,'');
    if ($request.url.indexOf("sg?") != -1){
        urlArg = "?" + $request.url.split("sg?")[1];
    }else{urlArg = ""};
    
}else if (isStashiOS){
    req = $request.url.replace(/sg\.stoverride$|sg\.stoverride\?.*/,'');
    if ($request.url.indexOf("sg.stoverride?") != -1){
        urlArg = "?" + $request.url.split("sg.stoverride?")[1];
    }else{urlArg = ""};
};
var rewriteName = req.substring(req.lastIndexOf('/') + 1).split('.')[0];
var original = [];//用于获取原文行号
//获取参数
var nName = urlArg.search(/\?n=|&n=/) != -1 ? (urlArg.split(/\?n=|&n=/)[1].split("&")[0].split("+")) : null;
var Pin0 = urlArg.search(/\?y=|&y=/) != -1 ? (urlArg.split(/\?y=|&y=/)[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
var Pout0 = urlArg.search(/\?x=|&x=/) != -1 ? (urlArg.split(/\?x=|&x=/)[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
var hnAdd = urlArg.search(/\?hnadd=|&hnadd=/) != -1 ? (urlArg.split(/\?hnadd=|&hnadd=/)[1].split("&")[0].replace(/%20/g,"").split(",")) : null;
var hnDel = urlArg.search(/\?hndel=|&hndel=/) != -1 ? (urlArg.split(/\?hndel=|&hndel=/)[1].split("&")[0].replace(/%20/g,"").split(",")) : null;
var delNoteSc = urlArg.search(/\?del=|&del=/) != -1 ? true : false;
var nCron = urlArg.search(/\?cron=|&cron=/) != -1 ? (urlArg.split(/\?cron=|&cron=/)[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
var nCronExp = urlArg.search(/\?cronexp=|&cronexp=/) != -1 ? (urlArg.split(/\?cronexp=|&cronexp=/)[1].split("&")[0].replace(/\./g," ").split("+")).map(decodeURIComponent) : null;
var nArgTarget = urlArg.search(/\?arg=|&arg=/) != -1 ? (urlArg.split(/\?arg=|&arg=/)[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
var nArg = urlArg.search(/\?argv=|&argv=/) != -1 ? (urlArg.split(/\?argv=|&argv=/)[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
var nTilesTarget = urlArg.search(/\?tiles=|&tiles=/) != -1 ? (urlArg.split(/\?tiles=|&tiles=/)[1].split("&")[0].split("+")) : null;
var nTilesColor = urlArg.search(/\?tcolor=|&tcolor=/) != -1 ? (urlArg.split(/\?tcolor=|&tcolor=/)[1].split("&")[0].split("+")) : null;
var icon = "";
//修改名字和简介
if (nName === null){
	name = rewriteName;
    desc = name;
}else{
	name = nName[0] != "" ? nName[0] : rewriteName;
	desc = nName[1] != undefined ? nName[1] : name;
};
if (isLooniOS || isSurgeiOS || isShadowrocket){
	name = "#!name=" + decodeURIComponent(name);
	desc = "#!desc=" + decodeURIComponent(desc);
}else if (isStashiOS){
	name = 'name: ' + '"' + decodeURIComponent(name) + '"';
	desc = 'desc: ' + '"' + decodeURIComponent(desc) + '"';
};

let npluginDesc = name + "\n" + desc;

//随机图标在插件中设置，默认启用
if(isLooniOS && iconStatus == "启用"){
	const stickerStartNum = 1001;
const stickerSum = iconLibrary1.split("(")[1].split("P")[0];
let randomStickerNum = parseInt(stickerStartNum + Math.random() * stickerSum).toString();
   icon = "#!icon=" + "https://github.com/Toperlock/Quantumult/raw/main/icon/" + iconLibrary2 + "/" + iconLibrary2 + "-" + randomStickerNum + ".png";
};
const pluginIcon = icon;
console.log("插件图标：" + pluginIcon);

!(async () => {
  let body = await http(req);
//判断是否断网
if(body == null || body == ""){if(isStashiOS || isSurgeiOS){
    console.log("Surge转换：未获取到body的链接为" + $request.url)
	$notification.post("Surge转换：未获取到body","请检查网络及节点是否畅通\n" + "源链接为" + $request.url,"认为是bug?点击通知反馈",{url:"https://t.me/zhangpeifu"})
 $done({ response: { status: 404 ,body:{} } });}else{
    console.log("Surge转换：未获取到body的链接为" + $request.url)
    $notification.post("Surge转换：未获取到body","请检查网络及节点是否畅通\n" + "源链接为" + $request.url,"认为是bug?点击通知反馈","https://t.me/zhangpeifu")
 $done({ response: { status: 404 ,body:{} } });
}//识别客户端通知
}else{//以下开始重写及脚本转换

original = body.replace(/^ *(#|;|\/\/)/g,'#').replace(/(^[^#].+)\x20+\/\/.+/g,"$1").split(/(\r\n)/);

if (body.match(/\/\*+\n[\s\S]*\n\*+\/\n/)){
body = body.replace(/[\s\S]*(\/\*+\n[\s\S]*\n\*+\/\n)[\s\S]*/,"$1").match(/[^\r\n]+/g);
}else{
    body = body.match(/[^\r\n]+/g);};

let pluginDesc = [];
let httpFrame = "";
let General = [];
let Panel = [];
let rules = [];
let script = [];
let URLRewrite = [];
let HeaderRewrite = [];
let MapLocal = [];
let tiles = [];
let cron = [];
let providers = [];
let MITM = "";
let others = [];       //不支持的内容

let scname = "";       //脚本名
let js = "";           //脚本链接
let arg = "";          //argument
let sctype = "";       //脚本类型
let ptn = "";          //正则
let rebody = "";       //是否需要body
let size = "";         //允许最大body大小
let proto = "";        //是否开启binary-body-mode
let hdtype = "";       //HeaderRewrite 类型
let cronExp = "";      //cron表达式
let croName = "";      //cron任务名
let cronJs = "";       //cron脚本链接
let rejectType = "";   //重写reject类型
let rejectPtn = "";    //重写reject正则
let file = "";         //Mock的文件链接
let fileName = "";     //文件名
let mock2Reject = "";  //Mock转reject类型
let tilesIcon = "";    //Stash磁贴图标
let tilesColor = "";   //Stash磁贴颜色


body.forEach((x, y, z) => {
	x = x.replace(/^ *(#|;|\/\/)/,'#').replace(/(^[^#].+)\x20+\/\/.+/,"$1").replace(/, *REJECT([^,\s]*)$/i,',REJECT$1').replace(/, *DIRECT$/i,',DIRECT').replace(/ reject/i,' reject').replace(/(hostname|force-http-engine-hosts|skip-proxy|always-real-ip)\x20*=/,'$1=').replace(/cronexpr?\x20*=\x20*/gi,'cronexp=').replace(/type *= *generic *,/i,"type=generic,").replace(/script-name *=/,"script-name=");
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
	if (x.indexOf(elem) != -1 && x.search(/^(hostname|force-http-engine-hosts|skip-proxy|always-real-ip)=/) == -1){
		x = "#" + x;
	}else{};
};//循环结束
}else{};//增加注释结束

//添加主机名
if (hnAdd != null){
	if (x.search(/^hostname=/) != -1){
		x = x.replace(/\x20/g,"").replace(/(.+)/,`$1,${hnAdd}`).replace(/,{2,}/g,",");
	}else{};
}else{};//添加主机名结束

//删除主机名
if (hnDel != null && x.search(/^hostname=/) != -1){
    x = x.replace(/\x20/g,"").replace(/^hostname=/,"").replace(/%.*%/,"").replace(/,{2,}/g,",").split(",");
	for (let i=0; i < hnDel.length; i++) {
  const elem = hnDel[i];
if (x.indexOf(elem) != -1){
  let hnInNum = x.indexOf(elem);
  delete x[hnInNum];
}else{};
  };//循环结束
x = "hostname=" + x;
}else{};//删除主机名结束

if (delNoteSc === true && x.match(/^#/) && x.indexOf("#!") == -1){
		x = "";
};

	let type = x.match(
		/^#!|http-re|\x20header-|type=generic,|script-name=|cronexp=|\x20reject|\x20data=|^hostname|^force-http-engine-hosts|^skip-proxy|^always-real-ip|\x20(302|307|header)$|,REJECT[^,\s]*$|,DIRECT/
	)?.[0];
//判断注释
if (isLooniOS || isSurgeiOS || isShadowrocket){
	
	if (x.match(/^[^#]/)){
	var noteK = "";
	}else{
	var noteK = "#";
	};
}else if (isStashiOS){
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
};//判断注释结束
	
	if (type) {
		switch (type) {
//简介            
			case "#!":
               if (isStashiOS){
               x = x.replace(/^#! *(name|desc) *= *(.*)/,'$1: "$2"');
            
            if (nName != null){
                x = x.replace(/^name:.*/,name).replace(/^desc:.*/,desc);
            };
            pluginDesc.push(x);
            };
            
            if (isLooniOS || isSurgeiOS || isShadowrocket){
            if (nName != null){
                x = x.replace(/^#!name *=.*/,name).replace(/^#!desc *=.*/,desc);};
            if (iconReplace == "启用"){
                x = x.replace(/^#!icon *=.*/,pluginIcon);
            };
            pluginDesc.push(x);
            };
            
            break;
//Panel脚本            
            case "type=generic,":
                    
				scname = x.split(/ *=/)[0].replace(/^#/,'');
				
				js = x.replace(/\x20/g,"").split("script-path=")[1].split(",")[0];
                
                tilesIcon = x.split("icon=")[1].split("&")[0];
                tilesColor = x.split("icon-color=")[1].split("&")[0];

//获取argument
				if (isSurgeiOS){
					if (x.match(/,\x20*argument\x20*=.+/)){
						if (x.match(/,\x20*argument\x20*=\x20*"+.*?,.*?"+/)
	){
				arg = ', argument=' + x.match(/,\x20*argument\x20*=\x20*("+.*?,.*?"+)/)[1];
	}else{
				arg = ", argument=" +  x.replace(/,\x20*argument\x20*=/gi,",argument=").split(",argument=")[1].split(",")[0];}
				}else{};

				}else if (isStashiOS){
					if (x.match(/,\x20*argument\x20*=.+/)){
						if (x.match(/,\x20*argument\x20*=\x20*"+.*?,.*?"+/)
	){
				arg = x.match(/,\x20*argument\x20*=\x20*("+.*?,.*?"+)/)[1];
				
				if (arg.match(/^".+"$/)){
				arg = `${noteKn6}argument: |-${noteKn8}` + arg.replace(/^"(.+)"$/,'$1');};
	}else{
				arg = `${noteKn6}argument: |-${noteKn8}` + x.replace(/,\x20*argument\x20*=/gi,",argument=").split(",argument=")[1].split(",")[0];}
				
				}else{};

				};//获取argument结束
            
            if (isSurgeiOS){
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = ', argument="' + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+") + '"';   
            };};};
                
				z[y - 1]?.match(/^#/) &&  script.push(z[y - 1]);
                
                script.push(
                    `${noteK}${scname} = type=generic, timeout=5, script-path=${js}${arg}`)
            }else if (isStashiOS){
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = `${noteKn4}argument: |-${noteKn6}` + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+");   
            };};};
                
            if (nTilesTarget != null){
	for (let i=0; i < nTilesTarget.length; i++) {
  const elem = nTilesTarget[i];
	if (x.indexOf(elem) != -1){
        tilesColor = nTilesColor[i];   
            };};};

				z[y - 1]?.match(/^#/) && tiles.push("    " + z[y - 1]);
				
				tiles.push(
					`${noteK2}- name: "${scname}_${y}"${noteKn4}interval: 3600${noteKn4}title: "${scname}"${noteKn4}icon: "${tilesIcon}"${noteKn4}backgroundColor: "${tilesColor}"${noteKn4}timeout: 30`);
			providers.push(
					`${noteK2}${scname}_${y}:${noteKn4}url: ${js}${noteKn4}interval: 86400`);
            };
            
            break;
//Panel配置            
            case "script-name=":
            
            if (isSurgeiOS){
                
				z[y - 1]?.match(/^#/) &&  [Panel].push(z[y - 1]);
                Panel.push(x);
            };

            break;
			
			case "http-re":
//Surge5脚本			
			if (x.match(/=\x20*http-re/)) {
				
				sctype = x.match('http-response') ? 'response' : 'request';
				
				scname = x.replace(/\x20/g,'').split("=")[0].replace(/^#/,'');
				
				ptn = x.replace(/(\{[0-9]+)\,([0-9]*\})/g,'$1t&zd;$2').replace(/\x20/g,"").split("pattern=")[1].split(",")[0].replace(/"/gi,'');
				
				js = x.replace(/\x20/g,"").split("script-path=")[1].split(",")[0];

				proto = x.replace(/\x20/gi,'').match('binary-body-mode=(true|1)') ? ', binary-body-mode=true' : '';
				
				rebody = x.replace(/\x20/gi,'').match('requires-body=(true|1)') ? ', requires-body=true' : '';
				
				size = x.replace(/\x20/g,'').match('requires-body=(true|1)') ? ', max-size=3145728' : '';
				
				if (isLooniOS || isSurgeiOS || isShadowrocket){
					if (x.match(/,\x20*argument\x20*=.+/)){
						if (x.match(/,\x20*argument\x20*=\x20*"+.*?,.*?"+/)
	){
				arg = ', argument=' + x.match(/,\x20*argument\x20*=\x20*("+.*?,.*?"+)/)[1];
	}else{
				arg = ", argument=" +  x.replace(/,\x20*argument\x20*=/gi,",argument=").split(",argument=")[1].split(",")[0];}
				}else{};

				}else if (isStashiOS){
					if (x.match(/,\x20*argument\x20*=.+/)){
						if (x.match(/,\x20*argument\x20*=\x20*"+.*?,.*?"+/)
	){
				arg = x.match(/,\x20*argument\x20*=\x20*("+.*?,.*?"+)/)[1];
				
				if (arg.match(/^".+"$/)){
				arg = `${noteKn6}argument: |-${noteKn8}` + arg.replace(/^"(.+)"$/,'$1');};
	}else{
				arg = `${noteKn6}argument: |-${noteKn8}` + x.replace(/,\x20*argument\x20*=/gi,",argument=").split(",argument=")[1].split(",")[0];}
				
				}else{};

				};
                
			if (isLooniOS){
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = ', argument="' + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+") + '"';   
            };};};

				z[y - 1]?.match(/^#/) && script.push(z[y - 1]);

				script.push(
					`${noteK}http-${sctype} ${ptn} script-path=${js}${rebody}${proto}, tag=${scname}_${y}${arg}`);

				}else if (isStashiOS){
					
				rebody = x.replace(/\x20/g,'').match('requires-body=(true|1)') ? 'require-body: true' : '';
				
				size = x.replace(/\x20/g,'').match('requires-body=(true|1)') ? 'max-size: 3145728' : '';
					
				proto = x.replace(/\x20/g,'').match('binary-body-mode=(true|1)') ? 'binary-mode: true' : '';
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = `${noteKn6}argument: |-${noteKn8}` + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+");   
            };};};

				z[y - 1]?.match(/^#/) && script.push("    " + z[y - 1]);
				
				script.push(
					`${noteKn4}- match: ${ptn}${noteKn6}name: ${scname}_${y}${noteKn6}type: ${sctype}${noteKn6}timeout: 30${noteKn6}${rebody}${noteKn6}${size}${arg}${noteKn6}${proto}`);
			providers.push(
					`${noteK2}${scname}_${y}:${noteKn4}url: ${js}${noteKn4}interval: 86400`);
				}else{

				z[y - 1]?.match(/^#/) && script.push(z[y - 1]);
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = ', argument="' + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+") + '"';   
            };};};

				script.push(
					`${noteK}${scname}_${y} = type=http-${sctype}, pattern=${ptn}, script-path=${js}${rebody}${size}${proto}, timeout=30${arg}`);
                
                    
                };
				
				}else if (x.match(/\x20header-/)){
//HeaderRewrite	
			if (isLooniOS){
				z[y - 1]?.match(/^#/) &&  URLRewrite.push(z[y - 1]);
				
					
			URLRewrite.push(`${noteK}` + x.replace(/#?http-(response|request)\x20/,""))
					
					}else if (isStashiOS){

				z[y - 1]?.match(/^#/) &&  HeaderRewrite.push("    " + z[y - 1]);
				
				hdtype = x.match(/http-response/) ? 'response ' : 'request';
				
				HeaderRewrite.push(`${noteK4}- ` + x.replace(/#?http-(response|request)\x20+/,"").replace("\x20header-",`\x20${hdtype}-`))
					}else if (isSurgeiOS){

				z[y - 1]?.match(/^#/) &&  HeaderRewrite.push(z[y - 1]);
                HeaderRewrite.push(x);};

				}else if (x.match(/http-(response|request)\x20/)){
//Surge4脚本
				ptn = x.replace(/\x20{2,}/g," ").split(" ")[1].replace(/"/gi,'');
					
				js = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0];
					
				sctype = x.match('http-response') ? 'response' : 'request';
					
				scname = js.substring(js.lastIndexOf('/') + 1, js.lastIndexOf('.') );

				proto = x.replace(/\x20/gi,'').match('binary-body-mode=(true|1)') ? ', binary-body-mode=true' : '';
				
				rebody = x.replace(/\x20/gi,'').match('requires-body=(true|1)') ? ', requires-body=true' : '';
				
				size = x.replace(/\x20/g,'').match('requires-body=(true|1)') ? ', max-size=3145728' : '';
				
			if (isLooniOS || isSurgeiOS || isShadowrocket){
					if (x.match(/,\x20*argument\x20*=.+/)){
						if (x.match(/,\x20*argument\x20*=\x20*"+.*?,.*?"+/)
	){
				arg = ', argument=' + x.match(/,\x20*argument\x20*=\x20*("+.*?,.*?"+)/)[1];
	}else{
				arg = ", argument=" +  x.replace(/,\x20*argument\x20*=/gi,",argument=").split(",argument=")[1].split(",")[0];}
				}else{};

				}else if (isStashiOS){
					if (x.match(/,\x20*argument\x20*=.+/)){
						if (x.match(/,\x20*argument\x20*=\x20*"+.*?,.*?"+/)
	){
				arg = x.match(/,\x20*argument\x20*=\x20*("+.*?,.*?"+)/)[1];
				
				if (arg.match(/^".+"$/)){
				arg = `${noteKn6}argument: |-${noteKn8}` + arg.replace(/^"(.+)"$/,'$1');};
	}else{
				arg = `${noteKn6}argument: |-${noteKn8}` + x.replace(/,\x20*argument\x20*=/gi,",argument=").split(",argument=")[1].split(",")[0];}
				
				}else{};

				};
	
				if (isLooniOS){
				
				z[y - 1]?.match(/^#/) && script.push(z[y - 1]);
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = ', argument="' + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+") + '"';   
            };};};

				script.push(
					`${noteK}http-${sctype} ${ptn} script-path=${js}${rebody}${proto}, tag=${scname}_${y}${arg}`);

				}else if (isStashiOS){

				proto = x.replace(/\x20/g,'').match('binary-body-mode=(true|1)') ? 'binary-mode: true' : '';

				rebody = x.replace(/\x20/g,'').match('requires-body=(true|1)') ? 'require-body: true' : '';
				
				size = x.replace(/\x20/g,'').match('requires-body=(true|1)') ? 'max-size: 3145728' : '';
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = `${noteKn6}argument: |-${noteKn8}` + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+");   
            };};};

				script.push(
					`${noteKn4}- match: ${ptn}${noteKn6}name: ${scname}_${y}${noteKn6}type: ${sctype}${noteKn6}timeout: 30${noteKn6}${rebody}${noteKn6}${size}${arg}${noteKn6}${proto}`
			);
			providers.push(
					`${noteK2}${scname}_${y}:${noteKn4}url: ${js}${noteKn4}interval: 86400`
			);
				}else{
                    
				z[y - 1]?.match(/^#/) &&  script.push(z[y - 1]);
                
            if (nArgTarget != null){
	for (let i=0; i < nArgTarget.length; i++) {
  const elem = nArgTarget[i];
	if (x.indexOf(elem) != -1){
        arg = ', argument="' + nArg[i].replace(/t;amp;/g,"&").replace(/t;add;/g,"+") + '"';   
            };};};

				script.push(
					`${noteK}${scname}_${y} = type=http-${sctype}, pattern=${ptn}, script-path=${js}${rebody}${size}${proto}, timeout=30${arg}`);
                };

				}else{
let lineNum = (original.indexOf(x) + 2)/2;
others.push(lineNum + "行" + x)};//整个http-re结束
				
				break;
				
//不是以http-re开头的HeaderRewrite				
			case " header-":
					
					if (isLooniOS){
				z[y - 1]?.match(/^#/) &&  URLRewrite.push(z[y - 1]);
					
			URLRewrite.push(`${noteK}` + x.replace(/#?http-(response|request)\x20/,""))
					
					}else if (isStashiOS){

				z[y - 1]?.match(/^#/) &&  HeaderRewrite.push("    " + z[y - 1]);
				
				hdtype = x.match(/http-response/) ? 'response ' : 'request';
				
				HeaderRewrite.push(`${noteK4}- ` + x.replace(/#?http-(response|request)\x20+/,"").replace("\x20header-",`\x20${hdtype}-`))
					}else if (isSurgeiOS){
                        
				z[y - 1]?.match(/^#/) &&  HeaderRewrite.push(z[y - 1]);
                HeaderRewrite.push(x);
                    };//HeaderRewrite结束
				
				break;

//定时任务
			case "cronexp=":

            if (x.match(/cronexp=(.+?),[^,]+?=/)){
                cronExp = x.match(/cronexp=(.+?),[^,]+?=/)[1].replace(/"/g,'');
            }else{
                cronExp = x.split("cronexp=")[1].replace(/"/g,'');
            };
            
            if (isStashiOS){
				
				cronExp = cronExp.replace(/[^\s]+ ([^\s]+ [^\s]+ [^\s]+ [^\s]+ [^\s]+)/,'$1');
            };
            
            if (nCron != null){
	for (let i=0; i < nCron.length; i++) {
  const elem = nCron[i];
	if (x.indexOf(elem) != -1){
        cronExp = nCronExp[i];   
            };};};
            
				croName = x.split("=")[0].replace(/\x20/g,"").replace(/^#/,'')
				
				cronJs = x.replace(/\x20/gi,"").split("script-path=")[1].split(",")[0];
                
				if (isLooniOS){
				
				script.push(
						`${noteK}cron "${cronExp}" script-path=${cronJs}, timeout=60, tag=${croName}`);
                }else if (isStashiOS){
				
				cron.push(
						`${noteKn4}- name: ${croName}${noteKn6}cron: "${cronExp}"${noteKn6}timeout: 60`
				);
				providers.push(
						`${noteK2}${croName}:${noteKn4}url: ${cronJs}${noteKn4}interval: 86400`
				);   
                }else{

				z[y - 1]?.match(/^#/) &&  script.push(z[y - 1]);
                script.push(
                    `${noteK}${croName} = type=cron, cronexp="${cronExp}", script-path=${cronJs}, timeout=60, wake-system=1`
                    );
                };
				break;

//REJECT

			case " reject":
            
            rejectType = x.split(" ")[x.split(" ").length - 1].toLowerCase().replace(/tinygif/,"img");
            
            rejectPtn = x.split(" ")[0].replace(/^#/,"");
            
            if (x.search(/ reject(-200|-img|-dict|-array|-tinygif)?$/i) == -1){
                
            }else if (isLooniOS){
                
				z[y - 1]?.match(/^#/) && URLRewrite.push(z[y - 1]);
                
				URLRewrite.push(
                    `${noteK}${rejectPtn} - ${rejectType}`);
                
            }else if (isStashiOS){
                
				z[y - 1]?.match(/^#/) && URLRewrite.push("    " + z[y - 1]);
				
				URLRewrite.push(
                    `${noteKn4}- ${rejectPtn} - ${rejectType}`);
                
            }else if (isShadowrocket){
                
				z[y - 1]?.match(/^#/) && URLRewrite.push(z[y - 1]);
				
				URLRewrite.push(
                    `${noteK}${rejectPtn} - ${rejectType}`);
                
            }else if (isSurgeiOS){
                
                if (rejectType.match("-")){
//reject-                    
                
				z[y - 1]?.match(/^#/) && MapLocal.push(z[y - 1]);
                    
				if (rejectType.match(/dict$/)){
					rejectType = "https://raw.githubusercontent.com/mieqq/mieqq/master/reject-dict.json"
				}else if (rejectType.match(/array$/)){
					rejectType = "https://raw.githubusercontent.com/mieqq/mieqq/master/reject-array.json"
				}else if (rejectType.match(/200$/)){
					rejectType = "https://raw.githubusercontent.com/mieqq/mieqq/master/reject-200.txt"
				}else if (rejectType.match(/img$/)){
					rejectType = "https://raw.githubusercontent.com/mieqq/mieqq/master/reject-img.gif"
				};
                MapLocal.push(
                    `${rejectPtn} data="${rejectType}"`);
                  
                }else{//reject
                
				z[y - 1]?.match(/^#/) && URLRewrite.push(z[y - 1]);
				
				URLRewrite.push(
                    `${noteK}${rejectPtn} - reject`);
                    
                }
                
            };
				break;
			
//Mock转reject/request

			case " data=":
				
				ptn = x.replace(/\x20{2,}/g," ").split(" data=")[0].replace(/^#|"/g,"");
				file = x.split(' data="')[1].split('"')[0];
				fileName = file.substring(file.lastIndexOf('/') + 1);
				scname = fileName.split(".")[0];
					
				if (fileName.match(/(img|dict|array|200|blank|tinygif)\.[^.]+$/i)){
                
                
                if (fileName.match(/dict\.[^.]+$/i)){
                    mock2Reject = "-dict";
                    
                }else if (fileName.match(/array\.[^.]+$/i)){
                    mock2Reject = "-array";
                    
                }else if (fileName.match(/(200|blank)\.[^.]+$/i)){
                    mock2Reject = "-200";
                    
                }else if (fileName.match(/(img|tinygif)\.[^.]+$/i)){
                    mock2Reject = "-img";
                };
                
                if (isLooniOS || isShadowrocket){
                    
				z[y - 1]?.match(/^#/) && URLRewrite.push(z[y - 1]);
                
				URLRewrite.push(
						`${noteK}${ptn} - reject${mock2Reject}`)
                }else if (isStashiOS){
                    
                z[y - 1]?.match(/^#/) && URLRewrite.push("    " + z[y - 1]);
                
                URLRewrite.push(
						`${noteKn4}- ${ptn} - reject${mock2Reject}`);}else{
                
				z[y - 1]?.match(/^#/) &&  URLRewrite.push(z[y - 1]);
                URLRewrite.push(x);};
				
				}else{
                    
                if (isLooniOS || isShadowrocket){
                    
                z[y - 1]?.match(/^#/) && script.push(z[y - 1]);
                
                script.push(
			`${noteK}http-request ${ptn} script-path=https://raw.githubusercontent.com/xream/scripts/main/surge/modules/echo-response/index.js, tag=${scname}_${y}, argument=type=text/json&url=${file}`)
                        
                }else if (isStashiOS){
                    
                z[y - 1]?.match(/^#/) && script.push("    " + z[y - 1]);
		
		script.push(
			`${noteK4}- match: ${ptn}${noteKn6}name: ${scname}_${y}${noteKn6}type: request${noteKn6}timeout: 30${noteKn6}argument: |-${noteKn8}type=text/json&url=${file}`)
				
				providers.push(
							`${noteK2}${scname}_${y}:${noteKn4}url: https://raw.githubusercontent.com/xream/scripts/main/surge/modules/echo-response/index.js${noteKn4}interval: 86400`);    
                }else{
                    
				z[y - 1]?.match(/^#/) &&  Maplocal.push(z[y - 1]);
                Maplocal.push(x);
                };
		};
				break;
				
//hostname				
			case "hostname":
            
            if (isLooniOS){
                MITM = x.replace(/%.*%/g," ").replace(/\x20/g,"").replace(/,{2,}/g,",").replace(/,*\x20*$/,"").replace(/hostname=(.*)/, `[MITM]\n\nhostname = $1`).replace(/=\x20,+/,"= ");
            }else if (isStashiOS){
                MITM = x.replace(/%.*%/g,"").replace(/\x20/g,"").replace(/,{2,}/g,",").replace(/,*\x20*$/,"").replace(/hostname=(.*)/, `t&2;mitm:\nt&hn;"$1"`).replace(/",+/,'"');
            }else{
                MITM = x.replace(/%.*%/g,"").replace(/\x20/g,"").replace(/,{2,}/g,",").replace(/,*\x20*$/,"").replace(/hostname=(.*)/, `[MITM]\n\nhostname = %APPEND% $1`).replace(/%\x20,+/,"% ");};
				break;

//general          

            case "force-http-engine-hosts":
            
            if (isLooniOS){
                General.push(x.replace(/%.*%/g,"").replace(/ *= */," = "));
            }else if (isStashiOS){
                General.push(x.replace(/%.*%/g,"").replace(/\x20/g,"").replace(/,{2,}/g,",").replace(/,*\x20*$/,"").replace(/force-http-engine-hosts=(.*)/, `t&2;force-http-engine:\nt&hn;"$1"`).replace(/",+/,'"'))
            }else{General.push(x);};
				break;
                                
            case "skip-proxy":
            
            if (isLooniOS){
                General.push(x.replace(/%.*%/g,"").replace(/ *= */," = "));
            }else if (isStashiOS){}else{General.push(x);};
				break;
           
            case "always-real-ip":
            
            if (isLooniOS){
                General.push(x.replace(/%.*%/g,"").replace(/ *= */," = "));
            }else if (isStashiOS){
                General.push(x.replace(/%.*%/g,"").replace(/\x20/g,"").replace(/,{2,}/g,",").replace(/,*\x20*$/,"").replace(/always-real-ip=(.*)/, `t&2;fake-ip-filter:\nt&hn;"$1"`).replace(/",+/,'"'))
            }else{General.push(x);};
				break;

			default:
//重定向
				if (type.match(/ (302|307|header)/)){
                    if (isLooniOS){
                        z[y - 1]?.match(/^#/)  && URLRewrite.push(z[y - 1]);
				
					URLRewrite.push(
						x.replace(/\x20{2,}/g," ").replace(/(^#)?([^\s]+)\x20([^\s]+)\x20(302|307|header)/, `${noteK}$2 $3 $4`));
                    }else if (isStashiOS){
                        
                      z[y - 1]?.match(/^#/)  && URLRewrite.push("    " + z[y - 1]);
				
					URLRewrite.push(x.replace(/\x20{2,}/g," ").replace(/(^#)?(.+?)\x20(.+?)\x20(302|307|header)/, `${noteKn4}- $2 $3 $4`));  
                    }else{
                
				z[y - 1]?.match(/^#/) &&  URLRewrite.push(z[y - 1]);
                URLRewrite.push(x);};
                
//重定向处理完毕 开始处理Loon Stash不支持的rule	
				}else if ((isLooniOS || isStashiOS) && x.match(/^#?(AND|NOT|OR|RULE-SET|DOMAIN-SET|SCRIPT) *,/)){
                    
                }else if (isLooniOS && x.match(/^#?DE?ST-PORT/)){
                    
                }else if (isStashiOS && x.match(/^#?USER-AGENT *,/)){
                    
                }else if (isStashiOS && x.match(/^#?URL-REGEX *,/)){
//开始处理stash URL-REGEX转reject                    
                    if (x.match(/, *REJECT([^,\s]*)$/)){
                
                    z[y - 1]?.match(/^#/) && URLRewrite.push("    " + z[y - 1]);
                x = x.replace(/\x20/,"");
                
                if (x.match(/DICT$/i)){
                    Urx2Reject = '-dict';
                }else if (x.match(/ARRAY$/i)){
                    Urx2Reject = '-array';
                }else if (x.match(/DROP$/i)){
                    Urx2Reject = '-200';
                }else if (x.match(/IMG$|TINYGIF$/i)){
                    Urx2Reject = '-img';
                }else if (x.match(/REJECT$/i)){
                    Urx2Reject = '';
                };
				
				URLRewrite.push(
					x.replace(/.*URL-REGEX,([^\s]+),[^,]+/,
					`${noteKn4}- $1 - reject${Urx2Reject}`)
				);
//转reject结束          
            }else{
let lineNum = (original.indexOf(x) + 2)/2;
others.push(lineNum + "行" + x)};//Stash URL-REGEX处理完毕         
                }else if (isSurgeiOS || isShadowrocket || isLooniOS){
                    x = x.replace(/" "/g,"");
				z[y - 1]?.match(/^#/) &&  rules.push(z[y - 1]);
                if (isLooniOS){
                    rules.push(x.replace(/,REJECT-NO-DROP$/,",REJECT-DROP").replace(/,REJECT-(200|TINYGIF)/,",REJECT-IMG"));
                    
                }else if(isShadowrocket){
                    rules.push(x.replace(/^#?DEST-PORT *,/,`${noteK}DST-PORT,`));}else{rules.push(x);}//Loon Surge 火箭 rule处理完毕
                
                }else if (isStashiOS){
                    x = x.replace(/" "/g,"");
                    z[y - 1]?.match(/^#/) && rules.push("    " + z[y - 1]);
                 rules.push(
                    x.replace(/^#?(.+),(DIRECT$|REJECT)[^,]*$/,`${noteK2}- $1,$2`).replace(/- DEST-PORT/,"- DST-PORT"));   
                };//整个rule结束
                
		} //switch结束
	}
}); //循环结束

if (isLooniOS){
    
    pluginDesc = (pluginDesc[0] || '') && `${pluginDesc.join("\n")}`;
    
    if (pluginDesc !="" && pluginDesc.search(/#! *name *=/) != -1){
        
        if (pluginDesc.search(/#! *icon *= *.+/) == -1){
        pluginDesc = pluginDesc + "\n" + pluginIcon;
            
        }else{pluginDesc = pluginDesc;};
        
    }else{
        pluginDesc = npluginDesc + "\n" + pluginIcon;
    };
    
    if (iconReplace == "启用" && pluginDesc.search(/#!icon=/) == -1 ){
        pluginDesc = pluginDesc + "\n" + pluginIcon};
    
    General = (General[0] || '') && `[General]\n\n${General.join("\n\n")}`;
    
    script = (script[0] || '') && `[Script]\n\n${script.join("\n\n")}`;

URLRewrite = (URLRewrite[0] || '') && `[Rewrite]\n\n${URLRewrite.join("\n")}`;

URLRewrite = URLRewrite.replace(/"/gi,'')

rules = (rules[0] || '') && `[Rule]\n\n${rules.join("\n")}`;

others = (others[0] || '') && `${others.join("\n")}`;

body = `${pluginDesc}


${General}


${rules}


${URLRewrite}


${script}


${MITM}`
		.replace(/t&zd;/g,',')
		.replace(/(#.+\n)\n+(?!\[)/g,'$1')
		.replace(/\n{2,}/g,'\n\n')
}else if (isStashiOS){
    
    pluginDesc = (pluginDesc[0] || '') && `${pluginDesc.join("\n")}`;
    
    if (pluginDesc !="" && pluginDesc.search(/name: /) != -1){
        pluginDesc = pluginDesc;
    }else{
        pluginDesc = npluginDesc;
    };
    
    General = (General[0] || '') && `${General.join("\n")}`;
    
    rules = (rules[0] || '') && `rules:\n${rules.join("\n")}`;

tiles = (tiles[0] || '') && `tiles:\n${tiles.join("\n\n")}`;

script = (script[0] || '') && `  script:\n${script.join("\n\n")}`;

providers = (providers[0] || '') && `script-providers:\n${providers.join("\n")}`;

cron = (cron[0] || '') && `cron:\n  script:\n${cron.join("\n")}`;

URLRewrite = (URLRewrite[0] || '') && `  rewrite:\n${URLRewrite.join("\n")}`;

URLRewrite = URLRewrite.replace(/"/gi,'')

HeaderRewrite = (HeaderRewrite[0] || '') && `  header-rewrite:\n${HeaderRewrite.join("\n")}`;

HeaderRewrite = HeaderRewrite.replace(/"/gi,'')

others = (others[0] || '') && `${others.join("\n")}`;

General = General.replace(/t&2;/g,'  ')
           .replace(/t&hn;/g,'    - ')
           .replace(/\,/g,'"\n    - "')

MITM = MITM.replace(/t&2;/g,'  ')
           .replace(/t&hn;/g,'    - ')
           .replace(/\,/g,'"\n    - "')

    if (URLRewrite != "" || script != "" || HeaderRewrite != "" || MITM != "" || General != ""){
httpFrame = `http:
${General}

${HeaderRewrite}

${URLRewrite}

${script}

${MITM}`
};

body = `${pluginDesc}


${rules}

${httpFrame}

${tiles}

${cron}

${providers}`
		.replace(/t&zd;/g,',')
		.replace(/script-providers:\n+$/g,'')
		.replace(/#      \n/gi,'\n')
		.replace(/      \n/g,"")
		.replace(/(#.+\n)\n+(?!\[)/g,'$1')
		.replace(/\n{2,}/g,'\n\n')
}else if (isSurgeiOS || isShadowrocket){
    pluginDesc = (pluginDesc[0] || '') && `${pluginDesc.join("\n")}`;
    
    if (pluginDesc !="" && pluginDesc.search(/#! *name *=/) != -1){
        pluginDesc = pluginDesc;
    }else{
        pluginDesc = npluginDesc;
    };
    General = (General[0] || '') && `[General]\n\n${General.join("\n\n")}`;
    
    Panel = (Panel[0] || '') && `[Panel]\n\n${Panel.join("\n\n")}`;
    
    rules = (rules[0] || '') && `[Rule]\n\n${rules.join("\n")}`;
    
	script = (script[0] || '') && `[Script]\n\n${script.join("\n\n")}`;
	
	HeaderRewrite = (HeaderRewrite[0] || '') && `[Header Rewrite]\n\n${HeaderRewrite.join("\n")}`;
	
	URLRewrite = (URLRewrite[0] || '') && `[URL Rewrite]\n\n${URLRewrite.join("\n")}`;
	
	MapLocal = (MapLocal[0] || '') && `[Map Local]\n\n${MapLocal.join("\n\n")}`;
	
	others = (others[0] || '') && `${others.join("\n\n")}`;

body = `${pluginDesc}


${General}


${Panel}


${rules}


${HeaderRewrite}


${URLRewrite}


${script}


${MapLocal}


${MITM}`
		.replace(/(#.+\n)\n+(?!\[)/g,'$1')
		.replace(/\n{2,}/g,'\n\n')
}


if (isStashiOS || isSurgeiOS) {
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
