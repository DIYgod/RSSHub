const noFound = 'Auto: Route No Found';

module.exports = ({ github, context, core }, body, number) => {
    core.debug(`body: ${body}`);
    const m = body.match(/```routes\r\n((.|\r\n)*)```/);
    core.debug(`match: ${m}`);
    let res = null;

    const removeLabel = () => {
        github.issues
            .removeLabel({
                issue_number: number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                name: noFound,
            })
            .catch((e) => {
                core.warning(e);
            });
    };

    if (m && m[1]) {
        res = m[1].trim().split('\r\n');
        core.info(`routes detected: ${res}`);

        if (res.length > 0 && res[0] === 'NOROUTE') {
            core.info('PR stated no route, passing');
            removeLabel();
            github.issues
                .addLabels({
                    issue_number: number,
                    owner: context.repo.owner,
                    repo: context.repo.repo,
                    labels: ['Auto: No Route Needed'],
                })
                .catch((e) => {
                    core.warning(e);
                });

            return;
        } else if (res.length > 0) {
            core.exportVariable('TEST_CONTINUE', true);
            removeLabel();
            return res;
        }
    }

    core.info('seems no route found, failing');

    github.issues.addLabels({
        issue_number: number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        labels: [noFound],
    });

    throw 'Please follow the PR rules: failed to detect route';
};
