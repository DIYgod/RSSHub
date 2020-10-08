const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    let url = '';
    if (!category) {
        url = 'https://gnn.gamer.com.tw/';
    } else {
        url = `https://gnn.gamer.com.tw/index.php?k=${category}`;
    }

    const response = await got({
        method: 'get',
        url: url,
    });
    const data = response.data;
    const $ = cheerio.load(data);

    let category_name = '';
    if (!category) {
        category_name = '首页';
    } else {
        category_name = $('a.now').text();
    }

    const list = $('div.BH-lbox.GN-lbox2')
        .children()
        .not('.GN-lbox2A,.GN-lbox2G')
        .map((index, item) => {
            item = $(item);
            const position = item.attr('class') === 'GN-lbox2F' ? 0 : 1;
            const element_a = item.find('a').eq(position);
            const tag_table = {
                'IMG-Gmuti': 'General',
                'IMG-GA19': 'PC',
                'IMG-GB3': 'NS',
                'IMG-GB4': 'PS5',
                'IMG-GB1': 'PS4',
                'IMG-GA14': 'ARC',
                'IMG-GAC': 'AC',
                'IMG-GA13': 'ETC',
                'IMG-GA1': 'OLG',
                'IMG-Gmobi': 'MOBI',
                'IMG-GA20': 'WEB',
                'IMG-GA25': 'Google',
                'IMG-GA24': 'Apple',
                'IMG-GA28': 'Facebook',
                'IMG-GA17': 'Other',
                'IMG-Gother': 'Other',
            };
            const tag_value = tag_table[item.find('img').eq(position).attr('class')];
            const tag = tag_value ? tag_value : 'Unclassified';
            return {
                title: '[' + tag + ']&nbsp;' + element_a.text(),
                link: element_a.attr('href').replace('//', 'https://'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(async (item) => {
            item.description = await ctx.cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                const $ = cheerio.load(response.data);
                let component = $('div.GN-lbox3B').children('div').children('div').html();
                if (component) {
                    const reg = /\b(data-src)\b/g;
                    component = component.replace(reg, 'src');
                }
                return component;
            });
            return item;
        })
    );

    ctx.state.data = {
        title: '巴哈姆特-GNN新闻-' + category_name,
        link: url,
        item: items,
    };
};
