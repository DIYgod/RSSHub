module.exports = {
    'kuaidi100.com': {
        _name: '快递 100',
        '.': [
            {
                title: '快递订单追踪',
                docs: 'https://docs.rsshub.app/other.html#kuai-di-100',
                source: '/',
                target: (params, url, document) => {
                    const postid = document && document.querySelector('#postid').value;
                    const com = document && document.querySelector('#selectComBtn').childNodes[1].attributes[1].value;
                    if (com && com !== 'default' && postid) {
                        return `/kuaidi100/track/${com}/${postid}`;
                    }
                },
            },
            {
                title: '支持的快递公司列表',
                docs: 'https://docs.rsshub.app/other.html#kuai-di-100',
                source: '/',
                target: '/kuaidi100/company',
            },
        ],
    },
};
