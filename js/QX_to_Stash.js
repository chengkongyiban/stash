/*************
#!author= @小白脸
*************/
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
let jsLink = [];     //待查重脚本链接
let providers = [];  //已查重脚本链接
let others = [];     //不支持的内容
let MapLocal = [];
let MITM = "";


body.forEach((x, y, z) => {
	let type = x.match(
		/script-|enabled=|url\x20reject|echo-response|\-header|hostname|url\x20(302|307)|\x20(request|response)-body/
	)?.[0];
	if (type) {
		switch (type) {
			case "script-":
			if (x.match('script-echo-response')) {throw '脚本不支持通用'}
				z[y - 1]?.match("#") && script.push(z[y - 1]);
				let proto = x.match('proto.js') ? '&6;binary-mode: true' : '';
				let rebody = x.match('script-(request|response)-body') ? '&6;require-body: true&6;max-size: 3145728' : '';
				let analyze = x.match('analyze-echo') ? '&6;require-body: true&6;max-size: 3145728' : '';
				script.push(
					x.replace(
						/(\#|\;|\/\/)?(\^?http[^\s]+)\x20url\x20script-(response|request|analyze)[^\s]+\x20(http.+\/(.+)\.js)/,
						`    - match: $2&6;name: $5&6;type: $3&6;timeout: 30${rebody}${proto}${analyze}`
					),
				);
				jsLink.push(
					x.replace(
						/(\#|\;|\/\/)?(\^?http[^\s]+)\x20url\x20script-(response|request|analyze)[^\s]+\x20(http.+\/(.+)\.js)/,
						`  $5:&4;url: $4&4;interval: 86400\n`
					),
				);
				break;

			case "enabled=":
				z[y - 1]?.match("#") && cron.push(z[y - 1]);
				cron.push(
					x.replace(
						/(\#|\;|\/\/)?(.+\*)\x20([^\,]+).+?\=([^\,]+).+/,
						`    - name: $4&6;cron: "$2"&6;timeout: 60`,
					),
				);
				jsLink.push(
					x.replace(
						/(\#|\;|\/\/)?(.+\*)\x20([^\,]+).+?\=([^\,]+).+/,
						`  $4:&4;url: $3&4;interval: 86400\n`
					),
				);
				break;

			case "url\x20reject":
				let jct = x.match(/reject?[^\s]+/)[0];
				let url = x.match(/\^?http[^\s]+/)?.[0];

				z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
				URLRewrite.push(x.replace(/(.*?)\x20url\x20(reject-200|reject-img|reject-dict|reject-array|reject)/, "    - $1 - $2"));
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

			case "echo-response":
				z[y - 1]?.match("#") && MapLocal.push(z[y - 1]);
				MapLocal.push(x.replace(/(\^?http[^\s]+).+(http.+)/, '$1 data="$2"'));
				break;
			case "hostname":
				MITM = x.replace(/hostname\x20?=(.*)/, `&2;mitm:\n&hostname;"$1"`);
				break;
			default:
				if (type.match("url ")) {
					z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
					URLRewrite.push(x.replace(/(\^?http[^\s]+).+(302|307).+(http.+)/, "    - $1 $3 $2"));
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

function unique (jsLink) {
  return Array.from(new Set(jsLink))
}

providers.push(
	(unique(jsLink))
	);

script = (script[0] || '') && `  script:\n${script.join("\n")}`;

providers = (providers[0] || '') && `script-providers:\n${providers.join("\n")}`.replace(/,/g,'');

cron = (cron[0] || '') && `cron:\n  script:\n${cron.join("\n")}`;

URLRewrite = (URLRewrite[0] || '') && `  rewrite:\n${URLRewrite.join("\n")}`;

/********
HeaderRewrite = (HeaderRewrite[0] || '') && `[Header Rewrite]\n${HeaderRewrite.join("\n")}`;

MapLocal = (MapLocal[0] || '') && `[MapLocal]\n${MapLocal.join("\n")}`;
********/


MITM = MITM.replace(/\x20/g,'')
           .replace(/\,/g,'"\n    - "')
		   .replace(/\&2;/g,'  ')
		   .replace(/\&hostname;/g,'    - ')

body = `${name}
${desc}

http:
${URLRewrite}

${script}

${MITM}

${cron}

${providers}`
        .replace(/&6;/g,'\n      ')
		.replace(/&4;/g,'\n    ')
        .replace(/\;/g,'#')
		.replace(/\n{2,}/g,'\n\n')
		.replace(/type: analyze/g,'type: request')



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