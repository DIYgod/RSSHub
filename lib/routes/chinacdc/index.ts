import path from 'node:path';

import { type CheerioAPI, type Cheerio, type Element, load } from 'cheerio';
import { type Context } from 'hono';

import { type DataItem, type Route, type Data, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import { getCurrentPath } from '@/utils/helpers';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const __dirname = getCurrentPath(import.meta.url);

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'zxyw' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '11', 10);

    const rootUrl: string = 'https://www.chinacdc.cn';
    const targetUrl: string = new URL(category.endsWith('/') ? category : `${category}/`, rootUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language: string = $('html').prop('lang');

    let items: DataItem[] = $('ul.xw_list li')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item: Cheerio<Element> = $(item);

            const aEl: Cheerio<Element> = $item.find('a');

            const title: string = aEl.prop('title') || aEl.text();

            const description: string = art(path.join(__dirname, 'templates/description.art'), {
                intro: $item.find('p.zy').text(),
            });

            const imageSrc: string | undefined = $item.find('img').prop('src');
            const imageType: string | undefined = imageSrc?.split(/\./).pop();
            const image: string | undefined = imageSrc ? new URL(imageSrc, targetUrl).href : undefined;
            const media: Record<string, Record<string, string>> = {};

            if (imageType && image) {
                media[imageType] = { url: image };
            }

            return {
                title,
                description,
                pubDate: parseDate($item.find('span').text()),
                link: new URL(aEl.prop('href') as string, targetUrl).href,
                content: {
                    html: description,
                    text: $item.find('p.zy').text(),
                },
                image,
                banner: image,
                language,
                media: Object.keys(media).length > 0 ? media : undefined,
            };
        });

    items = (
        await Promise.all(
            items.map((item) => {
                if (!item.link && typeof item.link !== 'string') {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $$: CheerioAPI = load(detailResponse);

                    const title: string = $$('h5').text();
                    const description: string = art(path.join(__dirname, 'templates/description.art'), {
                        description: $$('div.TRS_Editor').html(),
                    });

                    return {
                        title,
                        description,
                        pubDate: parseDate($$('span.fb em').text()),
                        content: {
                            html: description,
                            text: $$('div.TRS_Editor').text(),
                        },
                        image: item.image,
                        banner: item.banner,
                        language,
                        media: item.media,
                    };
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    const author: string = $('title').text();
    const title: string = $('div.erjiCurNav').text();
    const feedImage: string = new URL($('img.logo').prop('src') as string, targetUrl).href;

    return {
        title: `${author} - ${title}`,
        description: title,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: feedImage,
        author,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/:category{.+}?',
    name: '通用',
    url: 'www.chinacdc.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/chinacdc/zxyw',
    parameters: {
        category: '分类，默认为 `zxyw`，即中心要闻，可在对应分类页 URL 中找到, Category, `zxyw`，即中心要闻 by default',
    },
    description: `:::tip
若订阅 [中心要闻](https://www.chinacdc.cn/zxyw/)，网址为 \`https://www.chinacdc.cn/zxyw/\`，请截取 \`https://www.chinacdc.cn/\` 到末尾 \`/\` 的部分 \`zxyw\` 作为 \`category\` 参数填入，此时目标路由为 [\`/chinacdc/zxyw\`](https://rsshub.app/chinacdc/zxyw)。
:::

| [中心要闻](https://www.chinacdc.cn/zxyw/) | [通知公告](https://www.chinacdc.cn/tzgg/) |
| ----------------------------------------- | ----------------------------------------- |
| [zxyw](https://rsshub.app/chinacdc/zxyw)  | [tzgg](https://rsshub.app/chinacdc/tzgg)  |

<details>
  <summary>更多分类</summary>

#### [党建园地](https://www.chinacdc.cn/dqgz/djgz/)

| [党建工作](https://www.chinacdc.cn/dqgz/djgz/)     | [廉政文化](https://www.chinacdc.cn/djgz_13611/)                | [工会工作](https://www.chinacdc.cn/ghgz/)          | [团青工作](https://www.chinacdc.cn/tqgz/)          | [理论学习](https://www.chinacdc.cn/tqgz_13618/)                |
| -------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| [dqgz/djgz](https://rsshub.app/chinacdc/dqgz/djgz) | [dqgz/djgz_13611](https://rsshub.app/chinacdc/dqgz/djgz_13611) | [dqgz/ghgz](https://rsshub.app/chinacdc/dqgz/ghgz) | [dqgz/tqgz](https://rsshub.app/chinacdc/dqgz/tqgz) | [dqgz/tqgz_13618](https://rsshub.app/chinacdc/dqgz/tqgz_13618) |

#### [疾控应急](https://www.chinacdc.cn/jkyj/)

| [传染病](https://www.chinacdc.cn/jkyj/crb2/)       | [突发公共卫生事件](https://www.chinacdc.cn/jkyj/tfggws/) | [慢性病与伤害防控](https://www.chinacdc.cn/jkyj/mxfcrxjb2/)  | [烟草控制](https://www.chinacdc.cn/jkyj/yckz/)     | [营养与健康](https://www.chinacdc.cn/jkyj/yyyjk2/)     |
| -------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------ |
| [jkyj/crb2](https://rsshub.app/chinacdc/jkyj/crb2) | [jkyj/tfggws](https://rsshub.app/chinacdc/jkyj/tfggws)   | [jkyj/mxfcrxjb2](https://rsshub.app/chinacdc/jkyj/mxfcrxjb2) | [jkyj/yckz](https://rsshub.app/chinacdc/jkyj/yckz) | [jkyj/yyyjk2](https://rsshub.app/chinacdc/jkyj/yyyjk2) |

| [环境与健康](https://www.chinacdc.cn/jkyj/hjyjk/)    | [职业卫生与中毒控制](https://www.chinacdc.cn/jkyj/hjwsyzdkz/) | [放射卫生](https://www.chinacdc.cn/jkyj/fsws/)     | [免疫规划](https://www.chinacdc.cn/jkyj/mygh02/)       | [结核病防控](https://www.chinacdc.cn/jkyj/jhbfk/)    |
| ---------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| [jkyj/hjyjk](https://rsshub.app/chinacdc/jkyj/hjyjk) | [jkyj/hjwsyzdkz](https://rsshub.app/chinacdc/jkyj/hjwsyzdkz)  | [jkyj/fsws](https://rsshub.app/chinacdc/jkyj/fsws) | [jkyj/mygh02](https://rsshub.app/chinacdc/jkyj/mygh02) | [jkyj/jhbfk](https://rsshub.app/chinacdc/jkyj/jhbfk) |

| [寄生虫病](https://www.chinacdc.cn/jkyj/jscb/)     |
| -------------------------------------------------- |
| [jkyj/jscb](https://rsshub.app/chinacdc/jkyj/jscb) |

#### [科学研究](https://www.chinacdc.cn/kxyj/)

| [科技进展](https://www.chinacdc.cn/kxyj/kjjz/)     | [学术动态](https://www.chinacdc.cn/kxyj/xsdt/)     | [科研平台](https://www.chinacdc.cn/kxyj/xsjl/)     | [科研亮点](https://www.chinacdc.cn/kxyj/kyld/)     | [科技政策](https://www.chinacdc.cn/kxyj/kjzc/)     |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| [kxyj/kjjz](https://rsshub.app/chinacdc/kxyj/kjjz) | [kxyj/xsdt](https://rsshub.app/chinacdc/kxyj/xsdt) | [kxyj/xsjl](https://rsshub.app/chinacdc/kxyj/xsjl) | [kxyj/kyld](https://rsshub.app/chinacdc/kxyj/kyld) | [kxyj/kjzc](https://rsshub.app/chinacdc/kxyj/kjzc) |

#### [教育培训](https://www.chinacdc.cn/jypx/)

| [研究生院](https://www.chinacdc.cn/jypx/yjsy/)     | [继续教育](https://www.chinacdc.cn/jypx/jxjy/)     | [博士后](https://www.chinacdc.cn/jypx/bsh/)      | [中国现场流行病学培训项目（CFETP）](https://www.chinacdc.cn/jypx/CFETP/) |
| -------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| [jypx/yjsy](https://rsshub.app/chinacdc/jypx/yjsy) | [jypx/jxjy](https://rsshub.app/chinacdc/jypx/jxjy) | [jypx/bsh](https://rsshub.app/chinacdc/jypx/bsh) | [jypx/CFETP](https://rsshub.app/chinacdc/jypx/CFETP)                     |

#### [全球公卫](https://www.chinacdc.cn/qqgw/)

| [合作伙伴](https://www.chinacdc.cn/qqgw/hzhb/)     | [世界卫生组织合作中心和参比实验室](https://www.chinacdc.cn/qqgw/wszz/) | [国际交流(港澳台交流)](https://www.chinacdc.cn/qqgw/gjjl/) | [公共卫生援外与合作](https://www.chinacdc.cn/qqgw/ggws/) |
| -------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| [qqgw/hzhb](https://rsshub.app/chinacdc/qqgw/hzhb) | [qqgw/wszz](https://rsshub.app/chinacdc/qqgw/wszz)                     | [qqgw/gjjl](https://rsshub.app/chinacdc/qqgw/gjjl)         | [qqgw/ggws](https://rsshub.app/chinacdc/qqgw/ggws)       |

#### [人才建设](https://www.chinacdc.cn/rcjs/)

| [院士风采](https://www.chinacdc.cn/rcjs/ysfc/)     | [首席专家](https://www.chinacdc.cn/rcjs/sxzj/)     | [人才队伍](https://www.chinacdc.cn/rcjs/rcdw/)     | [人才招聘](https://www.chinacdc.cn/rcjs/rczp/)     |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| [rcjs/ysfc](https://rsshub.app/chinacdc/rcjs/ysfc) | [rcjs/sxzj](https://rsshub.app/chinacdc/rcjs/sxzj) | [rcjs/rcdw](https://rsshub.app/chinacdc/rcjs/rcdw) | [rcjs/rczp](https://rsshub.app/chinacdc/rcjs/rczp) |

#### [健康数据](https://www.chinacdc.cn/jksj/)

| [全国法定传染病疫情情况](https://www.chinacdc.cn/jksj/jksj01/) | [全国新型冠状病毒感染疫情情况](https://www.chinacdc.cn/jksj/xgbdyq/) | [重点传染病和突发公共卫生事件风险评估报告](https://www.chinacdc.cn/jksj/jksj02/) | [全球传染病事件风险评估报告](https://www.chinacdc.cn/jksj/jksj03/) | [全国预防接种异常反应监测信息概况](https://www.chinacdc.cn/jksj/jksj04_14209/) |
| -------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| [jksj/jksj01](https://rsshub.app/chinacdc/jksj/jksj01)         | [jksj/xgbdyq](https://rsshub.app/chinacdc/jksj/xgbdyq)               | [jksj/jksj02](https://rsshub.app/chinacdc/jksj/jksj02)                           | [jksj/jksj03](https://rsshub.app/chinacdc/jksj/jksj03)             | [jksj/jksj04_14209](https://rsshub.app/chinacdc/jksj/jksj04_14209)             |

| [流感监测周报](https://www.chinacdc.cn/jksj/jksj04_14249/)         | [全国急性呼吸道传染病哨点监测情况](https://www.chinacdc.cn/jksj/jksj04_14275/) | [健康报告](https://www.chinacdc.cn/jksj/jksj04/)       |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------ |
| [jksj/jksj04_14249](https://rsshub.app/chinacdc/jksj/jksj04_14249) | [jksj/jksj04_14275](https://rsshub.app/chinacdc/jksj/jksj04_14275)             | [jksj/jksj04](https://rsshub.app/chinacdc/jksj/jksj04) |

#### [健康科普](https://www.chinacdc.cn/jkkp/)

| [传染病](https://www.chinacdc.cn/jkkp/crb/)      | [慢性非传染性疾病](https://www.chinacdc.cn/jkkp/mxfcrb/) | [免疫规划](https://www.chinacdc.cn/jkkp/mygh/)     | [公共卫生事件](https://www.chinacdc.cn/jkkp/ggws/) | [烟草控制](https://www.chinacdc.cn/jkkp/yckz/)     |
| ------------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| [jkkp/crb](https://rsshub.app/chinacdc/jkkp/crb) | [jkkp/mxfcrb](https://rsshub.app/chinacdc/jkkp/mxfcrb)   | [jkkp/mygh](https://rsshub.app/chinacdc/jkkp/mygh) | [jkkp/ggws](https://rsshub.app/chinacdc/jkkp/ggws) | [jkkp/yckz](https://rsshub.app/chinacdc/jkkp/yckz) |

| [营养与健康](https://www.chinacdc.cn/jkkp/yyjk/)   | [环境健康](https://www.chinacdc.cn/jkkp/hjjk/)     | [职业健康与中毒控制](https://www.chinacdc.cn/jkkp/zyjk/) | [放射卫生](https://www.chinacdc.cn/jkkp/fsws/)     |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------- |
| [jkkp/yyjk](https://rsshub.app/chinacdc/jkkp/yyjk) | [jkkp/hjjk](https://rsshub.app/chinacdc/jkkp/hjjk) | [jkkp/zyjk](https://rsshub.app/chinacdc/jkkp/zyjk)       | [jkkp/fsws](https://rsshub.app/chinacdc/jkkp/fsws) |

</details>
`,
    categories: ['government'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.chinacdc.cn/:category'],
            target: (params) => {
                const category = params.category;

                return `/chinacdc${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '中心要闻',
            source: ['www.chinacdc.cn/zxyw/'],
            target: '/zxyw',
        },
        {
            title: '通知公告',
            source: ['www.chinacdc.cn/tzgg/'],
            target: '/tzgg',
        },
        {
            title: '党建园地 - 廉政文化',
            source: ['www.chinacdc.cn/djgz_13611/'],
            target: '/dqgz/djgz_13611',
        },
        {
            title: '党建园地 - 党建工作',
            source: ['www.chinacdc.cn/dqgz/'],
            target: '/dqgz/djgz',
        },
        {
            title: '党建园地 - 廉政文化',
            source: ['www.chinacdc.cn/djgz_13611/'],
            target: '/dqgz/djgz_13611',
        },
        {
            title: '党建园地 - 工会工作',
            source: ['www.chinacdc.cn/ghgz/'],
            target: '/dqgz/ghgz',
        },
        {
            title: '党建园地 - 团青工作',
            source: ['www.chinacdc.cn/tqgz/'],
            target: '/dqgz/tqgz',
        },
        {
            title: '党建园地 - 理论学习',
            source: ['www.chinacdc.cn/tqgz_13618/'],
            target: '/dqgz/tqgz_13618',
        },
        {
            title: '疾控应急 - 传染病',
            source: ['www.chinacdc.cn/jkyj/crb2/'],
            target: '/jkyj/crb2',
        },
        {
            title: '疾控应急 - 突发公共卫生事件',
            source: ['www.chinacdc.cn/jkyj/tfggws/'],
            target: '/jkyj/tfggws',
        },
        {
            title: '疾控应急 - 慢性病与伤害防控',
            source: ['www.chinacdc.cn/jkyj/mxfcrxjb2/'],
            target: '/jkyj/mxfcrxjb2',
        },
        {
            title: '疾控应急 - 烟草控制',
            source: ['www.chinacdc.cn/jkyj/yckz/'],
            target: '/jkyj/yckz',
        },
        {
            title: '疾控应急 - 营养与健康',
            source: ['www.chinacdc.cn/jkyj/yyyjk2/'],
            target: '/jkyj/yyyjk2',
        },
        {
            title: '疾控应急 - 环境与健康',
            source: ['www.chinacdc.cn/jkyj/hjyjk/'],
            target: '/jkyj/hjyjk',
        },
        {
            title: '疾控应急 - 职业卫生与中毒控制',
            source: ['www.chinacdc.cn/jkyj/hjwsyzdkz/'],
            target: '/jkyj/hjwsyzdkz',
        },
        {
            title: '疾控应急 - 放射卫生',
            source: ['www.chinacdc.cn/jkyj/fsws/'],
            target: '/jkyj/fsws',
        },
        {
            title: '疾控应急 - 免疫规划',
            source: ['www.chinacdc.cn/jkyj/mygh02/'],
            target: '/jkyj/mygh02',
        },
        {
            title: '疾控应急 - 结核病防控',
            source: ['www.chinacdc.cn/jkyj/jhbfk/'],
            target: '/jkyj/jhbfk',
        },
        {
            title: '疾控应急 - 寄生虫病',
            source: ['www.chinacdc.cn/jkyj/jscb/'],
            target: '/jkyj/jscb',
        },
        {
            title: '科学研究 - 科技进展',
            source: ['www.chinacdc.cn/kxyj/kjjz/'],
            target: '/kxyj/kjjz',
        },
        {
            title: '科学研究 - 学术动态',
            source: ['www.chinacdc.cn/kxyj/xsdt/'],
            target: '/kxyj/xsdt',
        },
        {
            title: '科学研究 - 科研平台',
            source: ['www.chinacdc.cn/kxyj/xsjl/'],
            target: '/kxyj/xsjl',
        },
        {
            title: '科学研究 - 科研亮点',
            source: ['www.chinacdc.cn/kxyj/kyld/'],
            target: '/kxyj/kyld',
        },
        {
            title: '科学研究 - 科技政策',
            source: ['www.chinacdc.cn/kxyj/kjzc/'],
            target: '/kxyj/kjzc',
        },
        {
            title: '教育培训 - 研究生院',
            source: ['www.chinacdc.cn/jypx/yjsy/'],
            target: '/jypx/yjsy',
        },
        {
            title: '教育培训 - 继续教育',
            source: ['www.chinacdc.cn/jypx/jxjy/'],
            target: '/jypx/jxjy',
        },
        {
            title: '教育培训 - 博士后',
            source: ['www.chinacdc.cn/jypx/bsh/'],
            target: '/jypx/bsh',
        },
        {
            title: '教育培训 - 中国现场流行病学培训项目（CFETP）',
            source: ['www.chinacdc.cn/jypx/CFETP/'],
            target: '/jypx/CFETP',
        },
        {
            title: '全球公卫 - 合作伙伴',
            source: ['www.chinacdc.cn/qqgw/hzhb/'],
            target: '/qqgw/hzhb',
        },
        {
            title: '全球公卫 - 世界卫生组织合作中心和参比实验室',
            source: ['www.chinacdc.cn/qqgw/wszz/'],
            target: '/qqgw/wszz',
        },
        {
            title: '全球公卫 - 国际交流(港澳台交流)',
            source: ['www.chinacdc.cn/qqgw/gjjl/'],
            target: '/qqgw/gjjl',
        },
        {
            title: '全球公卫 - 公共卫生援外与合作',
            source: ['www.chinacdc.cn/qqgw/ggws/'],
            target: '/qqgw/ggws',
        },
        {
            title: '人才建设 - 院士风采',
            source: ['www.chinacdc.cn/rcjs/ysfc/'],
            target: '/rcjs/ysfc',
        },
        {
            title: '人才建设 - 首席专家',
            source: ['www.chinacdc.cn/rcjs/sxzj/'],
            target: '/rcjs/sxzj',
        },
        {
            title: '人才建设 - 人才队伍',
            source: ['www.chinacdc.cn/rcjs/rcdw/'],
            target: '/rcjs/rcdw',
        },
        {
            title: '人才建设 - 人才招聘',
            source: ['www.chinacdc.cn/rcjs/rczp/'],
            target: '/rcjs/rczp',
        },
        {
            title: '健康数据 - 全国法定传染病疫情情况',
            source: ['www.chinacdc.cn/jksj/jksj01/'],
            target: '/jksj/jksj01',
        },
        {
            title: '健康数据 - 全国新型冠状病毒感染疫情情况',
            source: ['www.chinacdc.cn/jksj/xgbdyq/'],
            target: '/jksj/xgbdyq',
        },
        {
            title: '健康数据 - 重点传染病和突发公共卫生事件风险评估报告',
            source: ['www.chinacdc.cn/jksj/jksj02/'],
            target: '/jksj/jksj02',
        },
        {
            title: '健康数据 - 全球传染病事件风险评估报告',
            source: ['www.chinacdc.cn/jksj/jksj03/'],
            target: '/jksj/jksj03',
        },
        {
            title: '健康数据 - 全国预防接种异常反应监测信息概况',
            source: ['www.chinacdc.cn/jksj/jksj04_14209/'],
            target: '/jksj/jksj04_14209',
        },
        {
            title: '健康数据 - 流感监测周报',
            source: ['www.chinacdc.cn/jksj/jksj04_14249/'],
            target: '/jksj/jksj04_14249',
        },
        {
            title: '健康数据 - 全国急性呼吸道传染病哨点监测情况',
            source: ['www.chinacdc.cn/jksj/jksj04_14275/'],
            target: '/jksj/jksj04_14275',
        },
        {
            title: '健康数据 - 健康报告',
            source: ['www.chinacdc.cn/jksj/jksj04/'],
            target: '/jksj/jksj04',
        },
        {
            title: '健康科普 - 传染病',
            source: ['www.chinacdc.cn/jkkp/crb/'],
            target: '/jkkp/crb',
        },
        {
            title: '健康科普 - 慢性非传染性疾病',
            source: ['www.chinacdc.cn/jkkp/mxfcrb/'],
            target: '/jkkp/mxfcrb',
        },
        {
            title: '健康科普 - 免疫规划',
            source: ['www.chinacdc.cn/jkkp/mygh/'],
            target: '/jkkp/mygh',
        },
        {
            title: '健康科普 - 公共卫生事件',
            source: ['www.chinacdc.cn/jkkp/ggws/'],
            target: '/jkkp/ggws',
        },
        {
            title: '健康科普 - 烟草控制',
            source: ['www.chinacdc.cn/jkkp/yckz/'],
            target: '/jkkp/yckz',
        },
        {
            title: '健康科普 - 营养与健康',
            source: ['www.chinacdc.cn/jkkp/yyjk/'],
            target: '/jkkp/yyjk',
        },
        {
            title: '健康科普 - 环境健康',
            source: ['www.chinacdc.cn/jkkp/hjjk/'],
            target: '/jkkp/hjjk',
        },
        {
            title: '健康科普 - 职业健康与中毒控制',
            source: ['www.chinacdc.cn/jkkp/zyjk/'],
            target: '/jkkp/zyjk',
        },
        {
            title: '健康科普 - 放射卫生',
            source: ['www.chinacdc.cn/jkkp/fsws/'],
            target: '/jkkp/fsws',
        },
    ],
    view: ViewType.Articles,
};
