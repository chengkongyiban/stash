//记录script hub曾经用到过的缓存js片段

var noCache = istrue(queryObject.nocache) ?? true;

var cachExp = queryObject.cachexp != undefined ? queryObject.cachexp : null;

//缓存有效期相关
var currentTime = new Date();
var seconds = Math.floor(currentTime.getTime() / 1000); // 将毫秒转换为秒
var boxjsSetExp = $.getval("Parser_cache_exp") ?? "1";
//设置有效期时间
var expirationTime
if (cachExp != null){
  expirationTime = cachExp * 1 * 60 * 60;
}else{
  expirationTime = boxjsSetExp * 1 * 60 * 60;
};
//$.log(expirationTime);
var nCache = [{"url":"","body":"","time":""}];
var oCache = $.getval("parser_cache");
//检查是否有缓存
if (oCache != "" && oCache != null){
  oCache = $.toObj(oCache);
}else{oCache = null;};





  let body

  if (noCache == true){
	body = (await $.http.get(req)).body;
}else if (oCache == null){
    //$.log("一个缓存也没有")
  body = (await $.http.get(req)).body;
  //$.log('body:' + body.length + '个字符');
  nCache[0].url = req;
  nCache[0].body = body;
  nCache[0].time = seconds;
  $.setjson(nCache, 'parser_cache');
  }else{
    //删除大于一天的缓存防止缓存越来越大
    oCache = oCache.filter(obj => {
  return seconds - obj.time < 86400 ;
});
$.setjson(oCache, 'parser_cache');

 if (!oCache.some(obj => obj.url === req)){
     //$.log("有缓存但是没有这个URL的")
  body = (await $.http.get(req)).body;
  //$.log('body:' + body.length + '个字符');
  nCache[0].url = req;
  nCache[0].body = body;
  nCache[0].time = seconds;
  var mergedCache = oCache.concat(nCache);
$.setjson(mergedCache, 'parser_cache');
  }else if (oCache.some(obj => obj.url === req)){
    const objIndex = oCache.findIndex(obj => obj.url === req);
    if (seconds - oCache[objIndex].time > expirationTime){
      //$.log("有缓存且有url,但是过期了")
  body = (await $.http.get(req)).body;
  //$.log('body:' + body.length + '个字符');
  oCache[objIndex].body = body;
  oCache[objIndex].time = seconds;
$.setjson(oCache, 'parser_cache');
    }else{
      //$.log("有缓存且有url且没过期")
    if (oCache[objIndex].body == null || oCache[objIndex].body == ""){
        //$.log("但是body为null")
        body = (await $.http.get(req)).body;
  //$.log('body:' + body.length + '个字符');
        oCache[objIndex].body = body;
        oCache[objIndex].time = seconds;        $.setjson(oCache, "parser_cache");
    }else{
        //$.log("获取到缓存body")
        body = oCache[objIndex].body;
    }
      };
  };
};
