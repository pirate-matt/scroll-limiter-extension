(function() {

  var default_options = {
    defaults: {
      redirect_url: 'http://i.imgur.com/sIeO6zQ.gif'
    },
    site_specific_options: {
      '.*://.*facebook.com.*': {
        allowed_scroll: 15000
        /* redirect_url: default */
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


  var restore_options = function() {
    chrome.storage.sync.get('piratematt_ScrollLimiterOptions', function(options) {
      options = options.piratematt_ScrollLimiterOptions;

      // restore defaults
      document.getElementById('DefaultRedirectUrl').value = options.defaults.redirect_url;

      // restore individuals
      build_individual_site_settings(options.site_specific_options);
    });
  };

  var build_individual_site_settings = function(site_options) {
    var site_keys = Object.keys(site_options);
    var table_body = document.getElementById('IndividualSitesTableBody');

    table_body.innerHTML = ''; // clear table

    if (! site_keys.length) {
      var empty_sites_row = document.createElement('tr');
      empty_sites_row.classList = 'warning';
      empty_sites_row.innerHTML = '<td colspan="4"><em>No site options set yet!</em></td>';
      table_body.appendChild(empty_sites_row);
    }
    else {
      var html = '';

      for (var i = 0; i< site_keys.length; i++) {
        var site_key = site_keys[i];
        var option = site_options[site_key]

        // Make sure the option exists (it doesn't when removing an option from settings)
        if (option) {
          var site_row = document.createElement('tr');
          site_row.innerHTML = ''
            + '<td>' + site_key + '</td>'
            + '<td>' + option.allowed_scroll + '</td>'
            + '<td data-redirect-url="' + option.redirect_url + '">' + (option.redirect_url ? option.redirect_url : '<small><em>default</em></small>') + '</td>'
          ;

          // Create edit btn, set listener
          var edit_btn = document.createElement('button')
          edit_btn.classList = 'btn btn-default btn-xs';
          edit_btn.innerHTML = '<span class="glyphicon glyphicon-pencil"></span>'
          edit_btn.addEventListener('click', make_individual_form_ready_for_edit);

          // Create delete btn, set listener
          var delete_btn = document.createElement('button')
          delete_btn.classList = 'btn btn-default btn-xs';
          delete_btn.innerHTML = '<span class="glyphicon glyphicon-trash text-danger"></span>'
          delete_btn.addEventListener('click', handle_individual_site_removal);

          // Add btns to DOM
          var action_td = document.createElement('td');
          action_td.appendChild(edit_btn);
          action_td.appendChild(delete_btn);
          site_row.appendChild(action_td);

          table_body.appendChild(site_row);
        }
      }
    }
  };


  var make_individual_form_ready_for_add = function() {
    document.getElementById('IndividualSiteRegex').value = '';
    document.getElementById('IndividualAllowedScroll').value = null;
    document.getElementById('IndividualRedirectUrl').value = '';
    document.getElementById('ModifyIndividual').innerHTML = 'Add';
  };

  var make_individual_form_ready_for_edit = function(event) {
    for (var i = 0; i < event.path.length; i++) {
      var el = event.path[i];

      if (el.tagName == 'TR') {
        var regex = el.children[0].innerHTML;
        var pixels = Number(el.children[1].innerHTML);
        var redirect = (el.children[2].dataset.redirectUrl == 'undefined' ? '' : el.children[2].dataset.redirectUrl);

        document.getElementById('IndividualSiteRegex').value = regex;
        document.getElementById('IndividualAllowedScroll').value = pixels;
        document.getElementById('IndividualRedirectUrl').value = redirect;

        break;
      }
    }

    document.getElementById('ModifyIndividual').innerHTML = 'Save';
  };


  var handle_defaults_change = function(event) {
    event.preventDefault();

    var submit_btn = event.currentTarget;
    submit_btn.setAttribute('disabled', 'disabled');
    submit_btn.innerHTML = 'Saving';


    var default_redirect_url = document.getElementById('DefaultRedirectUrl').value;

    // get the latest options
    chrome.storage.sync.get('piratematt_ScrollLimiterOptions', function(options) {
      options = options.piratematt_ScrollLimiterOptions;
      options.defaults.redirect_url = default_redirect_url;

      chrome.storage.sync.set({piratematt_ScrollLimiterOptions: options}, function() {
        submit_btn.innerHTML = 'Saved';
        setTimeout(function() {
          submit_btn.removeAttribute('disabled');
          submit_btn.innerHTML = 'Save';
        }, 1000);
      });
    });


  };

  var handle_individual_site_change = function(event) {
    event.preventDefault();

    var submit_btn = event.currentTarget;
    submit_btn.setAttribute('disabled', 'disabled');
    var action_text = submit_btn.innerHTML;
    submit_btn.innerHTML = (action_text == 'Add' ? 'Add' : 'Sav') + 'ing';

    var regex = document.getElementById('IndividualSiteRegex').value;
    var pixels = document.getElementById('IndividualAllowedScroll').value;
    var redirect = document.getElementById('IndividualRedirectUrl').value;

    // get the latest options
    chrome.storage.sync.get('piratematt_ScrollLimiterOptions', function(options) {
      options = options.piratematt_ScrollLimiterOptions;
      options.site_specific_options[regex] = {
        allowed_scroll: pixels,
        redirect_url: (redirect ? redirect : undefined)
      };

      chrome.storage.sync.set({piratematt_ScrollLimiterOptions: options}, function() {
        submit_btn.innerHTML = (action_text == 'Add' ? 'Add' : 'Sav') + 'ed';
        build_individual_site_settings(options.site_specific_options);
        setTimeout(function() {
          submit_btn.removeAttribute('disabled');
          submit_btn.innerHTML = action_text;
        }, 1000);
      });
    });
  };


  var handle_individual_site_removal = function(event) {
    var delete_btn = event.currentTarget;
    delete_btn.setAttribute('disabled', 'disabled');

    var regex;

    for (var i = 0; i < event.path.length; i++) {
      var el = event.path[i];

      if (el.tagName == 'TR') {
        regex = el.children[0].innerHTML;
        break;
      }
    }

    // get the latest options
    chrome.storage.sync.get('piratematt_ScrollLimiterOptions', function(options) {
      options = options.piratematt_ScrollLimiterOptions;
      options.site_specific_options[regex] = undefined;

      chrome.storage.sync.set({piratematt_ScrollLimiterOptions: options}, function() {
        build_individual_site_settings(options.site_specific_options);
        make_individual_form_ready_for_add();
      });
    });
  };


  var get_started = function() {
    document.addEventListener('DOMContentLoaded', restore_options);
    restore_options();
    document.getElementById('ModifyDefaults').addEventListener('click', handle_defaults_change);
    document.getElementById('ModifyIndividual').addEventListener('click', handle_individual_site_change);
    document.getElementById('GetToAddForm').addEventListener('click', make_individual_form_ready_for_add);
  };


})();
