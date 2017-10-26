/** 
In memory timeseries database with averaged/summed values to reduce performance footprint
@author       Daniel Vestøl
@license	  MIT

@constructor
@param {object} [options] Options object, can be left as blank to use defaults, see index.spec.js for details
@param {number} [options.maxEntries] how many entries to store in the timeseries, defaults to 3600
@param {number} [options.entriesPerSecond] how many times a second to move the timeseries, default 1, can be less than 1 for slower updates
@param {string} [options.mergeMode] how to merge multiple entries in one tick, default is "average"
@param {object} [options.data] starting data for timeSeries, defaults to {}

@param {function} [log] Logging function, can be left as undefined for no logging
@returns {object} timeSeries
*/

module.exports = function(options, log){
	if(log) log("Logging enabled!");
	/* {
		maxEntries: 100, // how long to store data before purging in ms
		entriesPerSecond: 2, // add up to not be too large
		mergeMode: "average", // OR "add", how to merge entries that happens in the same "tick"
		data:{}
	}
	*/
	// this.data[Math.floor(Date.now() * options.entriesPerSecond / 1000) % options.maxEntries]
	// (Math.floor(Date.now() * options.entriesPerSecond / 1000) - Math.floor(x * options.entriesPerSecond / 1000)) % options.maxEntries
	if(typeof options != "object"){
		throw "ERROR: argument 1 should be an object with options";
	}
	if(!options.mergeMode) options.mergeMode = "average";
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
	* @param {Date} date Unix epoch time in ms returned from Date.now();
	* @returns {number} index Current index in this.data
	*/
	this.getCurrentIndex = (date) => {
		return Math.floor( date * options.entriesPerSecond / 1000 );
	}
	/**
	 * Adds timeseries data to a collection
	 * @public
	 * @example
	 * let series = new timeSeries();
	 * series.add({
	 *   key: "apples",
	 *   value: 3,
	 * });
	 * 
	 * @param {object} entry
	 * @param {string} entry.key what item to add
	 * @param {number} entry.value how much to add
	*/
	this.add = (entry) => {
		/* {
			key: "string",
			value: 134,
		}
		*/
		// input validation
		if(typeof entry.key == "string" && isNumber(entry.value)){
			
			if(!this.data[entry.key]){
				this.data[entry.key] = new Array(options.maxEntries);
			}
			
			let currentIndex = this.getCurrentIndex(Date.now());
			let currArray = this.data[entry.key];
			ensureDatastoreIsReady(entry.key, this);
			
			// actually update our database with a new average
			if(this.options.mergeMode == "average"){
				currArray.numberOfEntries++;
			} else if(this.options.mergeMode == "add"){
				currArray.numberOfEntries = 1;
			}
			currArray.valueOfEntries += Number(entry.value);
			currArray[currArray.length-1] = currArray.valueOfEntries / currArray.numberOfEntries;
		} else throw new Error("Invalid input entry, check that key is a string and value is a value")
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
			throw new Error("ERROR: Argument 1 is not a number!");
		}
		let to = Date.now();
		
		if(datapoints > options.maxEntries) throw new Error("ERROR: Argument 1 datapoints is out of bounds!");
		
		if(!this.data[key]){
			this.data[key] = new Array(options.maxEntries);
		}
		ensureDatastoreIsReady(key, this);
		
		let chartDataPoints = [];
		let Xaxis = 0;
		for(let i = this.data[key].length - datapoints; i < this.data[key].length; i++){
			let o = i;
			if(i < 0){
				o = i + options.maxEntries;
			}
			chartDataPoints.push({
				y: this.data[key][o] || 0,
				x: Xaxis++,
			});
			
		}
		let xyz = {};
		xyz.name = key;
		xyz.type = "line";
		xyz.dataPoints = chartDataPoints;
		return xyz;
		//return chartDataPoints;
	}
	/**
	 * Clears all data
	 * @public
	 * 
	 * @example
	 * new timeSeries().clear()
	*/
	this.clear = () => {
		this.data = [];
	}
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
function ensureDatastoreIsReady(key, that){
	let currentIndex = that.getCurrentIndex(Date.now());
	let currArray = that.data[key];
	
	if(!currArray.lastIndex) {
		// we are preparing a new database for a new key, add some stuff
		currArray.lastIndex = currentIndex;
		currArray.numberOfEntries = 0;
		currArray.valueOfEntries = 0;
	}	 
	if(currArray.lastIndex != currentIndex){
		// We are now working on averages for a new entry, shift the old ones and push a new entry
		for(let i = 0; i < currentIndex - currArray.lastIndex; i++){
			currArray.shift();
			currArray.push(undefined);
		}
		currArray.numberOfEntries = 0;
		currArray.valueOfEntries = 0;
		currArray.lastIndex = currentIndex;
	}
}