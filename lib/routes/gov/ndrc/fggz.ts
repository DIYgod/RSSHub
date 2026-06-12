import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/fggz/:category{.+}?',
    name: '发展改革工作',
    example: '/gov/ndrc/fggz',
    parameters: { category: '分类，见下表，默认为全部' },
    maintainers: ['nczitzk'],
    categories: ['government'],
    handler,
    description: `::: details 全部分类

#### 机关办公

| 业务工作  | 学思践悟  |
| --------- | --------- |
| jgbg/ywgz | jgbg/xsjw |

#### 发改政研

| 经济数据概览 | 社会关切回应 | 新媒体解读 |
| ------------ | ------------ | ---------- |
| fgzy/jjsjgl  | fgzy/shgqhy  | fgzy/xmtjd |

#### 发展战略和规划

| 国家发展战略和规划 | 国家级专项规划 | 地方发展规划  | 发展规划工作  |
| ------------------ | -------------- | ------------- | ------------- |
| fzzlgh/gjfzgh      | fzzlgh/gjjzxgh | fzzlgh/dffzgh | fzzlgh/fzgggz |

#### 发改综合

| 国内经济监测 | 工业经济         | 投资运行         | 市场消费         |
| ------------ | ---------------- | ---------------- | ---------------- |
| fgzh/gnjjjc  | fgzh/gnjjjc/gyjj | fgzh/gnjjjc/tzyx | fgzh/gnjjjc/scxf |

| 价格情况         | 财政收支         | 货币金融         | 就业情况         |
| ---------------- | ---------------- | ---------------- | ---------------- |
| fgzh/gnjjjc/jgqk | fgzh/gnjjjc/czsz | fgzh/gnjjjc/hbjr | fgzh/gnjjjc/jyqk |

| 地区经济         | 国际经济监测 | 先行指数         | 大宗商品市场情况     |
| ---------------- | ------------ | ---------------- | -------------------- |
| fgzh/gnjjjc/dqjj | fgzh/gjjjjc  | fgzh/gjjjjc/xxzs | fgzh/gjjjjc/dzspscqk |

| 国别分析         | 国际组织预测和研究动态 | 国际组织预测            | 国际组织研究动态          |
| ---------------- | ---------------------- | ----------------------- | ------------------------- |
| fgzh/gjjjjc/gbfx | fgzh/gjzzychyjdt       | fgzh/gjzzychyjdt/gjzzyc | fgzh/gjzzychyjdt/gjzzyjdt |

#### 经济运行与调节

| 宏观经济运行  | 地方经济运行  | 煤电油气运   | 现代物流    |
| ------------- | ------------- | ------------ | ----------- |
| jjyxtj/hgjjyx | jjyxtj/dfjjyx | jjyxtj/mdyqy | jjyxtj/xdwl |

#### 体制改革

| 改革快讯  | 半月改革动态 | 地方改革经验 |
| --------- | ------------ | ------------ |
| tzgg/ggkx | tzgg/byggdt  | tzgg/dfggjx  |

#### 固定资产投资

| 投资法规与政策动态 |
| ------------------ |
| gdzctz/tzfg        |

#### 利用外资和境外投资

| 境外投资    | 外商投资    | 外债管理    | 政策法规    |
| ----------- | ----------- | ----------- | ----------- |
| lywzjw/jwtz | lywzjw/wstz | lywzjw/wzgl | lywzjw/zcfg |

#### 地区经济

| 重大战略  | 四大板块  | 国土海洋流域新区 |
| --------- | --------- | ---------------- |
| dqjj/zdzl | dqjj/sdbk | dqjj/qt          |

#### 地区振兴

| 巩固拓展脱贫攻坚成果和欠发达地区振兴发展 | 对口支援与合作 | 革命老区振兴发展 | 生态退化地区治理 |
| ---------------------------------------- | -------------- | ---------------- | ---------------- |
| dqzx/tpgjypkfq                           | dqzx/dkzyyhz   | dqzx/gglqzxfz    | dqzx/stthdqzl    |

#### 区域开放

| 信息集萃  |
| --------- |
| qykf/xxjc |

#### 农业农村经济

| 重点建设    | 投资指南    | 乡村振兴    | 农经信息    |
| ----------- | ----------- | ----------- | ----------- |
| nyncjj/zdjs | nyncjj/tzzn | nyncjj/xczx | nyncjj/njxx |

#### 基础设施发展

| 政策规划    | 城轨监管    | 重大工程    | 问题研究    |
| ----------- | ----------- | ----------- | ----------- |
| zcssfz/zcgh | zcssfz/cgjg | zcssfz/zdgc | zcssfz/wtyj |

#### 产业发展

| 制造业发展 | 服务业发展 |
| ---------- | ---------- |
| cyfz/zcyfz | cyfz/fwyfz |

#### 创新和高技术发展

| 地方进展      |
| ------------- |
| cxhgjsfz/dfjz |

#### 环境与资源

| 碳达峰碳中和 | 生态文明建设 | 节能和能效  | 资源利用和循环经济 |
| ------------ | ------------ | ----------- | ------------------ |
| hjyzy/tdftzh | hjyzy/stwmjs | hjyzy/jnhnx | hjyzy/zyzhlyhxhjj  |

#### 就业与收入

| 就业收入社保消费 | 地方经验   |
| ---------------- | ---------- |
| jyysr/jysrsbxf   | jyysr/dfjx |

#### 经济贸易

| 重要商品情况 | 对外经贸及政策分析 | 流通业发展 |
| ------------ | ------------------ | ---------- |
| jjmy/zyspqk  | jjmy/dwjmjzcfx     | jjmy/ltyfz |

#### 财金信用

| 工作动态    |
| ----------- |
| cjxy/gzdt03 |

#### 价格管理

| 地方工作  |
| --------- |
| jggl/dfgz |

#### 发改法规

| 地方信息  |
| --------- |
| fgfg/dfxx |

#### 国际合作

| 世经动态  |
| --------- |
| gjhz/zywj |

#### 干部之家

| 系统风采  | 人才招聘  | 委属工作  | 学习园地  |
| --------- | --------- | --------- | --------- |
| gbzj/xtfc | gbzj/rczp | gbzj/wsgz | gbzj/xxyd |

#### 评估督导

| 评督动态  | 评督经验  |
| --------- | --------- |
| pgdd/pddt | pgdd/pdjy |

#### 发改党建

| 中央精神  | 机关党建  | 委属党建  | 系统党建  |
| --------- | --------- | --------- | --------- |
| fgdj/zydj | fgdj/jgdj | fgdj/wsdj | fgdj/xtdj |

#### 发改金辉

| 党建之窗  | 系统交流  | 学习园地  | 金色夕阳  |
| --------- | --------- | --------- | --------- |
| fgjh/djzc | fgjh/zthd | fgjh/yxyd | fgjh/jsxy |

:::`,
    radar: [
        {
            title: '发展改革工作',
            source: ['ndrc.gov.cn/fggz/:category*'],
            target: (params) => {
                const category = params.category;

                return `/gov/ndrc/fggz/${category ? `/${category.endsWith('/') ? category : `${category}/`}` : '/'}`;
            },
        },
        {
            title: '机关办公 - 业务工作',
            source: ['ndrc.gov.cn/fggz/jgbg/ywgz'],
            target: '/fggz/jgbg/ywgz',
        },
        {
            title: '机关办公 - 学思践悟',
            source: ['ndrc.gov.cn/fggz/jgbg/xsjw'],
            target: '/fggz/jgbg/xsjw',
        },
        {
            title: '发改政研 - 经济数据概览',
            source: ['ndrc.gov.cn/fggz/fgzy/jjsjgl'],
            target: '/fggz/fgzy/jjsjgl',
        },
        {
            title: '发改政研 - 社会关切回应',
            source: ['ndrc.gov.cn/fggz/fgzy/shgqhy'],
            target: '/fggz/fgzy/shgqhy',
        },
        {
            title: '发改政研 - 新媒体解读',
            source: ['ndrc.gov.cn/fggz/fgzy/xmtjd'],
            target: '/fggz/fgzy/xmtjd',
        },
        {
            title: '发展战略和规划 - 国家发展战略和规划',
            source: ['ndrc.gov.cn/fggz/fzzlgh/gjfzgh'],
            target: '/fggz/fzzlgh/gjfzgh',
        },
        {
            title: '发展战略和规划 - 国家级专项规划',
            source: ['ndrc.gov.cn/fggz/fzzlgh/gjjzxgh'],
            target: '/fggz/fzzlgh/gjjzxgh',
        },
        {
            title: '发展战略和规划 - 地方发展规划',
            source: ['ndrc.gov.cn/fggz/fzzlgh/dffzgh'],
            target: '/fggz/fzzlgh/dffzgh',
        },
        {
            title: '发展战略和规划 - 发展规划工作',
            source: ['ndrc.gov.cn/fggz/fzzlgh/fzgggz'],
            target: '/fggz/fzzlgh/fzgggz',
        },
        {
            title: '发改综合 - 国内经济监测',
            source: ['ndrc.gov.cn/fggz/fgzh/gnjjjc'],
            target: '/fggz/fgzh/gnjjjc',
        },
        {
            title: '发改综合 - 工业经济',
            source: ['ndrc.gov.cn/fggz/fgzh/gnjjjc/gyjj'],
            target: '/fggz/fgzh/gnjjjc/gyjj',
        },
        {
            title: '发改综合 - 投资运行',
            source: ['ndrc.gov.cn/fggz/fgzh/gnjjjc/tzyx'],
            target: '/fggz/fgzh/gnjjjc/tzyx',
        },
        {
            title: '发改综合 - 市场消费',
            source: ['ndrc.gov.cn/fggz/fgzh/gnjjjc/scxf'],
            target: '/fggz/fgzh/gnjjjc/scxf',
        },
        {
            title: '发改综合 - 价格情况',
            source: ['ndrc.gov.cn/fggz/fgzh/gnjjjc/jgqk'],
            target: '/fggz/fgzh/gnjjjc/jgqk',
        },
        {
            title: '发改综合 - 财政收支',
            source: ['ndrc.gov.cn/fggz/fgzh/gnjjjc/czsz'],
            target: '/fggz/fgzh/gnjjjc/czsz',
        },
        {
            title: '发改综合 - 货币金融',
            source: ['ndrc.gov.cn/fggz/fgzh/gnjjjc/hbjr'],
            target: '/fggz/fgzh/gnjjjc/hbjr',
        },
        {
            title: '发改综合 - 就业情况',
            source: ['ndrc.gov.cn/fggz/fgzh/gnjjjc/jyqk'],
            target: '/fggz/fgzh/gnjjjc/jyqk',
        },
        {
            title: '发改综合 - 地区经济',
            source: ['ndrc.gov.cn/fggz/fgzh/gnjjjc/dqjj'],
            target: '/fggz/fgzh/gnjjjc/dqjj',
        },
        {
            title: '发改综合 - 国际经济监测',
            source: ['ndrc.gov.cn/fggz/fgzh/gjjjjc'],
            target: '/fggz/fgzh/gjjjjc',
        },
        {
            title: '发改综合 - 先行指数',
            source: ['ndrc.gov.cn/fggz/fgzh/gjjjjc/xxzs'],
            target: '/fggz/fgzh/gjjjjc/xxzs',
        },
        {
            title: '发改综合 - 大宗商品市场情况',
            source: ['ndrc.gov.cn/fggz/fgzh/gjjjjc/dzspscqk'],
            target: '/fggz/fgzh/gjjjjc/dzspscqk',
        },
        {
            title: '发改综合 - 国别分析',
            source: ['ndrc.gov.cn/fggz/fgzh/gjjjjc/gbfx'],
            target: '/fggz/fgzh/gjjjjc/gbfx',
        },
        {
            title: '发改综合 - 国际组织预测和研究动态',
            source: ['ndrc.gov.cn/fggz/fgzh/gjzzychyjdt'],
            target: '/fggz/fgzh/gjzzychyjdt',
        },
        {
            title: '发改综合 - 国际组织预测',
            source: ['ndrc.gov.cn/fggz/fgzh/gjzzychyjdt/gjzzyc'],
            target: '/fggz/fgzh/gjzzychyjdt/gjzzyc',
        },
        {
            title: '发改综合 - 国际组织研究动态',
            source: ['ndrc.gov.cn/fggz/fgzh/gjzzychyjdt/gjzzyjdt'],
            target: '/fggz/fgzh/gjzzychyjdt/gjzzyjdt',
        },
        {
            title: '经济运行与调节 - 宏观经济运行',
            source: ['ndrc.gov.cn/fggz/jjyxtj/hgjjyx'],
            target: '/fggz/jjyxtj/hgjjyx',
        },
        {
            title: '经济运行与调节 - 地方经济运行',
            source: ['ndrc.gov.cn/fggz/jjyxtj/dfjjyx'],
            target: '/fggz/jjyxtj/dfjjyx',
        },
        {
            title: '经济运行与调节 - 煤电油气运',
            source: ['ndrc.gov.cn/fggz/jjyxtj/mdyqy'],
            target: '/fggz/jjyxtj/mdyqy',
        },
        {
            title: '经济运行与调节 - 现代物流',
            source: ['ndrc.gov.cn/fggz/jjyxtj/xdwl'],
            target: '/fggz/jjyxtj/xdwl',
        },
        {
            title: '经济运行与调节 - 应急管理',
            source: ['ndrc.gov.cn/fggz/jjyxtj/yjgl'],
            target: '/fggz/jjyxtj/yjgl',
        },
        {
            title: '体制改革 - 改革快讯',
            source: ['ndrc.gov.cn/fggz/tzgg/ggkx'],
            target: '/fggz/tzgg/ggkx',
        },
        {
            title: '体制改革 - 半月改革动态',
            source: ['ndrc.gov.cn/fggz/tzgg/byggdt'],
            target: '/fggz/tzgg/byggdt',
        },
        {
            title: '体制改革 - 地方改革经验',
            source: ['ndrc.gov.cn/fggz/tzgg/dfggjx'],
            target: '/fggz/tzgg/dfggjx',
        },
        {
            title: '固定资产投资 - 投资法规与政策动态',
            source: ['ndrc.gov.cn/fggz/gdzctz/tzfg'],
            target: '/fggz/gdzctz/tzfg',
        },
        {
            title: '利用外资和境外投资 - 境外投资',
            source: ['ndrc.gov.cn/fggz/lywzjw/jwtz'],
            target: '/fggz/lywzjw/jwtz',
        },
        {
            title: '利用外资和境外投资 - 外商投资',
            source: ['ndrc.gov.cn/fggz/lywzjw/wstz'],
            target: '/fggz/lywzjw/wstz',
        },
        {
            title: '利用外资和境外投资 - 外债管理',
            source: ['ndrc.gov.cn/fggz/lywzjw/wzgl'],
            target: '/fggz/lywzjw/wzgl',
        },
        {
            title: '利用外资和境外投资 - 政策法规',
            source: ['ndrc.gov.cn/fggz/lywzjw/zcfg'],
            target: '/fggz/lywzjw/zcfg',
        },
        {
            title: '地区经济 - 重大战略',
            source: ['ndrc.gov.cn/fggz/dqjj/zdzl'],
            target: '/fggz/dqjj/zdzl',
        },
        {
            title: '地区经济 - 四大板块',
            source: ['ndrc.gov.cn/fggz/dqjj/sdbk'],
            target: '/fggz/dqjj/sdbk',
        },
        {
            title: '地区经济 - 国土海洋流域新区',
            source: ['ndrc.gov.cn/fggz/dqjj/qt'],
            target: '/fggz/dqjj/qt',
        },
        {
            title: '地区振兴 - 巩固拓展脱贫攻坚成果和欠发达地区振兴发展',
            source: ['ndrc.gov.cn/fggz/dqzx/tpgjypkfq'],
            target: '/fggz/dqzx/tpgjypkfq',
        },
        {
            title: '地区振兴 - 对口支援与合作',
            source: ['ndrc.gov.cn/fggz/dqzx/dkzyyhz'],
            target: '/fggz/dqzx/dkzyyhz',
        },
        {
            title: '地区振兴 - 革命老区振兴发展',
            source: ['ndrc.gov.cn/fggz/dqzx/gglqzxfz'],
            target: '/fggz/dqzx/gglqzxfz',
        },
        {
            title: '地区振兴 - 生态退化地区治理',
            source: ['ndrc.gov.cn/fggz/dqzx/stthdqzl'],
            target: '/fggz/dqzx/stthdqzl',
        },
        {
            title: '地区振兴 - 资源型地区转型发展',
            source: ['ndrc.gov.cn/fggz/dqzx/zyxdqzxfz'],
            target: '/fggz/dqzx/zyxdqzxfz',
        },
        {
            title: '地区振兴 - 老工业地区振兴发展',
            source: ['ndrc.gov.cn/fggz/dqzx/lzydfzxfz'],
            target: '/fggz/dqzx/lzydfzxfz',
        },
        {
            title: '区域开放 - 信息集萃',
            source: ['ndrc.gov.cn/fggz/qykf/xxjc'],
            target: '/fggz/qykf/xxjc',
        },
        {
            title: '农业农村经济 - 重点建设',
            source: ['ndrc.gov.cn/fggz/nyncjj/zdjs'],
            target: '/fggz/nyncjj/zdjs',
        },
        {
            title: '农业农村经济 - 投资指南',
            source: ['ndrc.gov.cn/fggz/nyncjj/tzzn'],
            target: '/fggz/nyncjj/tzzn',
        },
        {
            title: '农业农村经济 - 乡村振兴',
            source: ['ndrc.gov.cn/fggz/nyncjj/xczx'],
            target: '/fggz/nyncjj/xczx',
        },
        {
            title: '农业农村经济 - 农经信息',
            source: ['ndrc.gov.cn/fggz/nyncjj/njxx'],
            target: '/fggz/nyncjj/njxx',
        },
        {
            title: '基础设施发展 - 政策规划',
            source: ['ndrc.gov.cn/fggz/zcssfz/zcgh'],
            target: '/fggz/zcssfz/zcgh',
        },
        {
            title: '基础设施发展 - 城轨监管',
            source: ['ndrc.gov.cn/fggz/zcssfz/cgjg'],
            target: '/fggz/zcssfz/cgjg',
        },
        {
            title: '基础设施发展 - 重大工程',
            source: ['ndrc.gov.cn/fggz/zcssfz/zdgc'],
            target: '/fggz/zcssfz/zdgc',
        },
        {
            title: '基础设施发展 - 问题研究',
            source: ['ndrc.gov.cn/fggz/zcssfz/wtyj'],
            target: '/fggz/zcssfz/wtyj',
        },
        {
            title: '基础设施发展 - 行业数据',
            source: ['ndrc.gov.cn/fggz/zcssfz/hysj'],
            target: '/fggz/zcssfz/hysj',
        },
        {
            title: '基础设施发展 - 地方发展',
            source: ['ndrc.gov.cn/fggz/zcssfz/dffz'],
            target: '/fggz/zcssfz/dffz',
        },
        {
            title: '产业发展 - 制造业发展',
            source: ['ndrc.gov.cn/fggz/cyfz/zcyfz'],
            target: '/fggz/cyfz/zcyfz',
        },
        {
            title: '产业发展 - 服务业发展',
            source: ['ndrc.gov.cn/fggz/cyfz/fwyfz'],
            target: '/fggz/cyfz/fwyfz',
        },
        {
            title: '创新和高技术发展 - 地方进展',
            source: ['ndrc.gov.cn/fggz/cxhgjsfz/dfjz'],
            target: '/fggz/cxhgjsfz/dfjz',
        },
        {
            title: '环境与资源 - 碳达峰碳中和',
            source: ['ndrc.gov.cn/fggz/hjyzy/tdftzh'],
            target: '/fggz/hjyzy/tdftzh',
        },
        {
            title: '环境与资源 - 生态文明建设',
            source: ['ndrc.gov.cn/fggz/hjyzy/stwmjs'],
            target: '/fggz/hjyzy/stwmjs',
        },
        {
            title: '环境与资源 - 节能和能效',
            source: ['ndrc.gov.cn/fggz/hjyzy/jnhnx'],
            target: '/fggz/hjyzy/jnhnx',
        },
        {
            title: '环境与资源 - 资源利用和循环经济',
            source: ['ndrc.gov.cn/fggz/hjyzy/zyzhlyhxhjj'],
            target: '/fggz/hjyzy/zyzhlyhxhjj',
        },
        {
            title: '环境与资源 - 水节约与保护',
            source: ['ndrc.gov.cn/fggz/hjyzy/sjyybh'],
            target: '/fggz/hjyzy/sjyybh',
        },
        {
            title: '环境与资源 - 环境与保护',
            source: ['ndrc.gov.cn/fggz/hjyzy/hjybh'],
            target: '/fggz/hjyzy/hjybh',
        },
        {
            title: '就业与收入 - 就业收入社保消费',
            source: ['ndrc.gov.cn/fggz/jyysr/jysrsbxf'],
            target: '/fggz/jyysr/jysrsbxf',
        },
        {
            title: '就业与收入 - 地方经验',
            source: ['ndrc.gov.cn/fggz/jyysr/dfjx'],
            target: '/fggz/jyysr/dfjx',
        },
        {
            title: '经济贸易 - 重要商品情况',
            source: ['ndrc.gov.cn/fggz/jjmy/zyspqk'],
            target: '/fggz/jjmy/zyspqk',
        },
        {
            title: '经济贸易 - 对外经贸及政策分析',
            source: ['ndrc.gov.cn/fggz/jjmy/dwjmjzcfx'],
            target: '/fggz/jjmy/dwjmjzcfx',
        },
        {
            title: '经济贸易 - 流通业发展',
            source: ['ndrc.gov.cn/fggz/jjmy/ltyfz'],
            target: '/fggz/jjmy/ltyfz',
        },
        {
            title: '财金信用 - 工作动态',
            source: ['ndrc.gov.cn/fggz/cjxy/gzdt03'],
            target: '/fggz/cjxy/gzdt03',
        },
        {
            title: '价格管理 - 地方工作',
            source: ['ndrc.gov.cn/fggz/jggl/dfgz'],
            target: '/fggz/jggl/dfgz',
        },
        {
            title: '发改法规 - 地方信息',
            source: ['ndrc.gov.cn/fggz/fgfg/dfxx'],
            target: '/fggz/fgfg/dfxx',
        },
        {
            title: '国际合作 - 世经动态',
            source: ['ndrc.gov.cn/fggz/gjhz/zywj'],
            target: '/fggz/gjhz/zywj',
        },
        {
            title: '干部之家 - 系统风采',
            source: ['ndrc.gov.cn/fggz/gbzj/xtfc'],
            target: '/fggz/gbzj/xtfc',
        },
        {
            title: '干部之家 - 人才招聘',
            source: ['ndrc.gov.cn/fggz/gbzj/rczp'],
            target: '/fggz/gbzj/rczp',
        },
        {
            title: '干部之家 - 委属工作',
            source: ['ndrc.gov.cn/fggz/gbzj/wsgz'],
            target: '/fggz/gbzj/wsgz',
        },
        {
            title: '干部之家 - 学习园地',
            source: ['ndrc.gov.cn/fggz/gbzj/xxyd'],
            target: '/fggz/gbzj/xxyd',
        },
        {
            title: '评估督导 - 评督动态',
            source: ['ndrc.gov.cn/fggz/pgdd/pddt'],
            target: '/fggz/pgdd/pddt',
        },
        {
            title: '评估督导 - 评督经验',
            source: ['ndrc.gov.cn/fggz/pgdd/pdjy'],
            target: '/fggz/pgdd/pdjy',
        },
        {
            title: '发改党建 - 中央精神',
            source: ['ndrc.gov.cn/fggz/fgdj/zydj'],
            target: '/fggz/fgdj/zydj',
        },
        {
            title: '发改党建 - 机关党建',
            source: ['ndrc.gov.cn/fggz/fgdj/jgdj'],
            target: '/fggz/fgdj/jgdj',
        },
        {
            title: '发改党建 - 委属党建',
            source: ['ndrc.gov.cn/fggz/fgdj/wsdj'],
            target: '/fggz/fgdj/wsdj',
        },
        {
            title: '发改党建 - 系统党建',
            source: ['ndrc.gov.cn/fggz/fgdj/xtdj'],
            target: '/fggz/fgdj/xtdj',
        },
        {
            title: '发改金辉 - 党建之窗',
            source: ['ndrc.gov.cn/fggz/fgjh/djzc'],
            target: '/fggz/fgjh/djzc',
        },
        {
            title: '发改金辉 - 系统交流',
            source: ['ndrc.gov.cn/fggz/fgjh/zthd'],
            target: '/fggz/fgjh/zthd',
        },
        {
            title: '发改金辉 - 学习园地',
            source: ['ndrc.gov.cn/fggz/fgjh/yxyd'],
            target: '/fggz/fgjh/yxyd',
        },
        {
            title: '发改金辉 - 金色夕阳',
            source: ['ndrc.gov.cn/fggz/fgjh/jsxy'],
            target: '/fggz/fgjh/jsxy',
        },
    ],
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 25;

    const rootUrl = 'https://www.ndrc.gov.cn';
    const currentUrl = new URL(`fggz${category ? `/${category.endsWith('/') ? category : `${category}/`}` : '/'}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('ul.u-list li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.prop('title') || item.text(),
                link: new URL(item.prop('href'), currentUrl).href,
                pubDate: parseDate(item.next().text(), 'YYYY/MM/DD'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('meta[name="ArticleTitle"]').prop('content');
                item.description = content('div.TRS_Editor').html();
                item.author = content('meta[name="ContentSource"]').prop('content');
                item.category = [...new Set([content('meta[name="ColumnName"]').prop('content'), content('meta[name="ColumnType"]').prop('content'), ...(content('meta[name="Keywords"]').prop('content').split(/,|;/) ?? [])])].filter(
                    Boolean
                );
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').prop('content')), +8);

                return item;
            })
        )
    );

    const image = $('div.logo a img').prop('src');

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        subtitle: $('meta[name="ColumnName"]').prop('content'),
        author: $('meta[name="SiteName"]').prop('content'),
    };
}
