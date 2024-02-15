#!/bin/bash
set -e

APP_VERSION=$(jq -r .version package.json)
NODE_VERSION="20.11.1"

npm run build
mkdir -p "dist/.cache/v$NODE_VERSION"

linux () {
	echo "Packing release for linux-$1..."

	if [ ! -f "dist/.cache/v$NODE_VERSION/linux-$1" ]; then
		echo "  Downloading node..."
		DLDIR=$(mktemp -d)
		wget -q -O "$DLDIR/node.tar.xz" "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-$1.tar.xz"
		tar -xf "$DLDIR/node.tar.xz" -C "$DLDIR"

		cp "$DLDIR/node-v$NODE_VERSION-linux-$1/bin/node" "dist/.cache/v$NODE_VERSION/linux-$1"
		rm -rf "$DLDIR"
	fi

	echo "  Copying files..."
	TMPDIR=$(mktemp -d)
	mkdir "$TMPDIR/dist"

	cp package.json README.md LICENSE "$TMPDIR/dist"
	cp release/run_scripts/linux.sh "$TMPDIR/run.sh"
	cp -r build "$TMPDIR/dist"
	cp "dist/.cache/v$NODE_VERSION/linux-$1" "$TMPDIR/dist/node"
	chmod +x "$TMPDIR/run.sh" "$TMPDIR/dist/node"

	echo "  Creating zip..."
	rm -f "dist/tgar-twitch-rating-v$APP_VERSION-linux-$1.zip"
	7z -y a "dist/tgar-twitch-rating-v$APP_VERSION-linux-$1.zip" "$TMPDIR/*" > /dev/null
	rm -rf "$TMPDIR"
}

mac () {
	echo "Packing release for mac-$1..."

	if [ ! -f "dist/.cache/v$NODE_VERSION/darwin-$1" ]; then
		echo "  Downloading node..."
		DLDIR=$(mktemp -d)
		wget -q -O "$DLDIR/node.tar.xz" "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-darwin-$1.tar.xz"
		tar -xf "$DLDIR/node.tar.xz" -C "$DLDIR"

		cp "$DLDIR/node-v$NODE_VERSION-darwin-$1/bin/node" "dist/.cache/v$NODE_VERSION/darwin-$1"
		rm -rf "$DLDIR"
	fi

	echo "  Copying files..."
	TMPDIR=$(mktemp -d)
	mkdir "$TMPDIR/dist"

	cp package.json README.md LICENSE "$TMPDIR/dist"
	cp release/run_scripts/mac.command "$TMPDIR/run.command"
	cp -r build "$TMPDIR/dist"
	cp "dist/.cache/v$NODE_VERSION/darwin-$1" "$TMPDIR/dist/node"
	chmod +x "$TMPDIR/run.command" "$TMPDIR/dist/node"

	echo "  Creating zip..."
	rm -f "dist/tgar-twitch-rating-v$APP_VERSION-mac-$1.zip"
	7z -y a "dist/tgar-twitch-rating-v$APP_VERSION-mac-$1.zip" "$TMPDIR/*" > /dev/null
	rm -rf "$TMPDIR"
}

win () {
	echo "Packing release for win-$1..."

	if [ ! -f "dist/.cache/v$NODE_VERSION/win-$1" ]; then
		echo "  Downloading node..."
		wget -q -O "dist/.cache/v$NODE_VERSION/win-$1.exe" "https://nodejs.org/dist/v$NODE_VERSION/win-$1/node.exe"
	fi

	echo "  Copying files..."
	TMPDIR=$(mktemp -d)
	mkdir "$TMPDIR/dist"

	cp package.json README.md LICENSE "$TMPDIR/dist"
	cp release/run_scripts/win.bat "$TMPDIR/run.bat"
	cp -r build "$TMPDIR/dist"
	cp "dist/.cache/v$NODE_VERSION/win-$1.exe" "$TMPDIR/dist/node.exe"

	echo "  Creating zip..."
	rm -f "dist/tgar-twitch-rating-v$APP_VERSION-win-$1.zip"
	7z -y a "dist/tgar-twitch-rating-v$APP_VERSION-win-$1.zip" "$TMPDIR/*" > /dev/null
	rm -rf "$TMPDIR"
}

linux x64
linux armv7l
linux arm64
mac x64
mac arm64
win x86
win x64
win arm64