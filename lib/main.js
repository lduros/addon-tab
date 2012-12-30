/* 
 * Copyrights Loic J. Duros 2012
 * lduros@member.fsf.org
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var AddonTab = require("addon-tab").AddonTab;
var data = require("self").data;
var tabs = require("tabs");

AddonTab({
  url: data.url("dark-side.html"),
  hideLocationBar: true, // set as true to hide location/search bar.
  tabStyle: {
    'background-color': '#000',
    'background-image': 'none', // important to overwrite bckg when tab is active.
    'font-weight': 'bold',
    'font-size': '1.1em',
    'text-decoration': 'italic',
    'color': 'red'
  },
  onReady: function (tab) {
    tab.attach({
      contentScript: 'self.postMessage(document.body.getElementsByTagName("h1")[0].textContent);',
      onMessage: function (message) {
        console.log('The following was posted from the addon-tab page:', message);
      }
    });
  }
});