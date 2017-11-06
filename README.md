# Sass Parser

A simple npm package to parse a `sass` file into a consumable `json` data

[![Build Status](https://img.shields.io/travis/bstashio/sass-parser/master.svg?style=flat-square)](https://travis-ci.org/bstashio/sass-parser)
[![Coverage Status](https://img.shields.io/coveralls/github/bstashio/sass-parser/master.svg?style=flat-square)](https://coveralls.io/github/bstashio/sass-parser?branch=master)
[![npm version](https://img.shields.io/npm/v/sass-parser.svg?style=flat-square)](http://npm.im/sass-parser)
[![Greenkeeper badge](https://img.shields.io/badge/Greenkeeper-enabled-brightgreen.svg?style=flat-square)](https://greenkeeper.io/)
[![MIT License](https://img.shields.io/npm/l/express.svg?style=flat-square)](http://opensource.org/licenses/MIT)


## Install

```
$ npm install sass-parser
```


## Usage

```js
const parse   = require('sass-parser')();

// parse variable
console.log( 'variable:' );
console.log( parse.variable( '$control-padding-vertical: calc(0.375em - 1px) !default' ) );

// parse mixin
console.log( 'mixin:' );
console.log( parse.mixin( '=arrow(   ,     )' ) );

// parse function
console.log( 'function:' );
console.log( parse.function( '@function     powerNumber        (    ,     )' ) );

// parse file
console.log( 'file:' );
parse.file('index.sass').then( data => console.log( data ) );
```


## Options


The following are the available default options:

```js
{
  regex: {
    variable: {
      pattern: '^\\$(.*?):\\s*([^;]+)\\s*([^;]+)\\!(global|default)',
      flags  : 'g',
    },
    mixin_name: {
      pattern: '^=((?!\\d)[\\w_-][\\w\\d_-]*)',
      flags  : 'gi',
    },
    mixin: {
      pattern: '^=((?!\\d)[\\w_-][\\w\\d_-]*)\\s*\\(\\s*([^\\)"]+)?.',
      flags  : 'gi',
    },
    function_name: {
      pattern: '^@function\\s*?((?!\\d)[\\w_-][\\w\\d_-]*)',
      flags  : 'gi',
    },
    function: {
      pattern: '^@function\\s*?((?!\\d)[\\w_-][\\w\\d_-]*)\\s*\\(\\s*([^\\)"]+)?.',
      flags  : 'gi',
    },
  },

  // ---------------------------------------------------------------------------
  
  line_by_line: {
    skipEmptyLines: true,
  },

  // ---------------------------------------------------------------------------
  
  keys: {
    
    variables: 'variables',
    variable : {
      id    : 'id',
      name  : 'name',
      value : 'value',
    },

    // -------------------------------------------------------------------------
    
    mixins: 'mixins',
    mixin : {
      name      : 'name',
      parameters: 'parameters',
    },

    // -------------------------------------------------------------------------
    
    functions: 'functions',
    function : {
      name      : 'name',
      parameters: 'parameters',
    },
    
  }
}
```

Example of using custom options:

```js
const parser = require('sass-parser')();
const parse  = parser({
  keys: {
    variables: 'vars',
    mixin: {
      parameters: 'param',
    },
    function: {
      name: 'fn',
    }
  }
});

parse.file('index.sass').then( data => console.log( data ) );
```


## License

MIT © [bstashio](https://github.com/bstashio)
