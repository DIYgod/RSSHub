import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

function getConfig(ctx) {
    const discourseConfig = config.discourse.config[ctx.req.param('configId')];
    if (!discourseConfig) {
        throw new ConfigNotFoundError('Discourse RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/">relevant config</a>');
    }
    return discourseConfig;
}

export { getConfig };
