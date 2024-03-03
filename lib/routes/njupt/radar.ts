export default {
    'njupt.edu.cn': {
        _name: '南京邮电大学',
        jwc: [
            {
                title: '教务处通知与新闻',
                docs: 'https://docs.rsshub.app/routes/university#nan-jing-you-dian-da-xue',
                source: '/*/list.htm',
                target: (_params, url) => {
                    url = new URL(url);
                    if (url.pathname.includes('/1594')) {
                        return '/njupt/notice';
                    } else if (url.pathname.includes('/1596')) {
                        return '/njupt/news';
                    }
                },
            },
        ],
    },
};
