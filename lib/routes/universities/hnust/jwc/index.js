const cont = require('./content');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'all';


    let content = await cont.GetContent(type);


    ctx.state.data = {
        title: '湖南科技大学教务处',
        link: 'https://jwc.hnust.edu.cn',
        description: '湖南科技大学教务处通知',
        item: content
    };
};
