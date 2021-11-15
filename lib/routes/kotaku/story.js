import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const storyUrl = `https://kotaku.com/c/${ctx.params.type}`;

    const {
        data
    } = await got({
        method: 'get',
        url: storyUrl,
    });

    const $ = cheerio.load(data);
    const list = $('article');

    const itemList = list
        .map((index, item) => {
            item = $(item);
            const titleElem = item.find('h2').first();
            const dateTime = item.find('time').first().attr('datetime');
            return {
                title: titleElem.length === 0 ? 'Untitled' : titleElem.text(),
                author: item.find('a[href*="/author/"]').last().text(),
                description: item.find('p').first().text(),
                link: titleElem.parent().attr('href'),
                pubDate: new Date(dateTime).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: storyUrl,
        language: 'en-US',
        item: itemList,
    };
};
