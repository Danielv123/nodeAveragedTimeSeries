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
			mergeMode: "average",
		});
		
		// generate some data
		series.add({key:"testThing", value:5});
		series.add({key:"testThing", value:4});
		setTimeout(()=>{
			series.add({key:"testThing", value:14});
			series.add({key:"testThing", value:11});
			series.add({key:"testThing", value:20});
			let data = series.get(20, "testThing")
			// console.log(data);
			
			let hasEntryWithValueOf4point5 = false;
			let hasEntryWithValueOf15 = false;
			data.dataPoints.forEach((entry)=>{
				if(entry.y == 4.5){
					hasEntryWithValueOf4point5 = true;
				}
				if(entry.y == 15){
					hasEntryWithValueOf15 = true;
				}
			});
			assert(hasEntryWithValueOf4point5, "One of the returned entries should have a value of 4.5");
			assert(hasEntryWithValueOf15, "One of the returned entries should have a value of 15");
			
			series.clear();
			assert.deepEqual(series.data, []);
			
			done();
		}, 200);
	});
	it("automatically expires data after some time", function(done){
		let series = new timeSeries({
			maxEntries:1,
			entriesPerSecond:10,
			mergeMode: "average",
		});
		
		// generate some data
		series.add({key:"testThing", value:5});
		
		// verify data is there
		let data = series.get(1, "testThing").dataPoints;
		assert(data[0].y == 5, "Data is not being stored correctly, expected to find 5");
		
		setTimeout(x=>{
			data = series.get(1, "testThing").dataPoints;
			assert(data[0].y == 0, "Data is not being erased, expected to find 0");
		
			done();
		},110);
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