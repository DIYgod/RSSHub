const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'https://hk01.com';
const apiRootUrl = 'https://web-data.api.hk01.com';

module.exports = {
    rootUrl,
    apiRootUrl,
    ProcessItems: (items, limit, tryGet) =>
        Promise.all(
            items
                .filter((item) => item.type !== 2)
                .slice(0, limit ? parseInt(limit) : 50)
                .map((item) => ({
                    title: item.data.title,
                    link: `${rootUrl}/sns/article/${item.data.articleId}`,
                    pubDate: parseDate(item.data.publishTime * 1000),
                    category: item.data.tags.map((t) => t.tagName),
                    author: item.data.authors.map((a) => a.publishName).join(', '),
                }))
                .map((item) =>
                    tryGet(item.link, async () => {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                        });

                        const content = JSON.parse(detailResponse.data.match(/"__NEXT_DATA__" type="application\/json">({"props":.*})<\/script>/)[1]);

                        item.description = art(path.join(__dirname, 'templates/description.art'), {
                            image: content.props.initialProps.pageProps.article.originalImage.cdnUrl,
                            teasers: content.props.initialProps.pageProps.article.teaser,
                            blocks: content.props.initialProps.pageProps.article.blocks,
                        });

                        return item;
                    })
                )
        ),
};
