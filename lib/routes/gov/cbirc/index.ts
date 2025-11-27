import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const handler = async (ctx) => {
    const { id = '915' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 18;

    const rootUrl = 'https://www.nfra.gov.cn';
    const apiUrl = new URL(`cn/static/data/DocInfo/SelectDocByItemIdAndChild/data_itemId=${id},pageIndex=1,pageSize=18.json`, rootUrl).href;
    const apiBreadUrl = new URL(`cn/static/data/item/getItemBread/data_itemId=${id}.json`, rootUrl).href;

    const breadResponse = await ofetch(apiBreadUrl);

    const item = breadResponse.data.find((b) => String(b.itemId) === id);

    const currentUrl = new URL(`cn/view/pages/ItemList.html?itemPId=${item.itemPid}&itemId=${id}&itemUrl=ItemListRightList.html`, rootUrl).href;

    const response = await ofetch(apiUrl);

    let items = response.data.rows.slice(0, limit).map((item) => {
        const title = item.docTitle;
        const description = item.docSubtitle;
        const guid = item.docId;

        return {
            title,
            description,
            pubDate: timezone(parseDate(item.publishDate), +8),
            link: new URL(`cn/view/pages/ItemDetail.html?docId=${guid}`, rootUrl).href,
            guid,
            id: guid,
            content: {
                html: description,
                text: description,
            },
            enclosure_url: new URL(item.pdfFileUrl, rootUrl).href,
            enclosure_type: 'application/pdf',
            enclosure_title: title,
        };
    });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const apiDocUrl = new URL(`cn/static/data/DocInfo/SelectByDocId/data_docId=${item.guid}.json`, rootUrl).href;

                const detailResponse = await ofetch(apiDocUrl);

                const data = detailResponse.data;

                const $$ = load(data.docClob);

                const title = data.docTitle;
                const description = $$('div.Section0').html();

                item.title = title;
                item.description = description;
                item.pubDate = timezone(parseDate(data.publishDate), +8);
                item.category = data.listTwoItem?.[0]?.ItemLvs.map((c) => c.itemName);
                item.author = data.docSource;
                item.guid = `cbirc-${item.guid}`;
                item.id = item.guid;
                item.content = {
                    html: description,
                    text: $$('div.Section0').text(),
                };
                item.updated = parseDate(data.docEditdate);
                item.language = $$('html').prop('lang') || '';

                return item;
            })
        )
    );

    const currentResponse = await ofetch(currentUrl);

    const $ = load(currentResponse);

    $('a.lyxd').remove();

    const language = $('html').prop('lang') || '';

    const imageSrc = $('div.header-left img').prop('src');
    const image = imageSrc ? new URL(imageSrc, rootUrl).href : '';

    return {
        title: `${$('title').text()} - ${item.itemName}`,
        description: item.desc,
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: item.type,
        language,
    };
};

