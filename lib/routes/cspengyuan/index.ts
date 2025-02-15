import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/credit-research/:category/:type?',
    name: '信用研究',
    url: 'www.cspengyuan.com/pengyuancmscn/',
    maintainers: ['orzchen'],
    example: '/cspengyuan/credit-research/macro',
    parameters: {
        category: '（必须）匹配一级分类，例如 macro、bond-market、industry 等。',
        type: '（可选）匹配报告类型或细节类型，例如 new、weekly、monthly、subject 等。',
        page: '（可选）匹配页数，例如 1,4、1,-1、-4,-1 等。',
    },
    description: `::: TIP
        **base route**: \`/cspengyuan/\`

        默认情况下只获取第一页的最新数据，通过添加查询参数 page 来定义查询的页面数量，如 page=1,4 则为第1页至第4页，为负数则为反向索引。

        但是由于缓存的原因这里使用参数查询无法及时更新缓存。

        过滤了 文章/PDF 链接为空的文章。

        通过添加查询参数 image 来获取 PDF 第一页截图。

        同时使用 page 和 image 参数可能会导致触发反爬。

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

    const response = await ofetch(linkUrl);
    const $ = load(response);

    const maxPageStr = $('div.py-pagination > ul.pagination > li.pagination-item').slice(-2, -1).find('a').text();
    const maxPage = isNaN(+maxPageStr) ? 1 : +maxPageStr;

    const page = ctx.req.query('page') ?? '1,1';
    const [start, end] = page
        .split(',')
        .slice(0, 2)
        .reduce((a, n) => {
            a.push(isNaN(+n) ? 1 : +n);
            return a;
        }, []);

    if (end > maxPage) {
        throw new Error(`End exceeds the maximum page limit of ${maxPage}`);
    }

    const listAll = await Promise.all(
        generateRange(start, end, maxPage)
            .reduce((a: string[], p) => {
                a.push(`${linkUrl}?page=${p}`);
                return a;
            }, [])
            .map((url) =>
                cache.tryGet(url, async () => {
                    const responseSub = await ofetch(url);
                    const $sub = load(responseSub);
                    let itemsInfo = $sub('div.py-main');
                    if (category === 'publication' && type) {
                        if (type === 'periodical') {
                            itemsInfo = itemsInfo.find('ul.py-list li div.py-periodical-box');
                        } else if (type === 'monograph') {
                            itemsInfo = itemsInfo.find('div.py-mrh-list > div.py-mrh-item');
                        }
                    } else {
                        itemsInfo = itemsInfo.find('ul.py-list li');
                    }
                    return itemsInfo.toArray().map((item) => getResearchItem(item, $sub, category, type));
                })
            )
    );

    const list = listAll.flat();

    const subTitle = $('h3.py-common-subtitle').text().trim();

    const items = await Promise.all(
        (list as any[])
            .filter((l) => l.link !== null)
            .map((item) =>
                cache.tryGet(item.link, async () => {
                    if (category === 'publication') {
                        const response = await ofetch(item.link);
                        const content = load(response);
                        const p = content('div.mrh-dtl-right-top > p');
                        const b = content('div.mrh-dtl-right-bom');
                        const imgUrl = content('img').attr('src');
                        if (type === 'periodical') {
                            item.description = `
                        <h4>${content(p[0]).text().trim()}</h4>
                        <h4>${content(p[1]).text().trim()}</h4>
                        <a download="${item.pdfName}" href="https://www.cspengyuan.com${item.pdfUrl}"
                        style="display: inline-block; padding: 10px 20px; background-color: red; color: white;
                        text-align: center; text-decoration: none; border-radius: 5px; font-size: 16px;">整刊下载</a><br>
                        <img src="${imgUrl}" height="50%" style="display: block; margin: 0 auto;">
                    `;
                        } else if (type === 'monograph') {
                            item.description = `
                        <h4>${content(p[0]).text().trim()}</h4>
                        <h4>${content(p[1]).text().trim()}</h4>
                        <h4><b>${b.find('h4 > b').text().trim()}</b></h4>
                        <p>${b.find('p').text().trim()}</p><br>
                        <img src="${imgUrl}" height="50%" style="display: block; margin: 0 auto;">
                    `;
                        }
                    } else {
                        const image = ctx.req.query('image') ?? false;
                        let screenshotBase64;
                        if (image) {
                            const browser = await puppeteer();
                            const page = await browser.newPage();
                            await page.goto(item.pdfViewUrl, { waitUntil: 'networkidle0' });
                            logger.http(`Requesting ${item.pdfViewUrl}`);
                            screenshotBase64 = await page.screenshot({
                                encoding: 'base64',
                            });
                            await browser.close();
                        }
                        item.description = `
                            pdf原链接: <a download="${item.pdfName}" href="https://www.cspengyuan.com${item.pdfUrl}">Download</a><br>
                            pdf在线预览: <a href="${item.pdfViewUrl}">预览</a><br>
                            <img src="data:image/png;base64,${screenshotBase64}" style="${screenshotBase64 ? '' : 'display: none'}">
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

    const isFullURL = (str) => {
        const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.[a-zA-Z0-9-]+)(\/[^\s]*)?(\?[^\s]*)?$/;
        return regex.test(str);
    };
    const isPath = (str) => {
        const regex = /^\/([a-zA-Z0-9\-\/\.]+(\?[a-zA-Z0-9\-\/&=\.]+)?)?$/;
        return regex.test(str);
    };
    const isValidURL = (str) => isFullURL(str) || isPath(str);

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

function generateRange(start, end, maxPage) {
    if (start < 0) {
        start = maxPage + start + 1;
    }

    if (start < 1 || start > maxPage) {
        throw new Error(`Invalid start value. Must be between 1 and ${maxPage}`);
    }

    if (end < 0) {
        end = maxPage + end + 1;
    }

    if (end < start || end > maxPage) {
        throw new Error(`End value must be between start and ${maxPage}`);
    }

    const result: any[] = [];
    for (let i = start; i <= end; i++) {
        result.push(i);
    }

    return result;
}
