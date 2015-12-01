'use strict';

module.exports = function(grunt) {

  grunt.initConfig({

    // bower_components files that should be copied to public folder
    publBowerFiles: [
    ],


    // source files that should be copied to public folder
    publSrcFiles: [
      {
        cwd: 'client/src/',
        src: [
          'css/**/*',
          '!css/plovr.css',
          'doc/**/*'
        ],
        dest: 'client/public/',
        expand: true
      }
    ]



  });

  require('./tasks/util/reg-plovr-vars.js')(grunt);

  require('load-grunt-tasks')(grunt);
  grunt.loadTasks('tasks');




  grunt.registerTask('default', ['dev']);

};
