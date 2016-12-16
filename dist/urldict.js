/**
* Micro lib to convert URL to dictionary of GET / HASH params and vice-versa.
*
* Author: Ronen Ness.
* Since: 2016.
*/

(function()
{
    "use strict";

    /**
    * Create a new URL dictionary object.
    * @param url {string} url to create dictionary from, or undefined to use location.href.
    */
    function UrlDict(url)
    {
		// if no url was provided and location is undefined (node.js) assert
		if (url === undefined && typeof location === "undefined")
		{
			throw new Error("On platforms where global 'location' is not defined you must provide a base URL when creating a new UrlDict object.");
		}
		
        // get default url
        url = url || location.href;

        // sanity checks - since we don't support question marks or hash inside the params, if there's more than 1
        // question mark or more than one hash, throw exception.
        if (url.split("?").length - 1 > 1) {
            throw new Error("UrlDict does not support '?' inside parameters.");
        }
        if (url.split("#").length - 1 > 1) {
            throw new Error("UrlDict does not support '#' inside parameters.");
        }

        // get the base url without hash or get params
        this._baseUrl = url.split("?")[0].split("#")[0];

        // get original HASH part and original GET part
        var srcGet = url.split("#")[0].split("?")[1] || "";
        var srcHash = url.split("#")[1];

        // break GET and HASH params into dictionaries
        this._getParams = this._breakParams(srcGet);
        this._hashParams = this._breakParams(srcHash);

        // create comfy get / hash APIs for specific params type
        this.GET = new ParamsDictApi(this._getParams);
        this.HASH = new ParamsDictApi(this._hashParams);
    }

    /**
    * Url dictionary prototype.
    */
    UrlDict.prototype = {

        /**
        * Return the base url without get or hash params.
        */
        getBaseUrl: function()
        {
            return this._baseUrl;
        },

        /**
        * Replace base url
        */
        setBaseUrl: function(newUrl)
        {
            this._baseUrl = newUrl;
        },

        /**
        * Build URL from current params dictionaries.
        */
        toUrl: function()
        {
            // build GET params and Hash param parts
            var getParams = this.GET.toString();
            var hashParams = this.HASH.toString();

            // build and return the final URL
            return this._baseUrl + (getParams ? "?" + getParams : "") + (hashParams ? "#" + hashParams : "");
        },
		
		/**
		* Clear all params (GET & HASH).
		*/
		clearParams: function()
		{
			this.GET.clear();
			this.HASH.clear();
		},

        /**
        * Convert a single value from the URL params back into the native JavaScript object.
        */
        _processVal: function(val)
        {
            // try to parse as JSON
            try {
                return JSON.parse(val);
            }
            // if exception, treat this value as string, because in GET params usually strings are not
            // wrapped by quotes and we want to allow that.
            catch (e) {
                return val;
            }
        },

        /**
        * Break a string of params into a dictionary.
        * This function expect just the params part, eg if the url is:
        *   some-domain.com?a=5&b=3
        * This function expect to get just the "a=5&b=3" part.
        */
        _breakParams: function(paramsString)
        {
            // no params? return empty dictionary
            if (!paramsString) {
                return {};
            }

            // create the dictionary to return
            var ret = {};

            // break the params string into parts (based on the '&' sign).
            var params = paramsString.split("&");

            // iterate params and set in dictionary
            var _this = this;
            params.forEach(function(item) {

                // get key and value
                var key = item.split("=")[0];
                var value = _this._processVal(item.substring(key.length + 1));

                // set in return dictionary
                ret[key] = value;
            });

            // return the output dictionary
            return ret;
        },

        /**
        * Get all the parameters as a mutable dictionary.
        * This return value is not just a clone, eg If you change this dictionary it will affect the final result
        * when calling toUrl().
        *
        * @return dictionary with 'get' containing GET params, and 'hash' containing HASH params.
        */
        asDict: function()
        {
            return {GET: this._getParams, HASH: this._hashParams};
        },
    };

    /**
    * Wrap a dictionary of params (used for either GET or HASH) and provide some API functions and utilities,
    * like a function to convert dictionary into formatted string etc.
    * We use this object to create shortcut access for the GET and HASH components under the parent UrlDict object.
    */
    function ParamsDictApi(dict)
    {
        this._dict = dict;
    };

    /**
    * Params dictionary API prototype.
    */
    ParamsDictApi.prototype = {

        // params dictionary. needs to be set from outside.
        _dict: null,

        /**
        * Get all the parameters as a mutable dictionary.
        * This return value is not just a clone, eg If you change this dictionary it will affect the final result
        * when calling toUrl().
        *
        * @return dictionary with parameters
        */
        asDict: function()
        {
            return this._dict;
        },

        /**
        * Convert dictionary into formatted URL params (as string).
        */
        toString: function()
        {
            var ret = [];
            for (var key in this._dict)
            {
                var val = this._dict[key];
                ret.push(key + "=" + (typeof val === "string" ? val : JSON.stringify(val)));
            }
            return ret.join("&");
        },

        /**
        * Set url param.
        */
        set: function(key, val)
        {
            this._dict[key] = val;
        },

        /**
        * Get url param.
        */
        get: function(key)
        {
            return this._dict[key];
        },

        /**
        * Remove url param
        */
        remove: function(key)
        {
            delete this._dict[key];
        },

        /**
        * Clear all params
        */
        clear: function()
        {
            for (var prop in this._dict) {
                if (this._dict.hasOwnProperty(prop)) {
                    delete this._dict[prop];
                }
            }
        },
    };

    // export the main class

    // node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = UrlDict;
    }
    // browsers
    else if (typeof window !== 'undefined') {
        window.UrlDict = UrlDict;
    }
    // other
    else {
        return UrlDict;
    }

})();