#!/bin/bash
set -e

npm run build
ssh graphtodo "mkdir -p graphtodo/tmp/public"
ssh graphtodo "cd graphtodo && git pull"
ssh graphtodo "cd graphtodo && npm install && npm prune"
scp stats.json graphtodo:graphtodo/tmp
scp -r public/*.bundle.js public/*.map public/fonts public/images graphtodo:graphtodo/tmp/public
ssh graphtodo "cd graphtodo && npm run clean"
ssh graphtodo "cp -r graphtodo/tmp/* graphtodo/"
ssh graphtodo "sudo systemctl restart geist.service"
ssh graphtodo "rm -rf graphtodo/tmp"
echo Done!


