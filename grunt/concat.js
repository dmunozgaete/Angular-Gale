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
module.exports = function(grunt, options)
{

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
        production:
        {
            options:
            {
                separator: ';',
                banner: banner
            },
            files:
            {
                'dist/angular-gale.js': [
                    'src/globals.js',
                    'src/gale_templates.js',
                    'src/gale.js',
                    'src/js/**/*.js'
                ]
            }
        }
    };
    //---------------------------------------------------------------
    return conf;
};
