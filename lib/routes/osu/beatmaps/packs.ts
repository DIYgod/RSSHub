// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { type = 'standard' } = ctx.req.param();

    const link = `https://osu.ppy.sh/beatmaps/packs?type=${type}`;

    const response = await got.get(link);
    const $ = load(response.data);
    const itemList = $('.beatmap-pack');

    ctx.set('data', {
        title: `osu! Beatmap Pack - ${type}`,
        link,
        item: itemList.toArray().map((element) => {
            const item = $(element);
            const title = item.find('.beatmap-pack__name').text().trim();
            const link = item.find('.beatmap-pack__header').attr('href');
            // Trying to get the description will return 429 (Too Many Requests).
            const description = item.find('.beatmap-pack__body').html();
            const pubDate = parseDate(item.find('.beatmap-pack__date').text(), 'YYYY-MM-DD');
            const author = item.find('.beatmap-pack__author--bold').text().trim();

            return {
                title,
                link,
                description,
                pubDate,
                author,
            };
        }),
    });
};
