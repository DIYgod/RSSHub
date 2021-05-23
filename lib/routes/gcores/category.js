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
            const entityRangeMap = {};
            for (const block of articleContent.blocks || []) {
                if (block.entityRanges.length) {
                    entityRangeMap[block.key] = block.entityRanges;
                }
            }

            $('figure').each((i, elem) => {
                const keyAttr = elem.attribs['data-offset-key'];
                const keyMatch = /^(\w+)-(\d+)-(\d)$/.exec(keyAttr);
                let actualContent = '';
                if (keyMatch) {
                    const [, key, index] = keyMatch;
                    if (entityRangeMap[key] && entityRangeMap[key][index]) {
                        const entityKey = entityRangeMap[key] && entityRangeMap[key][index].key;
                        const entity = articleContent.entityMap[entityKey];
                        actualContent = convertEntityToContent(entity);
                    }
                }

                if (actualContent) {
                    $(elem).replaceWith(actualContent);
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

function convertEntityToContent(entity) {
    const { type, data } = entity;
    switch (type) {
        case 'IMAGE':
            return `
<figure>
<img src="https://image.gcores.com/${data.path}" alt="${data.caption || ''}">
${data.caption ? `<figcaption>${data.caption}</figcaption>` : ''}
</figure>`;

        case 'GALLERY':
            return data.images
                .map(
                    (image, i, arr) => `
<figure>
<img src="https://image.gcores.com/${image.path}" alt="${image.caption || ''}">
<figcaption>${data.caption || ''} (${i + 1}/${arr.length}) ${image.caption || ''}</figcaption>
</figure>
            `
                )
                .join('');

        default:
            return '';
    }
}
