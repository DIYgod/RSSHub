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

    const removeLabel = () =>
        github.rest.issues
            .removeLabel({
                ...issue_facts,
                name: noFound,
            })
            .catch((e) => {
                core.warning(e);
            });

    if (context.payload.pull_request.state === 'closed') {
        await github.rest.pulls
            .update({
                ...pr_facts,
                state: 'open',
            })
            .catch((e) => {
                core.warning(e);
            });
    }

    if (whiteListedUser.includes(sender)) {
        core.info('PR created by a whitelisted user, passing');
        await removeLabel();
        await github.rest.issues
            .addLabels({
                ...issue_facts,
                labels: ['Auto: whitelisted'],
            })
            .catch((e) => {
                core.warning(e);
            });
        return;
    } else {
        core.debug('PR created by ' + sender);
    }

    if (m && m[1]) {
        res = m[1].trim().split(/\r?\n/);
        core.info(`routes detected: ${res}`);

        if (res.length > 0 && res[0] === 'NOROUTE') {
            core.info('PR stated no route, passing');
            await removeLabel();
            await github.rest.issues
                .addLabels({
                    ...issue_facts,
                    labels: ['Auto: No Route Needed'],
                })
                .catch((e) => {
                    core.warning(e);
                });

            return;
        } else if (res.length > 0) {
            core.exportVariable('TEST_CONTINUE', true);
            await removeLabel();
            return res;
        }
    }

    core.warning('seems no route found, failing');

    await github.rest.issues
        .addLabels({
            ...issue_facts,
            labels: [noFound],
        })
        .catch((e) => {
            core.warning(e);
        });
    await github.rest.issues
        .createComment({
            ...issue_facts,
            body: `自动检测失败, 请确认PR正文部分符合格式规范并重新开启, 详情请检查日志
Auto Route test failed, please check your PR body format and reopen pull request. Check logs for more details`,
        })
        .catch((e) => {
            core.warning(e);
        });
    await github.rest.pulls
        .update({
            ...pr_facts,
            state: 'closed',
        })
        .catch((e) => {
            core.warning(e);
        });

    throw Error('Please follow the PR rules: failed to detect route');
};
