const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const showdown = require('showdown');

const host = 'https://leetcode.com';
const gqlEndpoint = `${host}/graphql`;

module.exports = async (ctx) => {
    const link = new URL('/articles/', host).href;
    const response = await got(link);
    const $ = cheerio.load(response.data);

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
            ctx.cache.tryGet(info.link, async () => {
                const titleSlug = info.link.split('/')[4];

                const questionData = await got
                    .post(gqlEndpoint, {
                        json: {
                            operationName: 'questionData',
                            variables: { titleSlug },
                            query: `query questionData($titleSlug: String!) {
                                question(titleSlug: $titleSlug) {
                                    content
                                }
                            }`,
                        },
                    })
                    .json();

                const questionNote = await got
                    .post(gqlEndpoint, {
                        json: {
                            operationName: 'QuestionNote',
                            variables: { titleSlug },
                            query: `query QuestionNote($titleSlug: String!) {
                                question(titleSlug: $titleSlug) {
                                    solution {
                                        content
                                    }
                                }
                            }`,
                        },
                    })
                    .json();

                const converter = new showdown.Converter();
                const solution = converter.makeHtml(questionNote.data.question.solution.content);

                info.description = questionData.data.question.content.trim() + solution;
                info.pubDate = parseDate(info.pubDate);

                return info;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        image: 'https://assets.leetcode.com/static_assets/public/icons/favicon-192x192.png',
        link,
        item: out,
    };
};
