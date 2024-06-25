import { CronJob } from 'cron';

const createJob = (cronTime, owner, repo, app) => {
  return new CronJob(
    cronTime,
    async function () {
        let octokit = await app.auth();

        const { data: installations } = await octokit.request('GET /app/installations', {
            headers: {
              accept: 'application/vnd.github.v3+json',
            },
          });

          if (installations.length === 0) {
            throw new Error('No installations found for the app');
          }

          const installationId = installations[0].id;

          octokit = await app.auth(installationId);

        await octokit.request('POST /repos/{owner}/{repo}/issues', {
            owner: 'busaku',
            repo: 'cmdgo',
            title: 'Found a bug',
            body: 'I\'m having a problem with this.',
            labels: [
              'gitification'
            ],
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          })
        app.log.info('CronJob executed');
    }, 
    null, // onComplete
    false, // start
    'Europe/Berlin' // timeZone
  );
};

export default createJob;