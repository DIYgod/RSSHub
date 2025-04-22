import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/news',
    categories: ['other'],
    example: '/fisher-spb/news',
    parameters: {},
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
            source: ['fisher.spb.ru/news'],
        },
    ],
    name: 'News',
    maintainers: ['denis-ya'],
    handler,
    url: 'fisher.spb.ru/news',
};

async function handler() {
    const renderVideo = (link) => art(path.join(__dirname, './templates/video.art'), { link });
    const renderImage = (href) => art(path.join(__dirname, './templates/image.art'), { href });

    const rootUrl = 'https://fisher.spb.ru/news/';
    const response = await got({
        method: 'get',
        url: rootUrl,
        responseType: 'buffer',
    });

    const $ = load(response.data);

    const descBuilder = (element) => {
        const content = load(`<p>${$('.news-message-text', element).html()}</p>`).root();
        $('.news-message-media a', element).each((_, elem) => {
            if ($(elem).hasClass('news-message-youtube')) {
                content.append(renderVideo($(elem).attr('data-youtube')));
            } else {
                content.append(renderImage($(elem).attr('href')));
            }
        });
        return content;
    };

    const items = $('.news-message')
        .map((_, elem) => ({
            pubDate: parseDate($('.news-message-date', elem).text().trim(), 'DD.MM.YYYY HH:mm'),
            title: $('.news-message-location', elem).text().trim(),
            description: descBuilder(elem).html(),
            author: $('.news-message-user', elem).text().trim(),
            guid: $(elem).attr('id'),
            link: rootUrl + $('.news-message-comments-number > a', elem).attr('href'),
        }))
        .get();

    return {
        title: $('head > title').text().trim(),
        link: rootUrl,
        item: items,
    };
}
