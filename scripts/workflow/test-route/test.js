/* eslint-disable */

module.exports = async ({ github, context, core, got }, baseUrl, routes, number) => {
    if (routes[0] === 'NOROUTE') {
        return;
    }

    const links = routes.map((e) => {
        const l = e.startsWith('/') ? e : `/${e}`;
        return `${baseUrl}${l}`;
    });

    let com = 'Successfully generated as following:\n\n';

    for (const lks of links) {
        core.info(`testing route:  ${lks}`);
        // Intended, one at a time
        const res = await got(lks).catch((err) => {
            com += `
<details>
    <summary><a href="${lks}">${lks}</a> - <b>Failed</b></summary>

\`\`\`
${err}
\`\`\`
</details>

`;
        });
        if (res && res.body) {
            const { body } = res;
            com += `
<details>
    <summary><a href="${lks}">${lks}</a> - Success</summary>

\`\`\`rss
${body.replace(/\s+(\n|$)/g, '\n')}
\`\`\`
</details>

`;
        }
    }
    github.rest.issues
        .addLabels({
            issue_number: number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            labels: ['Auto: Route Test Complete'],
        })
        .catch((e) => {
            core.warning(e);
        });
    github.rest.issues
        .createComment({
            issue_number: number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: com,
        })
        .catch((e) => {
            core.warning(e);
        });
};
