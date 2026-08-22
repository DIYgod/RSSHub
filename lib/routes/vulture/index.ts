import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:tag/:excludetags?',
    categories: ['new-media'],
    example: '/vulture/movies',
    parameters: { tag: 'The sub-site name', excludetags: 'Comma-delimited list of tags. If an article includes one of these tags, it will be excluded from the RSS feed.' },
    name: 'Sub-site',
    maintainers: ['loganrockmore'],
    handler,
    description: `Supported sub-sites:

| TV | Movies | Comedy | Music | TV Recaps | Books | Theater | Art | Awards | Video |
| -- | ------ | ------ | ----- | --------- | ----- | ------- | --- | ------ | ----- |
| tv | movies | comedy | music | tvrecaps  | books | theater | art | awards | video |`,
};

async function loadArticle(articleURL: string) {
    const response = await ofetch(articleURL);
    const $ = load(response);

    const tags = $('meta[property="article:tag"]').attr('content')!.split(', ');
    const description = $('div.article-content');

    // remove the content that we don't want to show
    description.find('aside.related').remove();
    description.find('aside.article-details_heading-with-paragraph').remove();
    description.find('section.package-list').remove();
    description.find('div.source-links h2').remove();
    description.find('div.source-links svg').remove();
    description.find('div.mobile-secondary-area').remove();
    description.find('aside.newsletter-flex-text').remove();

    description.append('<br /><br />tags: ' + tags.join(', '));

    return {
        title: $('meta[property="og:title"]').attr('content') ?? '',
        author: 'by ' + $('meta[name="author"]').attr('content'),
        pubDate: parseDate($('meta[property="article:published_time"]').attr('content')!),
        link: articleURL,
        guid: articleURL,
        description: description.html(),
        tags,
    };
}

async function handler(ctx: Context) {
    const { tag, excludetags } = ctx.req.param();
    const url = `https://www.vulture.com/tags/${tag}/`;

    let title = `Vulture - tag ${tag}`;
    if (excludetags !== undefined) {
        title += ' - excluding tags ' + excludetags.split(',').join(', ');
    }

    const htmlData = await ofetch(url, { headers: { Referer: url } });
    const $ = load(htmlData);

    const articleURLs = $('section.paginated-feed li.article')
        .slice(0, 25)
        .toArray()
        .map((article) => {
            const articleURL = $(article).find('a.link-text').attr('href')!;
            if (articleURL.startsWith('//www.')) {
                return 'https:' + articleURL;
            }
            if (articleURL.startsWith('www.')) {
                return 'https://' + articleURL;
            }
            return articleURL;
        });

    let result = await Promise.all(articleURLs.map((articleURL) => cache.tryGet(articleURL, () => loadArticle(articleURL))));

    if (excludetags !== undefined) {
        const tagsToExclude = excludetags.split(',');
        result = result.filter((item: any) => !item.tags?.some((itemTag: string) => tagsToExclude.includes(itemTag)));
    }

    return {
        title,
        link: url,
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
}
