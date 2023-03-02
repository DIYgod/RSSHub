const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

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
        url,
    });
    const data = response.data;
    const $ = cheerio.load(data);

    const list = $('div.BH-lbox.GN-lbox2')
        .children()
        .not('p,a,img,span')
        .map((index, item) => {
            item = $(item);
            let aLabelNode;
            let tag;
            // a label with div
            if (item.find('h1').length !== 0) {
                aLabelNode = item.find('h1').find('a');
                tag = item.find('div.platform-tag_list').text();
            } else {
                // a label without div
                aLabelNode = item.find('a');
                tag = item.find('div.platform-tag_list').text();
            }

            return {
                title: '[' + tag + ']' + aLabelNode.text(),
                link: aLabelNode.attr('href').replace('//', 'https://'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(async (item) => {
            item.description = await ctx.cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                let component = '';
                const urlReg = /window.location.replace\('.*'/g;

                let pubInfo;
                let dateStr;
                if (response.body.search(urlReg) < 0) {
                    const $ = cheerio.load(response.data);
                    if ($('span.GN-lbox3C').length > 0) {
                        // official publish 1
                        pubInfo = $('span.GN-lbox3C').text().split('）');
                        item.author = pubInfo[0].replace('（', '').replace(' 報導', '');
                        dateStr = pubInfo[1].trim();
                    } else {
                        // official publish 2
                        pubInfo = $('span.GN-lbox3CA').text().split('）');
                        item.author = pubInfo[0].replace('（', '').replace(' 報導', '');
                        dateStr = pubInfo[1].replace('原文出處', '').trim();
                    }
                    component = $('div.GN-lbox3B').html();
                } else {
                    // url redirect
                    const newUrl = response.body.match(urlReg)[0].split('(')[1].replace(/'/g, '');
                    const _response = await got.get(newUrl);
                    const _$ = cheerio.load(_response.data);

                    if (_$('div.MSG-list8C').length > 0) {
                        // personal publish 1
                        pubInfo = _$('span.ST1').text().split('│');
                        item.author = pubInfo[0].replace('作者：', '');
                        dateStr = pubInfo[_$('span.ST1').find('a').length > 0 ? 2 : 1];
                        component = _$('div.MSG-list8C').html();
                    } else {
                        // personal publish 2
                        pubInfo = _$('div.article-intro').text().replace(/\n/g, '').split('|');
                        item.author = pubInfo[0];
                        dateStr = pubInfo[1];
                        component = _$('div.text-paragraph').html();
                    }
                }
                item.pubDate = timezone(parseDate(dateStr, 'YYYY-MM-DD HH:mm:ss'), +8);
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