export const route: Route = {
    path: '/cbirc/:id?',
    name: '分类',
    url: 'www.cbirc.gov.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/gov/cbirc/:id?',
    parameters: { category: '分类，默认为监管动态，即 915，可在对应分类页 URL 中找到' },
    description: `::: tip
  若订阅 [监管动态](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemId=915&itemUrl=ItemListRightList.html)，网址为 \`https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemId=915&itemUrl=ItemListRightList.html\`。截取 \`itemId\` 的值 \`915\` 作为参数填入，此时路由为 [\`/gov/cbirc/915\`](https://rsshub.app/gov/cbirc/915)。
:::

#### [首页](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=899&itemId=971&itemUrl=ItemListRightMore.html)

| [弹出公告](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=971&itemId=972&itemUrl=sss) | [法律声明](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=971&itemId=4128&itemUrl=ItemListRightArticle.html) |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [972](https://rsshub.app/gov/cbirc/972)                                                             | [4128](https://rsshub.app/gov/cbirc/4128)                                                                                  |

#### [机构概况](https://www.cbirc.gov.cn/cn/view/pages/jigougaikuang/jigougaikuang.html)

| [主要职责](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=900&itemId=901&itemUrl=ItemListRightArticle.html) | [总局领导](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=900&itemId=902&itemUrl=jigougaikuang/huilingdao.html) | [内设机构](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=900&itemId=911&itemUrl=jigougaikuang/neishejigou.html) | [直属行政机构](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=900&itemId=4243&itemUrl=jigougaikuang/zhishuxingzhengjigou.html) | [派出机构](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=900&itemId=912&itemUrl=jigougaikuang/paichujigou.html) |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [901](https://rsshub.app/gov/cbirc/901)                                                                                   | [902](https://rsshub.app/gov/cbirc/902)                                                                                       | [911](https://rsshub.app/gov/cbirc/911)                                                                                        | [4243](https://rsshub.app/gov/cbirc/4243)                                                                                                    | [912](https://rsshub.app/gov/cbirc/912)                                                                                        |

| [联系方式](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=900&itemId=913&itemUrl=jigougaikuang/lianxifangshi.html) |
| -------------------------------------------------------------------------------------------------------------------------------- |
| [913](https://rsshub.app/gov/cbirc/913)                                                                                          |

#### [新闻资讯](https://www.cbirc.gov.cn/cn/view/pages/xinwenzixun/xinwenzixun.html)

| [监管动态](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=914&itemId=915&itemUrl=ItemListRightList.html) | [政策解读](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=914&itemId=916&itemUrl=ItemListRightMore.html) | [领导活动及讲话](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=914&itemId=919&itemUrl=ItemListRightList.html) | [新闻发布会及访谈](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=914&itemId=920&itemUrl=xinwenzixun/xinwenfabu.html) | [新闻发言人](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=914&itemId=921&itemUrl=xinwenzixun/xinwenfayan.html) |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [915](https://rsshub.app/gov/cbirc/915)                                                                                | [916](https://rsshub.app/gov/cbirc/916)                                                                                | [919](https://rsshub.app/gov/cbirc/919)                                                                                      | [920](https://rsshub.app/gov/cbirc/920)                                                                                             | [921](https://rsshub.app/gov/cbirc/921)                                                                                        |

#### [政务信息](https://www.cbirc.gov.cn/cn/view/pages/zhengwuxinxi/zhengwuxinxi.html)

| [政府信息公开](https://www.cbirc.gov.cn/cn/view/pages/zhengwuxinxi/zhengfuxinxi.html) | [公告通知](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=923&itemId=925&itemUrl=ItemListRightList.html) | [政策法规](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=923&itemId=926&itemUrl=ItemListRightMore.html) | [行政许可](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=923&itemId=930&itemUrl=zhengwuxinxi/xingzhengxuke.html) | [行政处罚](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=923&itemId=931&itemUrl=zhengwuxinxi/xingzhengchufa.html) |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [924](https://rsshub.app/gov/cbirc/924)                                               | [925](https://rsshub.app/gov/cbirc/925)                                                                                | [926](https://rsshub.app/gov/cbirc/926)                                                                                | [930](https://rsshub.app/gov/cbirc/930)                                                                                         | [931](https://rsshub.app/gov/cbirc/931)                                                                                          |

| [行政监管措施](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=923&itemId=932&itemUrl=ItemListRightList.html) | [人事信息](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=923&itemId=933&itemUrl=ItemListRightList.html) |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [932](https://rsshub.app/gov/cbirc/932)                                                                                    | [933](https://rsshub.app/gov/cbirc/933)                                                                                |

#### [在线服务](https://www.cbirc.gov.cn/cn/view/pages/zaixianfuwu/zaixianfuwu.html)

| [行政许可办事服务指南](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=937&itemId=938&itemUrl=zaixianfuwu/banshifuwu.html) | [查询服务](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=937&itemId=939&itemUrl=zaixianfuwu/chaxunfuwu.html) |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [938](https://rsshub.app/gov/cbirc/938)                                                                                                 | [939](https://rsshub.app/gov/cbirc/939)                                                                                     |

#### [互动交流](https://www.cbirc.gov.cn/cn/view/pages/hudongjiaoliu/hudongjiaoliu.html)

| [政务咨询](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=945&itemId=946&itemUrl=tosubmenu:hudongjiaoliu/woyaozixun.html) | [征集调查](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=945&itemId=950&itemUrl=ItemListRightMore.html) | [国务院办公厅开通"国家政务服务投诉与建议"小程序](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=945&itemId=952&itemUrl=http://www.gov.cn/xinwen/2018-09/20/content_5323786.htm) |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [946](https://rsshub.app/gov/cbirc/946)                                                                                                 | [950](https://rsshub.app/gov/cbirc/950)                                                                                | [952](https://rsshub.app/gov/cbirc/952)                                                                                                                                                       |

#### [统计数据](https://www.cbirc.gov.cn/cn/view/pages/tongjishuju/tongjishuju.html)

| [统计信息](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=953&itemId=954&itemUrl=ItemListRightList.html) | [数据图表](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=953&itemId=955&itemUrl=tosubmenu:tongjishuju/zongzichan.html) |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| [954](https://rsshub.app/gov/cbirc/954)                                                                                | [955](https://rsshub.app/gov/cbirc/955)                                                                                               |

#### [专题专栏](https://www.cbirc.gov.cn/cn/view/pages/zhuantizhuanlan/zhuantizhuanlan.html)

| [推进普惠金融高质量发展](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=960&itemId=4234&itemUrl=ItemListRightMore.html) | [防范和处置非法集资](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=960&itemId=963&itemUrl=ItemListRightMore.html) | [消费者保护](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=960&itemId=4097&itemUrl=ItemListRightMore.html) | [法治宣传](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=960&itemId=4106&itemUrl=ItemListRightMore.html) | [政府网站年度报表](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=960&itemId=970&itemUrl=ItemListRightList.html) |
| ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [4234](https://rsshub.app/gov/cbirc/4234)                                                                                             | [963](https://rsshub.app/gov/cbirc/963)                                                                                          | [4097](https://rsshub.app/gov/cbirc/4097)                                                                                 | [4106](https://rsshub.app/gov/cbirc/4106)                                                                               | [970](https://rsshub.app/gov/cbirc/970)                                                                                        |

| [服务民营企业](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=960&itemId=4171&itemUrl=ItemListRightList.html) | [服务制造业发展](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=960&itemId=4217&itemUrl=ItemListRightList.html) | [学习贯彻习近平新时代中国特色社会主义思想主题教育](https://www.cbirc.gov.cn/cn/view/pages/ItemList.html?itemPId=960&itemId=4229&itemUrl=ItemListRightMore.html) |
| --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [4171](https://rsshub.app/gov/cbirc/4171)                                                                                   | [4217](https://rsshub.app/gov/cbirc/4217)                                                                                     | [4229](https://rsshub.app/gov/cbirc/4229)                                                                                                                       |
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
            source: ['www.cbirc.gov.cn/:id?'],
            target: (_, url) => {
                const urlObj = new URL(url.toString());
                const id = urlObj.searchParams.get('itemId');

                return `/gov/cbirc${id ? `/${id}` : ''}`;
            },
        },
        {
            title: '首页 - 弹出公告',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/972',
        },
        {
            title: '首页 - 法律声明',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/4128',
        },
        {
            title: '机构概况 - 主要职责',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/901',
        },
        {
            title: '机构概况 - 总局领导',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/902',
        },
        {
            title: '机构概况 - 内设机构',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/911',
        },
        {
            title: '机构概况 - 直属行政机构',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/4243',
        },
        {
            title: '机构概况 - 派出机构',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/912',
        },
        {
            title: '机构概况 - 联系方式',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/913',
        },
        {
            title: '新闻资讯 - 监管动态',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/915',
        },
        {
            title: '新闻资讯 - 政策解读',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/916',
        },
        {
            title: '新闻资讯 - 领导活动及讲话',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/919',
        },
        {
            title: '新闻资讯 - 新闻发布会及访谈',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/920',
        },
        {
            title: '新闻资讯 - 新闻发言人',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/921',
        },
        {
            title: '政务信息 - 政府信息公开',
            source: ['www.cbirc.gov.cn/cn/view/pages/zhengwuxinxi/zhengfuxinxi.html'],
            target: '/cbirc/924',
        },
        {
            title: '政务信息 - 公告通知',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/925',
        },
        {
            title: '政务信息 - 政策法规',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/926',
        },
        {
            title: '政务信息 - 行政许可',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/930',
        },
        {
            title: '政务信息 - 行政处罚',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/931',
        },
        {
            title: '政务信息 - 行政监管措施',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/932',
        },
        {
            title: '政务信息 - 人事信息',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/933',
        },
        {
            title: '在线服务 - 行政许可办事服务指南',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/938',
        },
        {
            title: '在线服务 - 查询服务',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/939',
        },
        {
            title: '互动交流 - 政务咨询',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/946',
        },
        {
            title: '互动交流 - 征集调查',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/950',
        },
        {
            title: '互动交流 - 国务院办公厅开通"国家政务服务投诉与建议"小程序',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/952',
        },
        {
            title: '统计数据 - 统计信息',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/954',
        },
        {
            title: '统计数据 - 数据图表',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/955',
        },
        {
            title: '专题专栏 - 推进普惠金融高质量发展',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/4234',
        },
        {
            title: '专题专栏 - 防范和处置非法集资',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/963',
        },
        {
            title: '专题专栏 - 消费者保护',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/4097',
        },
        {
            title: '专题专栏 - 法治宣传',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/4106',
        },
        {
            title: '专题专栏 - 政府网站年度报表',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/970',
        },
        {
            title: '专题专栏 - 服务民营企业',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/4171',
        },
        {
            title: '专题专栏 - 服务制造业发展',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/4217',
        },
        {
            title: '专题专栏 - 学习贯彻习近平新时代中国特色社会主义思想主题教育',
            source: ['www.cbirc.gov.cn/cn/view/pages/ItemList.html'],
            target: '/cbirc/4229',
        },
    ],
};
