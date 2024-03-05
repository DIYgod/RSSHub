export default {
    'zyshow.net': {
        _name: '综艺秀',
        '.': [
            {
                title: '综艺',
                docs: 'https://docs.rsshub.app/routes/multimedia#zong-yi-xiu-zong-yi',
                source: ['/:region/:id', '/:id', '/'],
                target: (params, url) =>
                    `/zyshow/${new URL(url)
                        .toString()
                        .split(/zyshow\.net/)
                        .pop()}`,
            },
        ],
    },
};
