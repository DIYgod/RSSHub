module.exports = {
    '141jav.com': {
        _name: '141JAV',
        '.': [
            {
                title: '今日种子',
                docs: 'https://docs.rsshub.app/routes/multimedia#141jav',
                source: '/',
                target: (params, url, document) => {
                    const today = document.querySelector('div.card.mb-1.card-overview').getAttribute('data-date').replace(/-/g, '');
                    return `/141jav/day/${today}`;
                },
            },
            {
                title: '今日演员',
                docs: 'https://docs.rsshub.app/routes/multimedia#141jav',
                source: '/',
                target: (params, url, document) => {
                    const star = document.querySelector('div.card-content > div > a').getAttribute('href');
                    return `/141jav${star}`;
                },
            },
            {
                title: '页面种子',
                docs: 'https://docs.rsshub.app/routes/multimedia#141jav',
                source: ['/:type', '/:type/:key', '/:type/:key/:morekey'],
                target: (params, url, document) => {
                    const itype = params.morekey === undefined ? params.type : params.type === 'tag' ? 'tag' : 'day';
                    let ikey = `${itype === 'day' ? params.type : ''}${params.key || ''}${itype === 'tag' && params.morekey !== undefined ? '%2F' : ''}${params.morekey || ''}`;
                    if (ikey === '' && itype === 'tag') {
                        ikey = document.querySelector('div.thumbnail.is-inline > a').getAttribute('href').replace('/tag/', '').replace(/\//g, '%2F');
                    } else if (ikey === '' && itype === 'actress') {
                        ikey = document.querySelector('div.card > a').getAttribute('href').replace('/actress/', '');
                    }
                    return `/141jav/${itype}/${ikey}`;
                },
            },
        ],
    },
};
