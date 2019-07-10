const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { boardId = 1 } = ctx.params;
    const response = await got({
        method: 'get',
        url: `http://top.baidu.com/mobile_v2/buzz?b=${boardId}`,
    });

    const { board, topwords, descs } = response.data.result;
    const items = topwords.map((item, index) => {
        const title = item.keyword;
        const content = descs[index].content;
        const desc = content
            ? content.data[0]
            : {
                  originlink: `https://www.baidu.com/s?ie=utf-8&wd=${encodeURIComponent(title)}`,
                  title,
                  description: title,
                  pubDate: Date.now(),
              };

        return {
            title,
            description: `
        <a href="${desc.originlink}">${desc.title}</a><br>
        ${desc.description || ''}
      `,
            link: desc.originlink,
            pubDate: new Date(desc.pubDate).toUTCString(),
        };
    });

    ctx.state.data = {
        title: `百度搜索风云榜-${board.boardname}`,
        item: items,
    };
};
