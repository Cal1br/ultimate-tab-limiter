// Load and display settings
async function loadSettings() {
  const config = await getConfig();
  const userOptions = await getOptions();

  const list = document.querySelector('#entriesList');
  const closeNewTabsToggle = document.querySelector('#closeNewTabs');
  closeNewTabsToggle.checked = userOptions.closeNewTabsToggle;
  list.innerHTML = '';

  config.entries.forEach((entry, index) => {
    const li = document.createElement('li');
    li.textContent = `${entry.domain} - ${entry.number}`;
    li.appendChild(getRemoveButton(li, config, index));
    list.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', loadSettings);

async function getConfig() {
  const result = await browser.storage.local.get('userConfig');
  return result.userConfig || { entries: [] };
}

async function getOptions() {
  const result = await browser.storage.local.get('userOptions');
  return result.userOptions || { closeNewTabsToggle: true };
}

// Add new domain-number entry
document.querySelector('#addEntryBtn').addEventListener('click', async () => {
  const domain = document.querySelector('#domain').value.trim();
  const number = parseInt(document.querySelector('#number').value, 10);

  if (!domain || isNaN(number) || number < 1) {
    alert('Enter a valid domain and max tab number (>=1).');
    return;
  }

  const config = await getConfig();
  config.entries.push({ domain, number });

  await browser.storage.local.set({ userConfig: config });

  document.querySelector('#domain').value = '';
  document.querySelector('#number').value = '';

  // Add the new entry with animation
  const list = document.querySelector('#entriesList');

  const li = document.createElement('li');
  li.textContent = `${domain} - ${number}`;

  li.appendChild(getRemoveButton(li, config, config.entries.length - 1));

  // Arcade pop animation
  li.classList.add('new-entry');
  li.addEventListener('animationend', () => li.classList.remove('new-entry'));

  list.appendChild(li);
});

function getRemoveButton(element, config, index) {
  // accept index
  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    config.entries.splice(index, 1);
    await browser.storage.local.set({ userConfig: config });

    element.classList.add('undertale-death');

    setTimeout(() => {
      element.remove();
      if (callback) callback();
    }, 250);
  });
  return removeBtn;
}

document
  .querySelector('#closeNewTabs')
  .addEventListener('change', async (event) => {
    const userOptions = await getOptions();

    userOptions.closeNewTabsToggle = event.target.checked;

    await browser.storage.local.set({ userOptions: userOptions });
  });
