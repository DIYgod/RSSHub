// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { finishArticleItem } from '@/utils/wechat-mp';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://nsd.pku.edu.cn/sylm/gd/';

const pageType = (href) => {
    if (!href.startsWith('http')) {
        return 'in-site';
    }
    const url = new URL(href);
    if (url.hostname === 'mp.weixin.qq.com') {
        return 'wechat-mp';
    } else if (url.hostname === 'news.pku.edu.cn') {
        return 'pku-news';
    } else {
        return 'unknown';
    }
};

export default async (ctx) => {
    const response = await got({ url: baseUrl, https: { rejectUnauthorized: false } });

    const $ = load(response.data);
    const list = $('div.maincontent > ul > li')
        .map((_index, item) => {
            const href = $(item).find('a').attr('href');
            const type = pageType(href);
            return {
                title: $(item).find('a').text().trim(),
                link: type === 'in-site' ? baseUrl + href : href,
                pubDate: parseDate($(item).find('span').first().text(), 'YYYY-MM-DD'),
                type,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) => {
            switch (item.type) {
                case 'wechat-mp':
                    return finishArticleItem(item);
                case 'pku-news':
                    return cache.tryGet(item.link, async () => {
                        const detailResponse = await got({ url: item.link, https: { rejectUnauthorized: false } });
                        const content = load(detailResponse.data);
                        item.description = content('div.pageArticle > div.col.lf').html();
                        return item;
                    });
                case 'in-site':
                    return cache.tryGet(item.link, async () => {
                        const detailResponse = await got({ url: item.link, https: { rejectUnauthorized: false } });
                        const content = load(detailResponse.data);
                        item.description = content('div.article').html();
                        return item;
                    });
                default:
                    return item;
            }
        })
    );

    ctx.set('data', {
        title: '观点 - 北京大学国家发展研究院',
        link: baseUrl,
        item: items,
    });
};
