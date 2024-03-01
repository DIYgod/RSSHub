const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl, getBoards, renderDesc } = require('./utils');

module.exports = async (ctx) => {
    let { board = 'all' } = ctx.params;

    const boards = await getBoards(ctx.cache.tryGet);
    let boardInfo;
    if (board !== 'all') {
        boardInfo = boards.find((b) => b.id === board || b.alias === board);
        board = boardInfo.id;
    }

    const { data: response } = await got.post(`${baseUrl}/article/get_new_articles`, {
        json: {
            boardId: board,
            isCollege: false,
            page: 0,
            pageSize: ctx.query.limit ? Number(ctx.query.limit) : 30,
        },
    });

    const result = JSON.parse(decodeURIComponent(response.result));

    const items = await Promise.all(
        result.map((item) =>
            ctx.cache.tryGet(`meteor:${item.id}`, () => ({
                title: item.title,
                description: renderDesc(item.content),
                link: `${baseUrl}/article/${item.shortId}`,
                author: item.authorAlias,
                pubDate: parseDate(item.createdAt),
            }))
        )
    );

    ctx.state.data = {
        title: `${board === 'all' ? '全部看板' : boardInfo.title} | Meteor 學生社群`,
        description: board === 'all' ? null : boardInfo.feedDescription,
        image: board === 'all' ? null : boardInfo.imgUrl === 'not_set' ? null : boardInfo.imgUrl,
        link: `${board === 'all' ? `${baseUrl}/board/all` : boardInfo.link}/new`,
        item: items,
    };
};
