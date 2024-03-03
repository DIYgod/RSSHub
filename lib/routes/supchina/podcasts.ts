// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://supchina.com';
    const currentUrl = `${rootUrl}/feed/podcast`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('item')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: item.find('guid').text(),
                author: item.find('itunes\\:author').text(),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const episodeResponse = await got({
                    method: 'get',
                    url: `https://rss.art19.com/episodes/${detailResponse.data.match(/data-episode-id="(.*?)"/)[1]}`,
                    headers: {
                        accept: 'application/json',
                    },
                });

                const data = episodeResponse.data;

                item.title = data.content.episode_title;
                item.itunes_item_image = data.content.cover_image;
                item.itunes_duration = data.content.duration;
                item.enclosure_url = data.content.media.mp3.url;
                item.enclosure_type = data.content.media.mp3.content_type;
                item.description = data.content.episode_description;
                item.pubDate = parseDate(data.performed_at);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'SupChina - Podcasts',
        link: `${rootUrl}/podcasts`,
        itunes_author: $('channel itunes\\:author').first().text(),
        image: $('itunes\\:image').attr('href'),
        item: items,
    });
};
