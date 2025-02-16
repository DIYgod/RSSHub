import { Route } from '@/types';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import puppeteer from '@/utils/puppeteer';
import { art } from '@/utils/render';
import path from 'node:path';
import { getCurrentPath } from '@/utils/helpers';

const __dirname = getCurrentPath(import.meta.url);

export const route: Route = {
    path: '/credit-research/:category/:type?',
    name: '信用研究',
    url: 'www.cspengyuan.com/pengyuancmscn/',
    maintainers: ['orzchen'],
    example: '/cspengyuan/credit-research/macro',
    parameters: {
        category: '（必须）匹配一级分类，例如 macro、bond-market、industry 等。',
        type: '（可选）匹配报告类型或细节类型，例如 new、weekly、monthly、subject 等。',
    },
    description: `::: TIP
**base route**: \`/cspengyuan/\`

默认情况下只获取第一页的最新数据。

过滤了 文章/PDF 链接为空的文章。

|       宏观研究        |            结构融资研究            |        评级研究        |       国际研究       |
| :-------------------: | :--------------------------------: | :--------------------: | :------------------: |
| credit-research/macro | credit-research/structured-finance | credit-research/rating | credit-research/intl |

| **债市研究** |             专题研究             |                热点分析                 |              债市周报              |              债市月报               |              债市年报              |
| :----------: | :------------------------------: | :-------------------------------------: | :--------------------------------: | :---------------------------------: | :--------------------------------: |
|      ×       | credit-research/industry/comment | credit-research/bond-market/hot-comment | credit-research/bond-market/weekly | credit-research/bond-market/monthly | credit-research/bond-market/annual |

| **行业研究** |             行业点评             |           行业信用展望           |             行业专题             |
| :------: | :------------------------------: | :------------------------------: | :------------------------------: |
|    ×     | credit-research/industry/comment | credit-research/industry/outlook | credit-research/industry/subject |

| **出版物** |                  期刊                  |                 专著                  |
| :----: | :------------------------------------: | :-----------------------------------: |
|   ×    | credit-research/publication/periodical | credit-research/publication/monograph |
    :::`,
    categories: ['finance'],
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
            title: '宏观研究',
            source: ['www.cspengyuan.com/pengyuancmscn/credit-research/macro-research.html'],
            target: '/cspengyuan/credit-research/macro',
        },
        {
            title: '债市周报',
            source: ['www.cspengyuan.com/pengyuancmscn/credit-research/bond-market-research/weekly.html'],
            target: '/credit-research/bond-market/weekly',
        },
        {
            title: '债市月报',
            source: ['www.cspengyuan.com/pengyuancmscn/credit-research/bond-market-research/monthly.html'],
            target: '/credit-research/bond-market/monthly',
        },
        {
            title: '债市年报',
            source: ['www.cspengyuan.com/pengyuancmscn/credit-research/bond-market-research/annual.html'],
            target: '/credit-research/bond-market/annual',
        },
        {
            title: '热点',
            source: ['www.cspengyuan.com/pengyuancmscn/credit-research/bond-market-research/hot-comment.html'],
            target: '/credit-research/bond-market/hot-comment',
        },
        {
            title: '专题研究',
            source: ['www.cspengyuan.com/pengyuancmscn/credit-research/bond-market-research/subject-research.html'],
            target: '/credit-research/bond-market/subject-research',
        },
        {
            title: '行业研究',
            source: ['www.cspengyuan.com/pengyuancmscn/credit-research/industry-research/comment.html'],
            target: '/credit-research/industry/comment',
        },
        {
            title: '行业信用展望',
            source: ['www.cspengyuan.com/pengyuancmscn/credit-research/industry-research/outlook.html'],
            target: '/credit-research/industry/outlook',
        },
        {
            title: '行业专题',
            source: ['www.cspengyuan.com/pengyuancmscn/credit-research/industry-research/subject.html'],
            target: '/credit-research/industry/subject',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { category, type } = ctx.req.param();

    const rootUrl = 'https://www.cspengyuan.com/pengyuancmscn/credit-research/';
    const linkUrl: string =
        type === undefined
            ? category === 'macro'
                ? `${rootUrl}${category}-research.html`
                : `${rootUrl}${category}.html`
            : category === 'publication'
              ? `${rootUrl}${category}/${type}.html`
              : `${rootUrl}${category}-research/${type}.html`;

    const response = await browser(linkUrl);

    const $ = load(response);

    const subTitle = $('h3.py-common-subtitle').text().trim();

    let itemsInfo = $('div.py-main');
    if (category === 'publication' && type) {
        if (type === 'periodical') {
            itemsInfo = itemsInfo.find('ul.py-list li div.py-periodical-box');
        } else if (type === 'monograph') {
            itemsInfo = itemsInfo.find('div.py-mrh-list > div.py-mrh-item');
        }
    } else {
        itemsInfo = itemsInfo.find('ul.py-list li');
    }

    const list = itemsInfo.toArray().map((item) => getResearchItem(item, $, category, type));

    const items = await Promise.all(
        (list as any[])
            .filter((l) => l.link !== null)
            .map((item) =>
                cache.tryGet(item.link, async () => {
                    if (category === 'publication') {
                        const response = await browser(item.link);
                        const content = load(response);
                        const p = content('div.mrh-dtl-right-top > p');
                        const b = content('div.mrh-dtl-right-bom');
                        const imgUrl = content('img').attr('src');
                        const segment1 = content(p[0]).text().trim();
                        const segment2 = content(p[1]).text().trim();
                        const part = { segment1, segment2 };
                        if (type === 'monograph') {
                            const segment3 = b.find('h4 > b').text().trim();
                            const segment4 = b.find('p').text().trim();
                            Object.assign(part, { segment3, segment4 });
                        }
                        item.description = art(path.join(__dirname, 'templates/description.art'), {
                            part,
                            item,
                            imgUrl,
                            type,
                        });
                    } else {
                        item.description = `
                            pdf原链接: <a download="${item.pdfName}" href="https://www.cspengyuan.com${item.pdfUrl}">Download</a><br>
                            pdf在线预览: <a href="${item.pdfViewUrl}">预览</a><br>
                            `;
                    }
                    return item;
                })
            )
    );

    return {
        title: `中证鹏元-信用研究-${subTitle}`,
        link: linkUrl,
        item: items,
    };
}

