Recent web UI frameworks give addon developers the opportunity to
design fantastic pages for their addons. This module makes it easier
to create great addon pages such as complex settings pages requiring
computation and interactivity with a unique user experience and
design.

A very bare example of an addon-tab:

![small screenshot](https://raw.github.com/lduros/addon-tab/master/doc/images/addon-tab-screenshot-small.png)


This module does only a few things:

    - Like the core addon-page module, it hides the navigation bar. But
      instead of being limited to a single page in your data/
      directory, you can create a new tab for any URL (including local
      addon pages) with a hidden nagivation toolbar.
      
    - To increase the distinct flavor of your addon, you can
      also add CSS styles to the tab itself of your addon tab. You may
      give it a certain background color, change the aspect of the
      label, or add a background-image...
      
    - It uses the tabs module, allowing you to inject content scripts
      and communicate with your addon scripts.
    
    - It is a modified version of the addon-page, having an object
      literal instead of a string constant for the URLs.
      
Use it with a great framework such as Bootstrap or jQuery UI and
create awesome pages!

Here is an example of how to open an addon-tab with a gloomy looking tab:
```javascript
const AddonTab = require("addon-tab");
const { data } = require("self");

AddonTab.open({
  url: data.url("dark-side.html"),
  tabStyle: {
    'background-color': '#000',
    'background-image': 'none', // important to overwrite bckg when tab is active.
    'font-weight': 'bold',
    'font-size': '1.1em',
    'color': 'red'
  },
  onReady: function (tab) {
    // do something with the page, add content scripts, etc, ...
  });
  }
});
```
The previous example will give you the following look:
![The resulting addon page](https://raw.github.com/lduros/addon-tab/master/doc/images/addon-tab-screenshot.png)

Just like the regular tab.open() method, you can add content script
onReady and with other events. The tabStyle object can hold any
supported css property/value. After the initial open, your local URI
has been added to the list of addon tabs.

You can remove a page from the AddonTab list by running:
```javascript
const AddonTab = require("addon-tab");
const { data } = require("self");

AddonTab.removeAddonTab(data.url("dark-side.html"));
```
