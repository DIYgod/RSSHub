module.exports = {
    'iresearch.com.cn': {
        _name: '艾瑞',
        www: [
            {
                title: '研究报告',
                docs: 'https://docs.rsshub.app/other.html#ai-rui-chan-ye-yan-jiu-bao-gao',
                source: ['/report.shtml'],
                target: '/iresearch/report',
            },
            {
                title: '周度市场观察',
                docs: 'https://docs.rsshub.app/other.html#ai-rui-zhou-du-shi-chang-guan-cha',
                source: ['/report.shtml?type=3', ''],
                target: '/iresearch/weekly/:category',
            },
        ],
    },
};
