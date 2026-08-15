import { query as dbQuery } from '../db/client.js';

const username = process.env.GITHUB_USERNAME || 'Coder-Delta';
const syncIntervalMs = Number(process.env.GITHUB_SYNC_INTERVAL_MS || 5 * 60 * 1000);
let lastSyncAt = 0;
let syncInProgress = null;

const toTitle = (repoName) => repoName
  .replace(/[-_]+/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

async function getPublicRepositories() {
  const repositories = [];

  for (let page = 1; page <= 10; page += 1) {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?type=owner&sort=created&direction=desc&per_page=100&page=${page}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
        },
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}`);
    }

    const pageItems = await response.json();
    repositories.push(...pageItems);
    if (pageItems.length < 100) break;
  }

  return repositories;
}

async function runSync() {
  try {
    const repositories = await getPublicRepositories();
    const eligible = repositories.filter((repo) => !repo.fork && !repo.archived && !repo.disabled);

    for (const [index, repo] of eligible.entries()) {
      await dbQuery(
        `INSERT INTO projects (repo, title, description, github_stars, featured, display_order)
         VALUES ($1, $2, $3, $4, false, $5)
         ON CONFLICT (repo) DO UPDATE SET
           github_stars = EXCLUDED.github_stars,
           updated_at = CURRENT_TIMESTAMP`,
        [
          repo.name,
          toTitle(repo.name),
          repo.description?.trim() || 'A public GitHub project by Ranjit Bhandary.',
          repo.stargazers_count || 0,
          10000 + index,
        ],
      );
    }

    lastSyncAt = Date.now();
  } catch (error) {
    // GitHub availability must never prevent the portfolio from serving saved projects.
    console.warn(`GitHub project sync skipped: ${error.message}`);
  } finally {
    syncInProgress = null;
  }
}

/**
 * Discovers new public, non-fork repositories without overwriting curated records.
 * A newly created repository appears on the next Projects visit after the cache period.
 */
export async function syncGithubProjects() {
  if (Date.now() - lastSyncAt < syncIntervalMs) return;
  if (!syncInProgress) syncInProgress = runSync();
  await syncInProgress;
}
