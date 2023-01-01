/****************************
#!author= @小白脸
说明
   ${noteK6} = \n六个空格
   ${noteK4} = \n四个空格
   t&2; = 两个空格
   t&hn; = 四个空格 - 一个空格
   t&zd; = {  , }  花括号中的逗号

***************************/


let req = $request.url.replace(/qx.stoverride$/,'')
let name = 'name: ' + req.match(/.+\/(.+)\.(conf|js|snippet|txt)/)?.[1] || '无名';
let desc = 'desc: ' + req.match(/.+\/(.+)\.(conf|js|snippet|txt)/)?.[1] || '无名';
!(async () => {
  let body = await http(req);

	body = body.match(/[^\n]+/g);
	
let script = [];
let URLRewrite = [];
let HeaderRewrite = [];
let cron = [];
//let jsLink = [];     //待查重脚本链接
let providers = [];  //已查重脚本链接
let others = [];     //不支持的内容
let MapLocal = [];
let MITM = "";


body.forEach((x, y, z) => {
	let type = x.match(
		/script-|enabled=|url\x20reject|echo-response|\-header|hostname|url\x20(302|307)|\x20(request|response)-body/
	)?.[0];
	
	//判断注释
	
	if (x.match(/^[^#;/]/)){
	var noteK6 = "\n      ";
	var noteK4 = "\n    ";
	var noteK2 = "  ";
	}else{
	var noteK6 = "\n#      ";
	var noteK4 = "\n#    ";
	var noteK2 = "#  ";
	};
	if (type) {
		switch (type) {
//远程脚本			
			case "script-":
			if (x.match('script-echo-response')) {throw '脚本不支持通用'}
				z[y - 1]?.match("#") && script.push(z[y - 1]);
				
				let sctype = x.match('-response') ? 'response' : 'request';
				
				let rebody = x.match('-body|-analyze') ? 'require-body: true' : '';
				
				let size = x.match('-body|-analyze') ? 'max-size: 3145728' : '';
				
				let proto = x.match('proto.js') ? 'binary-mode: true' : '';
				
				let ptn = x.split(" ")[0].replace(/^(#|;|\/\/)/,'');
				
				let js = x.split(" ")[3];
				
				let scname = js.substring(js.lastIndexOf('/') + 1, js.lastIndexOf('.') );
				
				script.push(
					x.replace(
						/.+script-.+/,
						`${noteK4}- match: ${ptn}${noteK6}name: ${scname}_${y}${noteK6}type: ${sctype}${noteK6}timeout: 30${noteK6}${rebody}${noteK6}${size}${noteK6}${proto}`
					),
				);
				providers.push(
					x.replace(
						/.+script-.+/,
						`${noteK2}${scname}_${y}:${noteK4}url: ${js}${noteK4}interval: 86400`
					),
				);
				break;
				
//定时任务

			case "enabled=":
				z[y - 1]?.match("#") && cron.push(z[y - 1]);
				
				let cronExp = x.split(" http")[0].replace(/[^\s]+ ([^\s]+ [^\s]+ [^\s]+ [^\s]+ [^\s]+)/,'$1').replace(/(#|;|\/\/)/,'');
				
				let cronJs = x.split("//")[1].split(",")[0].replace(/(.+)/,'https://$1');
				
				let croName = x.split("tag=")[1].split(",")[0];
				
				cron.push(
					x.replace(
						/.+enabled=.+/,
						`${noteK4}- name: ${croName}${noteK6}cron: "${cronExp}"${noteK6}timeout: 60`,
					),
				);
				providers.push(
					x.replace(
						/.+enabled.+/,
						`${noteK2}${croName}:${noteK4}url: ${cronJs}${noteK4}interval: 86400`
					),
				);
				break;

//reject

			case "url\x20reject":

				z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
				URLRewrite.push(x.replace(/(#|;|\/\/)?(.*?)\x20url\x20(reject-200|reject-img|reject-dict|reject-array|reject)/, `${noteK4}- $2 - $3`));
				break;
/**********
			case "-header":
			if (x.match(/\(\\r\\n\)/g).length === 2){			
				z[y - 1]?.match("#") &&  HeaderRewrite.push(z[y - 1]);
let op = x.match(/\x20response-header/) ?
'http-response ' : '';
     if(x.match(/\$1\$2/)){
		  HeaderRewrite.push(x.replace(/(\^?http[^\s]+).+?n\)([^\:]+).+/,`${op}$1 header-del $2`))	
		}else{
				HeaderRewrite.push(
					x.replace(
						/(\^?http[^\s]+)[^\)]+\)([^:]+):([^\(]+).+\$1\x20?\2?\:?([^\$]+)?\$2/,
						`${op}$1 header-replace-regex $2 $3 $4''`,
					),
				);
				}
				}else{
	$notification.post('不支持这条规则转换,已跳过','',`${x}`);
				}
				break;

			case "echo-response":
				z[y - 1]?.match("#") && MapLocal.push(z[y - 1]);
				MapLocal.push(x.replace(/(\^?http[^\s]+).+(http.+)/, '$1 data="$2"'));
				break;
				
**********************/				
			case "hostname":
				MITM = x.replace(/hostname\x20?=(.*)/, `t&2;mitm:\nt&hn;"$1"`);
				break;
			default:
				if (type.match("url ")) {
					z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
					URLRewrite.push(x.replace(/(#|;|\/\/)?(.*?)\x20url\x20(302|307)\x20(.+)/, `${noteK4}- $2 $4 $3`));
				} else {
					
					z[y - 1]?.match("#") && others.push(z[y - 1]);
					others.push(
						x.replace(
							/([^\s]+)\x20url\x20(response|request)-body\x20(.+)\2-body(.+)/,
							`test = type=$2,pattern=$1,requires-body=1,script-path=https://raw.githubusercontent.com/mieqq/mieqq/master/replace-body.js, argument=$3->$4`,
						),
					);


				}
		} //switch结束
	}
}); //循环结束

/*****
此处为脚本链接查重，现采用唯一性标识符
function unique (jsLink) {
  return Array.from(new Set(jsLink))
}

providers.push(
	(unique(jsLink))
	);
*****/

script = (script[0] || '') && `  script:\n${script.join("\n")}`;

providers = (providers[0] || '') && `script-providers:\n${providers.join("\n")}`;

cron = (cron[0] || '') && `cron:\n  script:\n${cron.join("\n")}`;

URLRewrite = (URLRewrite[0] || '') && `  rewrite:\n${URLRewrite.join("\n")}`;

/********
HeaderRewrite = (HeaderRewrite[0] || '') && `[Header Rewrite]\n${HeaderRewrite.join("\n")}`;

MapLocal = (MapLocal[0] || '') && `[MapLocal]\n${MapLocal.join("\n")}`;
********/


MITM = MITM.replace(/\x20/g,'')
           .replace(/\,/g,'"\n    - "')
		   .replace(/t&2;/g,'  ')
		   .replace(/t&hn;/g,'    - ')

body = `${name}
${desc}

http:
${URLRewrite}

${script}

${MITM}

${cron}

${providers}`
		.replace(/\n{2,}/g,'\n\n')
		.replace(/script-providers:\n+$/g,'')



 $done({ response: { status: 200 ,body:body } });

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