const createStorage = (provider) => ({
  get(key, defaultValue) {
    const json = provider.getItem(key);
    if (json === null || typeof json === 'undefined') {
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }

    try {
      return JSON.parse(json);
    } catch (error) {
      console.error(`Error parsing JSON for key "${key}":`, error);
      // Return defaultValue in case of an error
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }
  },
  set(key, value) {
    provider.setItem(key, JSON.stringify(value));
  },
});

export default createStorage;
