const got = require('@/utils/got');
const cheerio = require('cheerio');
const { app, os, sv, getSignedSearchParams } = require('./utils');
const { art } = require('@/utils/render');
const path = require('path');

const config = {
    1000: '头条',
    1003: '股市',
    1135: '港股',
    1007: '环球',
    1005: '公司',
    1118: '券商',
    1110: '基金',
    1006: '地产',
    1032: '金融',
    1119: '汽车',
    1111: '科创版',
    1160: '品见',
    1124: '期货',
    1176: '投教',
};

module.exports = async (ctx) => {
    const category = ctx.params.category || '1000';
    const title = config[category];
    if (!title) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/finance.html#cai-lian-she-shen-du">docs</a>');
    }
    const searchParams = getSignedSearchParams({
        app,
        os,
        sv,
    });
    const baseUrl = 'https://www.cls.cn';
    const link = `${baseUrl}/v3/depth/home/assembled/${category}`;
    const response = await got({
        method: 'get',
        url: link,
        searchParams,
    });

    let list =
        response.data.data.depth_list?.map((item) => ({
            title: item.title || item.brief,
            link: `${baseUrl}/detail/${item.id}`,
            pubDate: new Date(item.ctime * 1000).toUTCString(),
        })) || [];

    list = list.concat(
        response.data.data.top_article.map((item) => ({
            title: item.title || item.brief,
            link: `${baseUrl}/detail/${item.id}`,
            pubDate: new Date(item.ctime * 1000).toUTCString(),
        }))
    );

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);
                const nextData = JSON.parse(content('script#__NEXT_DATA__').text());
                const articleDetail = nextData.props.initialState.detail.articleDetail;

                item.description = art(path.join(__dirname, 'templates/depth.art'), { articleDetail });
                item.author = articleDetail.author?.name;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `财联社 - ${title}`,
        link: `${baseUrl}/depth?id=${category}`,
        item: items,
    };
};
