# stash
欢迎加入群组https://t.me/zhangpeifu

欢迎加入频道https://t.me/h5683577

重写转换覆写链接https://t.me/h5683577/126

说明:

如何使用:在qx重写链接末尾加qx.stoverride  在surge模块链接末尾加sg.stoverride

如何修改覆写名&简介:qx.stoverride?n=名字&d=简介 当缺省n=时仅修改简介，当缺省d=时同时修改名字和简介，surge模块同理

不支持转换哪些类型:qx的(request|response)-header(支持部分，有需要可以在群里反馈) echo-response(此类型Stash无法实现)

surge的Rule(仅支持转换URL-REGEX为reject)以及一系列不是重写的内容，如[General]等字段

关于需要开启binary-mode的脚本说明:

因为qx对此类脚本没有特殊标记，仅能靠脚本名判断，如Maasea佬的YouTube去广告脚本没有以proto.js结尾，故转换后不会正确识别并开启

surge的可以正确识别并开启
