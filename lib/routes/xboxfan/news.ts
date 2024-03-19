import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';
import md5 from '@/utils/md5';

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/xboxfan/news',
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
            source: ['xboxfan.com/'],
        },
    ],
    name: '资讯',
    maintainers: ['XXY233'],
    handler,
    url: 'xboxfan.com/',
};

async function handler() {
    const baseUrl = 'https://xboxfan.com/';
    const { data: response } = await got(baseUrl);
    const $ = load(response);

    $('div.homeCom').remove();
    $('div.homeMore').remove();

    $('el-image').each((index, el_image) => {
        const img = $('<img>');
        img.attr('src', $(el_image).attr('src'));
        $(el_image).replaceWith(img);
    });

    const items = $(`div.homeItem[v-if="showFeedLevel == 'read'"]`)
        .toArray()
        .map((item) => {
            const data = {
                title: '资讯',
                author: $(item).find('div.homeName').text(),
                pubDate: parseRelativeDate($(item).find('div.homeTime').first().text().split(' ')[0]),
            };

            $(item).find('div.homeName').remove();
            $(item).find('div.homeTime').remove();

            const md5Value = md5($(item).text());
            data.guid = md5Value;

            data.description = $(item).html();

            return data;
        });

    return {
        title: '盒心光环·资讯',
        link: 'https://xboxfan.com/',
        item: items,
    };
}
