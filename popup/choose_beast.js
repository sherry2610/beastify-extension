/**
 * CSS to hide everything on the page,
 * except for elements that have the "beastify-image" class.
 */
const hidePage = `body > :not(.beastify-image) {
                    display: none;
                  }`;
let identifierFlag = false;

if (typeof browser === 'undefined') {
  identifierFlag = true;
  var browser = chrome;
}

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks(tabId, changeInfo, tabInfo) {
  // browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log('markA');
  document.addEventListener('click', e => {
    /**
     * Given the name of a beast, get the URL to the corresponding image.
     */
    function beastNameToURL(beastName) {
      switch (beastName) {
        case 'Frog':
          let abc = browser.runtime.getURL('./beasts/frog.jpg');
          console.log({ abc });
          return abc;
        case 'Snake':
          return browser.runtime.getURL('./beasts/snake.jpg');
        case 'Turtle':
          return browser.runtime.getURL('./beasts/turtle.jpg');
      }
    }

    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the beast URL and
     * send a "beastify" message to the content script in the active tab.
     */
    function beastify(tabs) {
      console.log('tabs inside beastify', tabs);
      browser.tabs.insertCSS({ code: hidePage }, function () {
        let url = beastNameToURL(e.target.textContent);
        console.log('e.target.textContent', e.target.textContent);
        browser.tabs.sendMessage(tabs[0].id, {
          command: 'beastify',
          beastURL: url,
        });
      });
      // .then(() => {
      //   let url = beastNameToURL(e.target.textContent);
      //   console.log('e.target.textContent', e.target.textContent);
      //   browser.tabs.sendMessage(tabs[0].id, {
      //     command: 'beastify',
      //     beastURL: url,
      //   });
      // });
    }

    /**
     * Remove the page-hiding CSS from the active tab,
     * send a "reset" message to the content script in the active tab.
     */
    function reset(tabs) {
      try {
        browser.tabs.removeCSS({ code: hidePage });
        browser.tabs.sendMessage(tabs[0].id, {
          command: 'reset',
        });
      } catch (error) {
        console.log('error in reset', error);
      }
      // browser.tabs.removeCSS({ code: hidePage }, function () {
      //   browser.tabs.sendMessage(tabs[0].id, {
      //     command: 'reset',
      //   });
      // });
      // .then(() => {
      //   browser.tabs.sendMessage(tabs[0].id, {
      //     command: 'reset',
      //   });
      // });
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not beastify: ${error}`);
    }

    /**
     * Get the active tab,
     * then call "beastify()" or "reset()" as appropriate.
     */
    if (e.target.classList.contains('beast')) {
      console.log('mark1');

      var query = browser.tabs.query(
        { currentWindow: true, active: true },
        function (tabs) {
          beastify(tabs);
        },
      );
      // query
      //   .then(function (tabs) {
      //     // tabs.forEach(function(tab) {
      //     //     do stuff here;
      //     // });
      //     beastify(tabs);
      //   })
      //   .catch(reportError);

      // browser.tabs
      //   .query({ active: true, currentWindow: true })
      //   .then(beastify)
      //   .catch(reportError);
      console.log('mark2');
    } else if (e.target.classList.contains('reset')) {
      console.log('mark3');
      browser.tabs.query(
        { active: true, currentWindow: true },
        function (tabs) {
          reset(tabs);
        },
      );
      // .then(reset)
      // .catch(reportError);
      console.log('mark4');
    }
  });
  // });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector('#popup-content').classList.add('hidden');
  document.querySelector('#error-content').classList.remove('hidden');
  console.error(`Failed to execute beastify content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */

// browser.tabs.onUpdated.addListener(function handleUpdated(
//   tabId,
//   changeInfo,
//   tabInfo,
// ) {
// if (browser === 'undefined') {
browser.tabs.executeScript(
  null,
  { file: '/content_scripts/beastify.js' },
  // { code: listenForClicks },
  function (results) {
    console.log('callback', results);
    listenForClicks();
  },
);
// } else {
// browser.tabs.executeScript({ file: 'browser-polyfill.js' });

// browser.tabs
//   .executeScript({ file: '/content_scripts/beastify.js' })
//   .then(listenForClicks)
//   .catch(reportExecuteScriptError);
// }
// });
