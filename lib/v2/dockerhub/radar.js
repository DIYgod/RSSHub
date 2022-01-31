module.exports = {
    'hub.docker.com': {
        _name: 'Docker Hub',
        '.': [
            {
                title: '镜像有新 Tag',
                docs: 'https://docs.rsshub.app/shopping.html#docker-hub-jing-xiang-you-xin-tag',
                source: ['/r/:owner/:image', '/r/:owner/:image/tags', '/_/:image'],
                target: (params) => `/dockerhub/tag/${params.owner ? params.owner : 'library'}/${params.image}`,
            },
        ],
    },
};
