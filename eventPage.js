(function() {

  // TODO - setup defaults upon install



  var set_limiting_listeners = function() {
    // Get stored settings
    chrome.storage.sync.get('piratematt_ScrollLimiterOptions', function(options) {
      options = options.piratematt_ScrollLimiterOptions;
      var site_keys = Object.keys(options.site_specific_options);

      // build a list of filters so events are only handled for configured sites
      var url_filters = [];

      for (var i = 0; i < site_keys.length; i++) {
        var site_key = site_keys[i];
        url_filters.push({urlMatches: site_key})
      }

      // Setup the (filtered) event listener
      chrome.webNavigation.onCompleted.addListener(handle_web_nav_completion, { url: url_filters });
    });
  };

  // Name the
  var handle_web_nav_completion = function(details) {
    chrome.tabs.executeScript(details.tabId, {file: 'limit_scroll.js'}, function(){
      //chrome.extension.getBackgroundPage().console.log('back from executing the scroll limiter script');
    });
  };


  // Setup listener for storage
  chrome.storage.onChanged.addListener(function(changes, area_name) {
    // if the changes are for this extension, remove the existing listener and add back in a new one, with the (potentially) new filters
    if (changes.piratematt_ScrollLimiterOptions) {
      chrome.webNavigation.onCompleted.removeListener(handle_web_nav_completion);
      set_limiting_listeners();
    }
  });


  var handle_storage_change = function() {};


  set_limiting_listeners();
})();
