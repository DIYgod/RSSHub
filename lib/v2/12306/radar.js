module.exports = {
    '12306.cn': {
        _name: '12306',
        kyfw: [
            {
                title: '售票信息',
                docs: 'https://docs.rsshub.app/travel.html#_12306-shou-shu-piao-piao-xin-shen-xi',
                source: ['/', '/otn/leftTicket/init'],
                target: (params, url) => {
                    const searchParams = new URL(url).searchParams;
                    const from = searchParams.get('fs').split(',')[0];
                    const to = searchParams.get('ts').split(',')[0];
                    const date = searchParams.get('date');

                    return `/12306/${date}/${from}/${to}`;
                },
            },
        ],
        www: [
            {
                title: '最新动态',
                docs: 'https://docs.rsshub.app/travel.html#_12306-zui-cuo-xin-dong-tai',
                source: ['/', '/mormhweb/1/:id/index_fl.html'],
                target: '/12306/zxdt/:id',
            },
        ],
    },
};
