const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const listPageUrl = `https://www.gcores.com/${category}`;
    const listPageRes = await got({
        method: 'get',
        url: listPageUrl,
    });
    const listPageData = listPageRes.data;
    let $ = cheerio.load(listPageData);
    const list = $('.original.am_card.original-normal');
    const count = [];
    const feedTitle = $('title').text();

    for (let i = 0; i < Math.min(list.length, 10); i++) {
        count.push(i);
    }

    const out = await Promise.all(
        count.map(async (i) => {
            const item = list[i];
            const gcoresUrl = 'https://www.gcores.com';
            const gcoresApiUrl = gcoresUrl + '/gapi/v1';
            let itemPageUrl = $(item).find('a.am_card_content.original_content').attr('href');
            const itemApiUrl = gcoresApiUrl + itemPageUrl;
            itemPageUrl = gcoresUrl + itemPageUrl;
            const itemCache = await ctx.cache.get(itemPageUrl);
            if (itemCache) {
                return Promise.resolve(JSON.parse(itemCache));
            }
            let itemPageRes;
            let itemApiRes;
            try {
                itemPageRes = await got({
                    method: 'get',
                    url: itemPageUrl,
                });
                itemApiRes = await got({
                    method: 'get',
                    url: itemApiUrl,
                });
            } catch (e) {
                return Promise.resolve();
            }
            const attr = itemApiRes.data.data.attributes;
            const title = attr.title;
            const imageUrl = 'https://image.gcores.com/';
            const cover = '<img src=' + imageUrl + attr.thumb + '>';
            const data = JSON.parse(attr.content);
            const itemPage = itemPageRes.data;
            $ = cheerio.load(itemPage);
            $ = cheerio.load($('.story.story-show').html());
            function getImgs(key) {
                return data.blocks
                    .find((o) => key.startsWith(o.key))
                    .entityRanges.map((o) => {
                        const img = data.entityMap[o.key];
                        if (img.type === 'IMAGE') {
                            return '<img src="' + imageUrl + img.data.path + '">';
                        }
                        return '';
                    })
                    .join('<br/>');
            }
            $('figure.story_block-atomic-image-normal').each((_, elm) => {
                $(elm).append(getImgs(elm.attribs['data-offset-key']));
            });
            const single = {
                title: title,
                description: cover + $('*').html(),
                link: itemPageUrl,
                guid: itemPageUrl,
            };
            ctx.cache.set(itemPageUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: feedTitle,
        link: listPageUrl,
        item: out,
    };
};
