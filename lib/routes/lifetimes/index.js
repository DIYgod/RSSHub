const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'news';

    const rootUrl = 'http://www.lifetimes.cn';
    const currentUrl = `${rootUrl}/${category.replace('-', '/')}`;

    const apiUrl = `${rootUrl}/api/list?offset=0&limit=20&node=`;
    let title, list, response;

    switch (category) {
        case 'hotspot': {
            title = '调查';
            response = await got({
                method: 'get',
                url: apiUrl + '%22/eh78c0d1d%22',
            });
            list = response.data.list.slice(0, 20).map((item) => ({
                link: `${rootUrl}/article/${item.aid}`,
            }));
            break;
        }
        case 'industry': {
            title = '产业经济';
            response = await got({
                method: 'get',
                url: apiUrl + '%22/ehg62mqqm%22',
            });
            list = response.data.list.slice(0, 20).map((item) => ({
                link: `${rootUrl}/article/${item.aid}`,
            }));
            break;
        }
        case 'news-comment': {
            title = '本报时评';
            response = await got({
                method: 'get',
                url: apiUrl + '%22/egv8vnjpq/egv8vtbcl%22',
            });
            list = response.data.list.slice(0, 20).map((item) => ({
                link: `${rootUrl}/article/${item.aid}`,
            }));
            break;
        }
        default: {
            response = await got({
                method: 'get',
                url: currentUrl,
            });
            const $ = cheerio.load(response.data);

            title = $('title').text();

            $('.oPBlock').remove();

            list = $('.list-block ul li, .firstCon-r ul li')
                .find('a')
                .slice(0, 10)
                .map((_, item) => {
                    item = $(item);
                    return {
                        link: `https:${item.attr('href')}`,
                    };
                })
                .get();
        }
    }

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('article').html();
                    item.title = content('.container-title').text();
                    item.author = content('.source').text().replace('来源：', '');
                    item.pubDate = new Date(parseInt(detailResponse.data.match(/\\"ctime\\":(.*),\\"utime\\"/)[1])).toUTCString();

                    return item;
                } catch (e) {
                    return Promise.resolve('');
                }
            })
        )
    );

    ctx.state.data = {
        title: `${title} - 生命时报`,
        link: currentUrl,
        item: items,
    };
};
