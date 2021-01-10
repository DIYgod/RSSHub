module.exports = ({github, context}, body, number) => {
    const m = body.match(/```routes\n((.|\n)*)```/);
    let res = null;

    if (m && m[1]) {
        res = m.split("\n");
        console.log("routes detected: ", res);

        if (res.length > 0) {
            return res;
        }

        if (res[0] === "NOROUTE") {
            console.log("PR stated no route, passing");
            github.issues.addLabels({
            issue_number: number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            labels: ['Auto: No Route Needed']
            });
            return res;
        }
    }

    console.log("seems no route found, failing");

    github.issues.addLabels({
        issue_number: number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        labels: ['Auto: Route No Found']
    });

    throw "Please follow the PR rules: failed to detect route";
};