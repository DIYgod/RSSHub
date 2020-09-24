const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const url = `https://www.gcores.com/${category}`;
    const res = await got({
        method: 'get',
        url: url,
    });
    const data = res.data;
    const $ = cheerio.load(data);
    const feedTitle = $('title').text();

    const list = $('.original.am_card.original-normal')
        .map(function () {
            const item = {
                url: $(this).find('a.am_card_content.original_content').attr('href'),
                title: $(this).find('h3.am_card_title').text(),
            };
            return item;
        })
        .get();

    const out = await Promise.all(
        list.map(async (item) => {
            const articleUrl = `https://www.gcores.com${item.url}`;

            const cache = await ctx.cache.get(articleUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const itemRes = await got({
                method: 'get',
                url: articleUrl,
            });

            const itemPage = itemRes.data;
            const $ = cheerio.load(itemPage);

            let articleData = await got(`https://www.gcores.com/gapi/v1${item.url}?include=media`);
            articleData = articleData.data.data;
            let cover;
            if (articleData.attributes.cover) {
                cover = `<img src="https://image.gcores.com/${articleData.attributes.cover}" />`;
            } else if (articleData.attributes.thumb) {
                cover = `<img src="https://image.gcores.com/${articleData.attributes.thumb}" />`;
            } else {
                cover = '';
            }

            // replace figure with img
            const articleContent = JSON.parse(articleData.attributes.content);
            const imgs = Object.values(articleContent.entityMap)
                .filter((e) => e.type === 'IMAGE')
                .map((e) => e.data.path);
            $('figure').each((i, elem) => {
                if (imgs[i]) {
                    $(elem).replaceWith($(`<img src="https://image.gcores.com/${imgs[i]}" />`));
                }
            });

            // remove editor toolbar img
            $('.md-editor-toolbar').replaceWith('');
            // remove hidden tip block
            $('.story_hidden').replaceWith('');

            const content = $('.story.story-show').html();
            const single = {
                title: item.title,
                description: cover + content,
                link: articleUrl,
                guid: articleUrl,
            };
            ctx.cache.set(articleUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: feedTitle,
        link: url,
        item: out,
    };
};
