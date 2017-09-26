
This is a tiny in memory non persistent database library. It is made for aggregating timeseries data and storing it as averages/sums. Example usage:

	let series = new timeSeries({
		maxEntries:20,
		entriesPerSecond:10,
		mergeMode: "add",
	});
	
	series.add({key:"testThing", value:5});
	series.add({key:"testThing", value:4});
	setTimeout(()=>{
		series.add({key:"testThing", value:14});
		series.add({key:"testThing", value:11});
		
		let data = series.get(20, "testThing");
	}
	/* Returns:
	[ { key: 'testThing', value: 25 },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: undefined },
	  { key: 'testThing', value: 9 },
	  { key: 'testThing', value: undefined } ]
	*/

Note how values submitted in the same 10th second time period are summed together. This is great for displaying on graphs and other applications that don't require high resolution.

See index.spec.js for more examples.