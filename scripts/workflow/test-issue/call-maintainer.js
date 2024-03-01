const unified = require('unified');
const parse = require('remark-parse');
const got = require('got');

// @TODO maybe we could use label or some other better ways to distinguish bug/feature issues
const matchTitle = ['路由地址', 'Routes'];
const maintainerURL = 'https://raw.githubusercontent.com/DIYgod/RSSHub/gh-pages/build/maintainer.json';
const successTag = 'Bug Ping: Pinged';
const parseFailTag = 'Bug Ping: Parsing Failed';
const failTag = 'Bug Ping: Not Found';
const deprecatedRoute = 'Route: deprecated';
const route = 'Route';

// DnD (do-not-disturb) usernames, add yours here to avoid being notified
const dndUsernames = new Set([]);

async function parseBodyRoutes(body, core) {
    const ast = await unified().use(parse).parse(body);

    // Is this a bug report?
    const title = ast.children[0].children[0].value.trim();
    core.debug(`title: ${title}`);
    if (!matchTitle.some((ele) => ele.localeCompare(title) === 0)) {
        return null;
    }

    let routes = ast.children[1].value.trim();
    core.debug(`routes: ${JSON.stringify(routes)}`);
    if (routes.localeCompare('NOROUTE') === 0) {
        return null;
    }

    if (routes) {
        routes = routes.split(/\r?\n/).filter(Boolean);
        const dedup = [...new Set(routes)];
        if (dedup.length !== routes.length) {
            core.warning('Duplication detected.');
        }
        core.debug(dedup);
        return dedup;
    }

    throw new Error('unable to parse the issue body: route does not exist');
}

async function getMaintainersByRoutes(routes, core) {
    // TODO: change me when https://github.com/actions/github-script is run on node20
    // const response = await fetch(maintainerURL);
    // const maintainers = await response.json();
    const maintainers = await got(maintainerURL).json();

    return routes.map((e) => {
        const m = maintainers[e];
        if (m === undefined) {
            core.warning(`Route ${e} not found`);
        }

        return m;
    });
}

module.exports = async ({ github, context, core }) => {
    const body = context.payload.issue.body;
    const issue_facts = {
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
    };

    const addLabels = (labels) =>
        github.rest.issues
            .addLabels({
                ...issue_facts,
                labels,
            })
            .catch((error) => {
                core.warning(error);
            });
    const updateIssueState = (state) =>
        github.rest.issues
            .update({
                ...issue_facts,
                state,
            })
            .catch((error) => {
                core.warning(error);
            });

    if (context.payload.issue.state === 'closed') {
        await updateIssueState('open');
    }

    const routes = await parseBodyRoutes(body, core).catch((error) => {
        core.warning(error);
    });

    if (routes === null) {
        return; // Not a bug report, or NOROUTE
    }

    if (routes === undefined) {
        await addLabels([parseFailTag]);
        return;
    }

    const maintainers = await getMaintainersByRoutes(routes, core);

    let successCount = 0;
    let emptyCount = 0;
    let failedCount = 0;
    let comments = '##### Searching for maintainers: \n\n';

    for (const [i, route] of routes.entries()) {
        const main = maintainers[i];
        if (main === undefined) {
            comments += `- \`${route}\`: **Route not found**\n`;
            failedCount += 1;
            continue;
        }

        if (main.length === 0) {
            comments += `- \`${route}\`: No maintainer listed, possibly a v1 or misconfigured route\n`;
            emptyCount += 1;
            continue;
        }

        if (main.length > 0) {
            const pingStr = main
                .map((e) => {
                    if (e in dndUsernames) {
                        return `\`@${e}\``; // Wrap in an inline code block to make sure no mention will be sent
                    }
                    return `@${e}`;
                })
                .join(' ');
            comments += `- \`${route}\`: ${pingStr}\n`;
            successCount += 1;
        }
    }

    const labels = [`Count: ${successCount}/${routes.length}`];

    if (failedCount > 0) {
        labels.push(failTag);
    } else {
        labels.push(successTag);
    }

    if (emptyCount > 0) {
        labels.push(deprecatedRoute);
    }

    if (successCount > 0) {
        labels.push(route);
    }

    // Write labels (status, affected route count)
    await addLabels(labels);

    // Reply to the issue and notify the maintainers (if any)
    await github.rest.issues
        .createComment({
            ...issue_facts,
            body: `${comments}


> To maintainers: if you are not willing to be disturbed, list your username in \`scripts/workflow/test-issue/call-maintainer.js\`. In this way, your username will be wrapped in an inline code block when tagged so you will not be notified.

如果所有路由都无法匹配，issue 将会被自动关闭。如果 issue 和路由无关，请使用 \`NOROUTE\` 关键词，或者留下评论。我们会重新审核。
If all routes can not be found, the issue will be closed automatically. Please use \`NOROUTE\` for a route-irrelevant issue or leave a comment if it is a mistake.
`,
        })
        .catch((error) => {
            core.warning(error);
        });

    if (failedCount && emptyCount === 0 && successCount === 0) {
        await updateIssueState('closed');
    }
};
