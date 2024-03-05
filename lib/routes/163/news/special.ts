// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
const typeMap = {
    1: '轻松一刻',
    2: '槽值',
    3: '人间',
    4: '大国小民',
    5: '三三有梗',
    6: '数读',
    7: '看客',
    8: '下划线',
    9: '谈心社',
    10: '哒哒',
    11: '胖编怪聊',
    12: '曲一刀',
    13: '今日之声',
    14: '浪潮',
    15: '沸点',
};
export default async (ctx) => {
    if (!ctx.req.param('type')) {
        throw new Error('Bad parameter. See <a href="https://docs.rsshub.app/routes/game#wang-yi-da-shen">https://docs.rsshub.app/routes/game#wang-yi-da-shen</a>');
    }
    const selectedType = Number.parseInt(ctx.req.param('type'));
    let type;
    switch (selectedType) {
        case 1:
            type = `BD21K0DLwangning`; // 轻松一刻
            break;
        case 2:
            type = `CICMICLUwangning`; // 槽值
            break;
        case 3:
            type = `CICMOMBLwangning`; // 人间
            break;
        case 4:
            type = `CICMPVC5wangning`; // 大国小民
            break;
        case 5:
            type = `CICMLCOUwangning`; // 三三有梗
            break;
        case 6:
            type = `D551V75Cwangning`; // 数读
            break;
        case 7:
            type = `D55253RHwangning`; // 看客
            break;
        case 8:
            type = `D553A53Lwangning`; // 下划线
            break;
        case 9:
            type = `D553PGHQwangning`; // 谈心社
            break;
        case 10:
            type = `CICMS5BIwangning`; // 哒哒
            break;
        case 11:
            type = `CQ9UDVKOwangning`; // 胖编怪聊
            break;
        case 12:
            type = `CQ9UJIJNwangning`; // 曲一刀
            break;
        case 13:
            type = `BD284UM8wangning`; // 今日之声
            break;
        case 14:
            type = `CICMMGBHwangning`; // 浪潮
            break;
        case 15:
            type = `D5543R68wangning`; // 沸点
            break;
        default:
            break;
    }
    const url = `https://3g.163.com/touch/reconstruct/article/list/${type}/0-20.html`;
    const response = await got(url);
    const data = response.data;
    const matches = data.replaceAll(/\s/g, '').match(/artiList\((.*?)]}\)/);
    const articlelist0 = matches[1].replace(/".*?wangning/, '"articles') + ']}';
    const articlelist = JSON.parse(articlelist0);
    const articles = articlelist.articles;

    const items = await Promise.all(
        articles.map((article) => {
            let url = article.url;
            if (url === null || article.skipType === 'video') {
                const skipurl = article.skipURL;
                const vid = skipurl.match(/vid=(.*?)$/);
                if (vid !== null) {
                    url = `https://3g.163.com/exclusive/video/${vid[1]}.html`;
                }
            }
            return cache.tryGet(url, async () => {
                const article_response = await got(url);
                const $ = load(article_response.data);

                article.link = url;
                article.description = $('.article-body').html() || $('div[class="video"]').html();
                article.pubDate = parseDate(article.ptime);

                return article;
            });
        })
    );

    const selectedTypeName = typeMap[selectedType];

    ctx.set('data', {
        title: selectedTypeName ? `${selectedTypeName} - 网易专栏` : '网易专栏',
        link: 'https://3g.163.com/touch/exclusive/?referFrom=163',
        item: items,
    });
};
