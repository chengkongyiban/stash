# 重写&规则集转换
欢迎加入群组https://t.me/zhangpeifu

欢迎订阅频道https://t.me/h5683577

## 安装地址:
   Surge LanceX Egern: [点击查看](https://raw.githubusercontent.com/chengkongyiban/Surge/main/modules/QX_to_Surge.sgmodule)  
   Shadowrocket: [点击查看](https://raw.githubusercontent.com/chengkongyiban/shadowrocket/main/Block/QX_to_Shadowrocket.module)  
   Loon: [点击查看](https://raw.githubusercontent.com/chengkongyiban/Loon/main/Loon-Gallery/Rewrite_to_Loon.plugin)  
   Stash: [点击查看](https://raw.githubusercontent.com/chengkongyiban/stash/main/override_Store/Rewrite_to_Stash.stoverride)  
  
## 简介

支持将QX重写解析至Surge Shadowrocket Loon Stash  
  
支持将Surge模块解析至Shadowrock(仅转换Mock为reject，Header Rewrite类型小火箭不支持) Loon Stash  
  
支持5款代理app规则集互转(不支持转换 域名集 & IP-CIDR集)  
  

## 如何使用:  
   ☆仅MITM了Github及Gitlab主机名，如需转换其他托管网址的资源请自行手动添加主机名。  
### 重写转换  
   Stash: 在QX重写链接末尾加qx.stoverride  在Surge模块链接末尾加sg.stoverride  
  
   Surge LanceX: 在QX重写链接末尾加qx  
  
   Shadowrock Loon: 在QX重写链接末尾加qx  在Surge模块链接末尾加sg (Shadowrocket兼容大部分Surge模块，仅在模块中有[Map Local]字段时需要使用转换)  
  
### 规则集转换  
   在规则集链接末尾加r_parser.list  

## 参数说明：  
### 重写转换(Surge转至Shadowrocket不支持使用参数)  
   **n=**  修改名字+简介 ，名字和简介以"+"相连，可缺省名字或简介  
   **y=**  根据关键词保留重写(即去掉注释) 多关键词以"+"分隔  
   **x=**  根据关键词排除重写(即添加注释) 多关键词以"+"分隔  
   **i=**  关闭随机插件图标(仅需传入i=即可 仅Loon需要此参数)  
   **del=** 从转换结果中剔除被注释的重写(仅需传入del=即可)  
   **hnadd=** 添加MITM主机名 多主机名以","分隔  
   **hndel=** 从已有MITM主机名中删除主机名 多主机名以","分隔(需要传入完整主机名)  
   **jsc=**  根据关键词为脚本启用脚本转换(多关键词以"+"分隔，主要用途 将使用了QX独有api的脚本转换为通用脚本，**谨慎开启，大部分脚本本身就通用，无差别启用，只会徒增功耗**)  

   在链接后加 "?" 使用参数, 不同参数用 "&" 连接  

   示例 https://raw.githubusercontent.com/chengkongyiban/shadowrocket/main/Block/bilibili.modulesg.stoverride?n=B站去广告+bilibili&y=魔改皮肤+Region&x=upos+简体字幕  

### 规则集转换  
   **y=**  根据关键词保留规则(即去掉注释) 多关键词以"+"分隔  
   **x=**  根据关键词排除规则(即添加注释) 多关键词以"+"分隔  
   **nore=**  为IP规则开启不解析域名(即no-resolve,仅需传入nore=)  

   示例 https://raw.githubusercontent.com/fmz200/wool_scripts/main/QuantumultX/filter/fenliu.listr_parser.list?x=baidu+jd&nore=  

## 关于需要开启binary-mode的脚本说明:  
   因为qx重写中对此类脚本没有特殊标记，仅能靠脚本名判断，如Maasea佬的YouTube去广告脚本没有以proto.js结尾，故转换后不会正确识别并开启  
   surge模块里的此类脚本可以正确识别并开启  

## 鸣谢  
原脚本作者@小白脸  
脚本修改[*@chengkongyiban*](https://github.com/chengkongyiban)  
大量借鉴[*@KOP-XIAO*](https://github.com/KOP-XIAO)佬的[resource-parser.js](https://github.com/KOP-XIAO/QuantumultX/raw/master/Scripts/resource-parser.js)  
感谢[*@xream*](https://github.com/xream) 佬提供的[replace-header.js](https://github.com/xream/scripts/raw/main/surge/modules/replace-header/index.js)，[echo-response.js](https://github.com/xream/scripts/raw/main/surge/modules/echo-response/index.js)，[script-converter.js](https://raw.githubusercontent.com/xream/scripts/main/surge/modules/script-converter/script-converter.js)  
感谢[*@mieqq*](https://github.com/mieqq) 佬提供的[replace-body.js](https://github.com/mieqq/mieqq/raw/master/replace-body.js)  
插件图标用的 [*@Keikinn*](https://github.com/Keikinn) 佬的 [StickerOnScreen](https://github.com/KeiKinn/StickerOnScreen)项目，感谢  
