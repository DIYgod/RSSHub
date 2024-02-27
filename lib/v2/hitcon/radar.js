module.exports = {
    'hitcon.org': {
        _name: 'HITCON',
        zeroday: [
            {
                title: '漏洞列表',
                docs: 'https://docs.rsshub.app/routes/programming#hitcon-zero-day',
                source: ['/vulnerability/:type?'],
                target: '/hitcon/zeroday/vulnerability/:type?',
            },
        ],
    },
};
