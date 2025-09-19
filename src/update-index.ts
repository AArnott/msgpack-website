import fs from 'fs-extra';
import path from 'path';
import YAML from 'js-yaml';
import { Octokit } from '@octokit/rest';
import MarkdownIt from 'markdown-it';
import nunjucks from 'nunjucks';
import cheerio from 'cheerio';

const QUICKSTART_FILES = ['msgpack.org.md', 'README.md', 'README.markdown', 'README.rdoc', 'README.rst', 'README'];

const md = new MarkdownIt({ html: true });

function escapeHtml(s: string) {
  return s.replace(/[&<>'"]/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  } as any)[c]);
}

function tweakQuickstartHtml(html: string) {
  // demote headings to avoid collisions with page structure
  return html
    .replace(/<(\/?)(h1)/g, '<$1h5')
    .replace(/<(\/?)(h2)/g, '<$1h6')
    .replace(/<(\/?)(h3)/g, '<$1h7')
    .replace(/<(\/?)(h4)/g, '<$1h8');
}

async function getQuickstartHtml(octokit: Octokit, owner: string, repo: string, default_branch: string) {
  for (const fname of QUICKSTART_FILES) {
    try {
      const res = await octokit.repos.getContent({ owner, repo, path: fname, ref: default_branch });
      // res.data may be a file or directory; ensure it's a file
      // @ts-ignore
      if (res && (res as any).data && (res as any).data.type === 'file') {
        // @ts-ignore
        const content = Buffer.from((res as any).data.content, 'base64').toString('utf8');
        if (/\.(md|markdown)$/i.test(fname) || fname.toLowerCase().includes('readme')) {
          const html = md.render(content);
          // tweak headings if needed
          return tweakQuickstartHtml(html);
        } else {
          return `<pre>${escapeHtml(content)}</pre>`;
        }
      }
    } catch (err: any) {
      if (err.status === 404) {
        continue;
      } else {
        console.error(`Error fetching ${owner}/${repo}/${fname}: ${err}`);
        break; // on other errors, stop trying
      }
    }
  }
  return null;
}

async function searchRepos(octokit: Octokit) {
  let items: any[] = [];
  let page = 1;
  while (true) {
    const res = await octokit.search.repos({ q: 'msgpack.org in:description', per_page: 100, page });
    if (!res.data.items || res.data.items.length === 0) break;
    items = items.concat(res.data.items as any[]);
    page++;
  }
  return items;
}

async function generate() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  // load lang.yml and keep the full language dictionary
  const langFile = path.resolve(process.cwd(), 'lang.yml');
  const langContents = await fs.readFile(langFile, 'utf8');
  const langMap = YAML.load(langContents) as any || {};
  const languages = Object.keys(langMap);

  console.log(`Found languages: ${languages.join(', ')}`);

  const cachePath = path.resolve(process.cwd(), 'data', 'cache.json');
  const useCache = process.env.USE_CACHE === 'true' || process.argv.includes('--use-cache');

  let collected: RepoInfo[] = [];
  if (useCache && (await fs.pathExists(cachePath))) {
    console.log('Using cached repo data from', cachePath);
    try {
      collected = await fs.readJson(cachePath) as RepoInfo[];
    } catch (err) {
      console.warn('Failed to read cache — falling back to live fetch:', err);
      collected = [];
    }
  } else {
    const repos = await searchRepos(octokit);
    console.log(`Found ${repos.length} repositories matching 'msgpack.org'`);

    // collect details for each repo
    for (const repo of repos) {
      try {
        if (repo.fork) continue;
        const desc: string = repo.description || '';
        const m = /msgpack\.org\[([^\]]+)\]/i.exec(desc);
        if (!m) continue;
        const lang = m[1];

        const ownerRepo = repo.full_name.split('/');
        const owner = ownerRepo[0];
        const reponame = ownerRepo[1];
        const default_branch = repo.default_branch || 'master';

        const quick = await getQuickstartHtml(octokit, owner, reponame, default_branch);
        const homepage = repo.homepage && repo.homepage !== '' && !repo.homepage.match(/^http:\/\/msgpack.org\/?$/) ? repo.homepage : repo.html_url;

        collected.push({
          msgpack_lang: lang,
          msgpack_quickstart_html: quick,
          msgpack_repo_id: repo.full_name.replace(/[^a-zA-Z0-9_\-]+/, '-'),
          msgpack_repo_homepage: homepage,
          full_name: repo.full_name,
          owner: owner,
          html_url: repo.html_url
        });

        console.log(`Collected ${repo.full_name} for lang=${lang}`);
      } catch (err) {
        console.error('Error processing repo', repo.full_name, err);
      }
    }

    // write cache for faster future runs
    try {
      await fs.mkdirp(path.dirname(cachePath));
      await fs.writeJson(cachePath, collected, { spaces: 2 });
      console.log('Wrote cache to', cachePath);
    } catch (err) {
      console.warn('Failed to write cache:', err);
    }
  }

  type RepoInfo = {
    msgpack_lang: string;
    msgpack_quickstart_html: string | null;
    msgpack_repo_id: string;
    msgpack_repo_homepage: string | null;
    full_name: string;
    owner: string;
    html_url: string;
  };

  // group by language and sort
  const grouped: Record<string, RepoInfo[]> = {};
  for (const r of collected) {
    grouped[r.msgpack_lang] = grouped[r.msgpack_lang] || [];
    grouped[r.msgpack_lang].push(r);
  }

  for (const lang of Object.keys(grouped)) {
    grouped[lang].sort((a, b) => a.full_name.localeCompare(b.full_name));
  }

  // setup nunjucks
  const templatesDir = path.resolve(process.cwd(), 'templates');
  nunjucks.configure(templatesDir, { autoescape: false });

  const dist = path.resolve(process.cwd(), 'dist');
  await fs.remove(dist);
  await fs.mkdirp(dist);

  // copy static assets (css, js, images, ddoc, edoc, javadoc, rdoc, releases, etc.)
  const staticDirs = ['css', 'js', 'images', 'ddoc', 'edoc', 'javadoc', 'rdoc', 'releases', 'maven2'];
  for (const d of staticDirs) {
    const src = path.join(process.cwd(), d);
    if (await fs.pathExists(src)) {
      await fs.copy(src, path.join(dist, d));
      console.log(`Copied ${d} -> dist/${d}`);
    }
  }

  // render pages per language
  for (const lang of languages) {
    const langKey = lang;
    const fileName = (langKey === 'en') ? 'index.html' : `${langKey}.html`;
    // The original ERB rendered the same `repos` collection for each locale
    // (the template handles language selection), so pass the full collected
    // list here and also expose `langs` for alternate links.
    const strings = (langMap[langKey] || {});
    const html = nunjucks.render('index.njk', {
      lang: langKey,
      repos: collected,
      langs: languages,
      strings: strings
    });

    await fs.writeFile(path.join(dist, fileName), html, 'utf8');
    console.log(`Wrote ${fileName} with ${collected.length} repos`);
  }

  console.log('Generation complete.');
}

if (require.main === module) {
  generate().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

export { generate };
