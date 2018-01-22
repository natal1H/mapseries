#!/bin/bash

set -e

TARGET_DIR=$JBOSS_HOME/static

cd /build/edit
npm install
gulp
mkdir $TARGET_DIR/edit
cp -r css $TARGET_DIR/edit
cp -r data $TARGET_DIR/edit
cp -r img $TARGET_DIR/edit
cp -r dist $TARGET_DIR/edit
cp index.html $TARGET_DIR/edit

mkdir -p $TARGET_DIR/edit/node_modules/codemirror/lib
mkdir -p $TARGET_DIR/edit/node_modules/codemirror/addon/lint
mkdir -p $TARGET_DIR/edit/node_modules/codemirror/addon/dialog
cp node_modules/codemirror/lib/codemirror.css $TARGET_DIR/edit/node_modules/codemirror/lib/codemirror.css
cp node_modules/codemirror/addon/lint/lint.css $TARGET_DIR/edit/node_modules/codemirror/addon/lint/lint.css
cp node_modules/codemirror/addon/dialog/dialog.css $TARGET_DIR/edit/node_modules/codemirror/addon/dialog/dialog.css

mkdir -p $TARGET_DIR/edit/node_modules/handsontable/dist
cp node_modules/handsontable/dist/handsontable.full.css $TARGET_DIR/edit/node_modules/handsontable/dist/handsontable.full.css

mkdir -p $TARGET_DIR/edit/node_modules/mapbox-gl/dist
mkdir -p $TARGET_DIR/edit/node_modules/@mapbox/mapbox-gl-draw/dist
cp node_modules/mapbox-gl/dist/mapbox-gl.css $TARGET_DIR/edit/node_modules/mapbox-gl/dist/mapbox-gl.css
cp node_modules/@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css $TARGET_DIR/edit/node_modules/@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css

mkdir -p $TARGET_DIR/edit/node_modules/vex-js/dist/css
cp node_modules/vex-js/dist/css/vex.css $TARGET_DIR/edit/node_modules/vex-js/dist/css/vex.css
cp node_modules/vex-js/dist/css/vex-theme-os.css $TARGET_DIR/edit/node_modules/vex-js/dist/css/vex-theme-os.css

mkdir -p $TARGET_DIR/edit/node_modules/jstree/dist/themes/default
cp node_modules/jstree/dist/themes/default/style.min.css $TARGET_DIR/edit/node_modules/jstree/dist/themes/default/style.min.css
cp node_modules/jstree/dist/themes/default/*.gif $TARGET_DIR/edit/node_modules/jstree/dist/themes/default
cp node_modules/jstree/dist/themes/default/*.png $TARGET_DIR/edit/node_modules/jstree/dist/themes/default

mkdir -p $TARGET_DIR/edit/node_modules/jquery-ui/themes/base
cp node_modules/jquery-ui/themes/base/jquery-ui.css $TARGET_DIR/edit/node_modules/jquery-ui/themes/base/jquery-ui.css

# clean up after yourself
cd /
rm -rf /build/edit
