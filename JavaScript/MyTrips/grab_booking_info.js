phantom.injectJs('bower_components/es6-promise/promise.min.js');

/*
 * Script that grabs Booking.com booking info from Gmail.
 */
var CHECK_INTERVAL_MS = 1000;
var MAX_WAIT_TIME_MS = 5000;

var email = "<username>@gmail.com";
var password = "<password>";

var page = require('webpage').create();

page.viewportSize = {
  width: 1024,
  height: 768
};

function waitFor(page, condition, callback, errback) {
  var timeWaited = 0;

  function check() {
    if (timeWaited > MAX_WAIT_TIME_MS) {
      errback && errback(new Error("Timed out waiting for condition " + condition.toString()));
    }
    if (condition(page)) {
      callback();
    } else {
      timeWaited += CHECK_INTERVAL_MS;
      setTimeout(check, CHECK_INTERVAL_MS);
    }
  }

  check();
}

function whenElementAvailable(page, cssSelector, callback, errback) {
  waitFor(page, function(page) {
    return page.evaluate(function(cssSelector) {
      return document.querySelector(cssSelector) != null;
    }, cssSelector);
  }, callback, errback);
}

function whenUrlChanges(page, callback, errback) {

  function getUrl(page) {
    return page.evaluate(function() {
      return document.URL;
    });
  }

  var initialUrl = getUrl(page);

  waitFor(page, function(page) {
    var currentUrl = getUrl(page);

    return currentUrl != initialUrl;
  }, callback, errback);
}

//TODO: Make into methods on the created page
//TODO: Extract as a separate library, publish it to Bower?

function open(page, url) {

  //TODO: Error handling
  return new Promise(function(resolve, reject) {
    page.open(url, function(status) {
      resolve(status);
    });
  });
}

function waitElement(page, cssSelector) {
   return new Promise(function(resolve, reject) {
     whenElementAvailable(page, cssSelector, function() {
       resolve(cssSelector);
     }, function(error) {
       reject(error);
     });
   });
}

function waitUrlChange(page) {
   return new Promise(function(resolve, reject) {
     whenUrlChanges(page, function() {
       resolve();
     }, function(error) {
       reject(error);
     });
   });
}

function delay(milliseconds) {
  milliseconds = milliseconds || 0;
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve();
    }, milliseconds);
  });
};

open(page, 'https://accounts.google.com').then(function() {
  page.evaluate(function(email, password) {
    var emailInput = document.querySelector("#Email");
    var passwordInput = document.querySelector("#Passwd");
    var signInButton = document.querySelector("#signIn");

    emailInput.setAttribute("value", email);
    passwordInput.setAttribute("value", password);

    signInButton.click();
  }, email, password);

  return waitElement(page, "#nav-personalinfo");
}).then(function() {
  return open(page, 'https://mail.google.com');
}).then(function() {
  return waitElement(page, "button[aria-label]");
}).then(function() {

  //Searching for e-mails from "customer.service@booking.com"
  page.evaluate(function() {
    var searchInputs = [].slice.call(document.querySelectorAll("form input"));
    var searchButton = document.querySelector("form button");

    searchInputs.forEach(function(input) {
      input.value = "customer.service@booking.com";
    });
    searchButton.click();
  });

  return waitUrlChange(page);
}).then(function() {

  var emailCount = page.evaluate(function() {
    var emails = document.querySelectorAll("td > div:nth-child(2) > span[name=\"Booking.com\"]");

    return emails.length;
  });

  //for (var i = 0; i < emailCount; i++) {
    page.evaluate(function() {
      var emails = document.querySelectorAll("td > div:nth-child(2) > span[name=\"Booking.com\"]");
      var event = document.createEvent("MouseEvent");

      event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      emails[0].dispatchEvent(event);
    });
  //}

  console.log("In total " + emailCount + " e-mails on the page");

  //TODO: Open each e-mail on the current page
  //TODO: Analyze the content of such an email
  //TODO: Open next page
  //If no em-mails finish
  //If there are e-mails, repeat
  setTimeout(function() {
    page.render('mail.png');
    phantom.exit();
  }, 2000);
});

//TODO: Iterate over all the e-mails that matched and extract the Booking information:
//city, address, start date, end date. Output this information to the console
//TODO: Re-factoring: extract common code that can be re-used in other PhantomJS scripts
//Looks a lot like what Selenium does, but this is closer to JavaScript being executed on the page (more low-level) and gives more control over execution. May still be useful when we want to run some test spec against
//a certain state of a certain page of a production app