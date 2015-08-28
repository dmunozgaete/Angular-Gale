//------------------------------------------------------
// Company: Valentys Ltda.
// Author: dmunozgaete@gmail.com
// 
// Description: Optimize Files for Production
//------------------------------------------------------
module.exports = function(grunt, options) {
    var run = function() {
        //-----------------------------------------------------------------------------
        grunt.task.run('clean:dist');
        grunt.task.run('concat');
        grunt.task.run('uglify');
        grunt.task.run('cssmin');
        //grunt.task.run('injector:production');

    };
    grunt.registerTask('build', run);
}
