const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const url = `https://www.yomiuri.co.jp/${category}`;

    const response = await got({
        method: 'get',
        url: url,
    });
    const data = response.data;
    const $ = cheerio.load(data);

    let category_name = '';
    let list = null;
    if (category === 'news') {
        category_name = '新着・速報';
        const urlPrefix = 'https://www.yomiuri.co.jp/y_ajax/';

        // get list1
        const param1 = $('input#latest_list_news_other_params').val();
        const response1 = await got({
            method: 'get',
            url: urlPrefix + 'latest_list_news/' + param1 + '/?action=latest_list_news&others=' + param1,
        });
        const data1 = response1.data;
        const firstArticleList = cheerio.load(data1);

        // get list2
        const param2 = $('input#latest_list_news_other_params2').val();
        const response2 = await got({
            method: 'get',
            url: urlPrefix + 'latest_list_news2/' + param2 + '/?action=latest_list_news2&others=' + param2,
        });
        const data2 = response2.data;
        const secondArticleList = cheerio.load(data2);
        list = secondArticleList('article').add(firstArticleList('article'));

        list = list.map((index, item) => {
            item = $(item);
            // remove matome title
            const matomeTitle = item.find('div.c-matome-title');
            if (matomeTitle.length !== 0) {
                matomeTitle.remove();
            }
            // remove member only
            const lockedIcon = item.find('svg[class=icon-locked]');
            if (lockedIcon.length === 0) {
                return item;
            } else {
                return null;
            }
        });
    } else {
        category_name = $('h1.p-header-category-current-title').text();
        list = $('div.p-category-organization,.p-category-time-series').find('li').not('.p-member-only').not('.p-ad-list-item');

        list = list.map((index, item) => {
            item = $(item);
            // remove matome title
            const matomeTitle = item.find('div.c-matome-title');
            if (matomeTitle.length !== 0) {
                matomeTitle.remove();
            }
            return item;
        });
    }

    const items = await Promise.all(
        list
            .map(async (index, item) => {
                item = $(item);

                let link = '';
                if (category_name === '新着・速報') {
                    link = item.find('h3').children('a').attr('href');
                } else {
                    link = item.find('a').attr('href');
                }

                const description = await ctx.cache.tryGet(link, async () => {
                    const response = await got.get(link);
                    const $ = cheerio.load(response.data);
                    return $('div.p-main-contents').html();
                });

                let tag = '';
                if (category_name === '新着・速報') {
                    const tag_table = {
                        news: '新着・速報',
                        national: '社会',
                        politics: '政治',
                        economy: '経済',
                        sports: 'スポーツ',
                        world: '国際',
                        science: '科学・ＩＴ',
                        election: '選挙・世論調査',
                        culture: 'エンタメ・文化',
                        igoshougi: '囲碁・将棋',
                        life: 'ライフ',
                        local: '地域',
                        editorial: '社説',
                        medical: '医療・健康',
                        olympic: 'オリンピック',
                    };
                    const tag_value = tag_table[link.split('/')[3]];
                    tag = tag_value ? tag_value : 'その他';
                    tag = '[' + tag + '] ';
                }
                return {
                    title: tag + item.find('a').text(),
                    description,
                    link,
                };
            })
            .get()
    );

    ctx.state.data = {
        title: '読売新聞 - ' + category_name,
        link: url,
        item: items,
    };
};
