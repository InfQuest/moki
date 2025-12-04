import { MessageSource, MessageType } from "./chunk-BAX9q0V5.js";
const SUPPORTED_LANGUAGES = ["en", "zh-CN", "zh-TW", "ja", "ko", "es", "fr", "de"];
const SUPPORTED_LOCALES = ["en", "zh_CN", "zh_TW", "ja", "ko", "es", "fr", "de"];
function isSupportedLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}
function languageCodeToI18nKey(code) {
  const normalizedCode = code.replace("-", "");
  return `languages_${normalizedCode}`;
}
function getLanguageName(code) {
  const key = languageCodeToI18nKey(code);
  const name = t(key);
  return name !== key ? name : code;
}
function localeToLanguageCode(locale) {
  return locale.replace("_", "-");
}
function languageCodeToLocale(code) {
  return code.replace("-", "_");
}
const DEFAULT_LOCALE = "en";
const STORAGE_KEY = "interfaceLanguage";
let messagesCache = {};
let currentLocale = DEFAULT_LOCALE;
let browserLocale = DEFAULT_LOCALE;
async function initI18n() {
  const browserLang = chrome.i18n.getUILanguage();
  const normalizedBrowserLang = normalizeLocale(browserLang);
  browserLocale = isSupportedLocale(normalizedBrowserLang) ? normalizedBrowserLang : DEFAULT_LOCALE;
  const stored = await chrome.storage.sync.get([STORAGE_KEY]);
  const userLocale = stored[STORAGE_KEY];
  if (userLocale && isSupportedLocale(userLocale)) {
    currentLocale = userLocale;
  } else {
    currentLocale = browserLocale;
  }
  await Promise.all([loadMessages(browserLocale), loadMessages(currentLocale)]);
}
async function loadMessages(locale) {
  if (messagesCache[locale]) {
    return;
  }
  try {
    const url = chrome.runtime.getURL(`_locales/${locale}/messages.json`);
    const response = await fetch(url);
    const messages = await response.json();
    messagesCache[locale] = messages;
  } catch (error) {
    console.error(`[i18n] Failed to load messages for locale: ${locale}`, error);
    if (locale !== DEFAULT_LOCALE) {
      await loadMessages(DEFAULT_LOCALE);
    }
  }
}
function normalizeLocale(locale) {
  return locale.replace("-", "_");
}
function t(key, substitutions) {
  const messages = messagesCache[currentLocale] || messagesCache[DEFAULT_LOCALE];
  if (!messages) {
    console.warn(
      `[i18n] No messages loaded for locale: ${currentLocale}, cache keys:`,
      Object.keys(messagesCache)
    );
    return key;
  }
  if (!messages[key]) {
    console.warn(
      `[i18n] Missing translation key: ${key} for locale: ${currentLocale}`,
      `Available keys: ${Object.keys(messages).length}`
    );
    return key;
  }
  let message = messages[key].message;
  if (substitutions) {
    const subs = Array.isArray(substitutions) ? substitutions : [substitutions];
    subs.forEach((sub, index) => {
      message = message.replace(`$${index + 1}`, sub);
    });
  }
  return message;
}
function tBrowser(key, substitutions) {
  const messages = messagesCache[browserLocale] || messagesCache[DEFAULT_LOCALE];
  if (!messages) {
    console.warn(
      `[i18n] No messages loaded for browser locale: ${browserLocale}, cache keys:`,
      Object.keys(messagesCache)
    );
    return key;
  }
  if (!messages[key]) {
    console.warn(
      `[i18n] Missing translation key: ${key} for browser locale: ${browserLocale}`,
      `Available keys: ${Object.keys(messages).length}`
    );
    return key;
  }
  let message = messages[key].message;
  if (substitutions) {
    const subs = Array.isArray(substitutions) ? substitutions : [substitutions];
    subs.forEach((sub, index) => {
      message = message.replace(`$${index + 1}`, sub);
    });
  }
  return message;
}
function getCurrentLocale() {
  return currentLocale;
}
async function setInterfaceLanguage(locale) {
  if (!isSupportedLocale(locale)) {
    console.error(`[i18n] Unsupported locale: ${locale}`);
    return;
  }
  currentLocale = locale;
  await chrome.storage.sync.set({ [STORAGE_KEY]: locale });
  await loadMessages(locale);
}
function getSupportedLocales() {
  return [...SUPPORTED_LOCALES];
}
function getBrowserLanguage() {
  return chrome.i18n.getUILanguage();
}
const DEFAULT_TIMEOUT = 1e4;
function sendMessageWithResponse(source, type, data = {}, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Message ${type} timed out after ${timeout}ms`));
    }, timeout);
    chrome.runtime.sendMessage(
      {
        source,
        type,
        data,
        timestamp: Date.now()
      },
      (response) => {
        clearTimeout(timer);
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || "Unknown error"));
        } else {
          resolve(response);
        }
      }
    );
  });
}
function sendMessageFireAndForget(source, type, data = {}) {
  chrome.runtime.sendMessage({
    source,
    type,
    data,
    timestamp: Date.now()
  });
}
async function callAPI(method, ...args) {
  const source = MessageSource.CONTENT_SCRIPT;
  const response = await sendMessageWithResponse(source, MessageType.API_CALL, {
    method,
    args
  });
  if (!(response == null ? void 0 : response.success)) {
    throw new Error((response == null ? void 0 : response.error) || `API call '${method}' failed`);
  }
  return response.data;
}
const CollectionBridge = {
  /**
   * Load collections for a specific video.
   *
   * @param videoViewId - Video view ID
   * @param sourceLang - Source language code
   * @returns Array of CollectionInfo
   */
  async loadCollections(videoViewId, sourceLang) {
    const response = await sendMessageWithResponse(
      MessageSource.CONTENT_SCRIPT,
      MessageType.COLLECTION_LOAD,
      { videoViewId, sourceLang }
    );
    return response.collections;
  },
  /**
   * Remove a collection.
   * Can be called with or without videoViewId:
   * - With videoViewId: faster lookup in specific cache
   * - Without videoViewId: searches all caches (for Popup use)
   *
   * @param collectionId - Collection UUID to remove
   * @param videoViewId - Optional video view ID for faster lookup
   * @param source - Message source (defaults to CONTENT_SCRIPT, use POPUP for Popup)
   */
  async removeCollection(collectionId, videoViewId, source = MessageSource.CONTENT_SCRIPT) {
    await sendMessageWithResponse(source, MessageType.COLLECTION_REMOVE, {
      videoViewId: videoViewId ?? 0,
      // 0 means search all caches
      collectionId
    });
  },
  /**
   * Check if a word is collected.
   *
   * @param videoViewId - Video view ID
   * @param word - Word to check
   * @param segmentBegin - Segment start time (ms)
   * @returns true if collected
   */
  async isWordCollected(videoViewId, word, segmentBegin) {
    const response = await sendMessageWithResponse(
      MessageSource.CONTENT_SCRIPT,
      MessageType.COLLECTION_CHECK,
      { videoViewId, word, segmentBegin }
    );
    return response.collected;
  },
  /**
   * Get collection ID for a word (used for unfavorite).
   *
   * @param videoViewId - Video view ID
   * @param word - Word to look up
   * @param segmentBegin - Segment start time (ms)
   * @returns Collection ID or null
   */
  async getCollectionId(videoViewId, word, segmentBegin) {
    const response = await sendMessageWithResponse(
      MessageSource.CONTENT_SCRIPT,
      MessageType.COLLECTION_CHECK,
      { videoViewId, word, segmentBegin, returnId: true }
    );
    return response.collectionId;
  },
  /**
   * Get collected lemmas for sidebar highlighting.
   *
   * @param videoViewId - Video view ID
   * @returns Set of lowercase lemmas
   */
  async getCollectedLemmas(videoViewId) {
    const response = await sendMessageWithResponse(
      MessageSource.CONTENT_SCRIPT,
      MessageType.COLLECTION_GET_LEMMAS,
      { videoViewId }
    );
    return new Set(response.lemmas);
  },
  /**
   * Create a new collection.
   * Calls API via Background, updates cache, and broadcasts to all tabs.
   *
   * @param request - Video collection create request
   * @returns Created collection response
   */
  async createCollection(request) {
    const response = await sendMessageWithResponse(MessageSource.CONTENT_SCRIPT, MessageType.COLLECTION_CREATE, { request });
    if (!response.success || !response.collection) {
      throw new Error(response.error || "Failed to create collection");
    }
    return response.collection;
  }
};
export {
  CollectionBridge,
  SUPPORTED_LANGUAGES,
  SUPPORTED_LOCALES,
  callAPI,
  getCurrentLocale,
  getLanguageName,
  initI18n,
  localeToLanguageCode,
  sendMessageFireAndForget,
  sendMessageWithResponse,
  setInterfaceLanguage,
  t,
  tBrowser
};
//# sourceMappingURL=chunk--DVCTphW.js.map
