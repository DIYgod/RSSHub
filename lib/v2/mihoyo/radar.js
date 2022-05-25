module.exports = {
    'mihoyo.com': {
        _name: '米游社v2',
        bbs: [
            {
                title: '米游社 - 官方公告',
                docs: 'https://docs.rsshub.app/game.html#mi-ha-you-mi-you-she-guan-fang-gong-gao',
                source: ['/:game/home/28', '/:game/home/6', '/:game/home/31', '/:game/home/33', '/:game/home/53', '/:game/home/58'],
                target: (params, url) => {
                    const GITS_MAP = {
                        bh3: 1, // '崩坏三',
                        ys: 2, // '原神',
                        bh2: 3, // '崩坏二',
                        wd: 4, // '未定事件簿',
                        sr: 6, // '崩坏：星穹铁道',
                        zzz: 8, // '绝区零'
                    };
                    const { game } = params;
                    const gids = GITS_MAP[game];
                    if (!gids) {
                        return '';
                    }
                    const { type = '2' } = new URL(url).searchParams;
                    const page_size = '20';
                    const last_id = '';
                    return `/mihoyo/bbs/official/${gids}/${type}/${page_size}/${last_id}`;
                },
            },
        ],
    },
};
