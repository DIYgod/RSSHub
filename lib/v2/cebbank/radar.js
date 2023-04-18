module.exports = {
    'cebbank.com': {
        _name: '中国光大银行',
        '.': [
            {
                title: '外汇牌价 - 牌价总览',
                docs: 'https://docs.rsshub.app/other.html#zhong-guo-guang-da-yin-hang',
                source: ['/site/ygzx/whpj/index.html', '/eportal/ui', '/'],
                target: '/cebbank/quotation/all',
            },
            {
                title: '外汇牌价 - 历史记录',
                docs: 'https://docs.rsshub.app/other.html#zhong-guo-guang-da-yin-hang',
                source: ['/site/ygzx/whpj/rmbwhpjlspj/index.html'],
                target: (_, url) => `/cebbank/quotation/history/${new URL(url).searchParams.get('currcode')}`,
            },
        ],
    },
};
