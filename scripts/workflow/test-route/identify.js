const noFound = 'Auto: Route No Found';
const allowedUser = new Set(['dependabot[bot]', 'pull[bot]']); // dependabot and downstream PR requested by pull[bot]

module.exports = async ({ github, context, core }, body, number, sender) => {
    core.debug(`sender: ${sender}`);
    core.debug(`body: ${body}`);
    // Remove all HTML comments before performing the match
    const bodyNoCmts = body.replaceAll(/<!--[\S\s]*?-->/g, '');
    const m = bodyNoCmts.match(/```routes\s+([\S\s]*?)```/);
    core.debug(`match: ${m}`);
    let res = null;

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

    const addLabels = (labels) =>
        github.rest.issues
            .addLabels({
                ...issueFacts,
                labels,
            })
            .catch((error) => {
                core.warning(error);
            });

    const removeLabel = () =>
        github.rest.issues
            .removeLabel({
                ...issueFacts,
                name: noFound,
            })
            .catch((error) => {
                core.warning(error);
            });

    const updatePrState = (state) =>
        github.rest.pulls
            .update({
                ...prFacts,
                state,
            })
            .catch((error) => {
                core.warning(error);
            });

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

        if (process.env.PULL_REQUEST) {
            return createComment(`Auto Route Test failed, please check your PR body format and reopen pull request. Check [logs](${logUrl}) for more details.
        自动路由测试失败，请确认 PR 正文部分符合格式规范并重新开启，详情请检查 [日志](${logUrl})。`);
        }

        return createComment(`Route Test failed, please check your comment body. Check [logs](${logUrl}) for more details.
        路由测试失败，请确认评论部分符合格式规范，详情请检查 [日志](${logUrl})。`);
    };

    const pr = await github.rest.issues
        .get({
            ...issueFacts,
        })
        .catch((error) => {
            core.warning(error);
        });
    if (pr.pull_request && pr.state === 'closed') {
        await updatePrState('open');
    }

    if (allowedUser.has(sender)) {
        core.info('PR created by a allowed user, passing');
        await removeLabel();
        await addLabels(['Auto: allowed']);
        return;
    } else {
        core.debug('PR created by ' + sender);
    }

    if (m && m[1]) {
        res = m[1].trim().split(/\r?\n/);
        core.info(`routes detected: ${res}`);

        if (res.length && res[0] === 'NOROUTE') {
            core.info('PR stated no route, passing');
            await removeLabel();
            await addLabels(['Auto: Route Test Skipped']);

            return;
        } else if (res.length && !res.some((e) => e.includes('/:'))) {
            core.exportVariable('TEST_CONTINUE', true);
            await removeLabel();
            return res;
        }
    }

    core.warning('Seems like no valid routes can be found. Failing.');

    await createFailedComment();
    if (process.env.PULL_REQUEST) {
        await addLabels([noFound]);
        await updatePrState('closed');
    }

    throw new Error('Please follow the PR rules: failed to detect route');
};
