/* 
 * Copyrights Loic J. Duros 2012
 * lduros@member.fsf.org
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let AddonTab = require("addon-tab");
const { data } = require("self");

let addonPage = function () {
  AddonTab.open({
    url: data.url("dark-side.html"),
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
};
require("widget").Widget({
  id: "mozilla-icon",
  label: "My Mozilla Widget",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: function () {
    addonPage();
  }
});