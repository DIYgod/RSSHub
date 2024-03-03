export default {
    'iresearch.com.cn': {
        _name: '艾瑞',
        www: [
            {
                title: '研究报告',
                docs: 'https://docs.rsshub.app/routes/other#ai-rui-chan-ye-yan-jiu-bao-gao',
                source: ['/report.shtml'],
                target: '/iresearch/report',
            },
            {
                title: '周度市场观察',
                docs: 'https://docs.rsshub.app/routes/other#ai-rui-zhou-du-shi-chang-guan-cha',
                source: ['/report.shtml'],
                target: (_, url) => (new URL(url).searchParams.get('type') === '3' ? '/iresearch/weekly' : null),
            },
        ],
    },
};
