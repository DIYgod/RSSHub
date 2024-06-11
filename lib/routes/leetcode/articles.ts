import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
    breaks: true,
});

const host = 'https://leetcode.com';
const gqlEndpoint = `${host}/graphql`;

export const route: Route = {
    path: '/articles',
    categories: ['programming'],
    example: '/leetcode/articles',
    parameters: {},
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
            source: ['leetcode.com/articles'],
        },
    ],
    name: 'Articles',
    maintainers: ['LogicJake'],
    handler,
    url: 'leetcode.com/articles',
};

async function handler() {
    const link = new URL('/articles/', host).href;
    const response = await ofetch(link, { parseResponse: (txt) => txt });
    const $ = load(response);

    const list = $('a.list-group-item')
        .filter((i, e) => $(e).find('h4.media-heading i').length === 0)
        .map(function () {
            const info = {
                title: $(this).find('h4.media-heading').text().trim(),
                author: $(this).find('.text-500').text(),
                link: new URL($(this).attr('href'), host).href,
                pubDate: $(this).find('p.pull-right.media-date strong').text().trim(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map((info) =>
            cache.tryGet(info.link, async () => {
                const titleSlug = info.link.split('/')[4];

                const questionContent = await ofetch(gqlEndpoint, {
                    method: 'POST',
                    body: {
                        operationName: 'questionContent',
                        variables: { titleSlug },
                        query: `query questionContent($titleSlug: String!) {
                                question(titleSlug: $titleSlug) {
                                    content
                                    mysqlSchemas
                                    dataSchemas
                                }
                            }`,
                    },
                });

                const officialSolution = await ofetch(gqlEndpoint, {
                    method: 'POST',
                    body: {
                        operationName: 'officialSolution',
                        variables: { titleSlug },
                        query: `query officialSolution($titleSlug: String!) {
                                question(titleSlug: $titleSlug) {
                                    solution {
                                        content
                                    }
                                }
                            }`,
                    },
                });

                const solution = md.render(officialSolution.data.question.solution.content);

                info.description = (questionContent.data.question.content?.trim() ?? '') + solution;
                info.pubDate = parseDate(info.pubDate);

                return info;
            })
        )
    );

    return {
        title: $('head title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        image: 'https://assets.leetcode.com/static_assets/public/icons/favicon-192x192.png',
        link,
        item: out,
    };
}
