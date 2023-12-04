const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { renderHTML } = require('./utils');

module.exports = async (ctx) => {
    const categoryId = ctx.params.category_id;
    const rssUrl = `https://www.scmp.com/rss/${categoryId}/feed`;
    const { data: response } = await got(rssUrl);
    const $ = cheerio.load(response, {
        xmlMode: true,
    });

    const list = $('item')
        .toArray()
        .map((item) => {
            item = $(item);
            const enclosure = item.find('enclosure').first();
            const mediaContent = item.find('media\\:content').toArray()[0];
            const thumbnail = item.find('media\\:thumbnail').toArray()[0];
            return {
                title: item.find('title').text(),
                description: item.find('description').text(),
                link: item.find('link').text().split('?utm_source')[0],
                author: item.find('author').text(),
                pubDate: parseDate(item.find('pubDate').text()),
                enclosure_url: enclosure?.attr('url'),
                enclosure_length: enclosure?.attr('length'),
                enclosure_type: enclosure?.attr('type'),
                media: {
                    content: Object.keys(mediaContent.attribs).reduce((data, key) => {
                        data[key] = mediaContent.attribs[key];
                        return data;
                    }, {}),
                    thumbnail: thumbnail?.attribs
                        ? Object.keys(thumbnail.attribs).reduce((data, attr) => {
                              data[attr] = thumbnail.attribs[attr];
                              return data;
                          }, {})
                        : undefined,
                },
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response, url } = await got(item.link);

                if (new URL(url).hostname !== 'www.scmp.com') {
                    // e.g., https://multimedia.scmp.com/
                    return item;
                }

                const $ = cheerio.load(response);

                const nextData = JSON.parse($('script#__NEXT_DATA__').text());
                const { article } = nextData.props.pageProps.payload.data;

                // item.nextData = article;

                item.summary = renderHTML(article.summary.json);
                item.description = renderHTML(article.subHeadline.json) + renderHTML(article.images.find((i) => i.type === 'leading')) + renderHTML(article.body.json);
                item.updated = parseDate(article.updatedDate, 'x');
                item.category = [...new Set([...article.topics.map((t) => t.name), ...article.sections.flatMap((t) => t.value.map((v) => v.name)), ...article.keywords.map((k) => k?.split(', '))])];

                // N.B. gallery in article is not rendered
                // e.g., { type: 'div', attribs: { class: 'scmp-photo-gallery', 'data-gallery-nid': '3239409' }}
                // from https://www.scmp.com/news/china/politics/article/3239355/li-keqiang-former-premier-china-dead

                return item;
            })
        )
    );

    ctx.state.json = {
        items,
    };

    ctx.state.data = {
        title: $('channel > title').text(),
        link: $('channel > link').text(),
        description: $('channel > description').text(),
        item: items,
        language: 'en-hk',
        icon: 'https://assets.i-scmp.com/static/img/icons/scmp-icon-256x256.png',
        logo: 'https://customerservice.scmp.com/img/logo_scmp@2x.png',
        image: $('channel > image > url').text(),
    };
};
