// @ts-nocheck
const categoryTitle = (type) => {
    let title;
    type = type.slice(0, 4).toLowerCase();

    switch (type) {
        case 'tzgg':
            title = '通知公告';
            break;
        case 'ggtz':
            title = '公告通知';
            break;
        case 'jwdt':
            title = '教务动态';
            break;
        case 'xyxw':
            title = '学院新闻';
            break;
        case 'jzxx':
            title = '讲座信息';
            break;
        case 'xzzq':
            title = '下载专区';
            break;
        default:
            title = '';
    }

    return title;
};

module.exports = categoryTitle;
