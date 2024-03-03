export default {
    '591.com.tw': {
        _name: '591 租屋網',
        rent: [
            {
                title: '所有物件',
                docs: 'https://docs.rsshub.app/routes/other#591-zu-wu-wang',
                source: ['/'],
                target: (params, url) => {
                    const searchParams = new URL(url).searchParams;
                    return `/591/tw/rent/${searchParams.toString()}`;
                },
            },
        ],
    },
};
