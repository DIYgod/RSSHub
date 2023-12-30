const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const categories = {
    社会: 'shehui',
    娱乐: 'yule',
    国际: 'guoji',
    军事: 'junshi',
    养生: 'yangsheng',
    汽车: 'qiche',
    体育: 'tiyu',
    财经: 'caijing',
    游戏: 'youxi',
    科技: 'keji',
    国内: 'guonei',
    宠物: 'chongwu',
    情感: 'qinggan',
    人文: 'renwen',
    教育: 'jiaoyu',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '社会';

    const rootUrl = 'https://mini.eastday.com';
    const currentUrl = `${rootUrl}/ns/api/detail/trust/trust-news-${categories[category]}.json`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = JSON.parse(response.data.match(/\((.*)\)/)[1]).data.trust.map((item) => ({
        title: item.topic,
        link: `${rootUrl}${item.url}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                const pageNumber = parseInt(detailResponse.data.match(/var page_num = '(\d+)'/)[1]);

                item.description = content('#J-contain_detail_cnt').html();
                item.pubDate = timezone(parseDate(content('meta[property="og:release_date"]').attr('content')), +8);

                if (pageNumber > 1) {
                    const links = [];

                    for (let i = 2; i <= pageNumber; i++) {
                        links.push(item.link.replace(/\.html/, `-${i}.html`));
                    }

                    links.forEach((link) =>
                        ctx.cache.tryGet(link, async () => {
                            const pageResponse = await got({
                                method: 'get',
                                url: link,
                            });
                            const subContent = cheerio.load(pageResponse.data);

                            subContent('img').each(function () {
                                subContent(this).attr('src', subContent(this).attr('data-url'));
                            });

                            item.description += subContent('#J-contain_detail_cnt').html();
                        })
                    );
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `24小时${category}热闻 - 东方资讯`,
        link: `${rootUrl}/#${categories[category]}`,
        item: items,
    };
};
