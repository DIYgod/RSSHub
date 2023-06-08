const noFound = 'Auto: Route No Found';
const whiteListedUser = ['dependabot[bot]', 'pull[bot]']; // dependabot and downstream PR requested by pull[bot]

module.exports = async ({ github, context, core }, body, number, sender) => {
    core.debug(`sender: ${sender}`);
    core.debug(`body: ${body}`);
    const m = body.match(/```routes\s+([\s\S]*?)```/);
    core.debug(`match: ${m}`);
    let res = null;

    const issue_facts = {
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: number,
    };
    const pr_facts = {
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: number,
    };

    const addLabels = (labels) =>
        github.rest.issues
            .addLabels({
                ...issue_facts,
                labels,
            })
            .catch((e) => {
                core.warning(e);
            });

    const removeLabel = () =>
        github.rest.issues
            .removeLabel({
                ...issue_facts,
                name: noFound,
            })
            .catch((e) => {
                core.warning(e);
            });

    const updatePrState = (state) =>
        github.rest.pulls
            .update({
                ...pr_facts,
                state,
            })
            .catch((e) => {
                core.warning(e);
            });

    const createComment = (body) =>
        github.rest.issues
            .createComment({
                ...issue_facts,
                body,
            })
            .catch((e) => {
                core.warning(e);
            });

    const createFailedComment = () =>
        createComment(`自动检测失败，请确认 PR 正文部分符合格式规范并重新开启，详情请检查日志
    Auto Route test failed, please check your PR body format and reopen pull request. Check logs for more details`);

    const pr = await github.rest.issues
        .get({
            ...issue_facts,
        })
        .catch((e) => {
            core.warning(e);
        });
    if (pr.pull_request && pr.state === 'closed') {
        await updatePrState('open');
    }

    if (whiteListedUser.includes(sender)) {
        core.info('PR created by a whitelisted user, passing');
        await removeLabel();
        await addLabels(['Auto: whitelisted']);
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
            await addLabels(['Auto: No Route Needed']);

            return;
        } else if (res.length && !res.some((e) => e.includes('/:'))) {
            core.exportVariable('TEST_CONTINUE', true);
            await removeLabel();
            return res;
        }
    }

    core.warning('Seems like no valid routes can be found. Failing.');

    await addLabels([noFound]);
    await createFailedComment();
    await updatePrState('closed');

    throw Error('Please follow the PR rules: failed to detect route');
};
