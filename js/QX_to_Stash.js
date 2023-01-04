/****************************
脚本修改自@小白脸
说明
   ${noteKn6} = \n#?六个空格
   ${noteKn4} = \n#?四个空格
   t&2; = 两个空格
   t&hn; = 四个空格 - 一个空格
   t&zd; = {  , }  花括号中的逗号

***************************/
var name = "";
var desc = "";

let req = $request.url.replace(/(\?.+?)?qx.stoverride$/,'')

if ($request.url.match(/\?.+?qx.stoverride$/)){
	name = 'name: ' + $request.url.match(/\?n=(.+)&d=.+qx.stoverride/)?.[1];
    desc = 'desc: ' + $request.url.match(/\?n=.+&d=(.+)qx.stoverride/)?.[1];
}else{
	name = 'name: ' + req.match(/.+\/(.+)\.(conf|js|snippet|txt)/)?.[1] || '无名';
    desc = 'desc: ' + req.match(/.+\/(.+)\.(conf|js|snippet|txt)/)?.[1] || '无名';
}




/*备份
let req = $request.url.replace(/qx.stoverride$/,'')


let name = 'name: ' + req.match(/.+\/(.+)\.(conf|js|snippet|txt)/)?.[1] || '无名';


let desc = 'desc: ' + req.match(/.+\/(.+)\.(conf|js|snippet|txt)/)?.[1] || '无名';

*/

!(async () => {
  let body = await http(req);

	body = body.match(/[^\n]+/g);
let script = [];
let URLRewrite = [];
let HeaderRewrite = [];
let cron = []; 
let providers = [];  
let others = [];     //不支持的内容
let MapLocal = [];
let MITM = "";


body.forEach((x, y, z) => {
	x = x.replace(/^(#|;|\/\/)/gi,'#');
	let type = x.match(
		/\x20url\x20script-|enabled=|\x20url\x20reject|\x20echo-response|\-header|^hostname| url 30|\x20(request|response)-body/
	)?.[0];
	
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
				z[y - 1]?.match("#") && script.push(z[y - 1]);
				
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
				z[y - 1]?.match("#") && cron.push(z[y - 1]);
				
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

				z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
				URLRewrite.push(x.replace(/(#)?(.*?)\x20url\x20(reject-200|reject-img|reject-dict|reject-array|reject)/, `${noteK4}- $2 - $3`));
				break;
				
//不懂如何转换，暂时放弃				
			case "-header":
			if (x.match(/\(\\r\\n\)/g).length === 2){			
				z[y - 1]?.match("#") &&  others.push(z[y - 1]);
let op = x.match(/\x20response-header/) ?
'http-response ' : '';
     if(x.match(/\$1\$2/)){
		  others.push(x.replace(/(\^?http[^\s]+).+?n\)([^\:]+).+/,`${op}$1 header-del $2`))	
		}else{
				others.push(
					x.replace(
						/(\^?http[^\s]+)[^\)]+\)([^:]+):([^\(]+).+\$1\x20?\2?\:?([^\$]+)?\$2/,
						`${op}$1 header-replace-regex $2 $3 $4''`,
					),
				);
				}
				}else{
					
				}
				break;
//stash不支持
			case " echo-response":
				z[y - 1]?.match("#") && MapLocal.push(z[y - 1]);
				MapLocal.push(x.replace(/(\^?http[^\s]+).+(http.+)/, '$1 data="$2"'));
				break;
				
//mitm		
			case "hostname":
				MITM = x.replace(/,$/,'').replace(/hostname\x20?=(.*)/, `t&2;mitm:\nt&hn;"$1"`);
				break;
				
//302/307				
			case " url 30":
				z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
					URLRewrite.push(x.replace(/(#)?(.*?)\x20url\x20(302|307)\x20(.+)/, `${noteK4}- $2 $4 $3`));
				break;

				
			default:
					z[y - 1]?.match("#") && script.push(z[y - 1]);
					script.push(
						x.replace(
							/(#)?([^\s]+)\x20url\x20(response|request)-body\x20(.+)\3-body(.+)/,
							`${noteK4}- match: $2${noteKn6}name: replace-body_${y}${noteKn6}type: $3${noteKn6}timeout: 30${noteKn6}require-body: true${noteKn6}max-size: 3145728${noteKn6}argument: >-${noteKn8}$4>$5`,
						),
					);
					providers.push(
						x.replace(
							/(#)?([^\s]+)\x20url\x20(response|request)-body\x20(.+)\3-body(.+)/,
							`${noteK2}replace-body_${y}:${noteKn4}url: https://raw.githubusercontent.com/mieqq/mieqq/master/replace-body.js
${noteKn4}interval: 86400`,
						),
					);


				
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

URLRewrite = (URLRewrite[0] || '') && `  rewrite:\n${URLRewrite.join("\n\n")}`;

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
		.replace(/#      \n/gi,'\n')
		.replace(/script-providers:\n+$/g,'')
		.replace(/\n{2,}/g,'\n\n')



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