// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const md = require('markdown-it')({
    html: true,
    breaks: true,
});

const host = 'https://leetcode.com';
const gqlEndpoint = `${host}/graphql`;

export default async (ctx) => {
    const link = new URL('/articles/', host).href;
    const response = await got(link);
    const $ = load(response.data);

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

                const questionContent = await got
                    .post(gqlEndpoint, {
                        json: {
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
                    })
                    .json();

                const officialSolution = await got
                    .post(gqlEndpoint, {
                        json: {
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
                    })
                    .json();

                const solution = md.render(officialSolution.data.question.solution.content);

                info.description = (questionContent.data.question.content?.trim() ?? '') + solution;
                info.pubDate = parseDate(info.pubDate);

                return info;
            })
        )
    );

    ctx.set('data', {
        title: $('head title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        image: 'https://assets.leetcode.com/static_assets/public/icons/favicon-192x192.png',
        link,
        item: out,
    });
};
