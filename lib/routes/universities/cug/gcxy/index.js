const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'http://gcxy.cug.edu.cn';

    const typeUrl = [
        {
            name: '所有',
            url: '',
        },
        {
            name: '学院新闻',
            url: '/index/xyxw.htm',
        },
        {
            name: '通知公告',
            url: '/index/tzgg.htm',
        },
        {
            name: '党建工作',
            url: '/index/djgz.htm',
        },
        {
            name: '学术动态',
            url: '/index/xsdt.htm',
        },
        {
            name: '本科生教育',
            url: '/index/bksjy.htm',
        },
        {
            name: '研究生教育',
            url: '/index/yjsjy.htm',
        },
        {
            name: '教工之家',
            url: '/index/jgzj.htm',
        },
    ];

    let type = ctx.params && ctx.params.type;
    if (type === undefined) {
        type = 0;
    } else {
        type = Number(type);
        if (type >= typeUrl.length) {
            return false;
        }
    }

    let typeList = [];

    if (type === 0) {
        // 获取所有的
        typeList = Object.keys(Array.apply(null, { length: typeUrl.length }));
    } else {
        typeList.push(type);
    }

    // console.log(typeList);

    const getItems = async function (url) {
        try {
            const response = await got({
                method: 'get',
                url: host + url,
                headers: {
                    Referer: host,
                },
            });
            const $ = cheerio.load(response.data);
            const items = $('div.right_list > ul > li');
            return await Promise.all(
                items
                    .map(async (index, item) => {
                        item = $(item);
                        const a = item.find('a');
                        const link = host + a.attr('href').replace('..', '');
                        // console.log(link);
                        return {
                            title: a.attr('title'),
                            link: link,
                            description: await got({
                                method: 'get',
                                url: link,
                                headers: {
                                    Referer: host,
                                },
                            })
                                .then((res) => {
                                    const $ = cheerio.load(res.data);
                                    return $('.v_news_content').html();
                                })
                                .catch(() => ''),
                            pubDate: item.find('span').text(),
                        };
                    })
                    .get()
            );
        } catch (e) {
            return [];
        }
    };

    const outList = await Promise.all(typeList.map(async (t) => await getItems(typeUrl[t].url)));

    ctx.state.data = {
        title: '[' + typeUrl[type].name + ']' + 'CUG-工程学院',
        link: host + typeUrl[type].url,
        description: '中国地质大学(武汉)工程学院-' + typeUrl[type].name,
        item: outList.reduce((p, n) => p.concat(n)),
    };
};
