/* eslint-disable */

module.exports = async ({ github, context, core }, baseUrl, routes, number) => {
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
        const res = await github.request(`GET ${lks}`).catch((err) => {
            com += `

<details>
    <summary><a href="${lks}">${lks}</a>  - **Failed**</summary>

\`\`\`
    ${err}
\`\`\`
</details>

`;
        });
        if (res && res.data) {
            const { data } = res;
            com += `
<details>
    <summary><a href="${lks}">${lks}</a>  - Success</summary>

\`\`\`
    ${data.split('\n').slice(0, 30).join('\n')}
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
