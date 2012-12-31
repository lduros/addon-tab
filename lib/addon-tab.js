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
const { getTabs, closeTab, getURI } = require('sdk/tabs/utils');
const { data } = require('self');
const { ns } = require("sdk/core/namespace");

const tabbrowser = require("tab-browser");
const tabs = require("tabs");

// store list of addon URLs to hide the navigation bar from
// and to add proper style.
// the url is used as the key for lookup efficiency.
// Objects contained are: {[url]: { tabStyle: {}}}
let addonTabs = {};

const windows = ns();

let addTabToList = function (options) {
  console.log('adding tab to list');
  options = options || {};
  let url;

  if (options.path) {
    // creating a new entry
    url = data.url(options.path);
    console.log("adding path", url);
    addonTabs[url] = {};
  }
  else {
    throw new Error("No url provided for the AddonTab page");
  }

  if (options.tabStyle)
    addonTabs[url] = options.tabStyle;

};

exports.open = function (options) {

  addTabToList(options);
  // make the path a resource:// URI
  options.url = data.url(options.path);
  let tab = tabs.open(options);
  applyStyles();
};

let applyStyles = function (window) {
  
  if (url in addonTabs) {
    console.log("found a matching url!!");
    for (let item in addonTabs[url]) {
      applyStyle(tab, item, addonTabs[url][item]);
    }

  }
};

let applyStyle = function (tab, property, value) {
  tab.style.setProperty(property,
                                         value,
                                         'important');  
};

exports.addTabToList = addTabToList;

WindowTracker({
  onTrack: function onTrack(window) {
    if (!isXULBrowser(window) || windows(window).hideChromeForLocation)
      return;
    console.log("triggering ontrack");
    let { XULBrowserWindow } = window;
    let { hideChromeForLocation } = XULBrowserWindow;
    
    windows(window).hideChromeForLocation = hideChromeForLocation;

   // getTabs(window).filter(tabFilter).forEach(applyStyles.bind(null, window));


    // Augmenting the behavior of `hideChromeForLocation` method, as
    // suggested by https://developer.mozilla.org/en-US/docs/Hiding_browser_chrome
    XULBrowserWindow.hideChromeForLocation = function(url) {
      
      for (let addonURL in addonTabs) {
        
        if (url.indexOf(addonURL) === 0) {
          let rest = url.substr(addonURL.length);
          return rest.length === 0 || ['#','?'].indexOf(rest.charAt(0)) > -1;
        }

      }

      return hideChromeForLocation.call(this, url);
    };
  },

  onUntrack: function onUntrack(window) {
    if (isXULBrowser(window))
      getTabs(window).filter(tabFilter).forEach(untrackTab.bind(null, window));
  }
});

function tabFilterForURL(tab, url) {
  return getURI(tab) === url;
}

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

  closeTab(tab);
}



