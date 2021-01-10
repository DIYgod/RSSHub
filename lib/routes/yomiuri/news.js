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
        category_name = '総合';
        list = $('ul.news-top-upper-content-topics-content-list.p-list').children('li').not('.p-member-only');
    } else {
        category_name = $('h1.p-header-category-current-title').text();
        list = $('div.p-category-organization,.p-category-time-series').find('li').not('.p-member-only').not('.p-ad-list-item');
    }

    const items = await Promise.all(
        list
            .map(async (index, item) => {
                item = $(item);
                const link = item.find('a').attr('href');
                const description = await ctx.cache.tryGet(link, async () => {
                    const response = await got.get(link);
                    const $ = cheerio.load(response.data);
                    return $('div.p-main-contents').html();
                });
                let tag = '';
                if (category_name === '総合') {
                    const tag_table = {
                        news: '総合',
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
        title: '読売新聞-' + category_name,
        link: url,
        item: items,
    };
};
