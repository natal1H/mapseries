Mapseries
=====================
Application for cataloguing map series.
It is able to automatically fill map sheet metadata
and copy it to clipboard for another cataloguing software, e.g. Aleph.

Add new map series
=====================
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

Development
=====================
1. Download Plovr: http://plovr.com/
2. Download OpenLayers 2 externs:
    https://github.com/jirik/closure-externs
3. Update path to OpenLayers 2 externs in mapseries.json
4. Run
  java -jar plovr.jar serve path/to/debug-mapseries.json

Deployment
=====================
1. Run
  java -jar plovr.jar build path/to/mapseries.json > path/to/deploy/mapseries.js
