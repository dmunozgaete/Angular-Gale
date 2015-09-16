module.exports = function(grunt, options) {

    var conf = {
        options: {
            curly: true,
            eqeqeq: true,
            eqnull: true,
            browser: true,
            validthis: true,
            devel: true
        },

        components: {
            src: [
                'src/js/components/**/*.js'
            ]
        },

        directives: {
            src: [
                'src/js/directives/**/*.js'
            ]
        },

        filters: {
            src: [
                'src/js/filters/**/*.js'
            ]
        },

        services: {
            src: [
                'src/js/services/**/*.js'
            ]
        },

        global: {
            src: [
                'src/gale.js',
                'src/globals.js'
            ]
        }
    };

    if(!grunt.option('report')){
        conf.options["reporter"] = require('jshint-stylish');
    }

    return conf;
};