const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

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

        list = $('div#latest_list_news').find('article').append($('div#latest_list_news_more').find('article'));

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
    let formattedCategoryName = categoryName;
    if (categoryName !== '') {
        formattedCategoryName = ' - ' + categoryName.trim();
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
                    const response = await got(link);
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
                        koushitsu: '皇室',
                    };
                    const tag_value = tag_table[link.split('/')[3]];
                    tag = tag_value ? tag_value : 'その他';
                    tag = '[' + tag + '] ';
                }

                return {
                    title: tag + item.find('a').text(),
                    description,
                    pubDate: timezone(parseDate(item.find('time').prop('datetime')), +9),
                    link,
                };
            })
            .get()
    );

    ctx.state.data = {
        title: '読売新聞' + formattedCategoryName,
        link: url,
        item: items,
    };
};
