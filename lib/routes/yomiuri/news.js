const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const url = `https://www.yomiuri.co.jp/${category}`;

    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data;
    const $ = cheerio.load(data);

    let categoryName;
    let list = null;
    if (category === 'news') {
        categoryName = '新着・速報';
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
        let parentSelector = 'div.p-category-organization,.p-category-time-series';
        // igoshougi channel sepcial div selector
        if (category === 'igoshougi') {
            parentSelector = 'div.uni-news-igoshougi-top';
        }
        categoryName = $('h1.p-header-category-current-title,h1.p-header-category-content-title').text();
        // p-header-category-content-title
        list = $(parentSelector).find('li').not('.p-member-only').not('.p-ad-list-item');
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

    // format category name
    if (categoryName !== '') {
        categoryName = ' - ' + categoryName.trim();
    }

    const items = await Promise.all(
        list
            .map(async (index, item) => {
                item = $(item);

                let link = '';
                if (categoryName === '新着・速報') {
                    link = item.find('h3').children('a').attr('href');
                } else {
                    link = item.find('a').attr('href');
                }

                const description = await ctx.cache.tryGet(link, async () => {
                    const response = await got.get(link);
                    const $ = cheerio.load(response.data);
                    const mainContent = $('div.p-main-contents');
                    // remove articles recomended
                    const recommendNode = mainContent.find('aside.ev-article-manual-related__article-inline');
                    if (recommendNode.length !== 0) {
                        recommendNode.remove();
                    }
                    return mainContent.html();
                });

                let tag = '';
                if (categoryName === '新着・速報') {
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
                    pubDate: timezone(new Date(item.find('time').prop('datetime')), +9),
                    link,
                };
            })
            .get()
    );

    ctx.state.data = {
        title: '読売新聞' + categoryName,
        link: url,
        item: items,
    };
};
