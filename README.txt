DataStore v0.3 for jQuery
Stores data for fast retrieval

Copyright (c) 2012 Tom Rodenberg <tarodenberg gmail com>
Dual licensed under the MIT or GPL Version 2 licenses.
http://jquery.org/license

Example Usage:
 var ds = new $.dataStore('Owner', 'Make', 'Model');
 ds.insert({Owner: "Joe", Make: "Honda", Model: "Accord", Year: 2006});
 ds.insert({Owner: "Sam", Make: "Toyota", Model: "Camry", Year: 2007});

 var resultFind = ds.find({Owner: "Sam", Make: "Toyota"});
 // resultFind = [{Owner: "Sam", Make: "Toyota", Model: "Camry", Year: 2007}]
   *
 var resultFirst = ds.first({Model: "Accord"});
 // resultFirst = {Owner: "Joe", Make: "Honda", Model: "Accord", Year: 2006}