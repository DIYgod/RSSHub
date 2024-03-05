export default {
    'whitehouse.gov': {
        _name: '美国白宫办公厅',
        '.': [
            {
                title: '简报室',
                docs: 'https://docs.rsshub.app/routes/government#mei-guo-bai-gong-ban-gong-ting',
                source: ['/briefing-room/:category', '/'],
                target: '/whitehouse/briefing-room/:category',
            },
            {
                title: '科技政策办公室',
                docs: 'https://docs.rsshub.app/routes/government#mei-guo-bai-gong-ban-gong-ting',
                source: ['/ostp', '/'],
                target: '/whitehouse/ostp',
            },
        ],
    },
};
