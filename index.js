'use strict';

const _							= require('lodash');
const line_by_line	= require('line-by-line');

// -----------------------------------------------------------------------------

const app = {};

// -----------------------------------------------------------------------------

/**
 * Default options are set here.
 * 
 * Can be extended when requiring the module by passing a custom options object.
 */
app.options = {
	
	regex: {
		variable: {
			pattern	: '^\\$(.*?):\\s*([^;]+)\\s*([^;]+)\\!(global|default)',
			flags		: 'g',
		},
		mixin_name: {
			pattern	: '^=((?!\\d)[\\w_-][\\w\\d_-]*)',
			flags		: 'gi',
		},
		mixin: {
			pattern	: '^=((?!\\d)[\\w_-][\\w\\d_-]*)\\s*\\(\\s*([^\\)"]+)?.',
			flags		: 'gi',
		},
		function_name: {
			pattern	: '^@function\\s*?((?!\\d)[\\w_-][\\w\\d_-]*)',
			flags		: 'gi',
		},
		function: {
			pattern	: '^@function\\s*?((?!\\d)[\\w_-][\\w\\d_-]*)\\s*\\(\\s*([^\\)"]+)?.',
			flags		: 'gi',
		},
	},

	// ---------------------------------------------------------------------------
	
	// @future_feature
	
	//variable_compiled_value: false, // get variable compiled value - requires node-sass

	// ---------------------------------------------------------------------------
	
	line_by_line: {
		skipEmptyLines: true,
	},

	// ---------------------------------------------------------------------------
	
	keys: {
		
		variables	: 'variables',
		variable	: {
			id		: 'id',
			name	: 'name',
			value	: 'value',
		},

		// -------------------------------------------------------------------------
		
		mixins: 'mixins',
		mixin	: {
			name			: 'name',
			parameters: 'parameters',
		},

		// -------------------------------------------------------------------------
		
		functions	: 'functions',
		function	: {
			name			: 'name',
			parameters: 'parameters',
		},
		
	}
	
};
// app.options

// -----------------------------------------------------------------------------

/**
 * Parses line to get sass variable
 * 
 * @param {string} line
 * @return {object}
 */
app.variable = ( line ) =>
{
	
	if ( ! line )
	{
		return;
	}

	// ---------------------------------------------------------------------------
	
	let regex	= app.options.regex.variable;
	let match = ( new RegExp( regex.pattern, regex.flags ) ).exec( line );
	
	if ( ! match || ! match[1] )
	{
		return;
	}

	// ---------------------------------------------------------------------------
	
	let keys= app.options.keys.variable;
	let out = {
		[keys.id]		: match[1],
		[keys.name]	: `$${match[1]}`,
		[keys.value]: match[2] || '',
	}

	// ---------------------------------------------------------------------------
	
	// @todo compiled value
	
	/*
	if ( app.options.variable_compiled_value )
	{
		
	}
	*/

	// ---------------------------------------------------------------------------
	
	out = _.mapValues( out, val => val.trim() );

	// ---------------------------------------------------------------------------

	return out;
	
}
// app.variable()



/**
 * Parses line to get sass mixin or function
 * 
 * @param {string} line
 * @return {object}
 */
app.chunk = ( line, what ) =>
{
	
	if ( ! line || ! what )
	{
		return;
	}

	// ---------------------------------------------------------------------------
	
	let regex = app.options.regex[`${what}_name`];
	let match = ( new RegExp( regex.pattern, regex.flags ) ).exec( line );
	
	if ( ! match || ! match[1] )
	{
		return;
	}

	// ---------------------------------------------------------------------------
	
	let keys= app.options.keys[ what ];
	let out	= {
		[keys.name]				: match[1].trim(),
		[keys.parameters]	: [],
	};

	// ---------------------------------------------------------------------------
	
	// this regex gets mixin/function name and parameters
	// if param don't exist no match is found
	// @consider doing it in a single regex
	
	regex = app.options.regex[ what ];
	match = ( new RegExp( regex.pattern, regex.flags ) ).exec( line );
	
	if ( match && match[2] )
	{
		out[keys.parameters] = match[2]
			.split(',')
			.map( param => param.trim() )
			.filter( param => param.length );
	}

	// ---------------------------------------------------------------------------

	return out;
	
}
// app.chunk()



/**
 * Parses line to get sass function
 * 
 * @param {string} line
 * @return {object}
 */
app.function = line => app.chunk( line, 'function' );



/**
 * Parses line to get sass mixin
 * 
 * @param {string} line
 * @return {object}
 */
app.mixin = line => app.chunk( line, 'mixin' );



/**
 * Parses a sass file line by line 
 * and populates returned data with variables, mixins and functions
 * 
 * @param {string} file
 * @return {promise}
 */
app.file = ( file ) =>
{
	
	return new Promise( (resolve, reject) => {
		
		try
		{
			let lr = new line_by_line( file, app.options.line_by_line );

			// -----------------------------------------------------------------------
			
			lr.on('error', err => reject( err ) );

			// -----------------------------------------------------------------------
			
			// @consider getting line numbers of parsed data to be used in file repo url
			/*
			let row		= 0;
			let raw		= [];
			*/

			// -----------------------------------------------------------------------
			
			let keys = app.options.keys;
			let data = {
				[keys.variables]: {},
				[keys.mixins]		: {},
				[keys.functions]: {},
			};

			// -----------------------------------------------------------------------
			
			//lr.on('open', () => console.log( '* reading %s', file ) );

			// -----------------------------------------------------------------------

			lr.on('line',  ( line ) => {
				
				// 1. check if variable
				
				let parsed = app.variable( line );

				if ( parsed )
				{
					data[ keys.variables ][ parsed[ keys.variable.id ] ] = parsed;
				}
				else
				{
					// 2. check function or mixin
					
					let is_function	= _.startsWith( line, '@function' );
					let what				= is_function ? 'function'  : 'mixin';
					parsed					= app[ what ]( line );
					
					if ( parsed )
					{
						let key = is_function ? keys.functions : keys.mixins;
						
						data[ key ][ parsed[ keys[ what ].name ] ] = parsed;
					}
				}
				
			});

			// -----------------------------------------------------------------------
			
			lr.on('end', () => resolve( data ) );
		}
		catch( err )
		{
			reject( err );
		}
		
	});
	
}
// app.file()

// -----------------------------------------------------------------------------

module.exports = options => {
	
	app.options = _.defaultsDeep( options, app.options );

	// ---------------------------------------------------------------------------
	
	return app;
	
};
