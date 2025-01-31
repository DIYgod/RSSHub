import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const rootUrl = 'https://xgzlyhd.samr.gov.cn';
const apiUrl = new URL('gjjly/message/getMessageList', rootUrl).href;
const apiDataUrl = new URL('gjjly/message/getDataList', rootUrl).href;
const currentUrl = new URL('gjjly/index', rootUrl).href;

const types = {
    category: '1',
    department: '2',
};

const fetchOptions = async (type) => {
    const { data: response } = await got.post(apiDataUrl, {
        json: {
            type: types[type],
        },
    });

    return response.data;
};

const getOption = async (type, name) => {
    const options = await fetchOptions(type);
    const results = options.filter((o) => o.name === name || o.code === name);

    if (results.length > 0) {
        return results.pop();
    }
    return;
};

export const route: Route = {
    path: '/samr/xgzlyhd/:category?/:department?',
    categories: ['government'],
    example: '/gov/samr/xgzlyhd',
    parameters: { category: '留言类型，见下表，默认为全部', department: '回复部门，见下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['xgzlyhd.samr.gov.cn/gjjly/index'],
        },
    ],
    name: '留言咨询',
    maintainers: ['nczitzk'],
    handler,
    url: 'xgzlyhd.samr.gov.cn/gjjly/index',
    description: `#### 留言类型

| 类型                                       | 类型 id                          |
| ------------------------------------------ | -------------------------------- |
| 反腐倡廉                                   | 14101a4192df48b592b5cfd77a26c0cf |
| 规划统计                                   | b807cf9cdf434635ae908d48757e0f39 |
| 行政执法和复议                             | 8af2530e77154d7b939428667b7413f6 |
| 假冒仿冒行为                               | 75374a34b95341829e08e54d4a0d8c04 |
| 走私贩私                                   | 84c728530e1e478e94fe3f0030171c53 |
| 登记注册                                   | 07fff64612dc41aca871c06587abf71d |
| 个体工商户登记                             | ca8f91ba9a2347a0acd57ea5fd12a5c8 |
| 信用信息公示系统                           | 1698886c3cdb495998d5ea9285a487f5 |
| 市场主体垄断                               | 77bfe965843844449c47d29f2feb7999 |
| 反不正当竞争                               | 2c919b1dc39440d8850c4f6c405869f8 |
| 商业贿赂                                   | b494e6535af149c5a51fd4197993f061 |
| 打击传销与规范直销                         | 407a1404844e48558da46139f16d6232 |
| 消费环境建设                               | 94c2003331dd4c5fa19b0cf88d720676 |
| 网络交易监管                               | 6302aac5b87140598da53f85c1ccb8fa |
| 动产抵押登记                               | 3856de5835444229943b18cac7781e9f |
| 广告监管                                   | d0e38171042048c2bf31b05c5e57aa68 |
| 三包                                       | c4dbd85692604a428b1ea7613e67beb8 |
| 缺陷产品召回                               | f93c9a6b81e941d09a547406370e1c0c |
| 工业生产许可                               | 2b41afaabaa24325b53a5bd7deba895b |
| 产品质量监督抽查                           | 4388504cb0c04e988e2cf0c90d4a3f14 |
| 食品安全协调                               | 3127b9f409c24d0eaa60b13c25f819fa |
| 食品生产监管                               | beaa5555d1364e5bb2a0f0a7cc9720e5 |
| 食品销售、餐饮服务、食用农产品销售监管     | 3b6c49c6ce934e1b9505601a3b881a6a |
| 保健、特殊医学用途配方和婴幼儿配方乳粉监管 | 13b43888f8554e078b1dfa475e2aaab0 |
| 食品监督抽检、召回                         | 0eb6c75581bf41ecaedc629370cb425c |
| 食品安全标准                               | 399cfd9abfa34c22a5cb3bb971a43819 |
| 特种设备人员、机构管理                     | e5d0e51cc7d0412790efac605008bf20 |
| 特种设备检验                               | 03f22fb3d4cd4f09b632079359e9dd7d |
| 计量器具                                   | 90b25e22861446d5822e07c7c1f5169a |
| 计量机构和人员管理                         | 76202742f06c459da7482160e0ce17ad |
| 国家标准                                   | 299b9672e1c246e69485a5b695f42c5b |
| 行业、地方、团体、企业标准                 | cbdc804c9b2c4e259a159c32eccf4ca9 |
| 认证监督管理                               | 41259262a42e4de49b5c0b7362ac3796 |
| 认可与检验检测                             | cb3c9d1e3d364f2a8b1cd70efa69d1cb |
| 新闻宣传                                   | e3e553e4019c46ccbdc06136900138e9 |
| 科技财务                                   | 47367b9704964355ba52899a4c5abbb0 |
| 干部人事                                   | 6b978e3c127c489ea8e2d693b768887e |
| 国际合作                                   | dd5ce768e33e435ab4bfb769ab6e079a |
| 党群工作                                   | aa71052978af4304937eb382f24f9902 |
| 退休干部                                   | 44505fc58c81428eb5cef15706007b5e |
| 虚假宣传                                   | 5bb2b83ecadb4bf89a779cee414a81dd |
| 滥用行政权力                               | 1215206156dc48029b98da825f26fcbc |
| 公平竞争                                   | 9880a23dcbb04deba2cc7b4404e13ff6 |
| 滥用市场支配地位                           | fea04f0acd84486e84cf71d9c13005b0 |
| 数字经济领域反垄断执法                     | 4bea424a6e4c4e2aac19fe3c73f9be23 |
| 并购行为                                   | 90e315647acd415ca68f97fc1b42053d |
| 经营者集中案件                             | d6571d2cd5624bc18191b342a2e8defb |
| 数字经济领域反垄断审查                     | 03501ef176ef44fba1c7c70da44ba8a0 |
| 综合执法                                   | cfbb1b5dade446299670ca38844b265e |
| 信用监管                                   | a9d76ea04a3a4433946bc02b0bdb77eb |
| 3C 认证                                    | 111decc7b14a4fdbae86fb4a3ba5c0c1 |
| 食用农产品                                 | 3159db51f8ca4f23a9340d87d5572d40 |
| 食品添加                                   | 4e4b0e0152334cbb9c62fd1b80138305 |

#### 回复部门

| 部门                         | 部门 id                          |
| ---------------------------- | -------------------------------- |
| 办公厅                       | 6ed539b270634667afc4d466b67a53f7 |
| 法规司                       | 8625ec7ff8d744ad80a1d1a2bf19cf19 |
| 执法稽查局                   | 313a8cb1c09042dea52be52cb392c557 |
| 登记注册局                   | e4553350549f45f38da5602147cf8639 |
| 信用监督管理司               | 6af98157255a4a858eac5f94ba8d98f4 |
| 竞争政策协调司               | 8d2266be4791483297822e1aa5fc0a96 |
| 综合规划司                   | 958e1619159c45a7b76663a59d9052ea |
| 反垄断执法一司               | f9fb3f6225964c71ab82224a91f21b2c |
| 反垄断执法二司               | 7986c79e4f16403493d5b480aec30be4 |
| 价格监督检查和反不正当竞争局 | c5d2b1b273b545cfbc6f874f670654ab |
| 网络交易监督管理司           | 6ac05b4dbd4e41c69f4529262540459b |
| 广告监督管理司               | 96457dfe16c54840885b79b4e6e17523 |
| 质量发展局                   | cb8d2b16fbb540dca296aa33a43fc573 |
| 质量监督司                   | af2c4e0a54c04f76b512c29ddd075d40 |
| 食品安全协调司               | cc29962c74e84ef2b21e44336da6c6c5 |
| 食品生产安全监督管理司       | b334db85a253458285db70b30ee26b0a |
| 食品经营安全监督管理司       | 4315f0261a5d49f7bdcc5a7524e19ce3 |
| 特殊食品安全监督管理司       | 62d14f386317486ca94bc53ca7f88891 |
| 食品安全抽检监测司           | abfc910832cc460a81876ad418618159 |
| 特种设备安全监察局           | ea79f90bec5840ef9b0881c83682225a |
| 计量司                       | b0556236fbcf4f45b6fdec8004dac3e4 |
| 标准技术管理司               | a558d07a51f4454fa59290e0d6e93c26 |
| 标准创新管理司               | ffb3a80984b344ed8d168f4af6508af0 |
| 认证监督管理司               | ca4987393d514debb4d1e2126f576987 |
| 认可与检验检测监督管理司     | 796bfab21b15498e88c9032fe3e3c9f1 |
| 新闻宣传司                   | 884fc0ea6c184ad58dda10e2170a1eda |
| 科技和财务司                 | 117355eea94c426199e2e519fd98ce07 |
| 人事司                       | a341e8b7929e44769b9424b7cf69d32a |
| 国际司                       | f784499ef24541f5b20de4c24cfc61e7 |
| 机关党委                     | a49119c6f40045dd994f3910500cedfa |
| 离退办                       | 6bf265ffd1c94fa4a3f1687b03fa908b |`,
};

