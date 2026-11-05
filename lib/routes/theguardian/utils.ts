import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const rebuildFigure = ($e, $) => {
    const img = $e.find('img');
    if (img.length === 0) {
        if ($e.find('iframe, video, audio').length === 0) {
            $e.remove();
        }
        return;
    }
    const caption = $e.find('figcaption').first().text().trim();
    const src = img.attr('src')?.replace(/width=\d+/, 'width=700');
    const figure = $('<figure>')
        .append(
            $('<img>')
                .attr('alt', img.attr('alt') ?? '')
                .attr('src', src ?? '')
        )
        .append('<br>')
        .append($('<figcaption>').text(caption));
    $e.replaceWith(figure);
};

const processFeed = (data: string) => {
    const $ = load(data);
    const content = $('#maincontent');

    if (content.length === 0) {
        return;
    }

    content.find('gu-island, ul > li > p> em > strong').remove();

    content.find('figure').each((_, e) => rebuildFigure($(e), $));

    const cover = $('div[data-gu-name="media"] figure');
    if (cover.length > 0) {
        rebuildFigure(cover, $);
        $('div[data-gu-name="media"] figure').insertBefore(content.children().first());
    }

    return content.html();
};

export const getFeed = async (cfg: { link: string; title: string; rss: string }): Promise<Data> => {
    const feed = await parser.parseURL(cfg.rss);
    const items = await pMap(
        feed.items.slice(0, 10),
        async (item) => ({
            title: item.title,
            author: item.creator,
            pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
            link: item.link,
            category: (item.categories as unknown[] | undefined)?.map((category) => (category as { _: string })._),
            description:
                (await cache.tryGet(item.link!, async () => {
                    const response = await ofetch(item.link!);
                    return processFeed(response);
                })) ?? item.content,
        }),
        { concurrency: 3 }
    );

    return {
        title: `The Guardian - ${cfg.title}`,
        link: cfg.link,
        description: `The Guardian - ${cfg.title}`,
        item: items as DataItem[],
    };
};
