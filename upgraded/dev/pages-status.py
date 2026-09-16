"""Read deployment status using the existing GitHub credential, kept in memory."""
import json, os, subprocess, urllib.request
from pathlib import Path
root=Path(__file__).resolve().parents[2]
env=dict(os.environ,GIT_TERMINAL_PROMPT='0',GCM_INTERACTIVE='Never')
result=subprocess.run(['git','-c','safe.directory='+root.as_posix(),'credential','fill'],input='protocol=https\nhost=github.com\nusername=marpad-stack\n\n',cwd=root,env=env,capture_output=True,text=True)
fields=dict(line.split('=',1) for line in result.stdout.splitlines() if '=' in line)
token=fields.get('password')
if not token:raise RuntimeError('Saved GitHub login unavailable.')
def get(suffix):
 request=urllib.request.Request('https://api.github.com/repos/marpad-stack/morash-bracha-games'+suffix,headers={'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','User-Agent':'Bracha-Pages-Verification'})
 with urllib.request.urlopen(request,timeout=30) as response:return json.load(response)
pages=get('/pages');build=get('/pages/builds/latest')
print(json.dumps({'url':pages.get('html_url'),'source':pages.get('source'),'status':build.get('status'),'commit':build.get('commit'),'error':build.get('error')},ensure_ascii=False))
