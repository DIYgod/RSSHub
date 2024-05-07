import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog/:blog',
    categories: ['programming'],
    example: '/isabelle-dev/blog/{1,2}',
    parameters: { blog: 'name of blog (1 for NEWS; 2 for Release)' },
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
            source: ['isabelle-dev.sketis.net/phame/blog/view/:blog/'],
            target: '/isabelle-dev/blog/',
        },
    ],
    name: 'Isabelle Development Blogs',
    maintainers: ['Ritsuka314'],
    handler: async (ctx) => {
        const baseUrl = 'https://isabelle-dev.sketis.net';
        const { blog } = ctx.req.param();
        const blogName = blog === '1' ? 'News' : blog === '2' ? 'Release' : 'UNKNOWN';
        const url = `${baseUrl}/phame/blog/view/${blog}/`;
        const response = await ofetch(url);
        const $ = load(response);

        const items = $('.phui-document-summary-view')
            .toArray()
            .map((item_) => {
                const item = $(item_);
                const title = item.find('.remarkup-header').first();
                const subtitle = item.find('.phui-document-summary-subtitle').first();
                return {
                    title: title.text(),
                    // We need an absolute URL for `link`, but `a.attr('href')` returns a relative URL.
                    link: `${baseUrl}${title.find('a').attr('href')}`,
                    description: item.find('.phui-document-summary-body').text(),
                    pubDate: parseDate(subtitle.find('strong').next().text().slice(4)), // parse starts after ' on '
                    author: subtitle.find('strong').text(),
                };
            });

        return {
            title: `Isabelle ${blogName}`,
            // channel link
            link: url,
            // each feed item
            item: items,
        };
    },
};
