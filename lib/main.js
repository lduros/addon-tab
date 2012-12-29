var SettingsTab = require("settings-tab").SettingsTab;
var data = require("self").data;
var tabs = require("tabs");

SettingsTab({
  url: data.url("settings.html"),
  hideLocationBar: true,
  tabStyle: {
    'background-color': '#E0E01B',
    'background-image': 'none', // important to overwrite bckg when tab is active.
    'font-weight': 'bold',
    'font-size': '1.1em',
    'text-decoration': 'italic'
  }
});

SettingsTab({
  url: data.url("dark-side.html"),
  hideLocationBar: true,
  tabStyle: {
    'background-color': '#000',
    'background-image': 'none', // important to overwrite bckg when tab is active.
    'font-weight': 'bold',
    'font-size': '1.1em',
    'text-decoration': 'italic',
    'color': 'red'
  }
});