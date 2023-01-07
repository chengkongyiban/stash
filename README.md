# stash
欢迎加入群组https://t.me/zhangpeifu

欢迎加入频道https://t.me/h5683577

重写转换覆写链接https://t.me/h5683577/126

说明:

如何使用:在qx重写链接末尾加qx.stoverride  在surge模块链接末尾加sg.stoverride

参数说明
   n=  修改覆写名字+简介 ，名字和简介以"+"相连，可缺省名字或简介;
   y=  根据关键词保留相关重写(即去掉注释)
   x=  根据关键词排除相关重写(即添加注释)
   在链接后加 "?" 使用, 不同参数用 "&" 连接 
   示例 https://raw.githubusercontent.com/chengkongyiban/shadowrocket/main/Block/bilibili.modulesg.stoverride?n=B站去广告&y=魔改皮肤+Region&x=upos+简体字幕

不支持转换哪些类型:qx的(request|response)-header(支持部分，有需要可以在群里反馈) echo-response(此类型Stash无法实现)

surge的Rule(仅支持转换URL-REGEX为reject)以及一系列不是重写的内容，如[General]等字段

关于需要开启binary-mode的脚本说明:

因为qx对此类脚本没有特殊标记，仅能靠脚本名判断，如Maasea佬的YouTube去广告脚本没有以proto.js结尾，故转换后不会正确识别并开启

surge的可以正确识别并开启
