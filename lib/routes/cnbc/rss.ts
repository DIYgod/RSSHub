// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import parser from '@/utils/rss-parser';

export default async (ctx) => {
    const { id = '100003114' } = ctx.req.param();
    const feed = await parser.parseURL(`https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=${id}`);

    const items = await Promise.all(
        feed.items
            .filter((i) => i.link && !i.link.startsWith('https://www.cnbc.com/select/'))
            .map((item) =>
                cache.tryGet(item.link, async () => {
                    const { data: response } = await got(item.link);
                    const $ = load(response);

                    delete item.content;
                    delete item.contentSnippet;
                    delete item.isoDate;

                    item.description = '';
                    if ($('.RenderKeyPoints-keyPoints').length) {
                        $('.RenderKeyPoints-keyPoints').html();
                    }
                    if ($('.FeaturedContent-articleBody').length) {
                        item.description += $('.FeaturedContent-articleBody').html();
                    }
                    if ($('.ArticleBody-articleBody').length) {
                        item.description += $('.ArticleBody-articleBody').html();
                    }
                    if ($('.LiveBlogBody-articleBody').length) {
                        item.description += $('.LiveBlogBody-articleBody').html();
                    }
                    if ($('.ClipPlayer-clipPlayer').length) {
                        item.description += $('.ClipPlayer-clipPlayer').html();
                    }

                    const meta = JSON.parse($('[type=application/ld+json]').last().text());
                    item.author = meta.author ? meta.author.name ?? meta.author.map((a) => a.name).join(', ') : null;
                    item.category = meta.keywords;

                    return item;
                })
            )
    );

    ctx.set('data', {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        language: feed.language,
    });
};
