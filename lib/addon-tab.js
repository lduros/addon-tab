/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

module.metadata = {
  'stability': 'experimental'
};

const { WindowTracker } = require('sdk/deprecated/window-utils');
const { isXULBrowser } = require('sdk/window/utils');
const { add, remove } = require('sdk/util/array');
const { getTabs, closeTab, getURI, getTabURL, getBrowserForTab } = require('sdk/tabs/utils');
const { data } = require('self');
const { ns } = require("sdk/core/namespace");

const tabBrowser = require("tab-browser");
const tabs = require("tabs");

const { defer } = require("sdk/lang/functional");

// store list of addon URLs to hide the navigation bar from
// and to add proper style.
// the url is used as the key for lookup efficiency.
// Objects contained are: {[url]: { [styles] }}
let addonTabs = {};

const windows = ns();

/* Add tab to a list of URL/styles. Can be called
 * from other scripts */
let addTabToList = function (options) {

  options = options || {};
  let url;

  if (options.url) {
    addonTabs[options.url] = {};
  }
  else {
    throw new Error("No url provided for the AddonTab page");
  }

  if (options.tabStyle)
    addonTabs[options.url] = options.tabStyle;
  else
    addonTabs[options.tabStyle] = null;

};

exports.removeAddonTab = function (url) {
  if (url && url in addonTabs)
    delete addonTabs[url];
};

let applyStyle = function (tab, property, value) {
  tab.style.setProperty(property,
                        value,
                        'important');  
};

let applyStyles = function (tab, url) {

  if (!url) {
    url = getURI(tab);
  }

  if (url in addonTabs && addonTabs[url] != null) {

    for (let item in addonTabs[url]) {
      applyStyle(tab, item, addonTabs[url][item]);
    }

  }
};

/* Simply adds the URL/style to the list,
 * and then just open a tab using the high-level
 * tab module.
 */
exports.open = function (options) {
  addTabToList(options);
  let tab = tabs.open(options);
  return tab;
};

/*
 * Track tabs opened and closed.
 * Once you have a tab open, get the browser for it
 * and figure out the location (which turns out to be the right one, not about:blank)
 */
let tabTracker = {
  onTrack: function (tab) {
    let browser = getBrowserForTab(tab);

    tab.addEventListener("load", function onTabLoad (e) {
      // let's get the location of the document.      
      applyStyles(tab, browser.contentDocument.location);
      tab.removeEventListener("load", onTabLoad, true);
    }, true);
  },
  onUntrack: function (tab) {
    // should we have something here?
  }
};
tabBrowser.TabTracker(tabTracker);

WindowTracker({
  onTrack: function onTrack(window) {
    if (!isXULBrowser(window) || windows(window).hideChromeForLocation)
      return;
    
    let { XULBrowserWindow } = window;
    let { hideChromeForLocation } = XULBrowserWindow;
    
    windows(window).hideChromeForLocation = hideChromeForLocation;

    // Augmenting the behavior of `hideChromeForLocation` method, as
    // suggested by https://developer.mozilla.org/en-US/docs/Hiding_browser_chrome
    XULBrowserWindow.hideChromeForLocation = function(url) {
      
        if (url in addonTabs)
          return true;

      return hideChromeForLocation.call(this, url);
    };
  },

  onUntrack: function onUntrack(window) {
    if (isXULBrowser(window))
      getTabs(window).filter(tabFilter).forEach(untrackTab.bind(null, window));

  }
});


function tabFilter(tab) {
  if (getURI(tab) in addonTabs) {
    return true;
  }

  return false;
}

function untrackTab(window, tab) {
  // Note: `onUntrack` will be called for all windows on add-on unloads,
  // so we want to clean them up from these URLs.
  let { hideChromeForLocation } = windows(window);

  if (hideChromeForLocation) {
    window.XULBrowserWindow.hideChromeForLocation = hideChromeForLocation;
    windows(window).hideChromeForLocation = null;
  }
  // had to remove closeTab call to prevent a TypeError: element is
  // undefined.
  //closeTab(tab);
}



