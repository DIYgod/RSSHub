const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 50;

    const rootUrl = 'https://ask.imiker.com';
    const apiUrl = new URL('explore/main/list/', rootUrl).href;
    const currentUrl = new URL(``, rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            page: 1,
            page_size: limit,
            type: 'jinghua',
            types: 'json',
        },
    });

    let items = response.slice(0, limit).map((item) => ({
        title: item.question_content,
        link: new URL(`question/${item.id}`, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            headImage: item.headimage,
            author: item.nick_name,
            question: item.question_detail,
        }),
        author: item.nick_name,
        guid: `imiker-${item.id}`,
        pubDate: parseDate(item.add_time_timestamp * 1000),
        upvotes: item.count?.vote_count ?? 0,
        comments: item.count?.answer_count ?? 0,
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                content('h5.img-for-lazyload').each((_, e) => {
                    const image = content(e).find('img');

                    content(e).replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            image: {
                                src: image.prop('data-original'),
                                alt: image.prop('alt'),
                                width: image.prop('data-width'),
                                height: image.prop('data-height'),
                            },
                        })
                    );
                });

                item.title = content('div.title h1').text();
                item.description += art(path.join(__dirname, 'templates/description.art'), {
                    description: content('div#warp').html(),
                });
                item.author = content('div.name').text();

                return item;
            })
        )
    );

    const author = '米课圈';
    const description = '精华';
    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${author} - ${description}`,
        link: currentUrl,
        description,
        language: 'zh',
        icon,
        logo: icon,
        subtitle: description,
        author,
        allowEmpty: true,
    };
};
