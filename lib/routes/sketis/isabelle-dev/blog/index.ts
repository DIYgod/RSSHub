import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const source = [
    'isabelle-dev.sketis.net/phame/',
    'isabelle-dev.sketis.net/phame/blog/',
    'isabelle-dev.sketis.net/phame/blog/view/:blog/',
    'isabelle-dev.sketis.net/phame/post/',
    'isabelle-dev.sketis.net/phame/post/view/:post_id/:post_title/',
];

export const route: Route = {
    path: '/isabelle-dev/blog/:blog',
    categories: ['programming'],
    example: '/sketis/isabelle-dev/blog/1',
    parameters: { blog: 'name of blog (1 for NEWS; 2 for Release)' },
    description: `
- Isabelle News: \`https://isabelle-dev.sketis.net/phame/blog/view/1/\`
- Isabelle Release: \`https://isabelle-dev.sketis.net/phame/blog/view/2/\`
`,
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
            source,
            target: '/isabelle-dev/blog/1',
        },
        {
            source,
            target: '/isabelle-dev/blog/2',
        },
    ],
    name: 'Isabelle Development Blogs',
    url: 'isabelle-dev.sketis.net',
    maintainers: ['Ritsuka314'],
    handler: async (ctx) => {
        const baseUrl = 'https://isabelle-dev.sketis.net';
        const { blog } = ctx.req.param();
        const blogName = blog === '1' ? 'News' : (blog === '2' ? 'Release' : 'UNKNOWN');
        const url = `${baseUrl}/phame/blog/view/${blog}/`;
        const response = await ofetch(url);
        const $ = load(response);

        const items = $('.phui-document-summary-view')
            .toArray()
            .map((item_) => {
                const item = $(item_);
                const title = item.find('.remarkup-header').first();
                const subtitle = item.find('.phui-document-summary-subtitle').first();
                const date = subtitle.find('strong').first()[0].nextSibling.data.slice(4); // parse starts after ' on '
                return {
                    title: title.text(),
                    // We need an absolute URL for `link`, but `a.attr('href')` returns a relative URL.
                    link: `${baseUrl}${title.find('a').attr('href')}`,
                    description: item.find('.phui-document-summary-body').html(),
                    pubDate: parseDate(date),
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
