const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const UA = require('@/utils/rand-user-agent')({ browser: 'chrome', os: 'android', device: 'mobile' });

const getArticleDetails = async (items, ctx) => {
    const list = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const url = item.link;
                const response = await got({
                    url,
                    method: 'get',
                    headers: {
                        'User-Agent': UA,
                    },
                });
                const html = response.data;
                const $ = cheerio.load(html);
                let data = JSON.parse($('script#__NEXT_DATA__').text());

                const list = data.props.pageProps.urqlState;
                const keyWithContent = Object.keys(list).filter((key) => list[key].data.includes('content'));
                data = JSON.parse(list[keyWithContent].data).article;
                item.title = data.shareTitle;
                item.category = data.categories.map((category) => category.slug);
                data.channels.forEach((channel) => {
                    item.category.push(channel.slug);
                });
                item.content = data.content.filter((item) => item.innerHtml !== undefined && item.innerHtml !== '');
                item.caption = data.dek;
                item.imgUrl = data.leadArt.image?.url;
                item.imgAlt = data.leadArt.image?.altText;
                item.imgCaption = data.leadArt.image?.attributionText;
                item.description = art(path.join(__dirname, 'templates/article-description.art'), {
                    item,
                });
                return {
                    title: item.title,
                    pubDate: parseDate(item.pubDate),
                    link: item.link,
                    description: item.description,
                };
            })
        )
    );
    return list;
};

module.exports = {
    getArticleDetails,
};
