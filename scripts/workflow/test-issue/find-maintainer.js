const unified = require('unified');
const parse = require('remark-parse');
const got = require('got');

// @TODO maybe we could use label or better way to separate bug/feature stuff
const matchTitle = ['路由地址', 'Routes'];
const maintainerURL = 'https://raw.githubusercontent.com/DIYgod/RSSHub/gh-pages/build/maintainer.json';
const successTag = 'Bug Ping: Pinged';
const parseFailure = 'Bug Ping: Parse Failure';
const failTag = 'Bug Ping: Not Found';
const ignoreUsername = new Set([]); // Wrap user who don't want to be pinged.

async function parseBodyRoutes(body, core) {
    const ast = await unified().use(parse).parse(body);

    // Is this a bug report?
    const title = ast.children[0].children[0].value.trim();
    core.debug(`title: ${title}`);
    if (!matchTitle.some((ele) => ele.localeCompare(title) === 0)) {
        return null;
    }

    const routes = ast.children[1].value.trim();
    core.debug(`routes: ${JSON.stringify(routes)}`);
    if (routes.localeCompare('NOROUTE') === 0) {
        return null;
    }

    if (routes) {
        const dedup = [...new Set(routes.split(/\r?\n/).filter((n) => n))];
        if (dedup.length !== routes.length) {
            core.warning('Duplicate Detected.');
        }
        core.debug(dedup);
        return dedup;
    }

    throw 'unable to parse body: routes does not exist';
}

async function getMaintainersByRoutes(routes, core) {
    const maintainers = await got(maintainerURL).json();

    return routes.map((e) => {
        const m = maintainers[e];
        if (m === undefined) {
            core.warning(`Route ${e} does not match any maintainer`);
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

    const routes = await parseBodyRoutes(body, core).catch((e) => {
        core.warning(e);
    });

    if (routes === null) {
        return; // Not a bug, or skipped
    }

    if (routes === undefined) {
        await github.rest.issues
            .addLabels({
                ...issue_facts,
                labels: [parseFailure],
            })
            .catch((e) => {
                core.warning(e);
            });
        return;
    }

    const maintainers = await getMaintainersByRoutes(routes, core);

    let successCount = 0;
    let comments = '##### Trying to find maintainers: \n\n';

    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        const main = maintainers[i];
        if (main === undefined) {
            comments += `- \`${route}\`: **Not found in list**\n`;
            continue;
        }

        if (main.length === 0) {
            comments += `- \`${route}\`: No maintainer listed, possibly v1 route or misconfigure\n`;
            successCount += 1;
            continue;
        }

        if (main.length > 0) {
            const pingStr = main
                .map((e) => {
                    if (e in ignoreUsername) {
                        return `\`@${e}\``; // Wrap with code so no mention will be sent
                    }
                    return `@${e}`;
                })
                .join(' ');
            comments += `- \`${route}\`: ${pingStr}\n`;
            successCount += 1;
        }
    }

    // Send out notification
    await github.rest.issues
        .createComment({
            ...issue_facts,
            body: `${comments}


> Maintainers: if you do not want to be notified, add your name in scripts/test-issue/find-maintainer.js so your name will be wrapped when tagged.
`,
        })
        .catch((e) => {
            core.warning(e);
        });

    if (successCount === routes.length) {
        await github.rest.issues
            .addLabels({
                ...issue_facts,
                labels: [successTag],
            })
            .catch((e) => {
                core.warning(e);
            });
    } else {
        await github.rest.issues
            .addLabels({
                ...issue_facts,
                labels: [failTag],
            })
            .catch((e) => {
                core.warning(e);
            });
    }

    // Write Affected Route Count
    await github.rest.issues
        .addLabels({
            ...issue_facts,
            labels: [`Count: ${successCount}/${routes.length}`],
        })
        .catch((e) => {
            core.warning(e);
        });
};
