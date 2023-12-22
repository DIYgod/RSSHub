const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://pkmer.cn';

module.exports = async (ctx) => {
    const { data: response } = await got(`${baseUrl}/page/1/`);
    const $ = cheerio.load(response);
    const items = process($);

    ctx.state.data = {
        title: `PKMer`,
        icon: 'https://cdn.pkmer.cn/covers/logo.png!nomark',
        logo: 'https://cdn.pkmer.cn/covers/logo.png!nomark',
        link: baseUrl,
        allowEmpty: true,
        item: items,
    };
};

function process($) {
    const container = $('#pages > div.grid.md\\:grid-cols-2.ltablet\\:grid-cols-3.lg\\:grid-cols-3.xxl\\:grid-cols-4.ltablet\\:gap-4.gap-6.mb-12.astro-CYXI3OY2');
    const items = container
        .children()
        .map((i, el) => {
            el = $(el);
            let item = el.children().first();
            item = $(item);
            const info = {};
            item.children().each((si, sel) => {
                sel = $(sel);
                switch (si) {
                    case 0: {
                        info.itunes_item_image = sel.find('img').attr('src');
                        break;
                    }
                    case 1: {
                        info.pubDate = sel.find('time').text().trim();
                        break;
                    }
                    case 2: {
                        info.title = sel.text().trim();
                        info.link = baseUrl + sel.attr('href');
                        break;
                    }
                    case 3: {
                        info.description = sel.text().trim();
                        break;
                    }
                    case 4: {
                        break;
                    }
                    case 5: {
                        info.author = sel.find('h4').text().trim();
                        break;
                    }
                }
            });
            return info;
        })
        .toArray();
    return items;
}
