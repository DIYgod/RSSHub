module.exports = {
    'aliyundrive.com': {
        _name: '阿里云盘',
        www: [
            {
                title: '文件列表',
                docs: 'https://docs.rsshub.app/programming.html#a-li-yun-pan',
                source: ['/s/:share_id', '/s/:share_id/folder/:parent_file_id'],
                target: '/aliyundrive/files/:share_id/:parent_file_id?',
            },
        ],
    },
};
