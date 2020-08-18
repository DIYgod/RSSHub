const got = require('@/utils/got');

module.exports = async (ctx) => {
    const userUrl = `https://www.wukong.com/wenda/web/my/brow/?count=20&other_uid=${ctx.params.id}`;
    const dongtaiUrl = `https://www.wukong.com/wenda/web/dongtai/list/brow/?other_uid=${ctx.params.id}&count=15&max_time=&style=1`;
    const response = await got({
        method: 'get',
        url: dongtaiUrl,
    });
    const userResponse = await got({
        method: 'get',
        url: userUrl,
    });

    const list = response.data.data.dongtai_list.map((item) => {
        if (item.cell_id === 0) {
            return Promise.resolve('');
        }
        const isQuestion = item.dongtai_cell.dongtai.OriginIdType === 1;
        return {
            title: `${item.dongtai_cell.dongtai.content.text}：${item.dongtai_cell.dongtai.base.question.title}`,
            link: isQuestion ? `https://www.wukong.com/question/${item.dongtai_cell.dongtai.base.question.qid}` : `https://www.wukong.com/answer/${item.dongtai_cell.dongtai.base.answer.ansid}`,
            description: isQuestion ? item.dongtai_cell.dongtai.base.question.content.text : item.dongtai_cell.dongtai.base.answer.content,
            pubDate: new Date((isQuestion ? item.dongtai_cell.dongtai.base.question.create_time : item.dongtai_cell.dongtai.base.answer.create_time) * 1000).toUTCString(),
        };
    });

    ctx.state.data = {
        title: `悟空问答 - ${userResponse.data.other_user_info.uname}`,
        link: `https://www.wukong.com/user/?uid=${ctx.params.id}`,
        item: list,
        description: `${userResponse.data.other_user_info.description}`,
    };
};
