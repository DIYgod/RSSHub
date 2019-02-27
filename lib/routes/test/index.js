const config = require('../../config');
let cacheIndex = 0;

module.exports = async (ctx) => {
    if (ctx.params.id === '0') {
        throw Error('Error test');
    }
    const item = [];
    if (ctx.params.id === 'long') {
        item.push({
            title: `Long Title `.repeat(10),
            description: `Long Description `.repeat(10),
            pubDate: new Date(`2018-3-1`).toUTCString(),
            link: `https://github.com/DIYgod/RSSHub/issues/0`,
            author: `DIYgod0`,
        });
    } else if (ctx.params.id === 'cache') {
        const description = await ctx.cache.tryGet('test', () => `Cache${++cacheIndex}`, config.cacheExpire * 2);
        item.push({
            title: 'Cache Title',
            description: description,
            pubDate: new Date(`2018-3-1`).toUTCString(),
            link: `https://github.com/DIYgod/RSSHub/issues/0`,
            author: `DIYgod0`,
        });
    }

    for (let i = 1; i < 6; i++) {
        item.push({
            title: `Title${i}`,
            description: `Description${i}`,
            pubDate: new Date(`2018-4-${i}`).toUTCString(),
            link: `https://github.com/DIYgod/RSSHub/issues/${i}`,
            author: `DIYgod${i}`,
        });
    }
    ctx.state.data = {
        title: `Test ${ctx.params.id}`,
        link: 'https://github.com/DIYgod/RSSHub',
        item: item,
    };
};
