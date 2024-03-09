const copymanga = {
    _name: '拷贝漫画',
    '.': [
        {
            title: '漫画更新',
            docs: 'https://docs.rsshub.app/routes/anime#kao-bei-man-hua',
            source: '/comic/:id',
            target: '/copymanga/comic/:id/5',
        },
    ],
};

export default {
    'copymanga.com': copymanga,
    'copymanga.info': copymanga,
    'copymanga.net': copymanga,
    'copymanga.org': copymanga,
    'copymanga.site': copymanga,
};
