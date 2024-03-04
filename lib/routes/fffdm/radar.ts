const fffdm = {
    title: '在线漫画',
    docs: 'https://docs.rsshub.app/routes/anime#feng-zhi-dong-man',
    source: ['/manhua/:id', '/:id'],
    target: '/fffdm/manhua/:id',
};

export default {
    'fffdm.com': {
        _name: '风之动漫',
        manhua: [fffdm],
        www: [fffdm],
    },
};
