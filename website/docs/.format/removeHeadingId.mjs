export default {
    rules: (list) => list.filter((e) => e),
    handler: async (data) => {
        const content = data.split('\n');
        let lastH2 = '';
        let lastH3 = '';

        for (let i = 0; i < content.length; i++) {
            if (content[i].startsWith('## ')) {
                lastH2 = content[i].match(`## (([^{])*)`)?.[1].trim();

                content[i] = `## ${lastH2}`;
            } else if (content[i].startsWith('### ')) {
                lastH3 = content[i].match(`### (([^{])*)`)?.[1].trim();

                content[i] = `### ${lastH3}`;
            } else if (content[i].startsWith('#### ')) {
                const title = content[i].match(`#### (([^{])*)`)?.[1].trim();

                content[i] = `#### ${title}`;
            }
        }

        return Promise.resolve(content.join('\n'));
    },
};
