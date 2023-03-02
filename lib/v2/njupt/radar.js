module.exports = {
    'njupt.edu.cn': {
        _name: '南京邮电大学',
        jwc: [
            {
                title: '教务处通知与新闻',
                docs: 'https://docs.rsshub.app/university.html#nan-jing-you-dian-da-xue',
                source: '/*/list.htm',
                target: (_params, url) => {
                    url = new URL(url);
                    if (url.pathname.indexOf('/1594') !== -1) {
                        return '/njupt/notice';
                    } else if (url.pathname.indexOf('/1596') !== -1) {
                        return '/njupt/news';
                    }
                },
            },
        ],
    },
};
