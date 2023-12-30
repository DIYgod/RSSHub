const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const rootUrl = 'https://www.iguoguo.net';

const getChildrenFromCheerioRoot = (cheerioInstance) => {
    const root = cheerioInstance.root();
    const rootKeys = Object.keys(root).filter((n) => n % 1 === 0);
    const rootChildren = rootKeys.map((key) => root[key].children);
    return rootChildren[0];
};

const getComments = (a, node) => {
    if (node.type === 'comment') {
        return a.concat([node.data]);
    } else if (node.type === 'tag' && node.children && node.children.length > 0) {
        return a.concat(node.children.reduce(getComments, []));
    } else {
        return a;
    }
};

module.exports = async (ctx) => {
    const currentUrl = rootUrl.concat('/html5');
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('a', '.post')
        .filter((_, x) => $(x).attr('href').endsWith('.html'))
        .filter((_, x) => $(x).children().eq(0).attr('src'))
        .map((_, item) => ({
            link: $(item).attr('href'),
            cover: $(item).children().eq(0).attr('src'),
        }))
        .get();

    const mime = {
        jpg: 'jpeg',
        png: 'png',
    };

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);
                item.title = content('h1', '.post-info').text();
                item.description = content('div.clearfix', '.post_content').html();
                const comments = getChildrenFromCheerioRoot(content).reduce(getComments, []);
                const date = comments[comments.length - 1].trim().split(' ').slice(9, 11);
                item.pubDate = timezone(parseDate(date[0] + date[1], 'YYYY-MM-DDHH:mm:ss'), +8);
                item.media = {
                    content: {
                        url: item.cover,
                        type: `image/${mime[item.cover.split('.').pop()]}`,
                    },
                };
                return item;
            })
        )
    );
    ctx.state.data = {
        title: '爱果果',
        link: currentUrl,
        description: '爱果果iguoguo是一个优秀酷站、h5、UI素材资源的发布分享平台，是设计师的灵感聚合地和素材下载源。',
        language: 'zh-cn',
        item: items,
    };
};
