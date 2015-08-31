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
    return {
        options: {
            singleQuotes: true,
        },
        app1: {
            files: {
                'dist/angular-gale.js' : ['dist/angular-gale.js']
            },
        }
    };
};
