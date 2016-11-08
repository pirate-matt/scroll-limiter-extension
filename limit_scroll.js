/* Use a closure for clean scope */
(function() {

  console.log('hallo', 'limiting scroll now...');

  // Make sure to only setup the listener once
  if (! window.piratematt_ScrollLimiterSet) {

    chrome.storage.sync.get('piratematt_ScrollLimiterOptions', function(options) {
      options = options.piratematt_ScrollLimiterOptions;
      var site_keys = Object.keys(options.site_specific_options);

      for (var i = 0; i < site_keys.length; i++) {
        var site_key = site_keys[i];

        var regex = new RegExp(site_key);

        if (regex.test(window.location.href)) {
          var site_option = options.site_specific_options[site_key];

          var scroll_tolerance = site_option.allowed_scroll;
          var redirect_url = (site_option.redirect_url ? site_option.redirect_url : options.defaults.redirect_url);

          var starting_scroll = window.scrollY;

          console.log('starting_scroll', starting_scroll);
          console.log('scroll_tolerance', scroll_tolerance);

          var did_scroll = false;

          window.addEventListener('scroll', function(event) {
            did_scroll = true;
          });

          // For performance reasons, only do anything besides assignment if applicable, once over 100ms
          setInterval(function() {
            if(did_scroll) {
              did_scroll = false;
              if(window.scrollY - starting_scroll > scroll_tolerance) {
                console.log('should redirect', window.scrollY - starting_scroll);
                window.location.href = "http://giphy.com/search/re-focus";
              }
            }
          }, 100);

        }

        break;
      }
    });


    window.piratematt_ScrollLimiterSet = true;
  }

})();
