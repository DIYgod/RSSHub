const parser = require('@/utils/rss-parser');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const getArticleDetail = (link, ctx) =>
    ctx.cache.tryGet(link, async () => {
        const response = await got(link);
        const $ = cheerio.load(response.data);

        const categories = $('.slug').text().trim();

        // ignore item until audio is available
        if ($('.audio-availability-message').length > 0) {
            return null;
        }

        const audioLink = $('.audio-tool-download a').attr('href');
        const audio = audioLink ? `<audio controls><source src="${audioLink}" type="audio/mp3"></audio>` : '';

        const regex = /\?storyId=(\d+)&amp;mediaId=(\d+)/;
        const m = $.html().match(regex);
        let video = '';
        if (m) {
            const storyId = m[1];
            const mediaId = m[2];
            video = $('.npr-video').length ? `<iframe width="740" height="416" src="https://www.npr.org/embedded-video?storyId=${storyId}&mediaId=${mediaId}&jwMediaType=music" frameborder="0" scrolling="no"></iframe>` : '';
        }

        $('.credit-caption').remove();
        $('.enlarge_measure').remove();

        const article =
            audio +
            video +
            $('.storytext')
                .toArray()
                .map((el) => $(el).html())
                .join('');

        return { article, categories };
    });

module.exports = async (ctx) => {
    const endpoint = ctx.params.endpoint || '1001';
    const feed = await parser.parseURL(`https://feeds.npr.org/${endpoint}/rss.xml`);

    const items = (
        await Promise.all(
            feed.items.map(async (item) => {
                const itemDetails = await getArticleDetail(item.link, ctx);
                if (itemDetails === null) {
                    return null;
                }
                return {
                    ...item,
                    description: itemDetails.article,
                    category: itemDetails.categories,
                };
            })
        )
    ).filter(Boolean);

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        icon: 'https://media.npr.org/images/podcasts/primary/npr_generic_image_300.jpg?s=200',
        item: items,
    };
};
