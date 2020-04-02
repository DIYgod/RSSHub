const { getVideoComments } = require('./utils');

module.exports = async (ctx) => {
    const link = 'http://www.javlibrary.com/cn/tl_bestreviews.php';
    const items = await getVideoComments(link);
    ctx.state.data = {
        title: 'Javlibrary - 最佳评论',
        link: link,
        item: items,
    };
};
