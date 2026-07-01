/* eslint-disable @typescript-eslint/no-empty-function */
// jsdom (the test DOM environment) does not implement matchMedia.
// ThemeService relies on it to detect the OS color-scheme preference.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
