module.exports = {
    'cebbank.com': {
        _name: '中国光大银行',
        '.': [
            {
                title: '外汇牌价 - 牌价总览',
                docs: 'https://docs.rsshub.app/new-media.html#eprice',
                source: ['/eportal/ui?pageId=477257'],
                target: '/quotation/all',
            },
            {
                title: '外汇牌价 - 历史记录',
                docs: 'https://docs.rsshub.app/new-media.html#eprice',
                source: ['/site/ygzx/whpj/rmbwhpjlspj/index.html?currcode=:id'],
                target: ({ id }) => `/quotation/${id}`,
            },
        ],
    },
};
