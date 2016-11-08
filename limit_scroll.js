/* Use a closure for clean scope */
(function() {

  // Make sure to only setup the limiter's listeners once
  if (! window.piratematt_ScrollLimiterSet) {

    // Find the setting associated with this page
    chrome.storage.sync.get('piratematt_ScrollLimiterOptions', function(options) {
      options = options.piratematt_ScrollLimiterOptions;
      var site_keys = Object.keys(options.site_specific_options);

      for (var i = 0; i < site_keys.length; i++) {
        var site_key = site_keys[i];

        var regex = new RegExp(site_key);

        // see if the stored option applies to the current url
        if (regex.test(window.location.href)) {
          var site_option = options.site_specific_options[site_key];

          var scroll_tolerance = site_option.allowed_scroll;
          var redirect_url = (site_option.redirect_url ? site_option.redirect_url : options.defaults.redirect_url);

          var starting_scroll = window.scrollY;

          console.log('redirect_url', redirect_url);
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
                console.log('Redirect incoming!', window.scrollY - starting_scroll);
                window.location.href = redirect_url;
              }
            }
          }, 100);

          break;  // if it does match, stop looking
        } /* end matching current url check */
      } /* end site_key loop */
    });


    window.piratematt_ScrollLimiterSet = true;
  }

})();
