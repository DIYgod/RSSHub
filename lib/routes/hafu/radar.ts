export default {
    'hafu.edu.cn': {
        _name: '河南财政金融学院',
        www: [
            {
                title: '河南财政金融学院 - 通知公告',
                docs: 'https://docs.rsshub.app/routes/university#he-nan-cai-zheng-jin-rong-xue-yuan',
                source: '/*',
                target: (params, url) => {
                    if (url.indexOf('www')) {
                        return '/hafu/news/ggtz';
                    }
                    if (url.indexOf('jwc')) {
                        return '/hafu/news/jwc';
                    }
                    if (url.indexOf('zsjyc')) {
                        return '/hafu/news/zsjyc';
                    }
                },
            },
        ],
    },
};
