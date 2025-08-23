// TODO move to utils.js

export async function getConfig() {
  const result = await getBrowser().storage.local.get('userConfig');
  return result.userConfig || { entries: [] };
}
export async function getOptions() {
  const result = await getBrowser().storage.local.get('userOptions');
  return result.userOptions || { closeNewTabsToggle: true };
}
export function getBrowser() {
  if (typeof browser !== 'undefined') {
    return browser;
  } else return chrome;
}
