import remarkParse from 'remark-parse';
import { unified } from 'unified';

const noFound = 'auto: route no found';
const criticalFailure = 'auto: DO NOT merge';
const routeTestFailed = 'auto: not ready to review';
const allowedUser = new Set(['dependabot[bot]', 'pull[bot]']); // dependabot and downstream PR requested by pull[bot]
const requiredHeading = 'Example for the Proposed Route(s) / 路由地址示例';

/** @type {boolean} */
const isPR = Boolean(process.env.PULL_REQUEST);

/**
 * @param {{ github: ReturnType<typeof import('@actions/github').getOctokit>, context: typeof import('@actions/github').context, core: typeof import('@actions/core') }} githubScript
 * @param {string | null} body
 * @param {number} number
 * @param {string} sender
 * @returns {Promise<string[] | void>}
 */
export default async function identify({ github, context, core }, body, number, sender) {
    core.debug(`sender: ${sender}`);
    core.debug(`body: ${body}`);

    const issueFacts = {
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: number,
    };
    const prFacts = {
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: number,
    };
    /** @type {Awaited<ReturnType<typeof github.rest.issues.get>>} */
    const { data: issue } = await github.rest.issues
        .get({
            ...issueFacts,
        })
        .catch((error) => {
            core.warning(error);
        });

    /** @param {string[]} labels */
    const addLabels = (labels) =>
        github.rest.issues
            .addLabels({
                ...issueFacts,
                labels,
            })
            .catch((error) => {
                core.warning(error);
            });
    /** @param {string} labelName */
    const removeLabel = (labelName = noFound) =>
        github.rest.issues
            .removeLabel({
                ...issueFacts,
                name: labelName,
            })
            .catch((error) => {
                core.warning(error);
            });
    /** @param {'open' | 'closed'} state */
    const updatePrState = (state) =>
        github.rest.pulls
            .update({
                ...prFacts,
                state,
            })
            .catch((error) => {
                core.warning(error);
            });
    /** @param {string} body */
    const createComment = (body) =>
        github.rest.issues
            .createComment({
                ...issueFacts,
                body,
            })
            .catch((error) => {
                core.warning(error);
            });
    const createFailedComment = () => {
        const logUrl = `${process.env.GITHUB_SERVER_URL}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`;

        if (isPR) {
            return createComment(`Auto Route Test failed, please check your PR body format and reopen pull request. Check [logs](${logUrl}) for more details.
        自动路由测试失败，请确认 PR 正文部分符合格式规范并重新开启，详情请检查 [日志](${logUrl})。`);
        }

        return createComment(`Route Test failed, please check your comment body. Check [logs](${logUrl}) for more details.
        路由测试失败，请确认评论部分符合格式规范，详情请检查 [日志](${logUrl})。`);
    };

    if (isPR) {
        if (issue.state === 'closed') {
            await updatePrState('open');
        }
        if (issue.labels.some((e) => e.name === criticalFailure) || issue.labels.some((e) => e.name === routeTestFailed)) {
            await removeLabel(criticalFailure);
            await removeLabel(routeTestFailed);
        }
    }

    if (allowedUser.has(sender)) {
        core.info('PR created by a allowed user, passing');
        await removeLabel();
        await addLabels(['auto: ready to merge']);
        return;
    } else {
        core.debug('PR created by ' + sender);
    }

    /** @type {string[] | undefined} */
    let routes;

    if (body) {
        const ast = unified().use(remarkParse).parse(body);

        let searchStart = 0;
        let searchEnd = ast.children.length;

        if (isPR) {
            const headingIndex = ast.children.findIndex((node) => node.type === 'heading' && node.children?.some((child) => child.type === 'text' && child.value.trim() === requiredHeading));
            core.debug(`headingIndex: ${headingIndex}`);

            if (headingIndex === -1) {
                searchStart = -1; // skip search
            } else {
                searchStart = headingIndex + 1;
                const nextHeading = ast.children.findIndex((node, i) => i > headingIndex && node.type === 'heading');
                if (nextHeading !== -1) {
                    searchEnd = nextHeading;
                }
            }
        }

        for (let i = searchStart; i >= 0 && i < searchEnd; i++) {
            const node = ast.children[i];
            if (node.type === 'code' && node.lang === 'routes') {
                const code = node.value?.trim();
                core.debug(`match: ${code}`);
                if (code) {
                    routes = code.split(/\r?\n/).filter(Boolean);
                }
                break;
            }
        }
    }

    if (routes?.length) {
        core.info(`routes detected: ${routes}`);

        if (routes[0] === 'NOROUTE') {
            core.info('PR stated no route, passing');
            await removeLabel();
            await addLabels(['auto: route test bypassed']);

            return;
        }

        if (routes.some((e) => e.includes('/:'))) {
            await addLabels([noFound]);
            return createComment(`Please use actual values in \`routes\` section instead of path parameters.
                请在 \`routes\` 部分使用实际值而不是路径参数。`);
        }

        core.exportVariable('TEST_CONTINUE', true);
        await removeLabel();
        return routes;
    }

    core.warning('Seems like no valid routes can be found. Failing.');

    await createFailedComment();
    if (isPR) {
        await addLabels([noFound]);
        await updatePrState('closed');
    }

    throw new Error('Please follow the PR rules: failed to detect route');
}
