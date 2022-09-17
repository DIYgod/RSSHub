const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const url = `https://www.macbed.com/${name}/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);

    const items = [
        {
            title: $('h1.post-title').text(),
            description: `<strong>简介<\\strong><br>${$('div.entry').text()}<br><img src=https:${$('div.entry').find('img').last().attr('src')}><br>
        <a style="color: #FF0000" href="https://www.macbed.com/${$('a.button.button-3d.button-primary.button-rounded').attr('href')}" target="_blank" class="button button-3d button-primary button-rounded">Download Link </a>`,
            link: url,
        },
    ];

    ctx.state.data = {
        title: name,
        link: url,
        item: items,
    };
};
