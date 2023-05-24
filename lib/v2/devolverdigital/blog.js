const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.devolverdigital.com/blog';

    const { data: response } = await got(baseUrl);
    const $ = cheerio.load(response);

    const nextData = JSON.parse($('#__NEXT_DATA__').html());
    const allBlogContents = $('div.flex > div > div > div > div:not([class])');

    const items = nextData.props.pageProps.posts.map((post, postIndex) => {
        // img resource redirection and
        // clean up absolute layouts for img and span
        const imageUrls = [];
        post.body.forEach((item) => {
            if (item.type === 'upload' && item.value.cloudinary.resource_type === 'image') {
                imageUrls.push(item.value.cloudinary.secure_url);
            }
        });
        const allImageSpans = $(allBlogContents[postIndex]).find('span > img').parent();
        allImageSpans.each((spanIndex, span) => {
            $(span).attr('style', $(span).attr('style').replace('position:absolute'), '');
            const img = $(span).find('img');
            img.attr('src', imageUrls[spanIndex]);
            img.attr('style', img.attr('style').replace('position:absolute', '').replace('width:0', '').replace('height:0', ''));
        });

        return {
            title: post.title,
            author: post.author,
            pubDate: Date.parse(post.createdAt),
            description: $(allBlogContents[postIndex]).html(),
        };
    });

    ctx.state.data = {
        title: 'DevolverDigital Blog',
        link: 'https://www.devolverdigital.com/blog',
        item: items,
    };
};
