import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id?',
    categories: ['new-media'],
    example: '/chinaisa',
    parameters: { id: '栏目，见下表，默认为钢协动态' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '栏目',
    maintainers: ['nczitzk'],
    handler,
    description: `| 栏目     | id                                               |
| -------- | --------------------------------------------------------------- |
| 钢协动态 | 58af05dfb6b4300151760176d2aad0a04c275aaadbb1315039263f021f920dcd |
| 钢协要闻 | 67ea4f106bd8f0843c0538d43833c463a0cd411fc35642cbd555a5f39fcf352b |
| 会议报道 | e5070694f299a43b20d990e53b6a69dc02e755fef644ae667cf75deaff80407a |
| 领导讲话 | a873c2e67b26b4a2d8313da769f6e106abc9a1ff04b7f1a50674dfa47cf91a7b |
| 图片新闻 | 806254321b2459bddb3c2cb5590fef6332bd849079d3082daf6153d7f8d62e1e |

<details>
<summary>更多栏目</summary>

#### 党建工作

| 栏目                                                 | id                                                               |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| 党建工作                                             | 10e8911e0c852d91f08e173c768700da608abfb4e7b0540cb49fa5498f33522b |
| 学习贯彻习近平新时代中国特色社会主义思想主题教育专栏 | b7a7ad4b5d8ffaca4b29f3538fd289da9d07f827f89e6ea57ef07257498aacf9 |
| 党史学习教育专栏                                     | 4d8e7dec1b672704916331431156ea7628a598c191d751e4fc28408ccbd4e0c4 |
| 不忘初心、牢记使命                                   | 427f7c28c90ec9db1aab78db8156a63ff2e23f6a0cea693e3847fe6d595753db |
| 两学一做                                             | 5b0609fedc9052bb44f1cfe9acf5ec8c9fe960f22a07be69636f2cf1cacaa8f7 |
| 钢协党代会                                           | beaaa0314f0f532d4b18244cd70df614a4af97465d974401b1f5b3349d78144b |
| 创先争优                                             | e7ea82c886ba18691210aaf48b3582a92dca9c4f2aab912757cedafb066ff8a6 |
| 青年工作                                             | 2706ee3a4a4c3c23e90e13c8fdc3002855d1dba394b61626562a97b33af3dbd0 |
| 日常动态                                             | e21157a082fc0ab0d7062c8755e91472ee0d23de6ccc5c2a44b62e54062cf1e4 |

#### 要闻

| 栏目         | id                                                               |
| ------------ | ---------------------------------------------------------------- |
| 要闻         | c42511ce3f868a515b49668dd250290c80d4dc8930c7e455d0e6e14b8033eae2 |
| 会员动态     | 268f86fdf61ac8614f09db38a2d0295253043b03e092c7ff48ab94290296125c |
| 疫情应对专栏 | a83c48faeb34065fd9b33d3c84957a152675141458aedc0ec454b760c9fcad65 |

#### 统计发布

| 栏目     | id                                                               |
| -------- | ---------------------------------------------------------------- |
| 统计发布 | 2e3c87064bdfc0e43d542d87fce8bcbc8fe0463d5a3da04d7e11b4c7d692194b |
| 生产经营 | 3238889ba0fa3aabcf28f40e537d440916a361c9170a4054f9fc43517cb58c1e |
| 进出口   | 95ef75c752af3b6c8be479479d8b931de7418c00150720280d78c8f0da0a438c |
| 环保统计 | 619ce7b53a4291d47c19d0ee0765098ca435e252576fbe921280a63fba4bc712 |

#### 行业分析

| 栏目     | id                                                               |
| -------- | ---------------------------------------------------------------- |
| 行业分析 | 1b4316d9238e09c735365896c8e4f677a3234e8363e5622ae6e79a5900a76f56 |
| 市场分析 | a44207e193a5caa5e64102604b6933896a0025eb85c57c583b39626f33d4dafd |
| 板带材   | 05d0e136828584d2cd6e45bdc3270372764781b98546cce122d9974489b1e2f2 |
| 社会库存 | 197422a82d9a09b9cc86188444574816e93186f2fde87474f8b028fc61472d35 |

#### 钢材价格指数

| 栏目         | id                                                               |
| ------------ | ---------------------------------------------------------------- |
| 钢材价格指数 | 17b6a9a214c94ccc28e56d4d1a2dbb5acef3e73da431ddc0a849a4dcfc487d04 |
| 综合价格指数 | 63913b906a7a663f7f71961952b1ddfa845714b5982655b773a62b85dd3b064e |
| 地区价格     | fc816c75aed82b9bc25563edc9cf0a0488a2012da38cbef5258da614d6e51ba9 |

#### 宏观经济信息

| 栏目         | id                                                               |
| ------------ | ---------------------------------------------------------------- |
| 宏观经济信息 | 5d77b433182404193834120ceed16fe0625860fafd5fd9e71d0800c4df227060 |
| 相关行业信息 | ae2a3c0fd4936acf75f4aab6fadd08bc6371aa65bdd50419e74b70d6f043c473 |
| 国际动态     | 1bad7c56af746a666e4a4e56e54a9508d344d7bc1498360580613590c16b6c41 |

#### 专题报道

| 栏目                 | id                                                               |
| -------------------- | ---------------------------------------------------------------- |
| 专题报道             | 50e7242bfd78b4395f3338df7699a0ff8847b886c4c3a55bd7c102a2cfe32fe9 |
| 钢协理事会           | 40c6404418699f0f8cb4e513013bb110ef250c782f0959852601e7c75e1afcd8 |
| 钢协新闻发布会       | 11ea370f565c6c141b1a4dac60aa00c4331bd442382a5dd476a5e73e001b773c |
| 劳模表彰             | 907e4ae217bf9c981a132051572103f9c87cccb7f00caf5a1770078829e6bcb3 |
| 钢铁行业职业技能竞赛 | 563c15270a691e3c7cb9cd9ba457c5af392eb4630fa833fc1a55c8e2afbc28a9 |

#### 成果奖励

| 栏目                   | id                                                               |
| ---------------------- | ---------------------------------------------------------------- |
| 成果奖励               | a6c30053b66356b4d77fbf6668bda69f7e782b2ae08a21d5db171d50a504bd40 |
| 冶金科学技术奖         | 50fe0c63f657ee48e49cb13fe7f7c5502046acdb05e2ee8a317f907af4191683 |
| 企业管理现代化创新成果 | b5607d3b73c2c3a3b069a97b9dbfd59af64aea27bafd5eb87ba44d1b07a33b66 |
| 清洁生产环境友好企业   | 4475c8e21374d063a22f95939a2909837e78fab1832dc97bf64f09fa01c0c5f7 |
| 产品开发市场开拓奖     | 169e34d7b29e3deaf4d4496da594d3bbde2eb0a40f7244b54dbfb9cc89a37296 |
| 质量金杯奖             | 68029784be6d9a7bf9cb8cace5b8a5ce5d2d871e9a0cbcbf84eeae0ea2746311 |

#### 节能减排

| 栏目                                       | id                                                               |
| ------------------------------------------ | ---------------------------------------------------------------- |
| 节能减排                                   | 08895f1681c198fdf297ab38e33e1f428f6ccf2add382f3844a52e410f10e5a0 |
| 先进节能环保技术                           | 6e639343a517fd08e5860fba581d41940da523753956ada973b6952fc05ef94f |
| 钢铁企业超低排放改造和评估监测进展情况公示 | 50d99531d5dee68346653ca9548f308764ad38410a091e662834a5ed66770174 |

#### 国际交流

| 栏目     | id                                                               |
| -------- | ---------------------------------------------------------------- |
| 国际交流 | 4753eef81b4019369d4751413d852ab9027944b84c612b5a08614e046d169e81 |
| 外事动态 | aa590ec6f835136a9ce8c9f3d0c3b194beb6b78037466ab40bb4aacc32adfcc9 |
| 国际会展 | 05ac1f2971bc375d25c9112e399f9c3cbb237809684ebc5b0ca4a68a1fcb971c |

#### 政策法规

| 栏目     | id                                                               |
| -------- | ---------------------------------------------------------------- |
| 政策法规 | 63a69eb0087f1984c0b269a1541905f19a56e117d56b3f51dfae0e6c1d436533 |
| 政策法规 | a214b2e71c3c79fa4a36ff382ee5f822b9603634626f7e320f91ed696b3666f2 |
| 贸易规则 | 5988b2380d04d3efde8cc247377d19530c17904ec0b5decdd00f9b3e026e3715 |

#### 分会园地

| 栏目         | id                                                               |
| ------------ | ---------------------------------------------------------------- |
| 分会园地     | d059d6751dcaae94e31a795072267f7959c35d012eebb9858b3ede2990e82ea9 |
| 法律分会     | 96000647f18ea78fa134a3932563e7d27c68d0482de498f179b44846234567a9 |
| 设备分会     | c8e1e3f52406115c2c03928271bbe883c0875b7c9f2f67492395685a62a1a2d8 |
| 国际产能合作 | 4fb8cc4b0d6f905a969ac3375f6d17b34df4dcae69d798d2a4616daa80af020c |
| 绿化分会     | ad55a0fbc1a44e94fb60e21b98cf967aca17ecf1450bdfb3699468fe8235103b |

#### 钢铁知识

| 栏目         | id                                                               |
| ------------ | ---------------------------------------------------------------- |
| 钢铁知识     | 7f7509ff045023015e0d6c1ba22c32734b673be2ec14eae730a99c08e3badb3f |
| 钢铁材料使用 | 7e319d71258ed6bb663cf59b4cf67fe97894e60aa5520f3d2cf966f82f9b89ac |
| 钢铁标准     | fae0c4dd27f8fe4759941e78c9dc1dfe0088ce30d1b684d12be4c8172d2c08e1 |

#### 钢协刊物

| 栏目       | id                                                               |
| ---------- | ---------------------------------------------------------------- |
| 钢协刊物   | ed51af486f6d4b313b3aaf8fea0b32a4a2d4a89714c61992caf01942eb61831b |
| 中国钢铁业 | 6440bdfccadf87908b13d8bbd9a66bb89bbd60cc5e175c018ca1c62c7d55e61f |
| 钢铁信息   | 2b66af0b2cda9b420739e55e255a6f72f277557670ef861c9956da8fde25da05 |
</details>`,
};

