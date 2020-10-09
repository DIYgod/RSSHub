const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    let url = '';
    let category_name = '';
    if (!category) {
        url = 'https://gnn.gamer.com.tw/';
        category_name = '首页';
    } else {
        url = `https://gnn.gamer.com.tw/index.php?k=${category}`;
        switch (category) {
            case '1':
                category_name = 'PC';
                break;
            case '3':
                category_name = 'TV 掌機';
                break;
            case '4':
                category_name = '手機遊戲';
                break;
            case '5':
                category_name = '動漫畫';
                break;
            case '9':
                category_name = '主題報導';
                break;
            case '11':
                category_name = '活動展覽';
                break;
            case '13':
                category_name = '電競';
                break;
            default:
                category_name = '首页';
        }
    }

    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data;
    const $ = cheerio.load(data);
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
            const key = item.find('img').eq(position).attr('class');
            const value = tag_table[key];
            const tag = value ? value : 'Unclassified';
            return {
                title: '[' + tag + ']&nbsp;' + element_a.text(),
                link: element_a.attr('href').replace('//', 'https://'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(async (item) => {
            // 图片延迟加载无法获取源地址;
            item.description = await ctx.cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                const $ = cheerio.load(response.data);
                return $('div.GN-lbox3B').children('div').html();
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
