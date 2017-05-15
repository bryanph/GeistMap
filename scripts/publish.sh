#!/bin/bash
npm run build
ssh graphtodo "cd graphtodo && npm run clean"
scp stats.json graphtodo:graphtodo
scp public/*.bundle.js public/*.map graphtodo:graphtodo/public
ssh graphtodo "sudo systemctl restart geist.service"
echo Done!


