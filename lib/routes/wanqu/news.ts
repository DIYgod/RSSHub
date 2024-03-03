// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://www.wanqu.co';
    const currentUrl = rootUrl;

    const response = await got(currentUrl);

    const $ = load(response.data);

    const items = $('div.mb-4')
        .toArray()
        .map((item) => ({
            title: $(item).find('a').text(),
            description: $(item).find('a').text(),
            link: $(item).find('a').attr('href'),
            pubDate: parseDate($(item).find('i.text-helper-color.mr-4').text().trim()),
        }));

    ctx.set('data', {
        title: '湾区日报 - 最新推荐',
        link: currentUrl,
        item: items,
    });
};
