//------------------------------------------------------
// Company: Valentys Ltda.
// Author: dmunozgaete@gmail.com
// 
// Description: Unify all into one 'big' file
// 
// URL: https://www.npmjs.com/package/grunt-contrib-concat
// 
/// NOTE: If you want to add dependdencies THIS IS THE FILE ;)!
//------------------------------------------------------
module.exports = function(grunt, options) {
    var conf = {
        production: {
            options: {
                separator: ';',
            },
            files: {
                'dist/angular-gale.js': [
                    'src/globals.js',
                    'src/gale_templates.js',
                    'src/gale.js',
                    'src/js/**/*.js'
                ],

                'dist/angular-gale.css': [
                    'src/**/*.css'
                ]
            }
        }
    };
    //---------------------------------------------------------------
    return conf;
};
