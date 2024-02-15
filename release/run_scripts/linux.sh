#!/bin/sh
if [ -t 0 ] ; then
	chmod +x dist/node
	PUBLIC_APP_URL=http://localhost:3000 OPEN_BROWSER=1 dist/node dist/build
else
	x-terminal-emulator -e ./run.sh
fi