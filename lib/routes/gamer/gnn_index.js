const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    let url = '';
    let categoryName = '';
    const categoryTable = {
        1: 'PC',
        3: 'TV 掌機',
        4: '手機遊戲',
        5: '動漫畫',
        9: '主題報導',
        11: '活動展覽',
        13: '電競',
        ns: 'Switch',
        ps5: 'PS5',
        ps4: 'PS4',
        xbone: 'XboxOne',
        xbsx: 'XboxSX',
        pc: 'PC 單機',
        olg: 'PC 線上',
        ios: 'iOS',
        android: 'Android',
        web: 'Web',
        comic: '漫畫',
        anime: '動畫',
    };
    const mainCategory = ['1', '3', '4', '5', '9', '11', '13'];
    if (!category || Object.keys(categoryTable).indexOf(category) < 0) {
        url = 'https://gnn.gamer.com.tw/';
    } else {
        categoryName = '-' + categoryTable[category];
        if (mainCategory.indexOf(category) > -1) {
            url = `https://gnn.gamer.com.tw/index.php?k=${category}`;
        } else {
            url = `https://acg.gamer.com.tw/news.php?p=${category}`;
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
            const ElementA = item.find('a').eq(position);
            const tagTable = {
                'IMG-Gmuti': 'General',
                'IMG-GA19': 'PC',
                'IMG-GB3': 'NS',
                'IMG-GB4': 'PS5',
                'IMG-GB1': 'PS4',
                'IMG-GB2': 'xone',
                'IMG-GB5': 'Xbox',
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
                'IMG-GA23': 'Other',
                'IMG-Gother': 'Other',
            };
            const tagValue = tagTable[item.find('img').eq(position).attr('class')];
            const tag = tagValue ? tagValue : 'Unclassified';
            return {
                title: '[' + tag + ']&nbsp;' + ElementA.text(),
                link: ElementA.attr('href').replace('//', 'https://'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(async (item) => {
            item.description = await ctx.cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                let component = '';
                const urlReg = /window.location.replace\('.*'/g;
                if (response.body.search(urlReg) < 0) {
                    const $ = cheerio.load(response.data);
                    item.author = $('span.GN-lbox3C').text().split('）')[0].split(' 報導')[0].split(' 提供')[0].split(' 同意授權轉載')[0].replace('（', '');
                    component = $('div.GN-lbox3B').html();
                } else {
                    const newUrl = response.body.match(urlReg)[0].split('(')[1].replace(/'/g, '');
                    const _response = await got.get(newUrl);
                    const _$ = cheerio.load(_response.data);
                    item.author = _$('span.ST1').text().split('│', 2)[0].split('作者：')[1];
                    component = _$('div.MSG-list8C').html();
                    if (!component) {
                        item.author = _$('a.caption-text.primary').text();
                        component = _$('div.text-paragraph').html();
                    }
                }
                component = component.replace(/\b(data-src)\b/g, 'src');
                return component;
            });
            return item;
        })
    );

    ctx.state.data = {
        title: '巴哈姆特-GNN新聞' + categoryName,
        link: url,
        item: items,
    };
};
