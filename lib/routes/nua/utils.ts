import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { fetchArticle } from '@/utils/wechat-mp';

const pageType = (href) => {
    if (!href.startsWith('http')) {
        return 'in-nua';
    }
    const url = new URL(href);
    if (url.hostname === 'mp.weixin.qq.com') {
        return 'wechat-mp';
    } else if (url.hostname === 'www.nua.edu.cn') {
        return 'nua';
    } else {
        return 'unknown';
    }
};

function arti_link(text, href) {
    return `<a href="${href}">${text}</a>`;
}

async function ProcessList(newsUrl, baseUrl, listName, listDate, webPageName) {
    const result = await got(newsUrl);
    const $ = load(result.data);

    const pageName = $(webPageName).text().trim();

    const items = $(listName)
        .toArray()
        .map((item) => {
            const href = $(item).find('a').attr('href');
            const type = pageType(href);

            return {
                link: type === 'in-nua' ? baseUrl + href : href,
                title: $(item).find('a').attr('title'),
                pubDate: timezone(parseDate($(item).find(listDate).first().text(), 'YYYY-MM-DD'), +8),
                type,
            };
        });

    return [items, pageName];
}

const ProcessFeed = (items, artiContent) =>
    Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                switch (item.type) {
                    case 'in-nua':
                    case 'nua': {
                        const result = await got(item.link);
                        const $ = load(result.data);
                        item.author = $('.arti_publisher').text() + '  ' + $('.arti_views').text();
                        item.description = $(artiContent).html();
                        return item;
                    }
                    case 'wechat-mp':
                        return fetchArticle(item.link);
                    case 'unknown':
                    default:
                        item.description = `暂不支持解析该内容，请点击 ${arti_link('原文', item.link)}`;
                        return item;
                }
            })
        )
    );

export default { ProcessList, ProcessFeed };
