#!/usr/bin/env node
/**
 * Pre-commit gate: every staged source file must reach MIN_LINES % line coverage.
 *
 * Usage:
 *   node scripts/check-staged-coverage.mjs            # staged files (git diff --cached)
 *   node scripts/check-staged-coverage.mjs src/a.ts   # explicit files
 *
 * Runs the whole suite (so a staged file is covered by any spec that exercises it),
 * but reports and enforces coverage only for the files in question.
 */
import { execFileSync, spawnSync } from 'node:child_process';

const MIN_LINES = Number(process.env.MIN_COVERAGE ?? 70);

// Keep in sync with coverage.exclude in vitest.config.ts.
const isCoverable = (file) =>
	/^src\/.+\.ts$/.test(file) &&
	!file.endsWith('.spec.ts') &&
	!file.includes('/testing/') &&
	!file.includes('/prisma/generated/') &&
	file !== 'src/main.ts';

const stagedFiles = () =>
	execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
		encoding: 'utf8',
	})
		.split('\n')
		.filter(Boolean);

const files = (process.argv.length > 2 ? process.argv.slice(2) : stagedFiles()).filter(isCoverable);

if (files.length === 0) {
	console.log('coverage: no staged source files, skipping');
	process.exit(0);
}

console.log(`coverage: checking ${files.length} file(s), minimum ${MIN_LINES}% lines per file`);

const result = spawnSync(
	'npx',
	[
		'vitest',
		'run',
		'--coverage.enabled',
		'--coverage.reporter=text',
		'--coverage.thresholds.perFile',
		`--coverage.thresholds.lines=${MIN_LINES}`,
		...files.map((file) => `--coverage.include=${file}`),
	],
	{ stdio: 'inherit' },
);

if (result.status !== 0) {
	console.error(
		`\ncoverage: commit blocked — tests failed or a staged file is below ${MIN_LINES}% line coverage.`,
	);
}

process.exit(result.status ?? 1);
