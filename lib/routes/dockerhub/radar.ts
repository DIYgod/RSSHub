export default {
    'docker.com': {
        _name: 'Docker Hub',
        hub: [
            {
                title: '镜像有新 Build',
                docs: 'https://docs.rsshub.app/routes/program-update#docker-hub',
                source: ['/r/:owner/:image', '/r/:owner/:image/tags', '/_/:image'],
                target: (params) => `/dockerhub/build/${params.owner ?? 'library'}/${params.image}`,
            },
            {
                title: '镜像有新 Tag',
                docs: 'https://docs.rsshub.app/routes/program-update#docker-hub',
                source: ['/r/:owner/:image', '/r/:owner/:image/tags', '/_/:image'],
                target: (params) => `/dockerhub/tag/${params.owner ?? 'library'}/${params.image}`,
            },
        ],
    },
};
