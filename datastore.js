(function($){
/**
 * DataStore v0.3 for jQuery
 * Stores data for fast retrieval
 *
 * Copyright (c) 2012 Tom Rodenberg <tarodenberg gmail com>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */
 
/**
 * Example Usage:
 *   var ds = new $.dataStore('Owner', 'Make', 'Model');
 *   ds.insert({Owner: "Joe", Make: "Honda", Model: "Accord", Year: 2006});
 *   ds.insert({Owner: "Sam", Make: "Toyota", Model: "Camry", Year: 2007});
 *
 *   var resultFind = ds.find({Owner: "Sam", Make: "Toyota"});
 *   // resultFind = [{Owner: "Sam", Make: "Toyota", Model: "Camry", Year: 2007}]
 *
 *   var resultFirst = ds.first({Model: "Accord"});
 *   // resultFirst = {Owner: "Joe", Make: "Honda", Model: "Accord", Year: 2006}
 */

/**
 * DataStore $.dataStore()
 * DataStore $.dataStore(string columnName1, string columnName2)
 */
$.dataStore = function() {
  var ds = new DataStore();

  //Check for columns
  if(arguments.length > 0) {
    ds.allIndex = false;
    for(var i = 0; i < arguments.length; i++) {
      ds.createColumn(arguments[i]);
    }
  }

  return ds;
}

  /**
   * DataStore - Stores your data
   */
  function DataStore() {
    this.columns = [];
    this.all = [];
    this.length = 0;
    this.sorted = false;
    this.allIndex = true;
  }

  /**
   * Inserts an object into the data store
   * after checking if it previously exists
   */
  DataStore.prototype.insertUnique = function(data) {
    // do find to determine if data entry exists
    var find = this.find(data);
    if(find && find.length > 0) {
      return false;
    }
    this.insert(data);
  }

  /**
   * Updates the first matching record,
   * otherwise inserts new record
   */
  DataStore.prototype.update = function(data) {
    var first = this.first(data);
    if(first) {
      $.extend(first, data);
    }
    else {
      this.insert(data);
    }
  }

  /**
 * Import data into this Data Store
 * void import(Array[Object] data, [optional] Object tag)
 */
  DataStore.prototype.importData = function(data, tag) {
    for(var i in data) {
      var x = data[i];
      if(tag) {
        $.extend(x, tag);
      }
      this.insert(x);
    }

    this.columns.sort(columnSort);
    this.sorted = true;
  }

  /**
   * Inserts data into the data store
   */
  DataStore.prototype.insert = function(data) {
    // Add data to indexed data object
    for(var i in data) {
      // Add reference to each indexed column
      var column = this.allIndex ? this.createColumn(i) : this.getColumn(i);
      if(column) {
        var val = objectToString(data[i]);
        if(val) {
          column.add(val, data);
        }
      }
    }

    // Add data to unindexed array
    this.all[this.length] = data;
    ++this.length;

    this.sorted = false;
  }

  /**
   * Returns an indexed column, otherwise null if it doesn't exist
   */
  DataStore.prototype.getColumn = function(name) {
    for(var i in this.columns) {
      var column = this.columns[i];
      if(column.name == name) {
        return column;
      }
    }
    //return null;
  }

  /**
   * Returns the column or a new column if non-existant
   */
  DataStore.prototype.createColumn = function(name) {
    var column = this.getColumn(name);
    if(!column) {
      column = new DataStoreColumn(name);
      this.columns.push(column);
    }
    return column;
  }

  /**
   * Return only first match
   */
  DataStore.prototype.first = function(data) {
    var results = this.find(data);
    if(results && results.length > 0) {
      return results[0];
    }
    // return null;
  }

  /**
   * Sort columns by length in descending order
   */
  DataStore.prototype.checkSort = function() {
    if(!this.sorted) {
      this.columns.sort(columnSort);
      this.sorted = true;
    }
  }

  /**
   * Finds all occurences that match the supplied object
   */
  DataStore.prototype.find = function(data) {
    this.checkSort();
    
    // Retrieve indexed arrays
    var arr = [];
    for(var i in data) {
      // Test if data was storable
      var val = objectToString(data[i]);
      if(val == null) {
        return;
      }
		
      // Test if index exists
      var column = this.getColumn(i);
      if(column != null && column.length > 0) {
        var index = column.index[val];
        if(index == null) {
          return;
        }

        var index_n = index.length;
        if(index_n == 0) {
          return;
        }

        if(index_n < this.length || arr.length == 0) {
          arr.push(index);
        }
      }
    }
    
    // Retrieve the intersection of all indexed arrays
    return getIntersect(arr);
  }

  function DataStoreColumn(name) {
    // Number of items in index
    this.length = 0;
    this.index = {};
    this.name = name;
  }

  DataStoreColumn.prototype.add = function(val, data) {
    var arr = this.index[val];
    if(arr) {
      arr.push(data);
    }
    else {
      this.index[val] = [data];
      this.length++;
    }
  }

  /**
   * Gets the intersection of n-number of arrays.
   * Returns array of items present in all arrays
   * arr getIntersect(arr[])
   * arr getIntersect(arr1, arr2, ...)
   */
  var getIntersect = function() {
    var arg_n = arguments.length;
    if(arg_n == 0) {
      return null;
    }
    if(arg_n == 1) {
      var a = arguments[0], a_n = a.length;
      if(a_n == null || a_n == 0) {
        return [];
      }
      if(a_n == 1) {
        return a[0];
      }
      return getIntersect.apply(this, a);
    }
    var arr = $.makeArray(arguments[0]);
    for(var i = 1; i < arg_n; i++) {
      var x = arguments[i];
      // remove items in arr that don't intersect current array x
      if(x == null) {
        return [];
      }
      arr = $.grep(arr, function(val) {
        return $.inArray(val, x) != -1;
      });
    }
    return arr;
  }

  /**
   * Constant array of storable types
   */
  var STORABLE_TYPES = ['string','number','boolean','date'];

  /**
   * Determine if an object type is storable in this data store
   */
  var isObjectStorable = function(obj) {
    if(obj == null) {
      return true;
    }
    return $.inArray(typeof(obj), STORABLE_TYPES) != -1;
  }

  /**
   * Converts an object to its string representation
   */
  var objectToString = function(obj) {
    if(obj == null) 
    {
      return 'null';
    }
    if(!isObjectStorable(obj)) {
      return null;
    }
    var str = obj.toString();
    if(str == '') {
      str = '\t';
    }
    return str;
  }

  /**
   * Sorts DataStoreColumns in descending length order
   */
  var columnSort = function(a,b) {
    return b.length - a.length;
  }

})(jQuery);
