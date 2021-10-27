const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'http://job.hrbeu.edu.cn';

const idMap = {
    tzgg: {
        name: '通知公告',
        url: 'http://job.hrbeu.edu.cn/HrbeuJY/Web/Home/NewsList?43kuJdqqW6kyCmomBv0smMlyGfDy8QefMwSyc-jK8Ww=.shtml',
    },
    rdxw: {
        name: '热点新闻',
        url: 'http://job.hrbeu.edu.cn/HrbeuJY/Web/Home/NewsList?43kuJdqqW6kyCmomBv0smLeM5XMyxaJMXP0thrbMBWI=.shtml',
    },
};

module.exports = async (ctx) => {
    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: idMap[id].url,
        headers: {
            Referer: rootUrl,
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('li.list_item.i1')
        .map((_, item) => {
            let link = $(item).find('a').attr('href');
            if (link.indexOf('.shtml') !== -1) {
                link = rootUrl.concat(link);
            }
            return {
                title: $(item).find('a').attr('title'),
                pubDate: $(item).find('.Article_PublishDate').text() + ' ' + hour + ':' + minute,
                link,
            };
        })
        .get();

    await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.link.indexOf('.shtml') !== -1) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);
                    item.description = content('.article').html();
                } else {
                    item.description = item.title + '<br><br>' + '本文需跳转，请点击标题后阅读';
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '就业服务平台-' + idMap[id].name,
        link: idMap[id].url,
        item: list,
    };
};
