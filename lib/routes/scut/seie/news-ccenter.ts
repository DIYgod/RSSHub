import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/seie/news_center',
    categories: ['university'],
    example: '/scut/seie/news_center',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www2.scut.edu.cn/ee/16285/list.htm'],
        },
    ],
    name: '电子与信息学院 - 新闻速递',
    maintainers: ['auto-bot-ty'],
    handler,
    url: 'www2.scut.edu.cn/ee/16285/list.htm',
    description: `::: warning
由于学院官网对非大陆 IP 的访问存在限制，需自行部署。
:::`,
};

async function handler() {
    const rootUrl = 'https://www2.scut.edu.cn';
    const url = `${rootUrl}/ee/16285/list.htm`;
    const response = await got(url);
    const $ = load(response.data);

    const list = $('.news_ul li');
    const articleList = list.toArray().map((item) => {
        item = $(item);
        const titleElement = item.find('.news_title a');
        return {
            title: titleElement.attr('title'),
            link: titleElement.attr('href'),
            pubDate: parseDate(item.find('.news_meta').text(), 'YYYY-MM-DD'),
        };
    });

    const items = await Promise.all(
        articleList.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(`${rootUrl}${item.link}`);
                const content = load(detailResponse.data);

                content('.wp_articlecontent *').each((_, child) => {
                    const childElem = content(child);
                    childElem.removeAttr('style');
                    childElem.removeAttr('lang');
                    childElem.removeAttr('original-src');
                    childElem.removeAttr('sudyfile-attr');
                    childElem.removeAttr('data-layer');
                    if ((!childElem.text().replace('\n', '').trim().length && !childElem.has('img')) || childElem.attr('name') === '_GoBack' || childElem.is('style')) {
                        childElem.remove();
                    }
                });

                const contentHTML = content('.wp_articlecontent').html();
                item.description = contentHTML.replaceAll(/^(<br>)+|(<br>)+$/g, '').trim();
                return item;
            })
        )
    );

    return {
        title: '华南理工大学电子与信息学院 - 新闻速递',
        link: url,
        item: items,
    };
}
