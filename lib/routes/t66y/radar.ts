export default {
    't66y.com': {
        _name: '草榴社區',
        '.': [
            {
                title: '分区帖子',
                docs: 'https://docs.rsshub.app/routes/multimedia#cao-liu-she-qu',
                source: ['/thread0806.php'],
                target: (param, url) => {
                    const { searchParams } = new URL(url);
                    return `/t66y/${searchParams.get('fid')}${searchParams.has('type') ? `/${searchParams.get('type')}` : ''}`;
                },
            },
            {
                title: '帖子跟踪',
                docs: 'https://docs.rsshub.app/routes/multimedia#cao-liu-she-qu',
                source: ['/htm_data/:YYMM/DD/:tid', '/read.php'],
                target: (param, url) => {
                    const link = new URL(url);
                    return link.pathname === '/read.php' ? `/t66y/post/${link.searchParams.get('tid')}` : `/t66y/post/${param.tid}`;
                },
            },
        ],
    },
};
