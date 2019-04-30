# 预报预警

## 停水通知

配合 [IFTTT](https://ifttt.com/) Applets [邮件通知](https://ifttt.com/applets/SEvmDVKY-) 使用实现自动通知效果.

<Route name="杭州市" author="znhocn" example="/tingshuitz/hangzhou" path="/tingshuitz/hangzhou"/>

<Route name="萧山区" author="znhocn" example="/tingshuitz/xiaoshan" path="/tingshuitz/xiaoshan"/>

<Route name="大连市" author="DIYgod" example="/tingshuitz/dalian" path="/tingshuitz/dalian"/>

<Route name="广州市" author="xyqfer" example="/tingshuitz/guangzhou" path="/tingshuitz/guangzhou"/>

<Route name="东莞市" author="victoriqueko" example="/tingshuitz/dongguan" path="/tingshuitz/dongguan"/>

<Route name="西安市" author="ciaranchen" example="/tingshuitz/xian" path="/tingshuitz/xian"/>

<Route name="阳江市" author="ciaranchen" example="/tingshuitz/yangjiang" path="/tingshuitz/yangjiang"/>

<Route name="南京市" author="ocleo1" example="/tingshuitz/nanjing" path="/tingshuitz/nanjing"/>

## 停电通知

获取未来一天的停电通知

<Route name="国家电网" author="xyqfer" example="/tingdiantz/95598/36401/36101" path="/tingdiantz/95598/:orgNo/:provinceNo/:scope?" :paramsDesc="['所属省供电公司编码', '所属地市供电公司编码', '停电范围关键字']"/>

> 以上参数可从[查询页面](http://m.95598.cn/95598/woutageNotice/winitOutageNotice)打开控制台抓包获得

<Route name="南京市" author="ocleo1" example="/tingdiantz/nanjing" path="/tingdiantz/nanjing"/>

## 中央气象台

<Route name="全国气象预警" author="ylc395" example="/weatheralarm" path="/weatheralarm">

可通过全局过滤参数订阅您感兴趣的地区.

</Route>

## 中国地震局

<Route name="地震速报" author="LogicJake" example="/earthquake" path="/earthquake/:region?" :paramsDesc="['区域，0全部，1国内（默认），2国外']">

可通过全局过滤参数订阅您感兴趣的地区.

</Route>

## 香港天文台

<Route name="Current Weather Report" author="calpa" example="/hko/weather" path="/hko/weather"/>
