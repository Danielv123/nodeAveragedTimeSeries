This is a tiny in memory non persistent database library. It is made for aggregating timeseries data and storing it as averages/sums. Example usage:

See index.spec.js for more examples.

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## index

In memory timeseries database with averaged/summed values to reduce performance footprint

**Parameters**

-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Options object, can be left as blank to use defaults, see index.spec.js for details
-   `log` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)?** Logging function, can be left as undefined for no logging

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** timeSeries

**Meta**

-   **author**: Daniel Vestøl

### add

Adds timeseries data to a collection

**Parameters**

-   `entry` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

**Examples**

```javascript
let series = new timeSeries();
series.add({
  key: "apples",
  value: 3,
});
```

### get

Retrieves timeseries data

**Parameters**

-   `datapoints` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** the number of datapoints to retrieve, has to be less than size of collection
-   `key` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** name of collection to retrieve

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** of objects like [{key: "string", value: number}]

### clear

Clears all data
