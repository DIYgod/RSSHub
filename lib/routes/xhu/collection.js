const got = require('@/utils/got');
const auth = require('./auth');
const { generateData } = require('./pin/utils');

module.exports = async (ctx) => {
    const xhu = await auth.Get();

    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `https://api.zhihu.com/collections/${id}/items?limit=20&offset=0`,
        headers: xhu.headers,
    });

    const list = response.data.data;

    const info = await got({
        method: 'get',
        url: `https://api.zhihu.com/collections/${id}`,
        headers: xhu.headers,
    });

    const collection_title = (info.data.collection ? info.data.collection.title : info.data.title) + ' - 知乎收藏夹';
    const collection_description = info.data.collection ? info.data.collection.description : info.data.description;

    const generateDataPin = (item) => generateData([item.content])[0];
    ctx.state.data = {
        title: `${collection_title}`,
        link: `https://www.zhihu.com/collection/${id}`,
        description: `${collection_description}`,
        item:
            list &&
            list.map((item) =>
                item.content.type === 'pin'
                    ? generateDataPin(item)
                    : {
                          title: `${item.content.type === 'article' ? item.content.title : item.content.question.title}`,
                          link: `${item.content.url}`,
                          description: `${item.content.content}`,
                          pubDate: new Date((item.content.type === 'article' ? item.content.updated : item.content.updated_time) * 1000).toUTCString(),
                      }
            ),
    };
};
