const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rootUrl = 'https://sesame.ninja/release_notes.txt';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const items = response.data
        .split('\r\n\r\n')
        .slice(0, 20)
        .map((item) => {
            const splits = item.split('\r\n - ');
            const title = splits.shift().replace(':', '');

            return {
                title,
                link: rootUrl,
                pubDate: title.match(/\((.*),/)[1],
                description: `<ul><li>${splits.join('</li><li>')}</ul>`,
            };
        });

    ctx.state.data = {
        title: 'Sesame Release Notes',
        link: rootUrl,
        item: items,
    };
};
