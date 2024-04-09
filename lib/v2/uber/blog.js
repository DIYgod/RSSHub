const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const rootURL = 'https://www.uber.com';
const apiURL = 'https://blogapi.uber.com';

module.exports = async (ctx) => {
    let maxPage = Number(ctx.params.maxPage);
    if (Number.isNaN(maxPage)) {
        maxPage = 1;
    }

    let pages = await Promise.all(
        [...Array(maxPage).keys()].map((pageIdx) =>
            got(`${apiURL}/wp-json/blog/v1/data`, {
                searchParams: {
                    page: pageIdx + 1,
                    parent: 'pittsburgh',
                    slug: 'engineering',
                },
            })
        )
    );
    pages = pages.map((page) => page.data);

    const result = await Promise.all(
        pages.map((page) =>
            Promise.all(
                page.posts.map((post) =>
                    ctx.cache.tryGet(`${rootURL}${post.link}`, async () => {
                        let { data: article } = await got(`${apiURL}/wp-json/blog/v1/data`, {
                            searchParams: {
                                slug: post.link.replace(/\//g, '').replace('blog', ''),
                            },
                        });
                        article = article.article;

                        return {
                            link: article.link,
                            title: article.title,
                            description: article.content,
                            pubDate: parseDate(article.created),
                            author: article.author,
                            category: article.categories.map((category) => category.category_name),
                        };
                    })
                )
            )
        )
    );

    ctx.state.data = {
        title: `Uber Engineering Blog`,
        link: rootURL + '/blog/engineering',
        description: 'The technology behind Uber Engineering',
        item: result.flat(),
    };
};
