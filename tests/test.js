// for qunit in nodejs
if (typeof require != 'undefined')
{
     if (typeof QUnit == 'undefined') {QUnit = require('qunit-cli');}
	 if (typeof UrlDict == 'undefined') {UrlDict = require("./../dist/urldict.js")}
}	

// return a dictionary with all method names and number of times they were called.
function set_coverage(obj)
{
    // return dictionary
    var ret = {};

    // function to wrap a method for coverage
    function wrap_method(obj, key)
    {
        // add to return dict
        ret[key] = 0;

        // copy the old function
        obj["__coverage_" + key] = obj[key];

        // create the wrapping function
        obj[key] = function()
        {
            // add counter
            ret[key]++;

            // call original function
            return obj["__coverage_" + key].apply(this, arguments);
        }
    }

    // set all object methods
    for (var key in obj)
    {
        if (typeof obj[key] === "function") {
            wrap_method(obj, key);
        }
    }

    // set all object prototype methods
    for (var key in obj.prototype)
    {
        if (typeof obj.prototype[key] === "function") {
            wrap_method(obj.prototype, key);
        }
    }

    // return the results dictionary
    return ret;
}
 
// add coverage to the UrlDict class
var covered = set_coverage(UrlDict);

// testing creating UrlDict objects with different params
QUnit.test( "basic creation", function( assert ) {

	// build with default current url
	var urlDict = new UrlDict();
	if (typeof location !== "undefined") {
		assert.equal(urlDict.toUrl(), location.href);
	}
  
});

// testing the first example from the readme file
QUnit.test( "example1", function( assert ) {

	// create a new urlDict object
	var urlDict = new UrlDict("www.example.com");
	
	// set url GET param
	urlDict.GET.set("a", 123);
	urlDict.GET.set("b", 456);
	
	// build url. output will be "www.example.com?a=123&b=456"
	assert.equal(urlDict.toUrl(), "www.example.com?a=123&b=456");
	
	// now set hash param
	urlDict.HASH.set("foo", "bar");
	
	// and now url output will be "www.example.com?a=123&b=456#foo=bar"
	assert.equal(urlDict.toUrl(), "www.example.com?a=123&b=456#foo=bar");
});

// testing the second example from the readme file
QUnit.test( "example2", function( assert ) {

	// build new url dict from url with GET and HASH params
	var urlDict = new UrlDict("www.example.com?a=123&b=456#foo=bar");
	
	// will output "123":
	assert.strictEqual(urlDict.GET.get("a"), 123);
	
	// will output "bar"
	assert.strictEqual(urlDict.HASH.get("foo"), "bar");
});

// print coverage percent
setTimeout(function()
{
	var covered_count = 0;
	var total = 0;
	var not_covered = [];
	for (var key in covered)
	{
		total++;
		if (covered[key] > 0)
		{
			covered_count++;
		}
		else
		{
			not_covered.push(key);
		}
	}

	if (not_covered.length === 0) not_covered = "None";
	var covered_percent = Math.round((covered_count / total) * 100.0);
	var not_covered_str = String(not_covered).replace(new RegExp(",", 'g'), ", ");
	if (typeof document != 'undefined')
	{
		document.getElementById("covered-percent").innerHTML = covered_percent;
		document.getElementById("not-covered").innerHTML = not_covered_str;
	}
	else
	{
		console.log("Covered percent: " + covered_percent + "%");
		console.log("Not covered: " + not_covered_str);
	}

}, 600);