async function handler(ctx) {
    const { category, department } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    let categoryOption;
    let departmentOption;

    if (category) {
        categoryOption = await getOption('category', category);
    }

    if (department) {
        departmentOption = await getOption('department', department);
    }

    const { data: response } = await got.post(apiUrl, {
        json: {
            clyj: '',
            curPage: '1',
            endTime: '',
            fzsj: departmentOption?.code ?? '',
            lybt: undefined,
            lylx: categoryOption?.code ?? '',
            lynr: '',
            startTime: '',
            zj: '',
        },
    });

    const items = response.data.data.slice(0, limit).map((item) => ({
        title: item.lybt,
        link: `${currentUrl}#${item.zj}`,
        description: art(path.join(__dirname, 'templates/description.art'), {
            item,
        }),
        author: `${item.lyr} ⇄ ${item.fzsjCn}`,
        category: [item.fzsjCn],
        guid: `${currentUrl}#${item.zj}`,
        pubDate: parseDate(item.pubtime),
    }));

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const author = '国家市场监督管理总局';
    const title = $('title').text();
    const subtitle = [categoryOption ? categoryOption.name : undefined, departmentOption ? departmentOption.name : undefined].filter(Boolean).join(' - ');
    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title: `${author}${title}${subtitle ? ` - ${subtitle}` : ''}`,
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: 'zh',
        image: new URL(`gjjly/${$('div.fd-logo img').prop('src')}`, rootUrl).href,
        icon,
        logo: icon,
        subtitle,
        author,
        allowEmpty: true,
    };
}
