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
	if (typeof location !== "undefined") {
		var urlDict = new UrlDict();
		assert.equal(urlDict.toUrl(), location.href);
	}
  
	// build with starting url
	var urlDict = new UrlDict("www.test.com");
	assert.equal(urlDict.getBaseUrl(), "www.test.com");
	assert.equal(urlDict.toUrl(), "www.test.com");
});

// parse params from url
QUnit.test( "parse params", function( assert ) {

	// build from url with lots of params and check the output dictionary
	var urlDict = new UrlDict('www.test.com?a="123"&b=bla&c=true&d=123#a=1&b="bla"&c=false&d=a1');
	assert.equal(urlDict.toUrl(), 'www.test.com?a=123&b=bla&c=true&d=123#a=1&b=bla&c=false&d=a1');
	assert.deepEqual(urlDict.asDict(), {
		GET: {
			a: "123",
			b: "bla",
			c: true,
			d: 123,
		},
		HASH: {
			a: 1,
			b: "bla",
			c: false,
			d: "a1",
		}
	});
	
	// now chage few params
	urlDict.GET.set("a", false);
	urlDict.HASH.set("aaa", "bbb");
	
	// make sure url is properly built
	assert.equal(urlDict.toUrl(), 'www.test.com?a=false&b=bla&c=true&d=123#a=1&b=bla&c=false&d=a1&aaa=bbb');
});

// using as dictionary
QUnit.test( "using as dict", function( assert ) {

	// build with starting url
	var urlDict = new UrlDict("www.test.com");
	
	// use as dictionary
	urlDict.asDict().GET["a"] = 123;
	urlDict.asDict().GET["b"] = true;
	urlDict.asDict().HASH["foo"] = "bar";
	urlDict.asDict().HASH["go"] = "abc";
	
	// convert to url
	assert.equal(urlDict.toUrl(), "www.test.com?a=123&b=true#foo=bar&go=abc");
});

// using the GET api
QUnit.test( "GET api", function( assert ) {

	// create url with params 
	var urlDict = new UrlDict('www.test.com?a="123"&b=bla&c=true&d=123#a=1&b="bla"&c=false&d=a1');
	assert.equal(urlDict.toUrl(), 'www.test.com?a=123&b=bla&c=true&d=123#a=1&b=bla&c=false&d=a1');
	
	// make sure GET as dict is correct
	assert.deepEqual(urlDict.GET.asDict(), {
		a: "123",
		b: "bla",
		c: true,
		d: 123,
	});
	
	// set url GET param
    urlDict.GET.set("a", 123);
	assert.deepEqual(urlDict.GET.asDict(), {
		a: 123,
		b: "bla",
		c: true,
		d: 123,
	});
	assert.equal(urlDict.toUrl(), 'www.test.com?a=123&b=bla&c=true&d=123#a=1&b=bla&c=false&d=a1');

    // get url GET param
    var a = urlDict.GET.get("a");
	assert.strictEqual(a, 123);

    // remove url GET param
    urlDict.GET.remove("a");
	assert.deepEqual(urlDict.GET.asDict(), {
		b: "bla",
		c: true,
		d: 123,
	});
	var a = urlDict.GET.get("a");
	assert.strictEqual(a, undefined);
	assert.equal(urlDict.toUrl(), 'www.test.com?b=bla&c=true&d=123#a=1&b=bla&c=false&d=a1');

    // clear all url GET params
    urlDict.GET.clear();
	assert.equal(urlDict.toUrl(), 'www.test.com#a=1&b=bla&c=false&d=a1');
	assert.deepEqual(urlDict.GET.asDict(), {});
});

// using the HASH api
QUnit.test( "HASH api", function( assert ) {

	// create url with params 
	var urlDict = new UrlDict('www.test.com?a="123"&b=bla&c=true&d=123#a=1&b="bla"&c=false&d=a1');
	assert.equal(urlDict.toUrl(), 'www.test.com?a=123&b=bla&c=true&d=123#a=1&b=bla&c=false&d=a1');
	
	// make sure HASH as dict is correct
	assert.deepEqual(urlDict.HASH.asDict(), {
		a: 1,
		b: "bla",
		c: false,
		d: "a1",
	});
	
	// set url HASH param
    urlDict.HASH.set("a", 123);
	assert.deepEqual(urlDict.HASH.asDict(), {
		a: 123,
		b: "bla",
		c: false,
		d: "a1",
	});
	assert.equal(urlDict.toUrl(), 'www.test.com?a=123&b=bla&c=true&d=123#a=123&b=bla&c=false&d=a1');

    // get url HASH param
    var a = urlDict.HASH.get("a");
	assert.strictEqual(a, 123);

    // remove url HASH param
    urlDict.HASH.remove("a");
	assert.deepEqual(urlDict.HASH.asDict(), {
		b: "bla",
		c: false,
		d: "a1",
	});
	var a = urlDict.HASH.get("a");
	assert.strictEqual(a, undefined);
	assert.equal(urlDict.toUrl(), 'www.test.com?a=123&b=bla&c=true&d=123#b=bla&c=false&d=a1');

    // clear all url HASH params
    urlDict.HASH.clear();
	assert.equal(urlDict.toUrl(), 'www.test.com?a=123&b=bla&c=true&d=123');
	assert.deepEqual(urlDict.HASH.asDict(), {});
});

// using clear all
QUnit.test( "clear all", function( assert ) {

	// build with starting url
	var urlDict = new UrlDict("www.test.com");
	
	// use as dictionary
	urlDict.asDict().GET["a"] = 123;
	urlDict.asDict().GET["b"] = true;
	urlDict.asDict().HASH["foo"] = "bar";
	urlDict.asDict().HASH["go"] = "abc";
	
	// convert to url
	assert.equal(urlDict.toUrl(), "www.test.com?a=123&b=true#foo=bar&go=abc");
	
	// now clear all and make sure it no longer have params
	urlDict.clearParams();
	assert.equal(urlDict.toUrl(), "www.test.com");
	assert.deepEqual(urlDict.asDict(), {GET: {}, HASH: {}});
});

// set / get base url
QUnit.test( "base url", function( assert ) {

	// build with starting url
	var urlDict = new UrlDict("www.test.com");
	
	// use as dictionary
	urlDict.asDict().GET["a"] = 123;
	urlDict.asDict().HASH["foo"] = "bar";
	
	// get base url
	assert.equal(urlDict.getBaseUrl(), "www.test.com");
	assert.equal(urlDict.toUrl(), "www.test.com?a=123#foo=bar");
	
	// set base url
	urlDict.setBaseUrl("www.foo.bar")
	assert.equal(urlDict.getBaseUrl(), "www.foo.bar");
	assert.equal(urlDict.toUrl(), "www.foo.bar?a=123#foo=bar");
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