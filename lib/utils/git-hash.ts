import { execSync } from 'node:child_process';

// without git, or outside a repository (as installed from npm), git's complaint is left unprinted
const git = (command: string) =>
    execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim();

let gitHash = process.env.HEROKU_SLUG_COMMIT?.slice(0, 8) || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8);
let gitDate: Date | undefined;
if (!gitHash) {
    try {
        gitHash = git('git rev-parse HEAD').slice(0, 8);
        gitDate = new Date(git('git log -1 --format=%cd'));
    } catch {
        gitHash = 'unknown';
    }
}

export { gitDate, gitHash };
