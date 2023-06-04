const cheerio = require('cheerio');
const got = require('@/utils/got');

const getData = async (ctx, list) => {
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                const data = JSON.parse($('script#__NEXT_DATA__').text());
                const type = data.props.pageProps.article.type.toLowerCase();
                if (type === 'video') {
                    const description = data.props.pageProps.article.description;
                    const credits = data.props.pageProps.article.credits;
                    const banner = `<img src="${data.props.pageProps.article.thumbnail.urls.header}">`;
                    const host = data.props.pageProps.article.hoster;

                    let video = '';
                    if (host === 'youtube') {
                        video = `https://www.youtube.com/watch?v=${data.props.pageProps.article.hosterId}`;
                    }
                    if (host === 'vimeo') {
                        // not all vimeo videos are available via simple id
                        video = `https://vimeo.com/${data.props.pageProps.article.hosterId}`;
                    }
                    item.description = `<a href="${video}">${banner}</a>${description}${credits}`;
                } else {
                    // Essay or Audio
                    // But unfortunately, the method based on __NEXT_DATA__
                    // does not include the information of the audio link.

                    // Besides, it seems that the method based on __NEXT_DATA__
                    // does not include the information of the two-column
                    // images in the article body,
                    // e.g. https://aeon.co/essays/how-to-mourn-a-forest-a-lesson-from-west-papua .
                    // But that's very rare.
                    const data = JSON.parse($('script#__NEXT_DATA__').text());

                    item.author = data.props.pageProps.article.authors.map((author) => author.displayName).join(', ');
                    const authorsBio = data.props.pageProps.article.authors.map((author) => '<p>' + author.displayName + author.authorBio.replace(/^<p>/g, ' ')).join('');

                    const banner = `<img src="${data.props.pageProps.article.thumbnail.urls.header}">`;
                    const capture = cheerio.load(data.props.pageProps.article.body);
                    capture('p.pullquote').remove();

                    item.description = banner + authorsBio + capture.html();
                }

                return item;
            })
        )
    );

    return items;
};

module.exports = {
    getData,
};
