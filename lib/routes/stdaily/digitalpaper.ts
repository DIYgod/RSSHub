import { Route } from '@/types';

import cache from '@/utils/cache';
import path from 'node:path';
import { art } from '@/utils/render';
import got from '@/utils/got';
import { load } from 'cheerio';

const renderDescription = ({ subtitle, quotation, pics, article }) =>
    art(path.join(__dirname, 'templates/description.art'), {
        subtitle,
        quotation,
        pics,
        article,
    });

const getPageLength = async (url) => {
    const response = await got({
        method: 'get',
        url,
    });

    const $ = load(response.data);
    const pageLength = $('.right1 .bmname').children().length;
    return { pageLength, $ };
};

const getArticleList = ($, paperUrl) => {
    const pageName = $('.zi .zi-top .banci strong').text();
    const list = $('.zi-meat ul>li')
        .toArray()
        .map((item) => {
            const link = $(item).find('a').attr('href');
            const title = $(item).find('a div').text();
            return {
                link: `${paperUrl}/${link}`,
                title: `[${pageName}] ${title}`,
                // pubDate,
            };
        });

    return list;
};
const createGetPageArticleList = (paperUrl, page = 1) => {
    const getPageArticleList = async () => {
        const currentUrl = `${paperUrl}/node_${page + 1}.htm`;
        const response = await got({
            method: 'get',
            url: currentUrl,
        });

        const $ = load(response.data);
        return getArticleList($, paperUrl);
    };

    return getPageArticleList;
};

const getListArticles = async (list, cache) => {
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $ = load(data);

                const quotation = $('.right-meat .yinti').text();
                const subtitle = $('.right-meat .futi').text();
                const article = $('.right-meat .tuwen .article #ozoom').html();
                const pics = $('.right-meat .tuwen .picture')
                    .toArray()
                    .map((item) => {
                        const pic = {};
                        $(item)
                            .find('tr')
                            .toArray()
                            .map((row) => {
                                const src = $(row).find('img').attr('src');
                                if (src) {
                                    pic.src = src;
                                } else {
                                    pic.des = $(row).find('td').text();
                                }
                                return null;
                            });
                        return pic;
                    });

                item.author = $('.right-meat .author').text();
                item.description = renderDescription({ subtitle, quotation, article, pics });

                return item;
            })
        )
    );
    return items;
};

export const route: Route = {
    path: '/digitalpaper',
    categories: ['traditional-media'],
    example: '/stdaily/digitalpaper',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '科技日报',
    maintainers: ['lyqluis'],
    handler,
};

async function handler() {
    const date = new Date();
    const dateStr = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const formatedDate = dateStr.replace('/', '-'); // 'yyyy-mm/dd'

    const rootUrl = 'http://digitalpaper.stdaily.com/http_www.kjrb.com/kjrb/html';
    const currentUrl = `${rootUrl}/${formatedDate}`;

    // get page
    const restPageLists = [];
    const allPageArticleLists = [];
    const { pageLength, $ } = await getPageLength(`${currentUrl}/node_2.htm`);
    allPageArticleLists.push(...getArticleList($, currentUrl));
    for (let i = 2; i <= pageLength; i++) {
        restPageLists.push(createGetPageArticleList(currentUrl, i));
    }
    // get pages' article list
    allPageArticleLists.push(...(await Promise.all(restPageLists.map((getPageArticleList) => getPageArticleList()))).flat());
    // get all articles
    const items = await getListArticles(allPageArticleLists, cache);

    return {
        title: `科技日报`,
        link: 'http://digitalpaper.stdaily.com',
        item: items,
    };
}
