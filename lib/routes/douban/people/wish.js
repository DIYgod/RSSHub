const querystring = require('querystring');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const torrent = require('@/utils/torrent');

module.exports = async (ctx) => {
    const userid = ctx.params.userid;
    const routeParams = querystring.parse(ctx.params.routeParams);

    // enable torrent search
    const providers = routeParams.torrentProvider === 'all' ? torrent.allProviders : routeParams.torrentProvider ? routeParams.torrentProvider.split(',') : [];
    const torrentMinSeeds = routeParams.torrentMinSeeds ? parseInt(routeParams.torrentMinSeeds) : 1;
    const torrentMinRating = routeParams.torrentMinRating ? parseFloat(routeParams.torrentMinRating) : 0.5;
    const torrentSkipNoMatch = routeParams.torrentSkipNoMatch === 'true';

    const pageSize = 15;
    const pagesCount = routeParams.pagesCount ? parseInt(routeParams.pagesCount) : 1;
    const tasks = [];
    for (let page = 0; page < pagesCount; page += 1) {
        const url = `https://movie.douban.com/people/${userid}/wish?start=${page * pageSize}`;

        tasks.push(
            got({
                method: 'GET',
                url,
                headers: {
                    Referer: url,
                },
            }).then((response) => {
                const data = response.data;
                const $ = cheerio.load(data);
                const list = $('div.article > div.grid-view > div.item');

                if (list) {
                    return Promise.all(
                        list.get().map(async (item) => {
                            item = $(item);
                            const itemPicUrl = item.find('.pic a img').attr('src');
                            const info = item.find('.info');
                            const title = info.find('ul li.title a').text();
                            const url = info.find('ul li.title a').attr('href');
                            const titles = title.split('/').filter((title) => title.trim());
                            const day = info.find('ul li .date').text().trim();
                            const rssItem = {
                                title: titles[0],
                                description: `${info.find('.intro').text()}<br><img src="${itemPicUrl}">`,
                                link: url,
                                pubDate: new Date(day),
                            };

                            if (routeParams.torrentProvider) {
                                const category = url.indexOf('movie.douban.com') > 0 ? 'Movies' : 'TV';
                                const keyword = titles.length > 1 ? titles[1] : titles[0];
                                let keywords = [keyword];
                                if (routeParams.torrentQuery) {
                                    keywords = keywords.concat(routeParams.torrentQuery.split(','));
                                }
                                const result = await torrent.get(providers, routeParams, keywords, category, torrentMinSeeds, torrentMinRating);
                                return Object.assign(rssItem, result);
                            } else {
                                return rssItem;
                            }
                        })
                    );
                }
            })
        );
    }

    let items = (await Promise.all(tasks)).reduce((item, rssItems) => item.concat(rssItems), []);
    if (torrentSkipNoMatch) {
        items = items.filter((item) => item.enclosure_url && item.enclosure_url.length > 0);
    }
    ctx.state.data = {
        title: `豆瓣想看 - ${userid}`,
        link: `https://movie.douban.com/people/${userid}/wish`,
        item: items,
    };
};
