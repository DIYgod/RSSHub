const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const { boardId = 1 } = ctx.params;
    const response = await axios({
        method: 'get',
        url: `http://top.baidu.com/mobile_v2/buzz?b=${boardId}`,
    });

    const { board, topwords, descs } = response.data.result;
    const items = topwords.map((item, index) => {
        const desc = descs[index].content.data[0];

        return {
            title: item.keyword,
            description: `
        <a href="${desc.originlink}">${desc.title}</a><br>
        ${desc.description}
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