async function handler(ctx) {
    const { id = '58af05dfb6b4300151760176d2aad0a04c275aaadbb1315039263f021f920dcd' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const rootUrl = 'https://www.chinaisa.org.cn';

    const apiUrl = new URL('gxportal/xfpt/portal/getColumnList', rootUrl).href;
    const apiArticleUrl = new URL('gxportal/xfpt/portal/viewArticleById', rootUrl).href;
    const currentUrl = new URL(`gxportal/xfgl/portal/list.html?columnId=${id}`, rootUrl).href;

    const response = await ofetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            params: encodeURI(`{"columnId":"${id}"}`),
        }),
        parseResponse: JSON.parse,
    });

    let $ = load(response.articleListHtml);

    let items = $('ul.list li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.prop('title') ?? item.text(),
                link: new URL(`gxportal/xfgl/portal/${item.prop('href')}`, rootUrl).href,
                guid: item.prop('href').match(/articleId=(\w+)/)[1],
                pubDate: parseDate(item.parent().find('span.times').text().replaceAll('[]', '')),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(apiArticleUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        params: encodeURI(`{"articleId":"${item.guid}","columnId":"${id}"}`),
                    }),
                    parseResponse: JSON.parse,
                });

                const articleContent = detailResponse.article_content;

                const content = load(articleContent);

                const matches = articleContent.match(/文章来源：(.*?)日期：(\d+-\d+-\d+)/);

                item.title = content('div.article_title').contents().first().text() || item.title;
                item.description = content('div.article_main').html();
                item.author = matches[1].split(/&/)[0];
                item.guid = `chinaisa-${item.guid}`;
                item.pubDate = parseDate(matches[2]);

                return item;
            })
        )
    );

    const subtitle = $('div.head-tit').text();

    const currentResponse = await ofetch(currentUrl);

    $ = load(currentResponse);

    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title: `${$('title').text()} - ${subtitle}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'cn',
        image: new URL('img/logo.jpg', rootUrl).href,
        icon,
        logo: icon,
        subtitle,
        allowEmpty: true,
    };
}
