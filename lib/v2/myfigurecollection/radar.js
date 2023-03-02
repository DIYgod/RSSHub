const myFigureCollection = [
    {
        title: '活動',
        docs: 'https://docs.rsshub.app/shopping.html#MyFigureCollection-huo-dong',
        source: ['/browse/activity', '/'],
        target: '/myfigurecollection/activity/:category?/:language?/:latestAdditions?/:latestEdits?/:latestAlerts?/:latestPictures?',
    },
    {
        title: '資料庫',
        docs: 'https://docs.rsshub.app/shopping.html#MyFigureCollection-zi-liao-ku',
        source: ['/browse', '/'],
        target: '/myfigurecollection/:category?/:language?',
    },
    {
        title: '圖片',
        docs: 'https://docs.rsshub.app/shopping.html#MyFigureCollection-tu-pian',
        source: ['/picture/browse/:category', '/'],
        target: (params) => {
            if (params.category === 'potd' || params.category === 'potw' || params.category === 'potm') {
                return '/myfigurecollection/:category?/:language?';
            }
        },
    },
];

module.exports = {
    'myfigurecollection.net': {
        _name: 'MyFigureCollection',
        '.': myFigureCollection,
        de: myFigureCollection,
        es: myFigureCollection,
        fi: myFigureCollection,
        fr: myFigureCollection,
        it: myFigureCollection,
        ja: myFigureCollection,
        nl: myFigureCollection,
        no: myFigureCollection,
        pl: myFigureCollection,
        pt: myFigureCollection,
        ru: myFigureCollection,
        sv: myFigureCollection,
        zh: myFigureCollection,
    },
};
