let req = $request.url.replace(/qx$/,'')
let name = 'name: ' + req.match(/.+\/(.+)\.(conf|js|snippet|txt)/)?.[1] || '无名';
let desc = 'desc: ' + req.match(/.+\/(.+)\.(conf|js|snippet|txt)/)?.[1] || '无名';
!(async () => {
  let body = await http(req);

	body = body.match(/[^\n]+/g);
	
let script = [];
let URLRewrite = [];
let HeaderRewrite = [];
let providers = [];
let MapLocal = [];
let MITM = "";

body.forEach((x, y, z) => {
	let type = x.match(
		/script-|enabled=|reject|echo-response|\-header|hostname|url\x20(302|307)|\x20(request|response)-body/
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
						/(\^?http[^\s]+)\x20url\x20script-(response|request|analyze)[^\s]+\x20(http.+\/(.+)\.js)/,
						`    - match: $1&6;name: $4&6;type: $2&6;timeout: 30${rebody}${proto}${analyze}`
					),
				);
				providers.push(
					x.replace(
						/(\^?http[^\s]+)\x20url\x20script-(response|request|analyze)[^\s]+\x20(http.+\/(.+)\.js)/,
						`  $4:&4;url: $3&4;interval: 86400`
					),
				);
				break;

			case "enabled=":
				z[y - 1]?.match("#") && script.push(z[y - 1]);
				script.push(
					x.replace(
						/(.+\*)\x20([^\,]+).+?\=([^\,]+).+/,
						`$3 = type=cron,script-path=$2,timeout=60,cronexp=$1,wake-system=1`,
					),
				);
				break;

			case "reject":
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
				MITM = x.replace(/hostname\x20?=(.*)/, `&2;mitm:\n&host;"$1"`);
				break;
			default:
				if (type.match("url ")) {
					z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
					URLRewrite.push(x.replace(/(\^?http[^\s]+).+(302|307).+(http.+)/, "    - $1 $3 $2"));
				} else {
					z[y - 1]?.match("#") && script.push(z[y - 1]);
					script.push(
						x.replace(
							/([^\s]+)\x20url\x20(response|request)-body\x20(.+)\2-body(.+)/,
							`test = type=$2,pattern=$1,requires-body=1,script-path=https://raw.githubusercontent.com/mieqq/mieqq/master/replace-body.js, argument=$3->$4`,
						),
					);
				}
		} //switch结束
	}
}); //循环结束

script = (script[0] || '') && `  script:\n${script.join("\n")}`;

providers = (providers[0] || '') && `script-providers:\n${providers.join("\n")}`;

URLRewrite = (URLRewrite[0] || '') && `  rewrite:\n${URLRewrite.join("\n")}`;

HeaderRewrite = (HeaderRewrite[0] || '') && `[Header Rewrite]\n${HeaderRewrite.join("\n")}`;

MapLocal = (MapLocal[0] || '') && `[MapLocal]\n${MapLocal.join("\n")}`;

MITM = MITM.replace(/\x20/g,'')
           .replace(/\,/g,'"\n    - "')
		   .replace(/\&2;/g,'  ')
		   .replace(/\&host;/g,'    - ')

body = `${name}
${desc}

http:
${URLRewrite}
${script}
${MITM}
${providers}`
        .replace(/&6;/g,'\n      ')
		.replace(/&4;/g,'\n    ')
        .replace(/(\;|\/\/)/g,'#')
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
