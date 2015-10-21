//------------------------------------------------------
// Company: Valentys Ltda.
// Author: dmunozgaete@gmail.com
// 
// Description: Minify and unify javascript or css files
// 
// URL: https://www.npmjs.com/package/grunt-contrib-uglify
// 
// NOTE: If you want to add dependencies , GO TO CONCAT.JS
//------------------------------------------------------
module.exports = function(grunt, options) {

    var bower = grunt.file.readJSON('bower.json');
    var banner = grunt.template.process(grunt.file.read('banner.txt'),
    {
        data:
        {
            authors: bower.authors[0],
            description: bower.description,
            homepage: bower.homepage,
            version: bower.version
        }
    });


    var conf = {
        gale: {
            options: {
                banner: banner,
                compress: true,
                mangle: false,
                sourceMap: true
            },
            files :{
                'dist/angular-gale.min.js': [
                    'dist/**/*.js'
                ]
            }
        }
    };
    return conf;
};
