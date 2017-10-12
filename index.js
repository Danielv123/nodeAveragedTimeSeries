/** 
In memory timeseries database with averaged/summed values to reduce performance footprint
@author       Daniel Vestøl

@constructor
@param {object} options Options object, can be left as blank to use defaults
@param {function} [log] Logging function, can be left as undefined for no logging
@returns {object} timeSeries
*/

module.exports = function(options, log){
	if(log) log("Logging enabled!");
	/* {
		maxEntries: 100, // how long to store data before purging in ms
		entriesPerSecond: 2, // add up to not be too large
		mergeMode: "add", // how to merge entries that happens in the same "tick"
		data:{}
	}
	*/
	// this.data[Math.floor(Date.now() * options.entriesPerSecond / 1000) % options.maxEntries]
	// (Math.floor(Date.now() * options.entriesPerSecond / 1000) - Math.floor(x * options.entriesPerSecond / 1000)) % options.maxEntries
	if(typeof options != "object"){
		throw "ERROR: argument 1 should be an object with options";
	}
	if(!options.mergeMode) options.mergeMode = "add";
	if(!options.entriesPerSecond) options.entriesPerSecond = 1;
	if(!options.maxEntries) options.maxEntries = 3600; // default to provide an hour of stats
	this.options = options;
	
	if(options.data){
		this.data = options.data;
	} else {
		this.data = {};
	}
	let data = this.data;
	/**
	* Get current index in datastore array
	* @private
	* @param {number} date Unix epoch time in ms returned from Date.now();
	* @returns {number} index Current index in this.data
	*/
	this.getCurrentIndex = (date) => {
		return Math.floor( date * options.entriesPerSecond / 1000 ) % options.maxEntries;
	}
	/**
	 * Adds timeseries data to a collection
	 * 
	 * @example
	 * let series = new timeSeries();
	 * series.add({
	 *   key: "apples",
	 *   value: 3,
	 * });
	 * 
	 * @param {object} entry
	*/
	this.add = (entry) => {
		/* {
			key: "string",
			value: 134,
		}
		*/
		if(typeof entry.key == "string" && !this.data[entry.key]){
			this.data[entry.key] = [];
		}
		if(isNaN(Number(entry.value))) throw "ERROR: entry.value is NaN!";
		
		let currentIndex = this.getCurrentIndex(Date.now());
		let currentEntry = this.data[entry.key][currentIndex];
		if(!this.data[key]){
			this.data[key] = new Array(options.maxEntries);
		}
		if(currentEntry && !isNaN(Number(currentEntry))){
			this.data[entry.key][currentIndex] = Number(currentEntry) + Number(entry.value);
			
			// clear next index
			if(currentIndex < options.maxEntries){
				this.data[entry.key][currentIndex+1];
			} else {
				this.data[entry.key][0];
			}
		} else {
			this.data[entry.key][currentIndex] = Number(entry.value);
			
			// clear next index
			if(currentIndex < options.maxEntries){
				this.data[entry.key][currentIndex+1];
			} else {
				this.data[entry.key][0];
			}
		}
	}
	/**
	 * Retrieves timeseries data
	 * @public
	 * @param {number} datapoints the number of datapoints to retrieve, has to be less than size of collection
	 * @param {string} key name of collection to retrieve
	 * 
	 * @returns {array} of objects like [{key: "string", value: number}]
	*/
	this.get = (datapoints, key) => { // to defaults to Date.now
		if(typeof datapoints != "number"){
			throw "ERROR: Argument 1 is not a number!";
		}
		let to = Date.now();
		
		if(datapoints > options.maxEntries) throw "ERROR: Argument 1 datapoints is out of bounds!"
		
		let currentIndex = this.getCurrentIndex(Date.now());
		let readyObject = [];
		if(!this.data[key]){
			this.data[key] = new Array(options.maxEntries);
		}
		let Yaxis = 0;
		for(let i = currentIndex - datapoints; i < currentIndex; i++){
			let o = i;
			if(i < 0){
				o = i + options.maxEntries;
			}
			readyObject.push({
				y: this.data[key][o] || 0,
				x: Yaxis++,
			});
			/*
			readyObject.push({
				key:key,
				value:this.data[key][o]
			});*/
			
		}
		let xyz = {};
		xyz.name = key;
		xyz.type = "line";
		xyz.dataPoints = readyObject;
		return xyz;
		//return readyObject;
	}
	/**
	 * Clears all data
	*/
	this.clear = () => {
		this.data = [];
	}
}