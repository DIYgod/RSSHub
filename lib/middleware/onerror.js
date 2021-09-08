const logger = require('@/utils/logger');
const config = require('@/config').value;
const art = require('art-template');
const path = require('path');

let Sentry;

if (config.sentry.dsn) {
    Sentry = Sentry || require('@sentry/node');
    Sentry.init({
        dsn: config.sentry.dsn,
    });
    Sentry.configureScope((scope) => {
        scope.setTag('node_name', config.nodeName);
    });

    logger.info('Sentry inited.');
}

module.exports = async (ctx, next) => {
    try {
        const time = +new Date();
        await next();
        if (config.sentry.dsn && +new Date() - time >= config.sentry.routeTimeout) {
            Sentry.withScope((scope) => {
                scope.setTag('route', ctx._matchedRoute);
                scope.setTag('name', ctx.request.path.split('/')[1]);
                scope.addEventProcessor((event) => Sentry.Handlers.parseRequest(event, ctx.request));
                Sentry.captureException(new Error('Route Timeout'));
            });
        }
    } catch (err) {
        let message = err;
        if (err.name && (err.name === 'HTTPError' || err.name === 'RequestError')) {
            message = `${err.message}: target website might be blocking our access, you can <a href="https://docs.rsshub.app/install/">host your own RSSHub instance</a> for a better usability.`;

            const templateZh = `<!--
请确保已阅读 [文档](https://docs.rsshub.app) 内相关部分，并按照模版提供信息，否则 issue 将被立即关闭。

由于部分源网站反爬缘故，演示地址一些 rss 会返回 status code 403，该问题不是 RSSHub 所致，请勿提交 issue。
-->

- 完整路由地址，包含所有必选与可选参数
    \`${ctx.path}\`
- 预期是什么

- 实际发生了什么

- 部署相关信息

<!--
如果是演示地址(rsshub.app)有此问题请删除此部分。

请确保您部署的是[主线 master 分支](https://github.com/DIYgod/RSSHub/tree/master)最新版 RSSHub。
-->

| Env                | Value         |
| ------------------ | ------------- |
| OS                 |               |
| Node version       |${process.version}     |
| if Docker, version |               |

- 额外信息（日志、报错等）
\`\`\`
    ${err.message}
\`\`\` `;

            const templateEn = `<!--
Please ensure you have read [documentation](https://docs.rsshub.app/en), and provide all the information required by this template, otherwise the issue will be closed immediately.

Due to the anti-crawling policy implemented by certain websites, some RSS routes provided by the demo will return status code 403. This is not an issue caused by RSSHub and please do not report it.
-->

- The involved route, with all required and optional parameters
    \`${ctx.path}\`
- What is expected

- What is actually happening

- Self-deployment information

<!--
Delete this section if you are using [RSSHub demo](https://rsshub.app).

Please ensure you have deployed the [master branch](https://github.com/DIYgod/RSSHub/tree/master) of RSSHub.
-->

| Env                | Value         |
| ------------------ | ------------- |
| OS                 |               |
| Node version       |${process.version}     |
| if Docker, version |               |

- Additional info (logs errors etc)
\`\`\`
    ${err.message}
\`\`\` `;

            message += `<br><br>如果您认为 RSSHub 导致了该错误，<a href="https://github.com/DIYgod/RSSHub/issues/new?template=bug_report_zh.md&title=[BUG]&body=${encodeURI(templateZh)}" target="_blank">请在 GitHub 报告</a>。`;

            message += `<br><br>If you believe this is an error caused by RSSHub, please <a href="https://github.com/DIYgod/RSSHub/issues/new?template=bug_report_en.md&title=[BUG]&body=${encodeURI(
                templateEn
            )}" target="_blank">report me on GitHub</a>.`;
        } else if (err instanceof Error) {
            message = process.env.NODE_ENV === 'production' ? err.message : err.stack;
        }
        logger.error(`Error in ${ctx.request.path}: ${message}`);

        if (config.isPackage) {
            ctx.body = {
                error: {
                    message: err.message ? err.message : err,
                },
            };
        } else {
            ctx.set({
                'Content-Type': 'text/html; charset=UTF-8',
            });
            if (ctx.status === 403) {
                message = err.message;
            } else {
                ctx.status = 404;
            }

            const requestPath = ctx.request.path;

            ctx.body = art(path.resolve(__dirname, '../views/error.art'), {
                requestPath,
                message,
            });
        }

        if (!ctx.debug.errorPaths[ctx.request.path]) {
            ctx.debug.errorPaths[ctx.request.path] = 0;
        }
        ctx.debug.errorPaths[ctx.request.path]++;

        if (!ctx.debug.errorRoutes[ctx._matchedRoute]) {
            ctx._matchedRoute && (ctx.debug.errorRoutes[ctx._matchedRoute] = 0);
        }
        ctx._matchedRoute && ctx.debug.errorRoutes[ctx._matchedRoute]++;

        if (!ctx.state.debuged) {
            if (!ctx.debug.routes[ctx._matchedRoute]) {
                ctx._matchedRoute && (ctx.debug.routes[ctx._matchedRoute] = 0);
            }
            ctx._matchedRoute && ctx.debug.routes[ctx._matchedRoute]++;

            if (ctx.response.get('X-Koa-Redis-Cache') || ctx.response.get('X-Koa-Memory-Cache')) {
                ctx.debug.hitCache++;
            }
        }

        if (config.sentry.dsn) {
            Sentry.withScope((scope) => {
                scope.setTag('route', ctx._matchedRoute);
                scope.setTag('name', ctx.request.path.split('/')[1]);
                scope.addEventProcessor((event) => Sentry.Handlers.parseRequest(event, ctx.request));
                Sentry.captureException(err);
            });
        }
    }
};
