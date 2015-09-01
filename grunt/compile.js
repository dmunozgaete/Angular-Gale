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
        grunt.task.run('jshint');
        grunt.task.run('html2js');
        grunt.task.run('concat');
        grunt.task.run('ngAnnotate');
        grunt.task.run('uglify');
        grunt.task.run('cssmin');
        grunt.task.run('clean:post');

    };
    grunt.registerTask('compile', run);
}
