const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const ids = require('./id');
const documentIds = require('./documentId');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 'justin';

    const isChannel = ids.hasOwnProperty(id) ? !/topic\//.test(ids[id].link) : documentIds.hasOwnProperty(id) ? !/topic\//.test(documentIds[id].link) : isNaN(id) ? undefined : true;

    if (isChannel === undefined) {
        throw Error('Bad id. See <a href="https://docs.rsshub.app/traditional-media.html#abc-news-channel-topic">docs</a>');
    }

    const rootUrl = 'https://www.abc.net.au';
    const currentUrl = `${rootUrl}/news/${ids.hasOwnProperty(id) ? ids[id].link : documentIds.hasOwnProperty(id) ? documentIds[id].link : id}`;
    const apiUrl = `${rootUrl}/news-web/api/loader/${id === 'justin' ? 'justinstories?' : `${isChannel ? `channelrefetch` : `topicstories`}?name=PaginationArticles&documentId=${!isNaN(id) ? id : ids[id].documentId}&`}size=100`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.collection.slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 50).map((item) => ({
        title: item.title.children,
        link: `${rootUrl}${item.link.to}`,
        pubDate: parseDate(item.timestamp.dates.firstPublished.labelDate),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('div[data-component="ZendeskForm"]').remove();
                content('aside[data-component="RelatedCard"]').remove();

                item.description = '';

                const cover = content('div[data-component="FeatureMedia"]');
                const coverImage = cover.find('img');
                coverImage.attr('src', coverImage.attr('data-src'));

                item.description += coverImage.toString() + cover.find('figcaption').toString();

                content('.ZN39J')
                    .find('noscript')
                    .each(function () {
                        content(this).parent().parent().html(content(this).text());
                    });

                item.description += content('.ZN39J').html();
                item.category = content('meta[property="article:tag"]')
                    .toArray()
                    .map((tag) => content(tag).attr('content'));

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${ids.hasOwnProperty(id) ? ids[id].title : documentIds.hasOwnProperty(id) ? documentIds[id].title : id} - ABC`,
        link: currentUrl,
        item: items,
    };
};
