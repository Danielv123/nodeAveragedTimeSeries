const assert = require("assert");
const timeSeries = require("./index.js");

describe("index.js", function(){
	it("is a construictor function with a few methods to it", function(){
		let series = new timeSeries({});
		assert(typeof series == "object");
		assert(typeof series.add == "function");
		assert(typeof series.get == "function");
		assert(typeof series.clear == "function");
		assert.deepEqual(series.data, {}, "Should be an empty object")
	});
	it("stores data", function(done){
		let series = new timeSeries({
			maxEntries:20,
			entriesPerSecond:10,
			mergeMode: "add",
		});
		
		// generate some data
		series.add({key:"testThing", value:5});
		series.add({key:"testThing", value:4});
		setTimeout(()=>{
			series.add({key:"testThing", value:14});
			series.add({key:"testThing", value:11});
			let data = series.get(20, "testThing")
			// console.log(data);
			
			let hasEntryWithValueOf9 = false;
			let hasEntryWithValueOf25 = false;
			data.forEach((entry)=>{
				if(entry.value == 9){
					hasEntryWithValueOf9 = true;
				}
				if(entry.value == 25){
					hasEntryWithValueOf25 = true;
				}
			});
			assert(hasEntryWithValueOf9, "One of the returned entries should have a value of 9");
			assert(hasEntryWithValueOf25, "One of the returned entries should have a value of 25");
			
			series.clear();
			assert.deepEqual(series.data, []);
			
			done();
		}, 200);
	});
	it("throws if the first argument isn't an options object", function(){
		assert.throws(function(){
			let series = new timeSeries();
		}, "ERROR: argument 1 should be an object with options");
	});
	it("logs if you send a log function as the second argument", function(){
		let logFunctionCalled = false;
		function logFunction(string){
			assert(typeof string == "string");
			logFunctionCalled = true;
		}
		
		let series = new timeSeries({}, logFunction);
		assert(logFunctionCalled, "It should call the log function once when running the constructor");
	});
	it("throws lots of errors if you don't call it with proper clean arguments", function(){
		let series = new timeSeries({
			maxEntries:20,
			entriesPerSecond:10,
		});
		
		assert.throws(function(){
			series.get("not a number");
		}, "ERROR: Argument 1 is not a number!");
		
		assert.throws(function(){
			series.add({key:"validKey", value:"invalidValue"});
		}, "ERROR: entry.value is NaN!");
	});
	it("timeSeries.get requires argument 1 to be lower than database size", function(){
		let series = new timeSeries({
			maxEntries:20,
			entriesPerSecond:10,
		});
		
		assert.throws(function(){
			series.get(9999);
		}, "ERROR: Argument 1 datapoints is out of bounds!");
	});
});