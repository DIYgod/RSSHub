const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.devolverdigital.com/blog';
    const { data: response } = await got(baseUrl);

    const $ = cheerio.load(response);
    const nextData = JSON.parse($('#__NEXT_DATA__').text());

    const items = await Promise.all(
        nextData.props.pageProps.posts.map((postData) => {
            const postUrl = `${baseUrl}/post/${postData.id}`;
            return ctx.cache.tryGet(postUrl, async () => {
                const { data: postPage } = await got(postUrl);

                const $page = cheerio.load(postPage);
                $page('noscript').remove();
                const postContent = $page('div.flex > div > div > div > div:not([class])');

                // img resource redirection and
                // clean up absolute layouts for img and span
                const imageUrls = postData.body.filter((item) => item.type === 'upload' && item.value.cloudinary.resource_type === 'image').map((item) => item.value.cloudinary.secure_url);
                const allImageSpans = postContent.find('span > img').parent();
                allImageSpans.each((spanIndex, span) => {
                    $(span).attr('style', $(span).attr('style').replace('position:absolute', ''));
                    const img = $(span).find('img');
                    img.attr('src', imageUrls[spanIndex]);
                    img.attr('style', img.attr('style').replace('position:absolute', '').replace('width:0', '').replace('height:0', ''));
                });

                return {
                    title: postData.title,
                    link: postUrl,
                    author: postData.author,
                    pubDate: Date.parse(postData.createdAt),
                    updated: Date.parse(postData.updatedAt),
                    description: postContent.html(),
                };
            });
        })
    );

    ctx.state.data = {
        title: 'DevolverDigital Blog',
        language: 'en-us',
        link: 'https://www.devolverdigital.com/blog',
        item: items,
    };
};
