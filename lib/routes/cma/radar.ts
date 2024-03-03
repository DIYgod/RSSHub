export default {
    'cma.cn': {
        _name: '中国气象局',
        weather: [
            {
                title: '天气预报频道',
                docs: 'https://docs.rsshub.app/routes/forecast#zhong-guo-qi-xiang-ju-tian-qi-yu-bao-pin-dao',
                source: ['/web/*'],
                target: (_, url) => {
                    url = new URL(url).href;
                    const idMatches = url.match(/channel-(\d+)\.html/);

                    return `/cma/channel${idMatches ? `/${idMatches[1]}` : ''}`;
                },
            },
        ],
    },
};
