module.exports = function(grunt) {

	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json');
		dirs: {
			obj: 'obj/Debug',
			bin: 'bin'
		},
		
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['Backbone.js', 'Attribute.js', 'Model.js', 'View.js', 'Collection.js'],
				dest: '<%= dirs.obj %>/<%= pkg.name %>-<%= pkg.version %>.concat.js'
			}
		},
		
		uglify: {
			options: {
			
			},
			build: {
				src: '<%= dirs.obj %>/<%= pkg.name %>.concat.js',
				dest: '<%= dirs.bin %>/<%= pkg.name %>-<%= pkg.version %>.min.js'
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	
	// Run concat and uglify by default.
	grunt.registerTask('default', ['concat', 'uglify']);
}