const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.wukong.com/wenda/web';
    const userUrl = `${rootUrl}/my/brow/?count=20&other_uid=${ctx.params.id}`;
    const dongtaiUrl = `${rootUrl}/dongtai/list/brow/?other_uid=${ctx.params.id}&count=15&max_time=&style=1`;
    const answerUrl = `${rootUrl}/my/brow/?count=15&t=${new Date().getTime()}&other_uid=${ctx.params.id}`;
    const questionUrl = `${rootUrl}/myquestion/brow/?count=15&t=${new Date().getTime()}&offset=0&other_uid=${ctx.params.id}`;

    let number = '';
    let currentUrl = '';
    const type = ctx.params.type || 'dongtai';

    switch (type) {
        case 'dongtai':
            number = '2';
            currentUrl = dongtaiUrl;
            break;
        case 'answers':
            number = '0';
            currentUrl = answerUrl;
            break;
        case 'questions':
            number = '1';
            currentUrl = questionUrl;
            break;
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const userResponse = await got({
        method: 'get',
        url: userUrl,
    });

    let data = '';

    switch (type) {
        case 'dongtai':
            data = response.data.data.dongtai_list;
            break;
        case 'answers':
            data = response.data.data.feed_question;
            break;
        case 'questions':
            data = response.data.question_list;
            break;
    }

    const list = data.map((item) => {
        switch (type) {
            case 'dongtai': {
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
            }
            case 'answers': {
                return {
                    title: item.question.title,
                    link: `https://www.wukong.com/answer/${item.ans_list[0].ansid}`,
                    description: item.ans_list[0].content,
                    pubDate: new Date(item.ans_list[0].create_time * 1000).toUTCString(),
                };
            }
            case 'questions': {
                return {
                    title: item.title,
                    link: `https://www.wukong.com/question/${item.qid}`,
                    description: item.content.text,
                    pubDate: new Date(item.create_time * 1000).toUTCString(),
                };
            }
            default:
                return {};
        }
    });

    ctx.state.data = {
        title: `悟空问答 - ${userResponse.data.other_user_info.uname}`,
        link: `https://www.wukong.com/user/?uid=${ctx.params.id}&type=${number}`,
        item: list,
        description: userResponse.data.other_user_info.description,
    };
};
