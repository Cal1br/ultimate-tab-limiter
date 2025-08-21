// Helper: check if URL matches domain or subdomain
//todo perhaps make the entries a MAP to fascilitate faster searchings
function matchesDomain(url, domain) {
  try {
    const u = new URL(url);
    return u.hostname === domain || u.hostname.endsWith('.' + domain);
  } catch {
    return false;
  }
}

// TODO move to utils.js
async function getConfig() {
  const result = await browser.storage.local.get('userConfig');
  return result.userConfig || { entries: [] };
}
async function getOptions() {
  const result = await browser.storage.local.get('userOptions');
  return result.userOptions || { closeNewTabsToggle: true };
}

// Count all tabs for a domain
async function getTabsForDomain(domain) {
  return await browser.tabs.query({ url: `*://*.${domain}/*` });
}

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!tab.url) return;

  const config = await getConfig();

  for (const entry of config.entries) {
    if (matchesDomain(tab.url, entry.domain)) {
      const openTabs = await getTabsForDomain(entry.domain);

      if (openTabs.length > entry.number) {
        console.log(
          `Tab limit exceeded for ${entry.domain}. Closing tab ${tab.id}`
        );
        try {
          const userOptions = await getOptions();
          if (userOptions.closeNewTabsToggle) {
            await browser.tabs.remove(tab.id);
          } else {
            console.log(openTabs);
            //lowest tab id is the oldest
            const lowest = openTabs.reduce((min, tab) =>
              tab.id < min.id ? tab : min
            );
            await browser.tabs.remove(lowest.id);
          }
        } catch (err) {
          console.warn('Failed to close tab:', err);
        }
      }

      break; // only check the first matching entry
    }
  }
});

browser.action.onClicked.addListener(() => {
  // Opens the extension options page
  browser.runtime.openOptionsPage();
});
