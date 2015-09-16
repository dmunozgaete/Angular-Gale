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
    return {

        options: {
            shorthandCompacting: false,
            roundingPrecision: -1
        },
        target: {
            files: {
                'dist/angular-gale.min.css': ['src/**/*.css']
            }
        }


    }
};
