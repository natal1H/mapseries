#!/bin/bash

set -e

cd /build/edit
npm install
gulp
mkdir $CATALINA_HOME/webapps/edit
cp -r css $CATALINA_HOME/webapps/edit
cp -r data $CATALINA_HOME/webapps/edit
cp -r img $CATALINA_HOME/webapps/edit
cp -r dist $CATALINA_HOME/webapps/edit
cp index.html $CATALINA_HOME/webapps/edit

mkdir -p $CATALINA_HOME/webapps/edit/node_modules/codemirror/lib
mkdir -p $CATALINA_HOME/webapps/edit/node_modules/codemirror/addon/lint
mkdir -p $CATALINA_HOME/webapps/edit/node_modules/codemirror/addon/dialog
cp node_modules/codemirror/lib/codemirror.css $CATALINA_HOME/webapps/edit/node_modules/codemirror/lib/codemirror.css
cp node_modules/codemirror/addon/lint/lint.css $CATALINA_HOME/webapps/edit/node_modules/codemirror/addon/lint/lint.css
cp node_modules/codemirror/addon/dialog/dialog.css $CATALINA_HOME/webapps/edit/node_modules/codemirror/addon/dialog/dialog.css

mkdir -p $CATALINA_HOME/webapps/edit/node_modules/handsontable/dist
cp node_modules/handsontable/dist/handsontable.full.css $CATALINA_HOME/webapps/edit/node_modules/handsontable/dist/handsontable.full.css

mkdir -p $CATALINA_HOME/webapps/edit/node_modules/mapbox-gl/dist
mkdir -p $CATALINA_HOME/webapps/edit/node_modules/@mapbox/mapbox-gl-draw/dist
cp node_modules/mapbox-gl/dist/mapbox-gl.css $CATALINA_HOME/webapps/edit/node_modules/mapbox-gl/dist/mapbox-gl.css
cp node_modules/@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css $CATALINA_HOME/webapps/edit/node_modules/@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css

mkdir -p $CATALINA_HOME/webapps/edit/node_modules/vex-js/dist/css
cp node_modules/vex-js/dist/css/vex.css $CATALINA_HOME/webapps/edit/node_modules/vex-js/dist/css/vex.css
cp node_modules/vex-js/dist/css/vex-theme-os.css $CATALINA_HOME/webapps/edit/node_modules/vex-js/dist/css/vex-theme-os.css

mkdir -p $CATALINA_HOME/webapps/edit/node_modules/jstree/dist/themes/default
cp node_modules/jstree/dist/themes/default/* $CATALINA_HOME/webapps/edit/node_modules/jstree/dist/themes/default

mkdir -p $CATALINA_HOME/webapps/edit/node_modules/jquery-ui/themes/base
cp node_modules/jquery-ui/themes/base/jquery-ui.css $CATALINA_HOME/webapps/edit/node_modules/jquery-ui/themes/base/jquery-ui.css

# clean up after yourself
cd /
rm -rf /build/edit
