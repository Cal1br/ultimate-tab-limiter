import { getBrowser, getConfig, getOptions } from './utils.js';

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

// Count all tabs for a domain
async function getTabsForDomain(domain) {
  return await getBrowser().tabs.query({ url: `*://*.${domain}/*` });
}

getBrowser().tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
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
            await getBrowser().tabs.remove(tab.id);
          } else {
            console.log(openTabs);
            //lowest tab id is the oldest
            const lowest = openTabs.reduce((min, tab) =>
              tab.id < min.id ? tab : min
            );
            await getBrowser().tabs.remove(lowest.id);
          }
        } catch (err) {
          console.warn('Failed to close tab:', err);
        }
      }

      break; // only check the first matching entry
    }
  }
});

getBrowser().action.onClicked.addListener(() => {
  // Opens the extension options page
  getBrowser().runtime.openOptionsPage();
});