const browser = async (link: string) => {
    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    logger.http(`Requesting ${link}`);
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();
    await page.close();
    await browser.close();
    return response;
};

const isFullURL = (str: string) => {
    const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.[a-zA-Z0-9-]+)(\/\S*)?(\?\S*)?$/;
    return regex.test(str);
};

const isPath = (str: string) => {
    const regex = /^\/([a-zA-Z0-9\-/.]+(\?[a-zA-Z0-9\-/&=.]+)?)?$/;
    return regex.test(str);
};

const isValidURL = (str: string) => isFullURL(str) || isPath(str);

function getResearchItem(item, $, category, type) {
    item = $(item);
    const viewUrl = 'https://www.cspengyuan.com/static/clientlibs/pengyuancmscn/plugins/web/viewer.html?file=/content';
    const a = item.find('a').first();
    const pdfUrl = item.find('a.py-list-btn-download').attr('href');
    const pdfName = item.find('a.py-list-btn-download').attr('download');
    const pdfViewUrl = `${viewUrl}${pdfUrl}`;

    const title =
        category === 'publication'
            ? type === 'periodical'
                ? item.find('div.py-periodical-title').attr('title').trim()
                : type === 'monograph'
                  ? item.find('span.mrh-item-right-title > b').text().trim()
                  : a.text().trim()
            : a.text().trim();

    const link = isValidURL(a.attr('href')) ? `https://www.cspengyuan.com${a.attr('href')}` : null;

    let pubDate =
        category === 'publication'
            ? type === 'periodical'
                ? a.attr('href').split('/').pop().split('.')[0].slice(0, 8)
                : type === 'monograph'
                  ? $(item.find('span.mrh-item-right > span')[2])
                        .text()
                        .match(/\d{4}-\d{2}-\d{2}/)?.[0]
                  : item.find('span.py-finance-date').text().trim()
            : item.find('span.py-finance-date').text().trim();
    pubDate = timezone(parseDate(pubDate, ['YYYYMMDD', 'YYYY-MM-DD']), +8);

    return {
        title,
        link,
        pubDate,
        category,
        pdfUrl,
        pdfName,
        pdfViewUrl,
    };
}
