'use strict';

const path			= require('path');
const _					= require('lodash');
const expect		= require('chai').expect;
const pckg			= require('../package');
const app				= require('../index')();
const test_util	= require('./util');

// -----------------------------------------------------------------------------

describe(`${pckg.name} Tests`, () => {
	
	let result;

	// ---------------------------------------------------------------------------
	
	describe('app.variable( line )', () => {

		it('should return undefined if "line" parameter not passed or is empty', () => {
			
			result = app.variable();
			
			expect( result ).to.be.undefined;
			
		});

		// -------------------------------------------------------------------------

		it('should return undefined if regex no match found', () => {
			
			result = app.variable('any string');
			
			expect( result ).to.be.undefined;
			
		});

		// -------------------------------------------------------------------------

		it('should return an object with keys "id", "name" and "value" if regex match found', () => {
			
			result = app.variable('$primary-color: #fff !default');
			
			test_util.verify.variable( result, 'primary-color', '#fff' );
			
		});
		
	});

	// ---------------------------------------------------------------------------

	describe('app.mixin( line )', () => {

		it('should return undefined if "line" parameter not passed or is empty', () => {
			
			result = app.mixin();
			
			expect( result ).to.be.undefined;
			
		});

		// -------------------------------------------------------------------------

		it('should return undefined if regex no match found', () => {
			
			result = app.mixin('any string');
			
			expect( result ).to.be.undefined;
			
		});

		// -------------------------------------------------------------------------

		it('should return an object with keys "name" and "parameters" if regex match found for a mixin', () => {
			
			result = app.mixin('=mixin_name($param)');
			
			test_util.verify.mixin( result, 'mixin_name', ['$param'] );
			
		});
		
	});

	// ---------------------------------------------------------------------------

	describe('app.function( line )', () => {

		it('should return undefined if "line" parameter not passed or is empty', () => {
			
			result = app.function();
			
			expect( result ).to.be.undefined;
			
		});

		// -------------------------------------------------------------------------

		it('should return undefined if regex no match found', () => {
			
			result = app.function('any string');
			
			expect( result ).to.be.undefined;
			
		});

		// -------------------------------------------------------------------------

		it('should return an object with keys "name" and "parameters" if regex match found for a function', () => {
			
			result = app.function('@function func_name( $param1, $param2 )');
			
			test_util.verify.function( result, 'func_name', ['$param1', '$param2'] );
			
		});
		
	});

	// ---------------------------------------------------------------------------
	
	describe('app.file( file )', () => {
		
		it('should return an object containing parsed file data (variables, mixins and functions)', () => {
			
			let file_path = test_util.fixture.path('mixed')();
			
			return app.file( file_path ).then( result => {
				
				let keys = {
					variables	: 'var',
					mixins		: 'mix',
					functions	: 'fn',
				};
				
				// ---------------------------------------------------------------------
	
				test_util.verify.object( result, _.keys( keys ) );

				// ---------------------------------------------------------------------
				
				_.forEach( keys, ( value, key ) => {
					
					test_util.verify.object(
						result[ key ],
						_.map( _.fill( Array(3), value ), (val, index) => `${val}_` + (index + 1) )
					);
						
				});
				
			});
				
		});
		
	});
	
});
