'use strict';

var fs            = require( 'fs' );
var path          = require( 'path' );
var config        = require( './config' );
var creditUtil    = require( './lib/credit' );
var packageUtil   = require( './lib/package' );
var analyzersUtil = require( './lib/analyzers' );
var Promise       = require( 'es6-promise' ).Promise;

/**
 * Read project root and evaluate dependency credits
 * for all supported package managers
 *
 * @param  {String} projectPath  absolute path to project root
 * @param  {Array}  analyzers    list of availalbe analyzers
 *
 * @return {Array}               list of credits
 *
 * @tested
 */
function readDirectory( projectPath, analyzers ) {
  var credits = {};
  var keys = Object.keys( analyzers );

  const promises = keys.map( analyzer => analyzers[ analyzer ]( projectPath ) );

  return Promise.all(promises)
    .then(res => {
      res.forEach((res, i) => {
        credits[ keys[i] ] = res.sort( function( a, b ) {
          return b.packages.length - a.packages.length;
        } );
      });
      return credits;
    });
}

module.exports = function( projectPath ) {
  var analyzers = analyzersUtil.getAnalyzers( config );

  if ( fs.existsSync( projectPath ) ) {
    return readDirectory( projectPath, analyzers );
  }
  return Promise.reject(new Error( projectPath + ' does not exist' ));
};
