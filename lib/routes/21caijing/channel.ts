import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const processMenu = (data: any[]) => {
    const result = {};

    const processMenuItem = (item, parentPath = '', parentUrl?, parentShort?) => {
        const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name;
        const currentUrl = item.url || parentUrl;
        const currentApiUrl = item.api || item.children?.[0]?.api;
        const currentShort = parentShort || currentUrl.split('/channel/').pop();

        if (currentUrl && currentApiUrl) {
            result[currentPath] = {
                url: currentUrl,
                apiUrl: currentApiUrl,
                short: currentShort || '',
            };
        }

        if (item.children && item.children.length > 0) {
            for (const child of item.children) {
                processMenuItem(child, currentPath, currentUrl, currentShort);
            }
        }
    };

    for (const item of data) {
        processMenuItem(item);
    }

    return result;
};

export const handler = async (ctx: Context): Promise<Data> => {
    const { name = '热点' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const domain: string = 'm.21jingji.com';
    const baseUrl: string = `https://${domain}`;
    const staticBaseUrl: string = 'https://static.21jingji.com';
    const menuUrl: string = new URL('m/webMenu.json', staticBaseUrl).href;

    const menuResponse = await ofetch(menuUrl);
    const menu = processMenu(menuResponse);

    if (!menu.hasOwnProperty(name)) {
        throw new InvalidParameterError('Invalid channel name');
    }

    const currentChannel = menu[name];

    const apiUrl: string = new URL(currentChannel.apiUrl, baseUrl).href;
    const targetUrl: string = new URL(`#/${currentChannel.url}`, baseUrl).href;
    const authUrl: string = new URL('reader/cbhChannelAuth', baseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language: string = $('html').attr('lang') ?? 'zh-CN';

    const authResponse = await ofetch(authUrl, {
        method: 'POST',
        responseType: 'json',
    });

    const response = await ofetch(apiUrl, {
        query: {
            short: currentChannel.short,
            type: 'json',
            page: 1,
        },
        headers: {
            authorization: authResponse.token,
            host: domain,
            referer: baseUrl,
        },
    });

    let items: DataItem[] = [];

    items = JSON.parse(response)
        .slice(0, limit)
        .map((item): DataItem => {
            const title: string = item.title;
            const pubDate: string = item.inputtime;
            const linkUrl: string | undefined = item.url;
            const categories: string[] = [...new Set(((item.keywords ?? '') as string)?.split(/,/).filter(Boolean))];
            const authors: DataItem['author'] = [...new Set([item.mp?.name, item.author, item.editor, item.source].filter(Boolean))].map((name) => ({
                name,
            }));
            const guid: string = `21jingji-${item.id}`;
            const image: string | undefined = item.image ?? item.thumb ?? item.listthumb;
            const updated: number | string = item.updatetime;

            const processedItem: DataItem = {
                title,
                pubDate: pubDate ? timezone(parseRelativeDate(pubDate), +8) : undefined,
                link: linkUrl,
                category: categories,
                author: authors,
                guid,
                id: guid,
                image,
                banner: image,
                updated: updated ? parseDate(updated, 'X') : undefined,
                language,
            };

            return processedItem;
        });

    items = (
        await Promise.all(
            items.map((item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $$: CheerioAPI = load(detailResponse);

                    $$('div.rela-box').remove();
                    $$('div.copyright').remove();

                    const title: string = $$('div.titleHead h1').text();
                    const description: string = $$('div.main_content, div.txtContent').html() ?? '';
                    const pubDateStr: string | undefined = $$('div.author-infos span')
                        .text()
                        .match(/(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2})/)?.[1];
                    const categories: string[] = $$('meta[name="keywords"]').attr('content')?.split(/,/) ?? item.category ?? [];
                    const upDatedStr: string | undefined = pubDateStr;

                    const processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : item.pubDate,
                        category: categories,
                        content: {
                            html: description,
                            text: description,
                        },
                        updated: upDatedStr ? timezone(parseDate(upDatedStr), +8) : item.updated,
                        language,
                    };

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    const author: string = $('title').text();

    return {
        title: `${author} - ${name}`,
        description: $('meta[name=description]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        author,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/channel/:name{.+}?',
    name: '频道',
    url: 'm.21jingji.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/21caijing/channel/热点',
    parameters: {
        category: '分类，默认为热点，可在对应分类页 URL 中找到',
    },
    description: `::: tip
若订阅 [热点](https://m.21jingji.com/#/)，请将 \`热点\` 作为 \`name\` 参数填入，此时目标路由为 [\`/21caijing/channel/热点\`](https://rsshub.app/21caijing/channel/热点)。

若订阅 [投资通 - 盘前情报](https://m.21jingji.com/#/channel/investment)，请将 \`投资通/盘前情报\` 作为 \`name\` 参数填入，此时目标路由为 [\`/21caijing/channel/投资通/盘前情报\`](https://rsshub.app/21caijing/channel/投资通/盘前情报)。
:::

<details>
<summary>更多分类</summary>

#### [热点](https://m.21jingji.com/#/)

#### [投资通](https://m.21jingji.com/#/channel/investment)

| [推荐](https://m.21jingji.com/#/channel/investment)            | [盘前情报](https://m.21jingji.com/#/channel/premkt)                    | [公司洞察](https://m.21jingji.com/#/channel/gsdc)                      | [南财研选](https://m.21jingji.com/#/channel/ncyx)                      | [龙虎榜](https://m.21jingji.com/#/channel/lhb)                     | [公告精选](https://m.21jingji.com/#/channel/notice)                    | [牛熊透视](https://m.21jingji.com/#/channel/bullbear)                  | [一周前瞻](https://m.21jingji.com/#/channel/dailyfx)                   | [财经日历](https://m.21jingji.com/#/)                                   | [风口掘金](https://m.21jingji.com/#/channel/windgap)                   | [实时解盘](https://m.21jingji.com/#/channel/marketanalysis)            | [调研内参](https://m.21jingji.com/#/channel/research)                  | [趋势前瞻](https://m.21jingji.com/#/channel/tendency)                  | [硬核选基](https://m.21jingji.com/#/channel/yhxj)                      | [3 分钟理财](https://m.21jingji.com/#/channel/sfzlc)                      | [AI 智讯](https://m.21jingji.com/#/channel/aizx)                    | [北向资金](https://m.21jingji.com/#/channel/northmoney)                |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [投资通/推荐](https://rsshub.app/21caijing/channel/投资通/推荐) | [投资通/盘前情报](https://rsshub.app/21caijing/channel/投资通/盘前情报) | [投资通/公司洞察](https://rsshub.app/21caijing/channel/投资通/公司洞察) | [投资通/南财研选](https://rsshub.app/21caijing/channel/投资通/南财研选) | [投资通/龙虎榜](https://rsshub.app/21caijing/channel/投资通/龙虎榜) | [投资通/公告精选](https://rsshub.app/21caijing/channel/投资通/公告精选) | [投资通/牛熊透视](https://rsshub.app/21caijing/channel/投资通/牛熊透视) | [投资通/一周前瞻](https://rsshub.app/21caijing/channel/投资通/一周前瞻) | [投资通/财经日历](https://rsshub.app/21caijing/channel/投资通/财经日历) | [投资通/风口掘金](https://rsshub.app/21caijing/channel/投资通/风口掘金) | [投资通/实时解盘](https://rsshub.app/21caijing/channel/投资通/实时解盘) | [投资通/调研内参](https://rsshub.app/21caijing/channel/投资通/调研内参) | [投资通/趋势前瞻](https://rsshub.app/21caijing/channel/投资通/趋势前瞻) | [投资通/硬核选基](https://rsshub.app/21caijing/channel/投资通/硬核选基) | [投资通/3 分钟理财](https://rsshub.app/21caijing/channel/投资通/3分钟理财) | [投资通/AI 智讯](https://rsshub.app/21caijing/channel/投资通/AI智讯) | [投资通/北向资金](https://rsshub.app/21caijing/channel/投资通/北向资金) |

#### [金融](https://m.21jingji.com/#/channel/finance)

| [动态](https://m.21jingji.com/#/channel/finance)           | [最保险](https://m.21jingji.com/#/channel/Insurance)           | [资管](https://m.21jingji.com/#/channel/21zg)              | [数字金融](https://m.21jingji.com/#/channel/szjr)                  | [私人银行](https://m.21jingji.com/#/channel/sryh)                  | [普惠](https://m.21jingji.com/#/channel/puhui)             | [观债](https://m.21jingji.com/#/channel/21gz)              | [金融研究](https://m.21jingji.com/#/channel/jryj)                  | [投教基地](https://m.21jingji.com/#/channel/tjjd)                  | [银行](https://m.21jingji.com/#/channel/bank)              | [非银金融](https://m.21jingji.com/#/channel/nonbank)               | [金融人事](https://m.21jingji.com/#/channel/jrrs)                  |
| ----------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [金融/动态](https://rsshub.app/21caijing/channel/金融/动态) | [金融/最保险](https://rsshub.app/21caijing/channel/金融/最保险) | [金融/资管](https://rsshub.app/21caijing/channel/金融/资管) | [金融/数字金融](https://rsshub.app/21caijing/channel/金融/数字金融) | [金融/私人银行](https://rsshub.app/21caijing/channel/金融/私人银行) | [金融/普惠](https://rsshub.app/21caijing/channel/金融/普惠) | [金融/观债](https://rsshub.app/21caijing/channel/金融/观债) | [金融/金融研究](https://rsshub.app/21caijing/channel/金融/金融研究) | [金融/投教基地](https://rsshub.app/21caijing/channel/金融/投教基地) | [金融/银行](https://rsshub.app/21caijing/channel/金融/银行) | [金融/非银金融](https://rsshub.app/21caijing/channel/金融/非银金融) | [金融/金融人事](https://rsshub.app/21caijing/channel/金融/金融人事) |

#### [宏观](https://m.21jingji.com/#/channel/politics)

#### [学习经济](https://m.21jingji.com/#/jujiao/xxjjIndexV3)

| [经济思想](https://m.21jingji.com/#/https://m.21jingji.com/news/xxjj)       | [学习经济卡片](https://m.21jingji.com/#/channel/mrjj)                              | [高质量发展](https://m.21jingji.com/#/channel/gzlfz)                           | [经济政策](https://m.21jingji.com/#/channel/jjzc)                          | [广东在行动](https://m.21jingji.com/#/channel/gdzxd)                           | [数说经济](https://m.21jingji.com/#/channel/ssjj)                          | [学习视频](https://m.21jingji.com/#/channel/xxsp)                          | [学习党史](https://m.21jingji.com/#/)                                       |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [学习经济/经济思想](https://rsshub.app/21caijing/channel/学习经济/经济思想) | [学习经济/学习经济卡片](https://rsshub.app/21caijing/channel/学习经济/学习经济卡片) | [学习经济/高质量发展](https://rsshub.app/21caijing/channel/学习经济/高质量发展) | [学习经济/经济政策](https://rsshub.app/21caijing/channel/学习经济/经济政策) | [学习经济/广东在行动](https://rsshub.app/21caijing/channel/学习经济/广东在行动) | [学习经济/数说经济](https://rsshub.app/21caijing/channel/学习经济/数说经济) | [学习经济/学习视频](https://rsshub.app/21caijing/channel/学习经济/学习视频) | [学习经济/学习党史](https://rsshub.app/21caijing/channel/学习经济/学习党史) |

#### [大湾区](https://m.21jingji.com/#/channel/GHM_GreaterBay)

| [动态](https://m.21jingji.com/#/channel/GHM_GreaterBay)        | [湾区金融](https://m.21jingji.com/#/channel/wqjr)                      | [大湾区直播室](https://m.21jingji.com/#/channel/dwqzbs)                        | [高成长企业](https://m.21jingji.com/#/channel/gczqy)                       | [产业地理](https://m.21jingji.com/#/channel/cydl)                      | [数智湾区](https://m.21jingji.com/#/channel/szwq)                      | [湾区金融大咖会](https://m.21jingji.com/#/channel/wqjrdkh)                         | [“港”创科 25 人](https://m.21jingji.com/#/channel/gck)                           | [湾区论坛](https://m.21jingji.com/#/channel/wqlt)                      |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [大湾区/动态](https://rsshub.app/21caijing/channel/大湾区/动态) | [大湾区/湾区金融](https://rsshub.app/21caijing/channel/大湾区/湾区金融) | [大湾区/大湾区直播室](https://rsshub.app/21caijing/channel/大湾区/大湾区直播室) | [大湾区/高成长企业](https://rsshub.app/21caijing/channel/大湾区/高成长企业) | [大湾区/产业地理](https://rsshub.app/21caijing/channel/大湾区/产业地理) | [大湾区/数智湾区](https://rsshub.app/21caijing/channel/大湾区/数智湾区) | [大湾区/湾区金融大咖会](https://rsshub.app/21caijing/channel/大湾区/湾区金融大咖会) | [大湾区/“港”创科 25 人](https://rsshub.app/21caijing/channel/大湾区/“港”创科25人) | [大湾区/湾区论坛](https://rsshub.app/21caijing/channel/大湾区/湾区论坛) |

#### [证券](https://m.21jingji.com/#/channel/capital)

| [动态](https://m.21jingji.com/#/channel/capital)           | [赢基金](https://m.21jingji.com/#/channel/funds)               | [券业观察](https://m.21jingji.com/#/channel/securities)            | [期市一线](https://m.21jingji.com/#/channel/qsyx)                  | [ETF](https://m.21jingji.com/#/channel/govern)           |
| ----------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------- |
| [证券/动态](https://rsshub.app/21caijing/channel/证券/动态) | [证券/赢基金](https://rsshub.app/21caijing/channel/证券/赢基金) | [证券/券业观察](https://rsshub.app/21caijing/channel/证券/券业观察) | [证券/期市一线](https://rsshub.app/21caijing/channel/证券/期市一线) | [证券/ETF](https://rsshub.app/21caijing/channel/证券/ETF) |

#### [汽车](https://m.21jingji.com/#/channel/auto)

| [热闻](https://m.21jingji.com/#/channel/autofocus)         | [新汽车](https://m.21jingji.com/#/channel/newauto)             | [车访间](https://m.21jingji.com/#/channel/autointerview)       | [财说车](https://m.21jingji.com/#/channel/autofortune)         | [汽车人](https://m.21jingji.com/#/channel/autopeople)          | [汽车商业地理](https://m.21jingji.com/#/channel/autogeo)                   | [汽车金融](https://m.21jingji.com/#/channel/autofinance)           | [行业报告](https://m.21jingji.com/#/channel/autoreport)            | [聚焦](https://m.21jingji.com/#/channel/autospotlight)     |
| ----------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| [汽车/热闻](https://rsshub.app/21caijing/channel/汽车/热闻) | [汽车/新汽车](https://rsshub.app/21caijing/channel/汽车/新汽车) | [汽车/车访间](https://rsshub.app/21caijing/channel/汽车/车访间) | [汽车/财说车](https://rsshub.app/21caijing/channel/汽车/财说车) | [汽车/汽车人](https://rsshub.app/21caijing/channel/汽车/汽车人) | [汽车/汽车商业地理](https://rsshub.app/21caijing/channel/汽车/汽车商业地理) | [汽车/汽车金融](https://rsshub.app/21caijing/channel/汽车/汽车金融) | [汽车/行业报告](https://rsshub.app/21caijing/channel/汽车/行业报告) | [汽车/聚焦](https://rsshub.app/21caijing/channel/汽车/聚焦) |

#### [观点](https://m.21jingji.com/#/channel/opinion)

#### [新健康](https://m.21jingji.com/#/channel/healthnews)

| [动态](https://m.21jingji.com/#/channel/healthdt)              | [21 健讯 Daily](https://m.21jingji.com/#/channel/healthinfo)                   | [21CC](https://m.21jingji.com/#/channel/21cc)                  | [21 健谈](https://m.21jingji.com/#/channel/healthtalk)              | [名医说](https://m.21jingji.com/#/channel/doctorssay)              | [数字医疗](https://m.21jingji.com/#/channel/digitalhealth)             | [21H 院长对话](https://m.21jingji.com/#/channel/talkwithdean)                 | [医健 IPO 解码](https://m.21jingji.com/#/channel/medicalIPO)                   | [研究报告](https://m.21jingji.com/#/channel/yjbg)                      | [21 科普](https://m.21jingji.com/#/channel/healthkp)                |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [新健康/动态](https://rsshub.app/21caijing/channel/新健康/动态) | [新健康/21 健讯 Daily](https://rsshub.app/21caijing/channel/新健康/21健讯Daily) | [新健康/21CC](https://rsshub.app/21caijing/channel/新健康/21CC) | [新健康/21 健谈](https://rsshub.app/21caijing/channel/新健康/21健谈) | [新健康/名医说](https://rsshub.app/21caijing/channel/新健康/名医说) | [新健康/数字医疗](https://rsshub.app/21caijing/channel/新健康/数字医疗) | [新健康/21H 院长对话](https://rsshub.app/21caijing/channel/新健康/21H院长对话) | [新健康/医健 IPO 解码](https://rsshub.app/21caijing/channel/新健康/医健IPO解码) | [新健康/研究报告](https://rsshub.app/21caijing/channel/新健康/研究报告) | [新健康/21 科普](https://rsshub.app/21caijing/channel/新健康/21科普) |

#### [ESG](https://m.21jingji.com/#/channel/esg)

| [ESG 发布厅](https://m.21jingji.com/#/channel/esg)                  | [绿色公司](https://m.21jingji.com/#/channel/lsgs)                | [绿色金融](https://m.21jingji.com/#/channel/lsjr)                | [净零碳城市](https://m.21jingji.com/#/channel/jltcs)                 | [碳市场](https://m.21jingji.com/#/channel/)                  | [生物多样性](https://m.21jingji.com/#/channel/swdyx)                 | [行业周报](https://m.21jingji.com/#/channel/hyzb)                | [研究报告](https://m.21jingji.com/#/)                             |
| -------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| [ESG/ESG 发布厅](https://rsshub.app/21caijing/channel/ESG/ESG发布厅) | [ESG/绿色公司](https://rsshub.app/21caijing/channel/ESG/绿色公司) | [ESG/绿色金融](https://rsshub.app/21caijing/channel/ESG/绿色金融) | [ESG/净零碳城市](https://rsshub.app/21caijing/channel/ESG/净零碳城市) | [ESG/碳市场](https://rsshub.app/21caijing/channel/ESG/碳市场) | [ESG/生物多样性](https://rsshub.app/21caijing/channel/ESG/生物多样性) | [ESG/行业周报](https://rsshub.app/21caijing/channel/ESG/行业周报) | [ESG/研究报告](https://rsshub.app/21caijing/channel/ESG/研究报告) |

#### [全球市场](https://m.21jingji.com/#/channel/global)

| [动态](https://m.21jingji.com/#/channel/global)                    | [全球财经连线](https://m.21jingji.com/#/channel/globaleconomics)                   | [直击华尔街](https://m.21jingji.com/#/channel/wallstreet)                      | [百家跨国公司看中国](https://m.21jingji.com/#/channel/mnc)                                     | [全球央行观察](https://m.21jingji.com/#/channel/globalcentralbanks)                | [全球能源观察](https://m.21jingji.com/#/channel/globalenergy)                      | [美股一线](https://m.21jingji.com/#/channel/USstock)                       | [港股一线](https://m.21jingji.com/#/channel/HKstock)                       | [全球金融观察](https://m.21jingji.com/#/channel/globalfinance)                     | [联合国现场](https://m.21jingji.com/#/channel/unitednations)                   | [全球央行月报](https://m.21jingji.com/#/channel/centralbankreport)                 | [全球商品观察](https://m.21jingji.com/#/channel/globalcommodities)                 |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [全球市场/动态](https://rsshub.app/21caijing/channel/全球市场/动态) | [全球市场/全球财经连线](https://rsshub.app/21caijing/channel/全球市场/全球财经连线) | [全球市场/直击华尔街](https://rsshub.app/21caijing/channel/全球市场/直击华尔街) | [全球市场/百家跨国公司看中国](https://rsshub.app/21caijing/channel/全球市场/百家跨国公司看中国) | [全球市场/全球央行观察](https://rsshub.app/21caijing/channel/全球市场/全球央行观察) | [全球市场/全球能源观察](https://rsshub.app/21caijing/channel/全球市场/全球能源观察) | [全球市场/美股一线](https://rsshub.app/21caijing/channel/全球市场/美股一线) | [全球市场/港股一线](https://rsshub.app/21caijing/channel/全球市场/港股一线) | [全球市场/全球金融观察](https://rsshub.app/21caijing/channel/全球市场/全球金融观察) | [全球市场/联合国现场](https://rsshub.app/21caijing/channel/全球市场/联合国现场) | [全球市场/全球央行月报](https://rsshub.app/21caijing/channel/全球市场/全球央行月报) | [全球市场/全球商品观察](https://rsshub.app/21caijing/channel/全球市场/全球商品观察) |

#### [一带一路](https://m.21jingji.com/#/channel/BandR)

#### [数读](https://m.21jingji.com/#/channel/readnumber)

#### [理财通](https://m.21jingji.com/#/channel/financing)

| [动态](https://m.21jingji.com/#/channel/licaidongtai)          | [数据库](https://m.21jingji.com/#/channel/sjk)                     | [研报](https://m.21jingji.com/#/channel/yanbao)                | [投教](https://m.21jingji.com/#/channel/tj)                    | [政策](https://m.21jingji.com/#/channel/zhengce)               | [固收+](https://m.21jingji.com/#/channel/gushou)                 | [纯固收](https://m.21jingji.com/#/channel/chungushou)              | [现金](https://m.21jingji.com/#/channel/xianjin)               | [混合](https://m.21jingji.com/#/channel/hunhe)                 | [权益](https://m.21jingji.com/#/channel/quanyi)                |
| --------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- |
| [理财通/动态](https://rsshub.app/21caijing/channel/理财通/动态) | [理财通/数据库](https://rsshub.app/21caijing/channel/理财通/数据库) | [理财通/研报](https://rsshub.app/21caijing/channel/理财通/研报) | [理财通/投教](https://rsshub.app/21caijing/channel/理财通/投教) | [理财通/政策](https://rsshub.app/21caijing/channel/理财通/政策) | [理财通/固收+](https://rsshub.app/21caijing/channel/理财通/固收+) | [理财通/纯固收](https://rsshub.app/21caijing/channel/理财通/纯固收) | [理财通/现金](https://rsshub.app/21caijing/channel/理财通/现金) | [理财通/混合](https://rsshub.app/21caijing/channel/理财通/混合) | [理财通/权益](https://rsshub.app/21caijing/channel/理财通/权益) |

#### [直播](https://m.21jingji.com/#/channel/live)

#### [长三角](https://m.21jingji.com/#/channel/yangtzeriverdelta)

#### [论坛活动](https://m.21jingji.com/#/channel/market)

#### [创投](https://m.21jingji.com/#/channel/entrepreneur)

#### [投教](https://m.21jingji.com/#/channel/tjzjy)

| [动态](https://m.21jingji.com/#/channel/tjzjy)             | [投教知识](https://m.21jingji.com/#/channel/tjzs)                  | [公益活动](https://m.21jingji.com/#/channel/gyhd)                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [投教/动态](https://rsshub.app/21caijing/channel/投教/动态) | [投教/投教知识](https://rsshub.app/21caijing/channel/投教/投教知识) | [投教/公益活动](https://rsshub.app/21caijing/channel/投教/公益活动) |

#### [海洋经济](https://m.21jingji.com/#/channel/oceaneconomy)

#### [数字合规](https://m.21jingji.com/#/channel/compliance)

#### [公司](https://m.21jingji.com/#/channel/company)

| [动态](https://m.21jingji.com/#/channel/company)           | [电子通信](https://m.21jingji.com/#/channel/electrocommunication)  | [互联网](https://m.21jingji.com/#/channel/internet)            | [高端制造](https://m.21jingji.com/#/channel/highend)               | [新能源](https://m.21jingji.com/#/channel/newenergy)           | [消费](https://m.21jingji.com/#/channel/consumption)       | [地产基建](https://m.21jingji.com/#/channel/infrastructure)        | [IPO](https://m.21jingji.com/#/channel/IPO)              | [文旅](https://m.21jingji.com/#/channel/culturetravel)     |
| ----------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| [公司/动态](https://rsshub.app/21caijing/channel/公司/动态) | [公司/电子通信](https://rsshub.app/21caijing/channel/公司/电子通信) | [公司/互联网](https://rsshub.app/21caijing/channel/公司/互联网) | [公司/高端制造](https://rsshub.app/21caijing/channel/公司/高端制造) | [公司/新能源](https://rsshub.app/21caijing/channel/公司/新能源) | [公司/消费](https://rsshub.app/21caijing/channel/公司/消费) | [公司/地产基建](https://rsshub.app/21caijing/channel/公司/地产基建) | [公司/IPO](https://rsshub.app/21caijing/channel/公司/IPO) | [公司/文旅](https://rsshub.app/21caijing/channel/公司/文旅) |

#### [人文](https://m.21jingji.com/#/channel/life)

#### [SFC Global](https://m.21jingji.com/#/channel/SFCGlobal)

| [News](https://m.21jingji.com/#/channel/SFCGlobal)                     | [SFC Markets and Finance](https://m.21jingji.com/#/channel/ SFCMarketsandFinance)                            | [SFC Market Talk](https://m.21jingji.com/#/channel/ SFCMarketTalk)                           | [CBN](https://m.21jingji.com/#/channel/CBN)                          | [Multinationals on China](https://m.21jingji.com/#/channel/MultinationalsonChina)                            | [Companies in the GBA](https://m.21jingji.com/#/channel/CompaniesintheGBA)                             |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [SFC Global/News](https://rsshub.app/21caijing/channel/SFC Global/News) | [SFC Global/SFC Markets and Finance](https://rsshub.app/21caijing/channel/SFC Global/SFC Markets and Finance) | [SFC Global/SFC Market Talk](https://rsshub.app/21caijing/channel/SFC Global/SFC Market Talk) | [SFC Global/CBN](https://rsshub.app/21caijing/channel/SFC Global/CBN) | [SFC Global/Multinationals on China](https://rsshub.app/21caijing/channel/SFC Global/Multinationals on China) | [SFC Global/Companies in the GBA](https://rsshub.app/21caijing/channel/SFC Global/Companies in the GBA) |

#### [南方财经报道](https://m.21jingji.com/#/channel/nfcjbd)

#### [链上预制菜](https://m.21jingji.com/#/channel/precookedfood)

| [动态](https://m.21jingji.com/#/channel/precookedfood)                 | [活动](https://m.21jingji.com/#/channel/foodevent)                     | [报道](https://m.21jingji.com/#/channel/foodnews)                      | [智库/课题](https://m.21jingji.com/#/channel/foodtopic)                          | [数据/创新案例](https://m.21jingji.com/#/channel/foodcase)                               | [链接平台](https://m.21jingji.com/#/channel/foodlink)                          |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [链上预制菜/动态](https://rsshub.app/21caijing/channel/链上预制菜/动态) | [链上预制菜/活动](https://rsshub.app/21caijing/channel/链上预制菜/活动) | [链上预制菜/报道](https://rsshub.app/21caijing/channel/链上预制菜/报道) | [链上预制菜/智库/课题](https://rsshub.app/21caijing/channel/链上预制菜/智库/课题) | [链上预制菜/数据/创新案例](https://rsshub.app/21caijing/channel/链上预制菜/数据/创新案例) | [链上预制菜/链接平台](https://rsshub.app/21caijing/channel/链上预制菜/链接平台) |

</details>
`,
    categories: ['finance'],
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
            title: '热点',
            source: ['m.21jingji.com/#/'],
            target: '/channel/热点',
        },
        {
            title: '投资通',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通',
        },
        {
            title: '投资通/推荐',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/推荐',
        },
        {
            title: '投资通/盘前情报',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/盘前情报',
        },
        {
            title: '投资通/公司洞察',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/公司洞察',
        },
        {
            title: '投资通/南财研选',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/南财研选',
        },
        {
            title: '投资通/龙虎榜',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/龙虎榜',
        },
        {
            title: '投资通/公告精选',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/公告精选',
        },
        {
            title: '投资通/牛熊透视',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/牛熊透视',
        },
        {
            title: '投资通/一周前瞻',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/一周前瞻',
        },
        {
            title: '投资通/财经日历',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/财经日历',
        },
        {
            title: '投资通/风口掘金',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/风口掘金',
        },
        {
            title: '投资通/实时解盘',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/实时解盘',
        },
        {
            title: '投资通/调研内参',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/调研内参',
        },
        {
            title: '投资通/趋势前瞻',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/趋势前瞻',
        },
        {
            title: '投资通/硬核选基',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/硬核选基',
        },
        {
            title: '投资通/3分钟理财',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/3分钟理财',
        },
        {
            title: '投资通/AI智讯',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/AI智讯',
        },
        {
            title: '投资通/北向资金',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投资通/北向资金',
        },
        {
            title: '金融',
            source: ['m.21jingji.com/#/channel/finance'],
            target: '/channel/金融',
        },
        {
            title: '金融/动态',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/金融/动态',
        },
        {
            title: '金融/最保险',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/金融/最保险',
        },
        {
            title: '金融/资管',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/金融/资管',
        },
        {
            title: '金融/数字金融',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/金融/数字金融',
        },
        {
            title: '金融/私人银行',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/金融/私人银行',
        },
        {
            title: '金融/普惠',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/金融/普惠',
        },
        {
            title: '金融/观债',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/金融/观债',
        },
        {
            title: '金融/金融研究',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/金融/金融研究',
        },
        {
            title: '金融/投教基地',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/金融/投教基地',
        },
        {
            title: '金融/银行',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/金融/银行',
        },
        {
            title: '金融/非银金融',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/金融/非银金融',
        },
        {
            title: '金融/金融人事',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/金融/金融人事',
        },
        {
            title: '宏观',
            source: ['m.21jingji.com/#/channel/politics'],
            target: '/channel/宏观',
        },
        {
            title: '学习经济',
            source: ['m.21jingji.com/#/jujiao/xxjjIndexV3'],
            target: '/channel/学习经济',
        },
        {
            title: '学习经济/经济思想',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/学习经济/经济思想',
        },
        {
            title: '学习经济/学习经济卡片',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/学习经济/学习经济卡片',
        },
        {
            title: '学习经济/高质量发展',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/学习经济/高质量发展',
        },
        {
            title: '学习经济/经济政策',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/学习经济/经济政策',
        },
        {
            title: '学习经济/广东在行动',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/学习经济/广东在行动',
        },
        {
            title: '学习经济/数说经济',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/学习经济/数说经济',
        },
        {
            title: '学习经济/学习视频',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/学习经济/学习视频',
        },
        {
            title: '学习经济/学习党史',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/学习经济/学习党史',
        },
        {
            title: '大湾区',
            source: ['m.21jingji.com/#/channel/GHM_GreaterBay'],
            target: '/channel/大湾区',
        },
        {
            title: '大湾区/动态',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/大湾区/动态',
        },
        {
            title: '大湾区/湾区金融',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/大湾区/湾区金融',
        },
        {
            title: '大湾区/大湾区直播室',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/大湾区/大湾区直播室',
        },
        {
            title: '大湾区/高成长企业',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/大湾区/高成长企业',
        },
        {
            title: '大湾区/产业地理',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/大湾区/产业地理',
        },
        {
            title: '大湾区/数智湾区',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/大湾区/数智湾区',
        },
        {
            title: '大湾区/湾区金融大咖会',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/大湾区/湾区金融大咖会',
        },
        {
            title: '大湾区/“港”创科25人',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/大湾区/“港”创科25人',
        },
        {
            title: '大湾区/湾区论坛',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/大湾区/湾区论坛',
        },
        {
            title: '证券',
            source: ['m.21jingji.com/#/channel/capital'],
            target: '/channel/证券',
        },
        {
            title: '证券/动态',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/证券/动态',
        },
        {
            title: '证券/赢基金',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/证券/赢基金',
        },
        {
            title: '证券/券业观察',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/证券/券业观察',
        },
        {
            title: '证券/期市一线',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/证券/期市一线',
        },
        {
            title: '证券/ETF',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/证券/ETF',
        },
        {
            title: '汽车',
            source: ['m.21jingji.com/#/channel/auto'],
            target: '/channel/汽车',
        },
        {
            title: '汽车/热闻',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/汽车/热闻',
        },
        {
            title: '汽车/新汽车',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/汽车/新汽车',
        },
        {
            title: '汽车/车访间',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/汽车/车访间',
        },
        {
            title: '汽车/财说车',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/汽车/财说车',
        },
        {
            title: '汽车/汽车人',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/汽车/汽车人',
        },
        {
            title: '汽车/汽车商业地理',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/汽车/汽车商业地理',
        },
        {
            title: '汽车/汽车金融',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/汽车/汽车金融',
        },
        {
            title: '汽车/行业报告',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/汽车/行业报告',
        },
        {
            title: '汽车/聚焦',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/汽车/聚焦',
        },
        {
            title: '观点',
            source: ['m.21jingji.com/#/channel/opinion'],
            target: '/channel/观点',
        },
        {
            title: '新健康',
            source: ['m.21jingji.com/#/channel/healthnews'],
            target: '/channel/新健康',
        },
        {
            title: '新健康/动态',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/新健康/动态',
        },
        {
            title: '新健康/21健讯Daily',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/新健康/21健讯Daily',
        },
        {
            title: '新健康/21CC',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/新健康/21CC',
        },
        {
            title: '新健康/21健谈',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/新健康/21健谈',
        },
        {
            title: '新健康/名医说',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/新健康/名医说',
        },
        {
            title: '新健康/数字医疗',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/新健康/数字医疗',
        },
        {
            title: '新健康/21H院长对话',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/新健康/21H院长对话',
        },
        {
            title: '新健康/医健IPO解码',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/新健康/医健IPO解码',
        },
        {
            title: '新健康/研究报告',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/新健康/研究报告',
        },
        {
            title: '新健康/21科普',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/新健康/21科普',
        },
        {
            title: 'ESG',
            source: ['m.21jingji.com/#/channel/esg'],
            target: '/channel/ESG',
        },
        {
            title: 'ESG/ESG发布厅',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/ESG/ESG发布厅',
        },
        {
            title: 'ESG/绿色公司',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/ESG/绿色公司',
        },
        {
            title: 'ESG/绿色金融',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/ESG/绿色金融',
        },
        {
            title: 'ESG/净零碳城市',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/ESG/净零碳城市',
        },
        {
            title: 'ESG/碳市场',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/ESG/碳市场',
        },
        {
            title: 'ESG/生物多样性',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/ESG/生物多样性',
        },
        {
            title: 'ESG/行业周报',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/ESG/行业周报',
        },
        {
            title: 'ESG/研究报告',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/ESG/研究报告',
        },
        {
            title: '全球市场',
            source: ['m.21jingji.com/#/channel/global'],
            target: '/channel/全球市场',
        },
        {
            title: '全球市场/动态',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/全球市场/动态',
        },
        {
            title: '全球市场/全球财经连线',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/全球市场/全球财经连线',
        },
        {
            title: '全球市场/直击华尔街',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/全球市场/直击华尔街',
        },
        {
            title: '全球市场/百家跨国公司看中国',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/全球市场/百家跨国公司看中国',
        },
        {
            title: '全球市场/全球央行观察',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/全球市场/全球央行观察',
        },
        {
            title: '全球市场/全球能源观察',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/全球市场/全球能源观察',
        },
        {
            title: '全球市场/美股一线',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/全球市场/美股一线',
        },
        {
            title: '全球市场/港股一线',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/全球市场/港股一线',
        },
        {
            title: '全球市场/全球金融观察',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/全球市场/全球金融观察',
        },
        {
            title: '全球市场/联合国现场',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/全球市场/联合国现场',
        },
        {
            title: '全球市场/全球央行月报',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/全球市场/全球央行月报',
        },
        {
            title: '全球市场/全球商品观察',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/全球市场/全球商品观察',
        },
        {
            title: '一带一路',
            source: ['m.21jingji.com/#/channel/BandR'],
            target: '/channel/一带一路',
        },
        {
            title: '数读',
            source: ['m.21jingji.com/#/channel/readnumber'],
            target: '/channel/数读',
        },
        {
            title: '理财通',
            source: ['m.21jingji.com/#/channel/financing'],
            target: '/channel/理财通',
        },
        {
            title: '理财通/动态',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/理财通/动态',
        },
        {
            title: '理财通/数据库',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/理财通/数据库',
        },
        {
            title: '理财通/研报',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/理财通/研报',
        },
        {
            title: '理财通/投教',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/理财通/投教',
        },
        {
            title: '理财通/政策',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/理财通/政策',
        },
        {
            title: '理财通/固收+',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/理财通/固收+',
        },
        {
            title: '理财通/纯固收',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/理财通/纯固收',
        },
        {
            title: '理财通/现金',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/理财通/现金',
        },
        {
            title: '理财通/混合',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/理财通/混合',
        },
        {
            title: '理财通/权益',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/理财通/权益',
        },
        {
            title: '直播',
            source: ['m.21jingji.com/#/channel/live'],
            target: '/channel/直播',
        },
        {
            title: '长三角',
            source: ['m.21jingji.com/#/channel/yangtzeriverdelta'],
            target: '/channel/长三角',
        },
        {
            title: '论坛活动',
            source: ['m.21jingji.com/#/channel/market'],
            target: '/channel/论坛活动',
        },
        {
            title: '创投',
            source: ['m.21jingji.com/#/channel/entrepreneur'],
            target: '/channel/创投',
        },
        {
            title: '投教',
            source: ['m.21jingji.com/#/channel/tjzjy'],
            target: '/channel/投教',
        },
        {
            title: '投教/动态',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投教/动态',
        },
        {
            title: '投教/投教知识',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投教/投教知识',
        },
        {
            title: '投教/公益活动',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/投教/公益活动',
        },
        {
            title: '海洋经济',
            source: ['m.21jingji.com/#/channel/oceaneconomy'],
            target: '/channel/海洋经济',
        },
        {
            title: '数字合规',
            source: ['m.21jingji.com/#/channel/compliance'],
            target: '/channel/数字合规',
        },
        {
            title: '公司',
            source: ['m.21jingji.com/#/channel/company'],
            target: '/channel/公司',
        },
        {
            title: '公司/动态',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/公司/动态',
        },
        {
            title: '公司/电子通信',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/公司/电子通信',
        },
        {
            title: '公司/互联网',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/公司/互联网',
        },
        {
            title: '公司/高端制造',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/公司/高端制造',
        },
        {
            title: '公司/新能源',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/公司/新能源',
        },
        {
            title: '公司/消费',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/公司/消费',
        },
        {
            title: '公司/地产基建',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/公司/地产基建',
        },
        {
            title: '公司/IPO',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/公司/IPO',
        },
        {
            title: '公司/文旅',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/公司/文旅',
        },
        {
            title: '人文',
            source: ['m.21jingji.com/#/channel/life'],
            target: '/channel/人文',
        },
        {
            title: 'SFC Global',
            source: ['m.21jingji.com/#/channel/SFCGlobal'],
            target: '/channel/SFC Global',
        },
        {
            title: 'SFC Global/News',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/SFC Global/News',
        },
        {
            title: 'SFC Global/SFC Markets and Finance',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/SFC Global/SFC Markets and Finance',
        },
        {
            title: 'SFC Global/SFC Market Talk',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/SFC Global/SFC Market Talk',
        },
        {
            title: 'SFC Global/CBN',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/SFC Global/CBN',
        },
        {
            title: 'SFC Global/Multinationals on China',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/SFC Global/Multinationals on China',
        },
        {
            title: 'SFC Global/Companies in the GBA',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/SFC Global/Companies in the GBA',
        },
        {
            title: '南方财经报道',
            source: ['m.21jingji.com/#/channel/nfcjbd'],
            target: '/channel/南方财经报道',
        },
        {
            title: '专题',
            source: ['m.21jingji.com/#/jujiao'],
            target: '/channel/专题',
        },
        {
            title: '链上预制菜',
            source: ['m.21jingji.com/#/channel/precookedfood'],
            target: '/channel/链上预制菜',
        },
        {
            title: '链上预制菜/动态',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/链上预制菜/动态',
        },
        {
            title: '链上预制菜/活动',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/链上预制菜/活动',
        },
        {
            title: '链上预制菜/报道',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/链上预制菜/报道',
        },
        {
            title: '链上预制菜/智库/课题',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/链上预制菜/智库/课题',
        },
        {
            title: '链上预制菜/数据/创新案例',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/链上预制菜/数据/创新案例',
        },
        {
            title: '链上预制菜/链接平台',
            source: ['m.21jingji.com/#/channel/investment'],
            target: '/channel/链上预制菜/链接平台',
        },
    ],
    view: ViewType.Articles,
};
