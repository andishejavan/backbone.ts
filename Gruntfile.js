module.exports = function(grunt) {

	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		license: grunt.file.read('LICENSE'),
		
		source:
			'src/Backbone.ts ' +
			'src/Attribute.ts ' +
			'src/Model.ts ' +
			'src/View.ts ' +
			'src/Collection.ts'
		,
		
		libraries:
			'/// <reference path="lib/jQuery-1.8.d.ts" />\r\n' +
			'/// <reference path="lib/underscore-1.4.d.ts" />'
		,
		
		dirs: {
			obj: 'obj/Debug',
			bin: 'bin'
		},
		
		exec: {
			tsc: {
				cmd: 'tsc --comments --declaration --out <%= pkg.name %>-<%= pkg.version %>.js <%= source %>'
			}
		},
		
		uglify: {
			options: {
			
			},
			build: {
				src: '<%= pkg.name %>-<%= pkg.version %>.js',
				dest: '<%= pkg.name %>-<%= pkg.version %>.min.js'
			}
		},
		
		concat: {
			definition: {		
				options: {
					// Include license and required library references into the definitions file.
					banner: '/*\r\n' +
							'<%= pkg.name %>-<%= pkg.version %>.ts may be freely distributed under the MIT license.\r\n' +
							'<%= license.toString() %>\r\n' +
							'*/\r\n\r\n' +
							'<%= libraries %>\r\n\r\n'
				},
				
				src: ['<%= pkg.name %>-<%= pkg.version %>.d.ts'],
				dest: '<%= pkg.name %>-<%= pkg.version %>.d.ts'
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	
	grunt.registerTask('default', ['exec:tsc', 'uglify', 'concat:definition']);
}