const config = require('@/config').value;

function getConfig(ctx) {
    if (!config.discourse.config[ctx.params.configId]) {
        throw Error('Discourse RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install">relevant config</a>');
    }
    return config.discourse.config[ctx.params.configId];
}

module.exports = {
    getConfig,
};
