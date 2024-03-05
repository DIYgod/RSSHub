export default {
    'cmde.org.cn': {
        _name: '国家药品监督管理局医疗器械技术审评中心',
        www: [
            {
                title: '通用',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-yao-pin-jian-du-guan-li-ju-yi-liao-qi-xie-ji-shu-shen-ping-zhong-xin',
                source: ['/*cate'],
                target: (params) => `/cmde/${params.cate.replace('/index.html', '')}`,
            },
        ],
    },
};
