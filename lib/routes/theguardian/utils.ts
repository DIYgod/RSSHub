import { load } from 'cheerio';

import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';

const rebuildFigure = ($e) => {
    const img = $e.find('img');
    if (img.length === 0) {
        $e.remove();
        return;
    }
    const caption = $e.find('figcaption').first().text().trim();
    const src = img.attr('src')?.replace(/width=\d+/, 'width=700');
    $e.replaceWith(`<figure><img alt='${img.attr('alt')}' src='${src}'><br><figcaption>${caption}</figcaption></figure>`);
};

const processFeed = (data: string) => {
    const $ = load(data);
    const content = $('#maincontent');

    if (content.length === 0) {
        return;
    }

    content.find('gu-island, ul > li > p> em > strong').remove();

    content.find('figure').each((_, e) => rebuildFigure($(e)));

    const cover = $('div[data-gu-name="media"] figure');
    if (cover.length > 0) {
        rebuildFigure(cover);
        $('div[data-gu-name="media"] figure').insertBefore(content.children().first());
    }

    return content.html();
};

export const getFeed = async (cfg: { link: string; title: string; rss: string }): Promise<Data> => {
    const feed = await parser.parseURL(cfg.rss);
    const items = await Promise.all(
        feed.items.slice(0, 10).map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const description = processFeed(response);

                return {
                    title: item.title,
                    description: description ?? item.content,
                    pubDate: item.pubDate,
                    link: item.link,
                    category: item.categories?.map((c) => (c as unknown as { _: string })._),
                };
            })
        )
    );

    return {
        title: `The Guardian - ${cfg.title}`,
        link: cfg.link,
        description: `The Guardian - ${cfg.title}`,
        item: items as DataItem[],
    };
};
