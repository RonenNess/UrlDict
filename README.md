# UrlDict

Micro lib (less than 2K!) to handle URL params like dictionaries.

Support GET params and Hash (if you want to use Fragment identifier to store a dictionary of values). Reliably build back URLs.

## Install

You can install via npm:

```
npm install urldict
```

Or bower:

```
bower install urldict
```

Or simply download the js files from /dist/ in this repo.

## Usage

Lets start with a simple example that covers most of it:

```JavaScript
	// create a new urlDict object
	var urlDict = new UrlDict("www.example.com");
	
	// set url GET param
	urlDict.GET.set("a", 123);
	urlDict.GET.set("b", 456);
	
	// build url. output will be "www.example.com?a=123&b=456"
	alert(urlDict.toUrl());
	
	// now set hash param
	urlDict.HASH.set("foo", "bar");
	
	// and now url output will be "www.example.com?a=123&b=456#foo=bar"
	alert(urlDict.toUrl());
```

Or if you want to get params from existing url:

```JavaScript
	// build new url dict from url with GET and HASH params
	var urlDict = new UrlDict("www.example.com?a=123&b=456#foo=bar");
	
	// will output "123":
	alert(urlDict.GET.get("a");
	
	// will output "bar"
	alert(urlDict.HASH.get("foo");
```

Note that UrlDict try to parse params using the JSON parser, which means that values like ```a=true``` will be returned as a boolean, and ```b=123``` as a number. However, there's a special exception that if the value is not a valid JSON string it will just treat it as string.

### Full API

To create a new UrlDict object:

```JavaScript
	// if 'url' is not provided, will use location.href instead.
	var urlDict = new UrlDict(url);
```

To build the full URL from UrlDict, use ```toUrl()```:

```JavaScript
	var url = urlDict.toUrl();
```

To get or set just the base URL, without the GET or Hash params, use ```getBaseUrl()``` and ```setBaseUrl()```:

```JavaScript
	// set the base url, eg the part before the GET and hash params:
	urlDict.setBaseUrl(newBaseUrl);
	
	// get the base url, eg the part before the GET and hash params:
	var baseUrl = urlDict.getBaseUrl();
```

To get a dictionary containing both GET and HASH params (objects are mutable and changing them will affect the urlDict), use ```asDict()```:

```JavaScript
	// get params as dictionary
	var params = urlDict.asDict();
	
	// show GET params
	console.log(params.GET);
	
	// show HASH params
	console.log(params.HASH);
	
	// to add a new GET param to url
	params.GET["a"] = 123;
```

#### GET and HASH

The main API to set / get URL params is via the ```GET``` and ```HASH``` objects. They share the same API:

```JavaScript
	// set url GET param
	urlDict.GET.set("a", 123);
	
	// get url GET param
	var a = urlDict.GET.get("a");
	
	// remove url GET param
	urlDict.GET.remove("a");
	
	// clear all url GET params
	urlDict.GET.clear();
```

The API above is the same for HASH object.

Or you can just get all params as a mutable dictionary (changing this dictionary will change the urlDict object):

```JavaScript
	// get all url GET params as a dictionary:
	var getParams = urlDict.GET.asDict();
	
	// change a url GET param
	getParams["a"] = 123;
```

## Tests & Browser support

urldict is fully testes on Node.js, IE7, Edge, Chrome, FireFox and Opera, and have 100% code coverage.

![BrowsersSupport](./misc/supported.png)

### Test in browsers

To test UrlDict in browsers just open the file `/tests/test.html` with the browser of your choice.

### Test in Node.js

To test in nodejs first install [qunit-cli](https://www.npmjs.com/package/qunit-cli):

```
npm install qunit-cli
```

Then you can run the following command from the project root:

```
qunit-cli tests/test.js
```

## License

UrlDict is distributed under the MIT license and is free to use for any personal or commercial purpose.
