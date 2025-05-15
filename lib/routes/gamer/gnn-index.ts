import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/gnn/:category?',
    categories: ['anime', 'popular'],
    view: ViewType.Articles,
    example: '/gamer/gnn/1',
    parameters: {
        category: {
            description: '版塊',
            options: [
                { value: '1', label: 'PC' },
                { value: '3', label: 'TV 掌機' },
                { value: '4', label: '手機遊戲' },
                { value: '5', label: '動漫畫' },
                { value: '9', label: '主題報導' },
                { value: '11', label: '活動展覽' },
                { value: '13', label: '電競' },
                { value: 'ns', label: 'Switch' },
                { value: 'ps5', label: 'PS5' },
                { value: 'ps4', label: 'PS4' },
                { value: 'xbone', label: 'XboxOne' },
                { value: 'xbsx', label: 'XboxSX' },
                { value: 'pc', label: 'PC 單機' },
                { value: 'olg', label: 'PC 線上' },
                { value: 'ios', label: 'iOS' },
                { value: 'android', label: 'Android' },
                { value: 'web', label: 'Web' },
                { value: 'comic', label: '漫畫' },
                { value: 'anime', label: '動畫' },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'GNN 新聞',
    maintainers: ['Arracc', 'ladeng07', 'pseudoyu'],
    handler,
    description: '缺省為首頁',
};

async function handler(ctx) {
    const category = ctx.req.param('category');
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
    if (!category || !Object.keys(categoryTable).includes(category)) {
        url = 'https://gnn.gamer.com.tw/';
    } else {
        categoryName = '-' + categoryTable[category];
        url = mainCategory.includes(category) ? `https://gnn.gamer.com.tw/index.php?k=${category}` : `https://acg.gamer.com.tw/news.php?p=${category}`;
    }

    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data;
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;
    const $ = load(data);

    const list = $('div.BH-lbox.GN-lbox2')
        .children()
        .not('p,a,img,span')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);
            let aLabelNode;
            let tag;
            // a label with div
            if (item.find('h1').length === 0) {
                // a label without div
                aLabelNode = item.find('a');
                tag = item.find('div.platform-tag_list').text();
            } else {
                aLabelNode = item.find('h1').find('a');
                tag = item.find('div.platform-tag_list').text();
            }

            return {
                title: '[' + tag + ']' + aLabelNode.text(),
                link: aLabelNode.attr('href').replace('//', 'https://'),
            };
        });

    const items = await Promise.all(
        list.map(async (item) => {
            item.description = await cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                let component = '';
                const urlReg = /window\.lazySizesConfig/g;

                let pubInfo;
                let dateStr;
                if (response.body.search(urlReg) >= 0) {
                    const $ = load(response.data);
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
                    const _response = await got.get(item.link);
                    const _$ = load(_response.data);

                    if (_$('div.MSG-list8C').length > 0) {
                        // personal publish 1
                        pubInfo = _$('span.ST1').text().split('│');
                        item.author = pubInfo[0].replace('作者：', '');
                        dateStr = pubInfo[_$('span.ST1').find('a').length > 0 ? 2 : 1];
                        component = _$('div.MSG-list8C').html();
                    } else {
                        // personal publish 2
                        pubInfo = _$('div.article-intro').text().replaceAll('\n', '').split('|');
                        item.author = pubInfo[0];
                        dateStr = pubInfo[1];
                        component = _$('div.text-paragraph').html();
                    }
                }
                item.pubDate = timezone(parseDate(dateStr, 'YYYY-MM-DD HH:mm:ss'), +8);
                component = component.replaceAll(/\b(data-src)\b/g, 'src');
                return component;
            });
            return item;
        })
    );

    return {
        title: '巴哈姆特-GNN新聞' + categoryName,
        link: url,
        item: items,
    };
}
