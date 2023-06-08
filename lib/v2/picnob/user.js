const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.picnob.com';
    const { id } = ctx.params;
    const url = `${baseUrl}/profile/${id}/`;
    const { data: response } = await got(url);
    const $ = cheerio.load(response);

    const profileName = $('h1.fullname').text();
    const userId = $('input[name=userid]').attr('value');

    const { data } = await got(`${baseUrl}/api/posts`, {
        searchParams: {
            userid: userId,
        },
    });

    const list = data.posts.items.map(async (item) => {
        const { shortcode, type } = item;
        const link = `${baseUrl}/post/${shortcode}/`;
        let images = [];
        if (type === 'img_multi') {
            images = await ctx.cache.tryGet(link, async () => {
                const { data } = await got(link);
                const $ = cheerio.load(data);
                return [
                    ...new Set(
                        $('.post_slide a')
                            .toArray()
                            .map((a) => {
                                a = $(a);
                                return {
                                    ori: a.attr('href'),
                                    url: a.find('img').attr('data-src'),
                                };
                            })
                    ),
                ];
            });
        }
        return {
            title: item.sum_pure,
            description: art(path.join(__dirname, 'templates/desc.art'), { item, images }),
            link,
            pubDate: parseDate(item.time, 'X'),
        };
    });

    ctx.state.data = {
        title: `${profileName} (@${id}) - Picnob`,
        description: $('.info .sum').text(),
        link: url,
        image: $('.ava .pic img').attr('src'),
        item: list,
    };
};
