const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { card2Html } = require('./utils');

const APP_DATA_REGEX = /window\.appData = JSON\.parse\(decodeURIComponent\("(.+?)"\)\);/;
const baseUrl = 'https://www.yuque.com';

module.exports = async (ctx) => {
    const { name, book } = ctx.params;
    const bookUrl = `${baseUrl}/${name}/${book}`;

    const { data: bookHtml } = await got(bookUrl);
    const $ = cheerio.load(bookHtml);
    const appData = JSON.parse(decodeURIComponent($('script').text().match(APP_DATA_REGEX)[1]));

    const bookId = appData.book.id;

    const {
        data: { data: docs },
    } = await got(`${baseUrl}/api/docs`, {
        searchParams: {
            book_id: bookId,
        },
    });

    const list = docs.map((item) => ({
        title: item.title,
        description: item.description,
        link: `${baseUrl}/${name}/${book}/${item.slug}`,
        pubDate: parseDate(item.published_at),
        slug: item.slug,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const {
                    data: { data },
                } = await got(`${baseUrl}/api/docs/${item.slug}`, {
                    searchParams: {
                        book_id: bookId,
                        include_contributors: true,
                    },
                });

                const $ = cheerio.load(data.content, null, false);

                $('card').each((_, elem) => {
                    card2Html($(elem), item.link);
                });
                $('[data-lake-id]').removeAttr('data-lake-id');
                $('[id]').removeAttr('id');
                $('p').each((_, elem) => {
                    elem = $(elem);
                    if (elem.children().length === 1 && elem.children().is('br')) {
                        elem.remove();
                    }
                    if (elem.children().length === 2 && elem.children().eq(0).is('span') && elem.children().eq(0).text().length === 1 && elem.children().eq(1).is('br')) {
                        elem.remove();
                    }
                });
                // obtain real video src
                for await (const v of $('video').toArray()) {
                    const $v = $(v);
                    const src = $v.attr('src');
                    if (src.startsWith('inputs')) {
                        const { data } = await got(`${baseUrl}/api/video`, {
                            searchParams: {
                                video_id: src,
                            },
                        });
                        const { info } = data.data;
                        $v.replaceWith(`<video controls preload='none' poster='${info.cover}'><source src='${info.url}' type='video/mp4'></video>`);
                    }
                }

                item.description = $.html();
                item.author = data.contributors.map((c) => c.name).join(', ');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: appData.book.name,
        description: appData.book.description,
        image: appData.group.avatar,
        link: bookUrl,
        item: items,
    };
};
