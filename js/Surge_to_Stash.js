/****************************

说明
   t&6; = \n六个空格
   t&4; = \n四个空格
   t&2; = 两个空格
   t&hn; = 四个空格 - 一个空格
   t&zd; = {  , }  花括号中的逗号

***************************/
let req = $request.url.replace(/sg.stoverride$/,'')
let name = 'name: ' + req.match(/.+\/(.+)\.(sgmodule|module)/)?.[1] || '无名';
let desc = 'desc: ' + req.match(/.+\/(.+)\.(sgmodule|module)/)?.[1] || '无名';
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
		/http-re|cronexp|\x20-\x20reject|\x20data=|\-header|hostname|\x20(302|307)|\x20(request|response)-body/
	)?.[0];
	if (type) {
		switch (type) {
			case "http-re":
			//if (x.match('script-echo-response')) {throw '脚本不支持通用'}
	x = x.replace(/\x20/gi,'').replace(/(\{.*?)\,(.*?\})/gi,'$1t&zd;$2');
				z[y - 1]?.match("#") && script.push(z[y - 1]);
				let proto = x.match('binary-body-mode=(true|1)') ? 't&6;binary-mode: true' : '';
				let rebody = x.match('requires-body=(true|1)') ? 't&6;require-body: truet&6;max-size: 3145728' : '';
				
				let ptn = x.replace(/\s/gi,"").split("pattern=")[1].split(",")[0]
				
				ptn = ptn.replace(/\"/gi,'');
				
				let js = x.replace(/\s/gi,"").split("script-path=")[1].split(",")[0]
				
				script.push(
					x.replace(
						/(\#|\;|\/\/)?([^\s]+)=type=http-(response|request)[^\s]+/,
						`    - match: ${ptn}t&6;name: $2_${y}t&6;type: $3t&6;timeout: 30${rebody}${proto}`
					),
				);
				providers.push(
					x.replace(
						/(\#|\;|\/\/)?([^\s]+)=type=http-(response|request)[^\s]+/,
						`  $2_${y}:t&4;url: ${js}t&4;interval: 86400`
					),
				);
				break;

			case "cronexp":
				
				let croName = x.split("type")[0].replace(/\x20/gi,"").split("=")[0].replace(/(\#|\;|\/\/)/,'')
				
				let cronJs = x.split("script-path=")[1].split(",")[0].replace(/\x20/gi,"")
				
				let cronExp = x.replace(/.+cronexpr?=(.+\x20.+?),.+/,"$1")
				
				
				cron.push(
					x.replace(
						/(\#|\;|\/\/)?.+cronexp.+/,
						`    - name: ${croName}t&6;cron: "${cronExp}"t&6;timeout: 60`,
					),
				);
				providers.push(
					x.replace(
						/(\#|\;|\/\/)?.+cronexp.+/,
						`  ${croName}:t&4;url: ${cronJs}t&4;interval: 86400`
					),
				);
				break;

			case "\x20-\x20reject":
				let jct = x.match(/reject?[^\s]+/)[0];
				let url = x.match(/\^?http[^\s]+/)?.[0];

				z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
				URLRewrite.push(x.replace(/(.+?)\x20-\x20(reject-200|reject-img|reject-dict|reject-array|reject)/, "    - $1 - $2"));
				break;

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


//Mock转reject
			case " data=":
				z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
				//let mock2Reject = x.replace(/.+(dict|array|200|img|png|gif).+/g,"-$1")
				
				let mock2Dict = x.match('dict') ? '-dict' : '';
				let mock2Array = x.match('array') ? '-array' : '';
				let mock2200 = x.match('200') ? '-200' : '';
				let mock2Img = x.match('(img|png|gif)') ? '-img' : '';
				
				URLRewrite.push(
					x.replace(
						/(\#|\;|\/\/)?(.+)data=.+/,
						`    - $2- reject${mock2Dict}${mock2Array}${mock2200}${mock2Img}`
					),
				);
				
				
				break;
			case "hostname":
			x = x.replace(/\x20/gi,'');
				MITM = x.replace(/hostname=%.+%(.*)/, `t&2;mitm:\nt&hn;"$1"`);
				break;
			default:
				if (type.match(" (302|307)")) {
					z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
					URLRewrite.push(x.replace(/(.+?)\x20(.+?)\x20(302|307)/, "    - $1 $2 $3"));
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


MITM = MITM.replace(/t&2;/g,'  ')
           .replace(/t&hn;/g,'    - ')
           .replace(/\,/g,'"\n    - "')

body = `${name}
${desc}

http:
${URLRewrite}

${script}

${MITM}

${cron}

${providers}`
        .replace(/t&6;/g,'\n      ')
		.replace(/t&4;/g,'\n    ')
		.replace(/t&zd;/g,',')
        .replace(/\;/g,'#')
		.replace(/\n{2,}/g,'\n\n')
		.replace(/"{2,}/g,'"')
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