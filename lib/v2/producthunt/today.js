const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const response = await got('https://www.producthunt.com/');

    const data = JSON.parse(cheerio.load(response.data)('#__NEXT_DATA__').html());

    const list = Object.values(data.props.apolloState)
        .filter((o) => o.__typename === 'Post')
        // only includes new post, not product
        .filter((o) => o.hasOwnProperty('redirectToProduct') && o.redirectToProduct === null);

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.slug, async () => {
                const detailresponse = await got(`https://www.producthunt.com/posts/${item.slug}`);

                const data = JSON.parse(cheerio.load(detailresponse.data)('#__NEXT_DATA__').html());
                const descData = data.props.apolloState[`Post${item.id}`];

                return {
                    title: `${item.slug} - ${item.tagline}`,
                    description:
                        descData.description +
                        art(path.join(__dirname, 'templates/descImg.art'), {
                            descData,
                        }),
                    link: `https://www.producthunt.com/posts/${item.slug}`,
                    pubDate: parseDate(descData.createdAt),
                };
            })
        )
    );

    ctx.state.data = {
        title: 'Product Hunt Today Popular',
        link: 'https://www.producthunt.com/',
        item: items,
    };
};
