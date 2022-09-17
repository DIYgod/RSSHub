module.exports = {
    'prestige-av.com': {
        _name: 'Prestige 蚊香社',
        '.': [
            {
                title: '系列作品',
                docs: 'https://docs.rsshub.app/multimedia.html#prestige-wen-xiang-she',
                source: ['/goods/goods_list.php'],
                target: (_params, url) => {
                    const link = new URL(url);
                    if (link.searchParams.get('mode') === 'series') {
                        return link.searchParams.has('sort') ? `/prestige-av/series/${link.searchParams.get('mid')}/${link.searchParams.get('sort')}` : `/prestige-av/series/${link.searchParams.get('mid')}`;
                    }
                },
            },
        ],
    },
};
