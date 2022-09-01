const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'new';
    const currentUrl = `https://tw.nextapple.com/realtime/${category}`;
    const response = await got(currentUrl);
    const $ = cheerio.load(response.data);
    const items = await Promise.all(
        $('article')
            .get()
            .map((item) => {
                const link = $(item).find('.post-title').attr('href');
                return ctx.cache.tryGet(link, async () => {
                    const response = await got(link);
                    const $ = cheerio.load(response.data);
                    const mainContent = $('#main-content');
                    const titleElement = mainContent.find('header h1');
                    const title = titleElement.text();
                    titleElement.remove();
                    const postMetaElement = mainContent.find('.post-meta');
                    const category = postMetaElement.find('.category').text();
                    const pubDate = parseDate(postMetaElement.find('time').attr('datetime'));
                    postMetaElement.remove();
                    $('.post-comments').remove();

                    return {
                        title,
                        description: mainContent.html(),
                        category,
                        pubDate,
                        link,
                    };
                });
            })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
