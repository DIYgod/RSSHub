const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    let url = '';
    if (category === 'index') {
        url = 'https://gnn.gamer.com.tw/';
    } else {
        url = `https://gnn.gamer.com.tw/index.php?k=${category}`;
    }

    let category_name = '';
    switch (parseInt(category)) {
        case 'index':
            category_name = '首页';
            break;
        case 1:
            category_name = 'PC';
            break;
        case 3:
            category_name = 'TV 掌機';
            break;
        case 4:
            category_name = '手機遊戲';
            break;
        case 5:
            category_name = '動漫畫';
            break;
        case 9:
            category_name = '主題報導';
            break;
        case 11:
            category_name = '活動展覽';
            break;
        case 13:
            category_name = '電競';
            break;
        default:
            category_name = '首页';
    }

    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div.BH-lbox.GN-lbox2')
        .children()
        .not('.GN-lbox2A')
        .not('.GN-lbox2G')
        .map((index, item) => {
            item = $(item);
            let element_a;
            let tag;
            let tag_name;
            if (item.attr('class') === 'GN-lbox2F') {
                element_a = item.find('a').eq(0);
                tag = item.children('img').eq(0).attr('class');
            } else {
                element_a = item.find('a').eq(1);
                tag = item.children('h1').children('img').eq(0).attr('class');
            }
            switch (tag) {
                case 'IMG-Gmuti':
                    tag_name = 'General';
                    break;
                case 'IMG-GA19':
                    tag_name = 'PC';
                    break;
                case 'IMG-GB3':
                    tag_name = 'NS';
                    break;
                case 'IMG-GB4':
                    tag_name = 'PS5';
                    break;
                case 'IMG-GB1':
                    tag_name = 'PS4';
                    break;
                case 'IMG-GA14':
                    tag_name = 'ARC';
                    break;
                case 'IMG-GAC':
                    tag_name = 'AC';
                    break;
                case 'IMG-GA13':
                    tag_name = 'ETC';
                    break;
                case 'IMG-GA1':
                    tag_name = 'OLG';
                    break;
                case 'IMG-Gmobi':
                    tag_name = 'MOBI';
                    break;
                case 'IMG-GA20':
                    tag_name = 'WEB';
                    break;
                case 'IMG-GA25':
                    tag_name = 'Google';
                    break;
                case 'IMG-GA24':
                    tag_name = 'Apple';
                    break;
                case 'IMG28':
                    tag_name = 'Facebook';
                    break;
                case 'IMG-GA17' || 'IMG-Gother':
                    tag_name = 'Other';
                    break;
                default:
                    tag_name = 'Unclassified';
            }

            return {
                title: '[' + tag_name + ']&nbsp;' + element_a.text(),
                link: element_a.attr('href').replace('//', 'https://'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(async (item) => {
            // 图片延迟加载无法获取源地址;
            const content = await got({
                method: 'get',
                url: item.link,
            });
            const c = cheerio.load(content.data);
            item.description = c('div.GN-lbox3B').children('div').html();
            return item;
        })
    );

    ctx.state.data = {
        title: '巴哈姆特-GNN新闻-' + category_name,
        link: url,
        item: items,
    };
};
