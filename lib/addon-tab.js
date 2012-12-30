/* 
 * Copyrights Loic J. Duros 2012
 * lduros@member.fsf.org
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { getMostRecentBrowserWindow } = require('api-utils/window/utils');
const {isXULBrowser} = require("sdk/window/utils");
const { ns } = require("sdk/core/namespace");
const windows = ns();
const tabbrowser = require("tab-browser");
const tabs = require("tabs");

exports.AddonTab = function (options) {
  options = options || {};
  
  if (!options.url)
    throw new Error("No url provided for the settings page");
  
  if (options.hideLocationBar)
    hideLocationBar(options.url);
  
  var tab = tabs.open(options);

  // set a special color and styles for the tab, if available:
  for (item in options.tabStyle) {
    setStyle(item,
             options.tabStyle[item]);
  }

  return tab;  

};

let setStyle = function (property, value) {
  tabbrowser.activeTab.style.setProperty(property,
                                         value,
                                         'important');  
};

let hideLocationBar = function (tabURL) {

  let mainWindow = getMostRecentBrowserWindow();

  // taken these couple lines from addon-page.js
  let {hideChromeForLocation} = mainWindow.XULBrowserWindow;
  windows(mainWindow).hideChromeForLocation = hideChromeForLocation;

  if (!isXULBrowser(mainWindow)) {
    return;
  }
  
  var prevFunc = mainWindow.XULBrowserWindow.hideChromeForLocation;

  mainWindow.XULBrowserWindow.hideChromeForLocation = function (url) {
    if (url.indexOf(tabURL) === 0) {
      return true;
    }
    return prevFunc.call(mainWindow.XULBrowserWindow, url);
  };

};