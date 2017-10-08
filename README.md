Perform reverse image search and automatically download highest available
resolution image. This script is powered by Google.

Be warned that execution takes a bit of time, ~5 seconds per image on a
broadband connection.

# Install

For now this is just one little script, download `master.zip`,
extract `hifinder` and run it.

`hifinder` depends on PyGObject, you'll need to install bindings from your
distro's package manger. If you're on a Debian based distro, run:

`sudo apt install python3-gi gir1.2-webkit-3.0 gir1.2-glib-2.0`

The rest you can get with pip:

`pip3 install requests beautifulsoup4`

# Usage

Download higher-res versions of all jpg images to a subfolder 'Hi-Res':

`hifinder -sn 'Hi-Res' *.jpg`

Replace all png files with higher-res versions:

`highfinder -o *.png`
