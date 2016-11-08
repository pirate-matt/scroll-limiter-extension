(function() {

  // runtime.onInstalled

  /*
  var default_options = {
  defaults: {
    redirect_url: 'http://giphy.com/search/re-focus'
  },
  site_specific_options: {
    '*://*.facebook.com/*': {
      allowed_scroll: 15000
      /* redirect_url: default * /
    },
  }
};


// Check for first install
chrome.storage.sync.get('piratematt_ScrollLimiterOptions', function(options) {
  // if first install, store the defaults
  if (! Object.keys(options).length) {
    chrome.storage.sync.set({piratematt_ScrollLimiterOptions: default_options}, function() {
      get_started();
    });
  }
  // otherwise, not the first defaults, set event listeners, etc.
  else {
    get_started();
  }
});

  */




  var set_limiting_listeners = function() {
    // Get stored settings
    chrome.storage.sync.get('piratematt_ScrollLimiterOptions', function(options) {
      options = options.piratematt_ScrollLimiterOptions;
      var site_keys = Object.keys(options.site_specific_options);

      var url_filters = [];

      for (var i = 0; i < site_keys.length; i++) {
        var site_key = site_keys[i];

        url_filters.push({urlMatches: site_key})
      }

      chrome.webNavigation.onCompleted.addListener(function(details) {
        limit_page_scrolling(details.tabId);
      }, { url: url_filters });

    });
  };


  var handle_storage_change = function() {};

  var limit_page_scrolling = function(tab_id) {
    chrome.tabs.executeScript(tab_id, {file: 'limit_scroll.js'}, function(){
      chrome.extension.getBackgroundPage().console.log('back from executing the scroll limiter script');
    });

  };


  set_limiting_listeners();
})();
