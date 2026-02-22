import adapter from '@sveltejs/adapter-static';

function normalizeBasePath(basePath) {
	if (!basePath || basePath === '/') {
		return '';
	}

	const withLeadingSlash = basePath.startsWith('/') ? basePath : `/${basePath}`;
	return withLeadingSlash.replace(/\/$/, '');
}

function resolveBasePath() {
	const configuredBasePath = process.env.MOIRE_BASE_PATH;

	if (configuredBasePath !== undefined) {
		return normalizeBasePath(configuredBasePath);
	}

	const repository = process.env.GITHUB_REPOSITORY;
	const [owner = '', repo = ''] = repository ? repository.split('/') : [];
	const isUserOrOrgPagesRepo = owner.length > 0
		&& repo.length > 0
		&& repo.toLowerCase() === `${owner.toLowerCase()}.github.io`;

	if (process.env.GITHUB_ACTIONS === 'true' && repo && !isUserOrOrgPagesRepo) {
		return normalizeBasePath(repo);
	}

	return '';
}

const basePath = resolveBasePath();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			fallback: '404.html'
		}),
		paths: {
			base: basePath,
			relative: true
		},
		alias: {
			$theme: './src/theme',
			$themes: './src/themes'
		}
	}
};

export default config;
