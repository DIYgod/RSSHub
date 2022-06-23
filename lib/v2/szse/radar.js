module.exports = {
    'szse.cn': {
        _name: '深圳证券交易所',
        '.': [
            {
                title: '上市公告 - 可转换债券',
                docs: 'https://docs.rsshub.app/finance.html#shen-zhen-zheng-quan-jiao-yi-suo-shang-shi-gong-gao-ke-zhu-huan-zheng-zhi-quan',
                source: ['/disclosure/notice/company/index.html', '/'],
                target: '/szse/notice',
            },
            {
                title: '问询函件',
                docs: 'https://docs.rsshub.app/finance.html#shen-zhen-zheng-quan-jiao-yi-suo-wen-xun-huan-jian',
                source: ['/disclosure/supervision/inquire/index.html', '/'],
                target: '/szse/inquire',
            },
            {
                title: '最新规则',
                docs: 'https://docs.rsshub.app/finance.html#shen-zhen-zheng-quan-jiao-yi-suo-zui-xin-gui-ze',
                source: ['/lawrules/rule/new', '/'],
                target: '/szse/rule',
            },
        ],
        listing: [
            {
                title: '创业板项目动态',
                docs: 'https://docs.rsshub.app/finance.html#shen-zhen-zheng-quan-jiao-yi-suo-chuang-ye-ban-xiang-mu-dong-tai',
                source: ['/projectdynamic/1/index.html', '/projectdynamic/2/index.html', '/projectdynamic/3/index.html', '/'],
                target: '/szse/projectdynamic/:type?/:stage?/:status?',
            },
        ],
    },
};
