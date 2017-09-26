

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
	
	function getCurrentIndex(date){
		return Math.floor( date * options.entriesPerSecond / 1000 ) % options.maxEntries;
	}
	function getOriginIndex(x){
		return (Math.floor(Date.now() * options.entriesPerSecond / 1000) - Math.floor(x * options.entriesPerSecond / 1000)) % options.maxEntries
	}
	this.add = function(entry){
		/* {
			key: "string",
			value: 134,
		}
		*/
		if(typeof entry.key == "string" && !this.data[entry.key]){
			this.data[entry.key] = [];
		}
		if(isNaN(Number(entry.value))) throw "ERROR: entry.value is NaN!";
		
		let currentIndex = getCurrentIndex(Date.now());
		let currentEntry = this.data[entry.key][currentIndex];
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
	this.get = function(datapoints, key){ // to defaults to Date.now
		if(typeof datapoints != "number"){
			throw "ERROR: Argument 1 is not a number!";
		}
		let to = Date.now();
		
		if(datapoints > options.maxEntries) throw "ERROR: Argument 1 datapoints is out of bounds!"
		
		let originIndex = getOriginIndex(datapoints);
		let currentIndex = getCurrentIndex(Date.now());
		let readyObject = [];
		for(let i = currentIndex - datapoints; i < currentIndex; i++){
			let o = i;
			if(i < 0){
				o = i + options.maxEntries;
			}
			readyObject.push({
				key:key,
				value:this.data[key][o]
			});
			
		}
		return readyObject;
	}
	this.clear = function(){
		this.data = [];
	}
}