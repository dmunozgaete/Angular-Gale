//------------------------------------------------------
// Company: Valentys Ltda.
// Author: dmunozgaete@gmail.com
// 
// Description: Clean a folder, (dist folder for example)
// 
// URL: https://github.com/alanshaw/grunt-include-replace
// 
/// NOTE: If you want to add dependdencies THIS IS THE FILE ;)!
//------------------------------------------------------
module.exports = function(grunt, options) {
    return {
        options: {
            base: 'src/js/components/',
            module: 'gale.templates',
            singleModule: true,
            useStrict: true,
            htmlmin: {
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true,
                removeEmptyAttributes: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true
            }
        },
        main: {
            src: ['src/js/components/**/*.tpl.html'],
            dest: 'src/gale_templates.js'
        }

    }
}
