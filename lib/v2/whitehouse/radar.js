module.exports = {
    'whitehouse.gov': {
        _name: '美国白宫办公厅',
        '.': [
            {
                title: '简报室',
                docs: 'https://docs.rsshub.app/government.html#mei-guo-bai-gong-ban-gong-ting',
                source: ['/briefing-room/:category', '/'],
                target: '/whitehouse/briefing-room/:category',
            },
        ],
    },
};
