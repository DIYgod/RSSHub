// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';
import md5 from '@/utils/md5';

export default async (ctx) => {
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

    ctx.set('data', {
        title: '盒心光环·资讯',
        link: 'https://xboxfan.com/',
        item: items,
    });
};
