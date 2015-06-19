# Mapseries

* Web application for cataloguing mapseries
* Able to automatically fill map sheet metadata and copy it to clipboard for another cataloguing software, e.g. Aleph.

## Add new map series
Read [manual](client/src/doc/navod.docx). Or briefly:
1. Prepare ShapeFile with map sheets.
  - Each map sheet should be one polygon.
  - Table must have at least SHEET and TITLE columns.
      SHEET contains unique ID of the sheet within map series.
      TITLE contains sheet title
  - Table might have another attributes, that can be used for filling the
      template.
2. Add the ShapeFile as a new layer to GeoServer running at
    http://mapseries.georeferencer.org/geoserver
  Use mapseries workspace.
3. Create template file in /templates direcory. Find an inspiration in the
    existing ah-ms3-200.txt template.
4. Add map series metadata to the config.js. Specify at least
    - title: map series title
    - layer: name of the GeoServer layer
    - template: template file created in step 3
5. Get beer

## Development

### Requirements
* [Java 7 or higher](http://www.java.com/)
  * Windows users: `path/to/directory/with/java.exe` must be in your PATH system variable
* [Python 2.7](https://www.python.org/downloads/) (32bit or 64bit; must correspond with node.js because of node-gyp)
  * Windows users: `path/to/python/directory` and `path/to/python/directory/Scripts` must be in your PATH system variable
* [node.js](http://nodejs.org/download/) (32bit or 64bit; must correspond with Python 2.7 because of node-gyp)
* [grunt](http://gruntjs.com/) `npm install -g grunt-cli`
* [bower](http://bower.io/) `npm install -g bower`
* [git](http://git-scm.com/downloads)
  * Windows users: `path/to/directory/with/git.exe` must be in your PATH system variable

### Installation
```
git clone https://github.com/klokan/mapseries-temap.git mapseries
cd mapseries
npm install
bower install
sudo grunt install (Linux) / grunt install (Windows)
```
#### Problems with installation
Windows users: If you have some errors during `npm install` related to [node-gyp](https://github.com/TooTallNate/node-gyp), you will probably need to install [Microsoft Visual Studio C++ 2012 Express for Windows Desktop](http://www.microsoft.com/en-us/download/details.aspx?id=34673) and run the installation again.

### Development
* `grunt` to run dev server and open mapseries.html in web browser
  * Edit e.g. content of `client/src/js/webpages/mapseries.js` and see changes in the browser
* `grunt lint` to run gjslint
* `grunt fix` to run fixjsstyle

### Build
* `grunt build` to compile the code and copy files to `client/public`
* `grunt build --map` to include also [source maps](https://developer.chrome.com/devtools/docs/javascript-debugging#source-maps)

Based on [ol3ds](https://github.com/jirik/ol3ds).