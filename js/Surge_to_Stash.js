/****************************

说明
   ${noteKn6} = \n六个空格
   ${noteKn4} = \n四个空格
   t&2; = 两个空格
   t&hn; = 四个空格 - 一个空格
   t&zd; = {  , }  花括号中的逗号

***************************/

let req = $request.url.replace(/sg.stoverride$/,'')
let name = 'name: ' + req.match(/.+\/(.+)\.(sgmodule|module|js)/)?.[1] || '无名';
let desc = 'desc: ' + req.match(/.+\/(.+)\.(sgmodule|module|js)/)?.[1] || '无名';
!(async () => {
  let body = await http(req);

	body = body.match(/[^\n]+/g);
	
let script = [];
let URLRewrite = [];
let cron = [];
let providers = [];
let MITM = "";
let others = [];          //不支持的内容
//let MapLocal = [];
//let HeaderRewrite = [];

body.forEach((x, y, z) => {
	x = x.replace(/^(#|;|\/\/)/gi,'#').replace(/(\{.*?)\,(.*?\})/gi,'$1t&zd;$2');
	let type = x.match(
		/http-re|cronexp|\x20-\x20reject|URL-REGEX|\x20data=|\-header|^hostname| 30(2|7)/
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
			
			if (x.match(/=http-re|= http-re/)) {
	x = x.replace(/\x20/gi,'').replace(/(\{.*?)\,(.*?\})/gi,'$1t&zd;$2');
				z[y - 1]?.match("#") && script.push(z[y - 1]);
				
				let sctype = x.match('http-response') ? 'response' : 'request';
				
				let rebody = x.match('requires-body=(true|1)') ? 'require-body: true' : '';
				
				let size = x.match('requires-body=(true|1)') ? 'max-size: 3145728' : '';
				
				let proto = x.match('binary-body-mode=(true|1)') ? 'binary-mode: true' : '';
				
				let scname = x.replace(/\x20/gi,'').split("=")[0].replace(/#/,'');
				
				let ptn = x.replace(/\s/gi,"").split("pattern=")[1].split(",")[0].replace(/\"/gi,'');
				
				let js = x.replace(/\s/gi,"").split("script-path=")[1].split(",")[0];
				
				let arg = [];
				
				if (x.match("argument")){
			arg = `${noteKn6}argument: >-${noteKn8}` +  x.split("argument=")[1].split(",")[0];
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
					
				if (x.match(/http-(response|request)\x20/)){

//surge4脚本	
				z[y - 1]?.match("#") && script.push(z[y - 1]);
				let proto = x.match('binary-body-mode=(true|1)') ? 'binary-mode: true' : '';
				let rebody = x.match('requires-body=(true|1)') ? 'require-body: true' : '';
				let size = x.match('requires-body=(true|1)') ? 'max-size: 3145728' : '';
				
				let ptn = x.split(" ")[1].replace(/\"/gi,'');
				
				let js = x.replace(/\s/gi,"").split("script-path=")[1].split(",")[0];
				
				let sctype = x.match('http-response') ? 'response' : 'request';
				
				let scname = js.substring(js.lastIndexOf('/') + 1, js.lastIndexOf('.') );
					
				let arg = [];
				
				if (x.match("argument")){
			arg = `${noteKn6}argument: >-${noteKn8}` +  x.split("argument=")[1].split(",")[0];
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
				}else{
					
				}
				}
				break;
//定时任务
			case "cronexp":
			
				let croName = x.split("=")[0].replace(/\x20/gi,"").replace(/#/,'')
				
				let cronJs = x.split("script-path=")[1].split(",")[0].replace(/\x20/gi,"")
				
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
			
				//let jct = x.match(/reject?[^\s]+/)[0];
				//let url = x.match(/\^?http[^\s]+/)?.[0];

				z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
				URLRewrite.push(x.replace(/(#)?(.+?)\x20-\x20(reject-200|reject-img|reject-dict|reject-array|reject)/, `${noteKn4}- $2 - $3`));
				break;

//看不懂
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
					
				}
				break;

				
//URL-REGEX转reject，排除非REJECT类型

			case "URL-REGEX":
			if (x.match(/,REJECT/)){
				z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
				let Urx2Dict = x.match('DICT') ? '-dict' : '';
				let Urx2Array = x.match('ARRAY') ? '-array' : '';
				let Urx2200 = x.match('200') ? '-200' : '';
				let Urx2Img = x.match('(IMG|GIF)') ? '-img' : '';
				
				URLRewrite.push(
					x.replace(/.*URL-REGEX,([^\s]+),.+/,
					`${noteKn4}- $1 - reject${Urx2Dict}${Urx2Array}${Urx2200}${Urx2Img}`)
				);
				}else{
					//console.log('未处理==>' + x);
				}
				
				break;

//Mock统统转reject，其他作用的Mock Stash无法实现

			case " data=":
				z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
				
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
				MITM = x.replace(/hostname=(%.+%)?(.*)/, `t&2;mitm:\nt&hn;"$2"`);
				break;
			default:
//重定向			
				if (type.match(" 30(2|7)")) {
				z[y - 1]?.match("#")  && URLRewrite.push(z[y - 1]);
				
					URLRewrite.push(x.replace(/(#)?(.+?)\x20(.+?)\x20(302|307)/, `${noteKn4}- $2 $3 $4`));
				} else {

//与Stash无关懒得动
/*					
					z[y - 1]?.match("#") && others.push(z[y - 1]);
					others.push(
						x.replace(
							/([^\s]+)\x20url\x20(response|request)-body\x20(.+)\2-body(.+)/,
							`test = type=$2,pattern=$1,requires-body=1,script-path=https://raw.githubusercontent.com/mieqq/mieqq/master/replace-body.js, argument=$3->$4`,
						),
					);
*/

				}
		} //switch结束
	}
}); //循环结束


script = (script[0] || '') && `  script:\n${script.join("\n")}`;

providers = (providers[0] || '') && `script-providers:\n${providers.join("\n")}`;

cron = (cron[0] || '') && `cron:\n  script:\n${cron.join("\n")}`;

URLRewrite = (URLRewrite[0] || '') && `  rewrite:\n${URLRewrite.join("\n")}`;

URLRewrite = URLRewrite.replace(/"/gi,'')
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
		.replace(/t&zd;/g,',')
		.replace(/\n{2,}/g,'\n\n')
		.replace(/"{2,}/g,'"')
		.replace(/script-providers:\n+$/g,'')


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