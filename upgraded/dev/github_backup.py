"""Create a private GitHub backup using the existing Git Credential Manager login.

Credentials stay in memory and are sent only to api.github.com. No token is
written into the repository, command arguments, Git remotes, or output.
"""
from pathlib import Path
from datetime import date
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
OWNER = sys.argv[1]
BASE_NAME = 'morash-bracha-games'
ENV = dict(os.environ, GIT_TERMINAL_PROMPT='0', GCM_INTERACTIVE='Never')
GIT = ['git', '-c', 'safe.directory=' + ROOT.as_posix()]


def git(*args, required=True):
    result = subprocess.run(GIT + list(args), cwd=ROOT, env=ENV,
                            capture_output=True, text=True, encoding='utf-8',
                            errors='replace')
    if required and result.returncode:
        raise RuntimeError('Git operation failed: ' + args[0] + '\n' + result.stderr)
    return result


def main():
    git('add', '--all')
    dirty = git('diff', '--cached', '--quiet', required=False).returncode
    if dirty:
        git('commit', '--quiet', '-m',
            'Polish all ten games, add nikud and culturally appropriate website artwork')
    local_sha = git('rev-parse', 'HEAD').stdout.strip()
    print('Local backup committed:', local_sha[:12], flush=True)
    print('Tracked files:', len(git('ls-files', '-z').stdout.split('\0')) - 1,
          flush=True)

    credential = subprocess.run(
        GIT + ['credential', 'fill'],
        input=f'protocol=https\nhost=github.com\nusername={OWNER}\n\n',
        cwd=ROOT, env=ENV, capture_output=True, text=True,
        encoding='utf-8', errors='replace')
    if credential.returncode:
        raise RuntimeError('The saved GitHub login could not be accessed.')
    fields = dict(line.split('=', 1) for line in credential.stdout.splitlines()
                  if '=' in line)
    token = fields.get('password')
    if not token:
        raise RuntimeError('No saved GitHub access token is available.')

    def api(endpoint, payload=None, missing_ok=False):
        request = urllib.request.Request(
            'https://api.github.com' + endpoint,
            data=None if payload is None else json.dumps(payload).encode('utf-8'),
            headers={'Authorization': 'Bearer ' + token,
                     'Accept': 'application/vnd.github+json',
                     'Content-Type': 'application/json',
                     'X-GitHub-Api-Version': '2022-11-28',
                     'User-Agent': 'Bracha-Project-Backup'},
            method='GET' if payload is None else 'POST')
        try:
            with urllib.request.urlopen(request, timeout=40) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            if missing_ok and error.code == 404:
                return None
            raise RuntimeError(f'GitHub API returned HTTP {error.code} for {endpoint}') from None

    account = api('/user')
    if account['login'].lower() != OWNER.lower():
        raise RuntimeError('The authenticated GitHub account differs from the selected account.')
    print('GitHub account verified:', account['login'], flush=True)

    existing_remote = git('remote', 'get-url', 'origin', required=False)
    if existing_remote.returncode == 0:
        remote = existing_remote.stdout.strip()
        prefix = 'https://github.com/' + OWNER + '/'
        if not remote.startswith(prefix) or not remote.endswith('.git'):
            raise RuntimeError('An unexpected origin already exists; it was not modified.')
        name = remote[len(prefix):-4]
        repo = api('/repos/' + OWNER + '/' + name)
        if repo['description'] != 'Private backup of the Bracha games, source content, working files and delivery package.':
            raise RuntimeError('The existing repository is not the expected backup destination.')
    else:
        name = BASE_NAME
        if api('/repos/' + OWNER + '/' + name, missing_ok=True):
            name += '-backup-' + date.today().isoformat()
            if api('/repos/' + OWNER + '/' + name, missing_ok=True):
                raise RuntimeError('Both backup names already exist; no existing repository was changed.')
        repo = api('/user/repos', {
            'name': name, 'private': True, 'auto_init': False,
            'description': 'Private backup of the Bracha games, source content, working files and delivery package.'})
        if repo['private'] is not True:
            raise RuntimeError('The repository is not private; upload was stopped.')
        git('remote', 'add', 'origin', repo['clone_url'])

    if repo['private'] is not True:
        raise RuntimeError('The backup repository is not private; upload was stopped.')
    print('Private repository:', repo['html_url'], flush=True)
    print('Uploading all tracked project files...', flush=True)
    git('push', '--set-upstream', 'origin', 'main')
    branch = api('/repos/' + OWNER + '/' + name + '/git/ref/heads/main')
    if branch['object']['sha'] != local_sha:
        raise RuntimeError('The remote revision does not match the local backup.')
    if git('status', '--porcelain').stdout.strip():
        raise RuntimeError('The project changed during upload; new changes remain to be backed up.')
    print(json.dumps({'url': repo['html_url'], 'private': True,
                      'branch': 'main', 'commit': local_sha,
                      'verified': True}, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(str(exc), file=sys.stderr, flush=True)
        sys.exit(1)
