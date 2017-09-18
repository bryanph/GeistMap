#!/bin/bash
set -e

npm run build
ssh graphtodo "cd graphtodo && git pull"
ssh graphtodo "cd graphtodo && npm install && npm prune"
ssh graphtodo "cd graphtodo && npm run clean"
scp stats.json graphtodo:graphtodo
scp -r public/*.bundle.js public/*.map public/fonts public/images graphtodo:graphtodo/public
ssh graphtodo "cd graphtodo && npm link full-auth-middleware"
ssh graphtodo "sudo systemctl restart geist.service"
echo Done!


