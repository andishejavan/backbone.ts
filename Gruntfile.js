module.exports = function(grunt) {

	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		dirs: {
			obj: 'obj/Debug',
			bin: 'bin'
		},
		
		exec: {
			tsc: {
				cmd: 'tsc --comments --declaration --out <%= pkg.name %>-<%= pkg.version %>.js Backbone.ts Attribute.ts Model.ts View.ts Collection.ts'
			},
			
			declarations: {
				cmd: 'tsc --out <%= pkg.name %>-<% pkg.version %>.d.ts --declaration Backbone.ts Attribute.ts Model.ts View.ts Collection.ts'
			}
		},
		
		uglify: {
			options: {
			
			},
			build: {
				src: '<%= pkg.name %>-<%= pkg.version %>.js',
				dest: '<%= pkg.name %>-<%= pkg.version %>.min.js'
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	
	grunt.registerTask('default', ['exec:tsc', 'uglify']);
}