var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Logger } from "./chunk-Ds9tf01o.js";
import { MessageType, MessageSource } from "./chunk-BAX9q0V5.js";
const _APIClient = class _APIClient {
  /**
   * Private constructor to enforce singleton pattern
   */
  constructor() {
    __publicField(this, "baseUrl");
    __publicField(this, "logger");
    __publicField(this, "accessToken", null);
    __publicField(this, "refreshToken", null);
    __publicField(this, "tokenExpiresAt", null);
    __publicField(this, "initializationPromise", null);
    __publicField(this, "cachedUser", null);
    __publicField(this, "lastRefreshTime", 0);
    __publicField(this, "isRefreshing", false);
    __publicField(this, "refreshPromise", null);
    this.baseUrl = "http://localhost:9999";
    this.logger = new Logger("[APIClient]");
    this.logger.info(`Initialized with baseUrl: ${this.baseUrl}`);
    this.initializationPromise = this.loadTokensFromStorage();
  }
  /**
   * Get the singleton instance of APIClient
   */
  static getInstance() {
    if (!_APIClient.instance) {
      _APIClient.instance = new _APIClient();
    }
    return _APIClient.instance;
  }
  /**
   * Wait for the client to finish initialization (loading tokens from storage)
   * This should be called before checking authentication status
   */
  async waitForInitialization() {
    if (this.initializationPromise) {
      await this.initializationPromise;
      this.initializationPromise = null;
    }
  }
  // ==========================================================================
  // Public API Methods
  // ==========================================================================
  /**
   * Translate multiple text segments
   *
   * @param request - Translation request with segments and language options
   * @returns Translated segments in the same order
   * @throws Error if translation fails after retries
   *
   * @example
   * const result = await client.translate({
   *   segments: ['Hello', 'World'],
   *   source_lng: 'en',
   *   target_lng: 'zh-CN'
   * })
   * console.log(result.segments) // ['你好', '世界']
   */
  async translate(request) {
    this.logger.debug("translate() called with:", request);
    return await this.request("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
  }
  /**
   * Look up a word definition with context awareness
   *
   * @param request - Lookup request with word, context, and native language
   * @returns Array of 1-2 definitions (most likely meanings)
   * @throws Error if lookup fails after retries
   *
   * @example
   * const definitions = await client.lookupWord({
   *   word: 'bank',
   *   context: 'I went to the bank to deposit money',
   *   native_lng: 'zh-CN'
   * })
   * console.log(definitions)
   * // [{ meaning: '银行' }, { meaning: '河岸' }]
   */
  async lookupWord(request) {
    this.logger.debug("lookupWord() called with:", request);
    return await this.request("/api/dictionary/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
  }
  /**
   * Look up complete entry information from database
   *
   * @param word - Word or phrase to look up
   * @param lang_code - Language code (e.g., "en", "zh-CN", "ja")
   * @param native_lang_code - Language of glosses and examples (default: "zh-CN")
   * @param source - Optional dictionary source filter (e.g., "wiktionary")
   * @param pos - Optional part-of-speech filter (e.g., "noun", "verb")
   * @returns Complete entry information or null if not found
   * @throws Error if lookup fails after retries
   *
   * @example
   * const entry = await client.lookupEntry('三昧', 'ja', 'zh-CN')
   * console.log(entry)
   * // {
   * //   word: '三昧',
   * //   lang_code: 'ja',
   * //   entries: [
   * //     {
   * //       source: 'wiktionary',
   * //       pos: 'unknown',
   * //       forms: [{ form: '三昧', tags: ['canonical'] }, ...],
   * //       sounds: [{ ipa: '[sã̠mːa̠i]', ... }],
   * //       senses: [{ glosses: [...], examples: [...] }]
   * //     }
   * //   ]
   * // }
   */
  async lookupEntry(word, lang_code, native_lang_code = "zh-CN", source, pos) {
    this.logger.debug("lookupEntry() called with:", {
      word,
      lang_code,
      native_lang_code,
      source,
      pos
    });
    const params = new URLSearchParams({ word, lang_code, native_lang_code });
    if (source) params.append("source", source);
    if (pos) params.append("pos", pos);
    try {
      return await this.request(
        `/api/dictionary/entry?${params.toString()}`,
        {
          method: "GET"
        },
        1
        // 不重试，404 是正常的未找到情况
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        this.logger.info(`Entry not found: ${word} (${lang_code})`);
        return null;
      }
      throw error;
    }
  }
  /**
   * Perform comprehensive NLP analysis on texts (batch processing)
   *
   * @param request - Analysis request with texts array and language
   * @returns Array of NLP analysis results, one for each text
   * @throws Error if analysis fails after retries
   *
   * @example
   * const results = await client.analyzeText({
   *   texts: ['Apple is looking at buying U.K. startup', 'Hello world'],
   *   language: 'en'
   * })
   * console.log(results[0].entities)
   * // [{ text: 'Apple', label: 'ORG', ... }, { text: 'U.K.', label: 'GPE', ... }]
   */
  async analyzeText(request) {
    this.logger.debug("analyzeText() called with:", request);
    return await this.request("/api/nlp/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
  }
  /**
   * Extract phrases (idioms, phrasal verbs, collocations, etc.) from texts (batch processing)
   *
   * @param request - Phrase extraction request with texts array, language, and native language
   * @returns Array of phrase lists, each corresponding to an input text
   * @throws Error if extraction fails after retries
   *
   * @example
   * const result = await client.extractPhrases({
   *   texts: ['I need to look it up', 'Break the ice'],
   *   language: 'en',
   *   native_lng: 'zh-CN'
   * })
   * console.log(result.phrases)
   * // [
   * //   [{ phrase: 'look up', meaning: '查找', ... }],
   * //   [{ phrase: 'break the ice', meaning: '打破僵局', ... }]
   * // ]
   */
  async extractPhrases(request) {
    this.logger.debug("extractPhrases() called with:", request);
    return await this.request("/api/nlp/extract-phrases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
  }
  /**
   * Detect the language of given text
   *
   * @param request - Language detection request with text
   * @returns Detected language code and confidence score
   * @throws Error if detection fails after retries
   *
   * @example
   * const result = await client.detectLanguage({
   *   text: 'Hello world'
   * })
   * console.log(result)
   * // { language: 'en', confidence: 0.93 }
   *
   * @example
   * const result = await client.detectLanguage({
   *   text: '你好世界'
   * })
   * console.log(result)
   * // { language: 'zh-CN', confidence: 0.95 }
   */
  async detectLanguage(request) {
    this.logger.debug("detectLanguage() called with:", request);
    return await this.request("/api/nlp/detect-language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
  }
  /**
   * Register a new user account
   *
   * @param request - Registration request with email, password, and optional name
   * @returns User information
   * @throws Error if registration fails
   *
   * @example
   * const user = await client.register({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   name: 'John Doe'
   * })
   */
  async register(request) {
    this.logger.debug("register() called with:", { email: request.email });
    return await this.request(
      "/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      },
      1
      // No retry for registration
    );
  }
  /**
   * Login with email and password
   *
   * @param request - Login request with email and password
   * @returns JWT tokens (access_token and refresh_token)
   * @throws Error if login fails
   *
   * @example
   * const tokens = await client.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * })
   * // Tokens are automatically stored
   */
  async login(request) {
    this.logger.debug("login() called with:", { email: request.email });
    const tokens = await this.request(
      "/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      },
      1
      // No retry for login
    );
    await this.setTokens(tokens);
    return tokens;
  }
  /**
   * Logout and revoke refresh token
   *
   * @throws Error if logout fails
   *
   * @example
   * await client.logout()
   * // Tokens are automatically cleared
   */
  async logout() {
    this.logger.debug("logout() called");
    if (!this.refreshToken) {
      this.logger.warn("No refresh token found, cannot logout");
      return;
    }
    try {
      await this.request(
        "/api/auth/logout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: this.refreshToken })
        },
        1
        // No retry for logout
      );
    } finally {
      await this.clearTokens();
    }
  }
  /**
   * Refresh access token using refresh token
   *
   * @returns New JWT tokens
   * @throws Error if refresh fails
   *
   * @example
   * const tokens = await client.refreshAccessToken()
   * // New tokens are automatically stored
   */
  async refreshAccessToken() {
    this.logger.debug("refreshAccessToken() called");
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }
    const tokens = await this.request(
      "/api/auth/refresh",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: this.refreshToken })
      },
      1
      // No retry for token refresh
    );
    await this.setTokens(tokens);
    return tokens;
  }
  /**
   * Get current user information
   *
   * @returns User information
   * @throws Error if request fails or user is not authenticated
   *
   * @example
   * const user = await client.getCurrentUser()
   * console.log(user.email)
   */
  async getCurrentUser() {
    this.logger.debug("getCurrentUser() called");
    const user = await this.request("/api/auth/me", {
      method: "GET"
    });
    await this.cacheUser(user);
    return user;
  }
  /**
   * Get cached user information without making API request
   *
   * @returns Cached user information or null if not available
   */
  getCachedUser() {
    return this.cachedUser;
  }
  /**
   * Check if user is authenticated (has valid access token)
   * If token is expired but refresh token is available, automatically refresh
   *
   * @returns true if user is authenticated (or successfully refreshed), false otherwise
   */
  async isAuthenticated() {
    if (!this.accessToken) {
      return false;
    }
    if (!this.isTokenExpired()) {
      return true;
    }
    if (!this.refreshToken) {
      this.logger.warn("Access token expired and no refresh token available");
      return false;
    }
    const now = Date.now();
    if (now - this.lastRefreshTime < 5 * 60 * 1e3) {
      this.logger.debug("Token refreshed recently, skipping refresh");
      return true;
    }
    if (this.isRefreshing && this.refreshPromise) {
      this.logger.debug("Token refresh already in progress, waiting...");
      return await this.refreshPromise;
    }
    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        this.logger.info("Access token expired, attempting to refresh...");
        await this.refreshAccessToken();
        this.lastRefreshTime = Date.now();
        this.logger.info("Token refresh successful");
        return true;
      } catch (error) {
        this.logger.error("Token refresh failed:", error);
        await this.clearTokens();
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();
    return await this.refreshPromise;
  }
  /**
   * Get current access token
   */
  getAccessToken() {
    return this.accessToken;
  }
  /**
   * Add or update a video view record
   *
   * This endpoint handles the complete flow:
   * 1. Creates/updates video record (upsert by video_id)
   * 2. Creates/updates video view record (upsert by user_id + video_id)
   *
   * @param request - Video view request with platform, URL, ID, title, and optional metadata
   * @returns VideoViewResponse with video_view_id and video information
   * @throws Error if creation fails (500 for server error)
   *
   * @example
   * const videoView = await client.addVideoView({
   *   platform: 'youtube',
   *   video_url: 'https://www.youtube.com/watch?v=abc123',
   *   video_id: 'abc123',
   *   video_title: 'Learn English'
   * })
   * console.log(videoView.id, videoView.view_count)
   */
  async addVideoView(request) {
    this.logger.debug("addVideoView() called with:", {
      video_id: request.video_id,
      platform: request.platform
    });
    return await this.request(
      "/api/video-views",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      },
      1
      // No retry for creation
    );
  }
  /**
   * Get a specific video view by ID
   *
   * @param videoViewId - Video view ID
   * @returns VideoViewResponse with video_view and video information
   * @throws Error if not found (404) or access denied (403)
   *
   * @example
   * const videoView = await client.getVideoView(123)
   * console.log(videoView.video.video_title, videoView.view_count)
   */
  async getVideoView(videoViewId) {
    this.logger.debug("getVideoView() called with:", { videoViewId });
    return await this.request(`/api/video-views/${videoViewId}`, {
      method: "GET"
    });
  }
  /**
   * List video views for current user with pagination
   *
   * @param options - Query options (skip, limit)
   * @returns Paginated list of video views ordered by most recently viewed first
   * @throws Error if retrieval fails
   *
   * @example
   * // Get recent video views
   * const result = await client.listVideoViews()
   * console.log(result.total, result.items)
   *
   * @example
   * // Get paginated video views
   * const result = await client.listVideoViews({
   *   skip: 0,
   *   limit: 20
   * })
   */
  async listVideoViews(options) {
    this.logger.debug("listVideoViews() called with:", options);
    const params = new URLSearchParams();
    if ((options == null ? void 0 : options.skip) !== void 0) params.append("skip", options.skip.toString());
    if ((options == null ? void 0 : options.limit) !== void 0) params.append("limit", options.limit.toString());
    const endpoint = params.toString() ? `/api/video-views?${params.toString()}` : "/api/video-views";
    return await this.request(endpoint, {
      method: "GET"
    });
  }
  /**
   * Create a new video collection item
   *
   * @param request - Collection creation request with video_view_id, vocabulary, media, and video context
   * @returns Created collection with video and video_view information
   * @throws Error if creation fails (400 for validation, 409 for duplicate, 500 for server error)
   *
   * @example
   * const collection = await client.createVideoCollection({
   *   video_view_id: 123, // From addVideoView API
   *   word: 'hello',
   *   sentence: 'Hello world',
   *   translation: '你好世界',
   *   definitions: 'a greeting',
   *   entry_key: 'hello:en:zh-CN:noun:oxford',
   *   audio_base64: 'data:audio/mp3;base64,...',
   *   image_base64: 'data:image/png;base64,...',
   *   audio_duration: 1500,
   *   segment_begin: 1000,
   *   segment_end: 3000,
   *   source_language: 'en',
   *   target_language: 'zh-CN',
   * })
   */
  async createVideoCollection(request) {
    this.logger.debug("createVideoCollection() called with:", {
      word: request.word,
      video_view_id: request.video_view_id
    });
    return await this.request(
      "/api/video-collections",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      },
      1
      // No retry for creation
    );
  }
  /**
   * Get video collections for current user with optional filters
   *
   * @param options - Query options (skip, limit, video_view_id, source_language)
   * @returns Paginated list of collections
   * @throws Error if retrieval fails
   *
   * @example
   * // Get all collections
   * const result = await client.getVideoCollections()
   * console.log(result.total, result.items)
   *
   * @example
   * // Get collections for a specific video view
   * const result = await client.getVideoCollections({
   *   video_view_id: 'abc-123',
   *   source_language: 'en',
   *   skip: 0,
   *   limit: 50
   * })
   */
  async getVideoCollections(options) {
    this.logger.debug("getVideoCollections() called with:", options);
    const params = new URLSearchParams();
    if ((options == null ? void 0 : options.skip) !== void 0) params.append("skip", options.skip.toString());
    if ((options == null ? void 0 : options.limit) !== void 0) params.append("limit", options.limit.toString());
    if ((options == null ? void 0 : options.video_view_id) !== void 0)
      params.append("video_view_id", options.video_view_id.toString());
    if (options == null ? void 0 : options.source_language) params.append("source_language", options.source_language);
    const endpoint = params.toString() ? `/api/video-collections?${params.toString()}` : "/api/video-collections";
    return await this.request(endpoint, {
      method: "GET"
    });
  }
  /**
   * Get a specific video collection by ID
   *
   * @param collectionId - Collection UUID
   * @returns Collection data with video and video_view information
   * @throws Error if not found (404) or access denied (403)
   *
   * @example
   * const collection = await client.getVideoCollection('abc-123-def-456')
   * console.log(collection.word, collection.video.video_title)
   */
  async getVideoCollection(collectionId) {
    this.logger.debug("getVideoCollection() called with:", { collectionId });
    return await this.request(`/api/video-collections/${collectionId}`, {
      method: "GET"
    });
  }
  /**
   * Delete a video collection
   *
   * @param collectionId - Collection UUID to delete
   * @returns void (204 No Content on success)
   * @throws Error if not found (404) or access denied (403)
   *
   * @example
   * await client.deleteVideoCollection('abc-123-def-456')
   * console.log('Collection deleted successfully')
   */
  async deleteVideoCollection(collectionId) {
    this.logger.debug("deleteVideoCollection() called with:", { collectionId });
    await this.request(
      `/api/video-collections/${collectionId}`,
      {
        method: "DELETE"
      },
      1
      // No retry for deletion
    );
  }
  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================
  /**
   * Generic HTTP request handler with retry logic
   *
   * @param endpoint - API endpoint path (e.g., '/api/translate')
   * @param options - Fetch API options
   * @param maxRetries - Maximum number of retry attempts (default: 3)
   * @returns Parsed JSON response
   * @throws Error if all retry attempts fail
   */
  async request(endpoint, options, maxRetries = 3) {
    const url = `${this.baseUrl}${endpoint}`;
    if (this.accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`
      };
    }
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(`Request attempt ${attempt}/${maxRetries} to ${url}`);
        const response = await fetch(url, options);
        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorText}`);
        }
        if (response.status === 204) {
          this.logger.debug(`Request successful on attempt ${attempt} (204 No Content)`);
          return void 0;
        }
        const data = await response.json();
        this.logger.debug(`Request successful on attempt ${attempt}`);
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Request failed (attempt ${attempt}/${maxRetries}):`, errorMessage);
        if (attempt === maxRetries) {
          this.logger.error(`All ${maxRetries} attempts failed for ${url}`);
          throw new Error(`API request failed after ${maxRetries} attempts: ${errorMessage}`);
        }
        const delayMs = Math.pow(2, attempt - 1) * 1e3;
        this.logger.debug(`Waiting ${delayMs}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw new Error("Unexpected error in request handler");
  }
  /**
   * Load tokens and cached user from chrome.storage.local
   */
  async loadTokensFromStorage() {
    try {
      const result = await chrome.storage.local.get([
        "access_token",
        "refresh_token",
        "token_expires_at",
        "cached_user"
      ]);
      this.accessToken = result.access_token || null;
      this.refreshToken = result.refresh_token || null;
      this.tokenExpiresAt = result.token_expires_at || null;
      this.cachedUser = result.cached_user || null;
      if (this.accessToken) {
        this.logger.info("Tokens loaded from storage");
      }
      if (this.cachedUser) {
        this.logger.info("Cached user loaded from storage");
      }
    } catch (error) {
      this.logger.error("Failed to load tokens from storage:", error);
    }
  }
  /**
   * Store tokens to chrome.storage.local and update instance variables
   */
  async setTokens(tokens) {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.tokenExpiresAt = Date.now() + tokens.expires_in * 1e3;
    try {
      await chrome.storage.local.set({
        access_token: this.accessToken,
        refresh_token: this.refreshToken,
        token_expires_at: this.tokenExpiresAt
      });
      this.logger.info("Tokens stored successfully");
    } catch (error) {
      this.logger.error("Failed to store tokens:", error);
      throw error;
    }
  }
  /**
   * Clear tokens and cached user from both instance and chrome.storage.local
   */
  async clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = null;
    this.cachedUser = null;
    try {
      await chrome.storage.local.remove([
        "access_token",
        "refresh_token",
        "token_expires_at",
        "cached_user"
      ]);
      this.logger.info("Tokens and cached user cleared");
    } catch (error) {
      this.logger.error("Failed to clear tokens:", error);
    }
  }
  /**
   * Cache user information to both instance and chrome.storage.local
   */
  async cacheUser(user) {
    this.cachedUser = user;
    try {
      await chrome.storage.local.set({
        cached_user: user
      });
      this.logger.info("User cached successfully");
    } catch (error) {
      this.logger.error("Failed to cache user:", error);
    }
  }
  /**
   * Check if access token is expired
   */
  isTokenExpired() {
    if (!this.tokenExpiresAt) {
      return true;
    }
    return Date.now() >= this.tokenExpiresAt - 6e4;
  }
};
__publicField(_APIClient, "instance");
let APIClient = _APIClient;
class AuthMessageHandler {
  constructor(apiClient, logger) {
    this.apiClient = apiClient;
    this.logger = logger;
  }
  /**
   * Check if the message type is auth-related and can be handled by this handler
   */
  canHandle(messageType) {
    return [
      MessageType.CHECK_AUTH,
      MessageType.AUTH_LOGIN,
      MessageType.AUTH_LOGOUT,
      MessageType.AUTH_REGISTER,
      MessageType.AUTH_GET_USER
    ].includes(messageType);
  }
  /**
   * Handle CHECK_AUTH from Content Script
   * Returns only authenticated status (no user info)
   */
  async handleContentScriptCheckAuth(sendResponse) {
    try {
      await this.apiClient.waitForInitialization();
      const authenticated = await this.apiClient.isAuthenticated();
      sendResponse({
        source: MessageSource.BACKGROUND,
        type: MessageType.CHECK_AUTH_RESPONSE,
        data: { authenticated },
        timestamp: Date.now()
      });
    } catch (error) {
      this.logger.error("Failed to check authentication:", error);
      sendResponse({
        source: MessageSource.BACKGROUND,
        type: MessageType.CHECK_AUTH_RESPONSE,
        data: { authenticated: false },
        timestamp: Date.now()
      });
    }
  }
  /**
   * Handle CHECK_AUTH from Popup
   * Returns authenticated status and user info if authenticated
   */
  async handlePopupCheckAuth(sendResponse) {
    try {
      await this.apiClient.waitForInitialization();
      const authenticated = await this.apiClient.isAuthenticated();
      let user = null;
      if (authenticated) {
        user = this.apiClient.getCachedUser() || await this.apiClient.getCurrentUser();
      }
      sendResponse({
        source: MessageSource.BACKGROUND,
        type: MessageType.CHECK_AUTH_RESPONSE,
        data: { authenticated, user },
        timestamp: Date.now()
      });
    } catch (error) {
      this.logger.error("Failed to check authentication:", error);
      sendResponse({
        source: MessageSource.BACKGROUND,
        type: MessageType.CHECK_AUTH_RESPONSE,
        data: { authenticated: false },
        timestamp: Date.now()
      });
    }
  }
  /**
   * Handle AUTH_LOGIN from Popup
   */
  async handleLogin(data, sendResponse) {
    try {
      await this.apiClient.login(data);
      const user = await this.apiClient.getCurrentUser();
      sendResponse({ success: true, user });
      this.broadcastAuthStateChange(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      this.logger.error("Login failed:", error);
      sendResponse({ success: false, error: errorMessage });
    }
  }
  /**
   * Handle AUTH_LOGOUT from Popup
   */
  async handleLogout(sendResponse) {
    try {
      await this.apiClient.logout();
      sendResponse({ success: true });
      this.broadcastAuthStateChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Logout failed";
      this.logger.error("Logout failed:", error);
      sendResponse({ success: false, error: errorMessage });
    }
  }
  /**
   * Handle AUTH_REGISTER from Popup
   */
  async handleRegister(data, sendResponse) {
    try {
      const user = await this.apiClient.register(data);
      sendResponse({ success: true, user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      this.logger.error("Registration failed:", error);
      sendResponse({ success: false, error: errorMessage });
    }
  }
  /**
   * Handle AUTH_GET_USER from Popup
   */
  async handleGetUser(sendResponse) {
    try {
      await this.apiClient.waitForInitialization();
      const isAuth = await this.apiClient.isAuthenticated();
      if (!isAuth) {
        sendResponse({ success: false, error: "Not authenticated" });
        return;
      }
      const user = this.apiClient.getCachedUser() || await this.apiClient.getCurrentUser();
      sendResponse({ success: true, user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get user";
      this.logger.error("Failed to get user:", error);
      sendResponse({ success: false, error: errorMessage });
    }
  }
  /**
   * Broadcast authentication state change to all YouTube tabs
   * Content Scripts will update their UI accordingly
   */
  broadcastAuthStateChange(authenticated) {
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
      this.logger.debug(`Broadcasting auth state change to ${tabs.length} YouTube tabs`);
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            source: MessageSource.BACKGROUND,
            type: MessageType.AUTH_STATE_CHANGED,
            data: { authenticated },
            timestamp: Date.now()
          });
        }
      });
    });
  }
}
class CollectionMessageHandler {
  constructor(apiClient, collectionManager, logger) {
    this.apiClient = apiClient;
    this.collectionManager = collectionManager;
    this.logger = logger;
  }
  /**
   * Check if the message type is collection-related and can be handled by this handler
   */
  canHandle(messageType) {
    return [
      MessageType.COLLECTION_LOAD,
      MessageType.COLLECTION_CREATE,
      MessageType.COLLECTION_REMOVE,
      MessageType.COLLECTION_CHECK,
      MessageType.COLLECTION_GET_LEMMAS
    ].includes(messageType);
  }
  /**
   * Handles COLLECTION_LOAD request.
   * Loads collections for a video and caches them.
   */
  async handleLoad(data, sendResponse) {
    try {
      const collections = await this.collectionManager.loadCollections(
        data.videoViewId,
        data.sourceLang
      );
      sendResponse({ collections });
    } catch (error) {
      this.logger.error("Failed to load collections:", error);
      sendResponse({
        collections: [],
        error: error instanceof Error ? error.message : "Failed to load collections"
      });
    }
  }
  /**
   * Handles COLLECTION_CREATE request.
   * Calls API to create collection, updates cache, and broadcasts.
   */
  async handleCreate(data, sendResponse) {
    var _a;
    try {
      const collection = await this.apiClient.createVideoCollection(data.request);
      this.logger.info(`Collection created: id=${collection.id}, word=${data.request.word}`);
      const collectionInfo = {
        id: collection.id,
        word: data.request.word,
        lemma: ((_a = data.request.lemma) == null ? void 0 : _a.toLowerCase()) ?? null,
        segmentBegin: data.request.segment_begin
      };
      this.collectionManager.addCollection(data.request.video_view_id, collectionInfo);
      sendResponse({
        success: true,
        collection
      });
    } catch (error) {
      this.logger.error("Failed to create collection:", error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : "Failed to create collection"
      });
    }
  }
  /**
   * Handles COLLECTION_REMOVE request.
   * Calls delete API and removes from cache.
   */
  async handleRemove(data, sendResponse) {
    try {
      await this.apiClient.deleteVideoCollection(data.collectionId);
      const videoViewId = data.videoViewId === 0 ? null : data.videoViewId;
      this.collectionManager.removeCollection(videoViewId, data.collectionId);
      sendResponse({ success: true });
    } catch (error) {
      this.logger.error("Failed to remove collection:", error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : "Failed to remove collection"
      });
    }
  }
  /**
   * Handles COLLECTION_CHECK request.
   * Checks if a word is collected and optionally returns collection ID.
   */
  handleCheck(data, sendResponse) {
    const collected = this.collectionManager.isWordCollected(
      data.videoViewId,
      data.word,
      data.segmentBegin
    );
    if (data.returnId) {
      const collectionId = this.collectionManager.getCollectionId(
        data.videoViewId,
        data.word,
        data.segmentBegin
      );
      sendResponse({ collected, collectionId });
    } else {
      sendResponse({ collected });
    }
  }
  /**
   * Handles COLLECTION_GET_LEMMAS request.
   * Returns all collected lemmas for sidebar highlighting.
   */
  handleGetLemmas(data, sendResponse) {
    const lemmasSet = this.collectionManager.getCollectedLemmas(data.videoViewId);
    sendResponse({ lemmas: Array.from(lemmasSet) });
  }
}
const _CollectionManager = class _CollectionManager {
  constructor(apiClient) {
    __publicField(this, "logger", new Logger("[CollectionManager]"));
    __publicField(this, "apiClient");
    // videoViewId → (cacheKey → CollectionInfo)
    __publicField(this, "cache", /* @__PURE__ */ new Map());
    this.apiClient = apiClient;
  }
  /**
   * Get singleton instance
   */
  static getInstance(apiClient) {
    if (!_CollectionManager.instance) {
      _CollectionManager.instance = new _CollectionManager(apiClient);
    }
    return _CollectionManager.instance;
  }
  /**
   * Load collections for a specific video.
   * Caches the result and broadcasts COLLECTIONS_LOADED event.
   *
   * @param videoViewId - Video view ID
   * @param sourceLang - Source language code
   * @returns Array of CollectionInfo
   */
  async loadCollections(videoViewId, sourceLang) {
    this.logger.debug(
      `Loading collections for videoViewId=${videoViewId}, sourceLang=${sourceLang}`
    );
    try {
      const response = await this.apiClient.getVideoCollections({
        video_view_id: videoViewId,
        source_language: sourceLang,
        limit: 1e3
        // Load all collections for this video
      });
      const videoCache = /* @__PURE__ */ new Map();
      const collections = [];
      for (const item of response.items) {
        const info = {
          id: item.id,
          word: item.word,
          lemma: item.lemma ? item.lemma.toLowerCase() : null,
          segmentBegin: item.segment_begin
        };
        const key = this.getCacheKey(item.word, item.segment_begin);
        videoCache.set(key, info);
        collections.push(info);
      }
      this.cache.set(videoViewId, videoCache);
      this.logger.info(`Loaded ${collections.length} collections for videoViewId=${videoViewId}`);
      return collections;
    } catch (error) {
      this.logger.error(`Failed to load collections for videoViewId=${videoViewId}:`, error);
      throw error;
    }
  }
  /**
   * Add a collection to cache (called after successful API creation).
   * Broadcasts COLLECTION_ADDED event.
   *
   * @param videoViewId - Video view ID
   * @param collection - Collection info to add
   */
  addCollection(videoViewId, collection) {
    let videoCache = this.cache.get(videoViewId);
    if (!videoCache) {
      videoCache = /* @__PURE__ */ new Map();
      this.cache.set(videoViewId, videoCache);
    }
    const key = this.getCacheKey(collection.word, collection.segmentBegin);
    videoCache.set(key, collection);
    this.logger.debug(
      `Added collection: videoViewId=${videoViewId}, word=${collection.word}, id=${collection.id}`
    );
    this.broadcast(MessageType.COLLECTION_ADDED, { videoViewId, collection });
  }
  /**
   * Remove a collection from cache (called after successful API deletion).
   * Broadcasts COLLECTION_REMOVED event.
   *
   * @param videoViewId - Video view ID (optional, will search all caches if null)
   * @param collectionId - Collection UUID to remove
   */
  removeCollection(videoViewId, collectionId) {
    let cachesToSearch;
    if (videoViewId !== null) {
      const videoCache = this.cache.get(videoViewId);
      if (!videoCache) {
        this.logger.warn(`No cache found for videoViewId=${videoViewId}`);
        return;
      }
      cachesToSearch = [[videoViewId, videoCache]];
    } else {
      cachesToSearch = Array.from(this.cache.entries());
    }
    for (const [vvId, videoCache] of cachesToSearch) {
      for (const [key, info] of videoCache.entries()) {
        if (info.id === collectionId) {
          videoCache.delete(key);
          this.logger.debug(`Removed collection: videoViewId=${vvId}, collectionId=${collectionId}`);
          const data = {
            videoViewId: vvId,
            collectionId,
            word: info.word,
            lemma: info.lemma
          };
          this.broadcast(MessageType.COLLECTION_REMOVED, data);
          return;
        }
      }
    }
    const scope = videoViewId !== null ? `videoViewId=${videoViewId}` : "all caches";
    this.logger.warn(`Collection not found in ${scope}: collectionId=${collectionId}`);
  }
  /**
   * Check if a word is collected for a specific video.
   *
   * @param videoViewId - Video view ID
   * @param word - Word to check
   * @param segmentBegin - Segment start time (ms)
   * @returns true if collected, false otherwise
   */
  isWordCollected(videoViewId, word, segmentBegin) {
    const videoCache = this.cache.get(videoViewId);
    if (!videoCache) return false;
    const key = this.getCacheKey(word, segmentBegin);
    return videoCache.has(key);
  }
  /**
   * Get collection ID for a word (used for unfavorite).
   *
   * @param videoViewId - Video view ID
   * @param word - Word to look up
   * @param segmentBegin - Segment start time (ms)
   * @returns Collection ID or null if not found
   */
  getCollectionId(videoViewId, word, segmentBegin) {
    var _a;
    const videoCache = this.cache.get(videoViewId);
    if (!videoCache) return null;
    const key = this.getCacheKey(word, segmentBegin);
    return ((_a = videoCache.get(key)) == null ? void 0 : _a.id) ?? null;
  }
  /**
   * Get all collected lemmas for a video (used for sidebar highlighting).
   *
   * @param videoViewId - Video view ID
   * @returns Set of lowercase lemmas
   */
  getCollectedLemmas(videoViewId) {
    const lemmas = /* @__PURE__ */ new Set();
    const videoCache = this.cache.get(videoViewId);
    if (!videoCache) return lemmas;
    for (const info of videoCache.values()) {
      if (info.lemma) {
        lemmas.add(info.lemma);
      }
    }
    return lemmas;
  }
  /**
   * Clear cache for a specific video (e.g., when video changes).
   *
   * @param videoViewId - Video view ID
   */
  clearCache(videoViewId) {
    this.cache.delete(videoViewId);
    this.logger.debug(`Cleared cache for videoViewId=${videoViewId}`);
  }
  /**
   * Generate cache key from word and segment begin time.
   */
  getCacheKey(word, segmentBegin) {
    return `${word.toLowerCase()}:${segmentBegin}`;
  }
  /**
   * Broadcast message to all YouTube tabs and Popup.
   */
  broadcast(type, data) {
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            source: MessageSource.BACKGROUND,
            type,
            data,
            timestamp: Date.now()
          }).catch(() => {
          });
        }
      }
    });
    chrome.runtime.sendMessage({
      source: MessageSource.BACKGROUND,
      type,
      data,
      timestamp: Date.now()
    }).catch(() => {
    });
  }
};
__publicField(_CollectionManager, "instance", null);
let CollectionManager = _CollectionManager;
const DEFAULT_SETTINGS = {
  nativeLanguage: "zh-CN",
  targetLanguage: "en",
  interfaceLanguage: "zh_CN"
};
class SettingsHandler {
  constructor(logger) {
    this.logger = logger;
  }
  /**
   * Check if the message type is settings-related and can be handled by this handler
   */
  canHandle(messageType) {
    return [MessageType.SETTINGS_LOAD, MessageType.SETTINGS_SAVE].includes(messageType);
  }
  /**
   * Handle SETTINGS_LOAD from Popup or Content Script
   * Returns current settings from chrome.storage.sync
   */
  async handleLoad(sendResponse) {
    try {
      const stored = await chrome.storage.sync.get([
        "nativeLanguage",
        "targetLanguage",
        "interfaceLanguage"
      ]);
      const settings = {
        nativeLanguage: stored.nativeLanguage || DEFAULT_SETTINGS.nativeLanguage,
        targetLanguage: stored.targetLanguage || DEFAULT_SETTINGS.targetLanguage,
        interfaceLanguage: stored.interfaceLanguage || DEFAULT_SETTINGS.interfaceLanguage
      };
      this.logger.debug("Loaded settings:", settings);
      sendResponse({ success: true, settings });
    } catch (error) {
      this.logger.error("Failed to load settings:", error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : "Failed to load settings"
      });
    }
  }
  /**
   * Handle SETTINGS_SAVE from Popup
   * Saves to chrome.storage.sync and broadcasts changes to all YouTube tabs
   */
  async handleSave(data, sendResponse) {
    try {
      const { settings: newSettings } = data;
      const stored = await chrome.storage.sync.get([
        "nativeLanguage",
        "targetLanguage",
        "interfaceLanguage"
      ]);
      const currentSettings = {
        nativeLanguage: stored.nativeLanguage || DEFAULT_SETTINGS.nativeLanguage,
        targetLanguage: stored.targetLanguage || DEFAULT_SETTINGS.targetLanguage,
        interfaceLanguage: stored.interfaceLanguage || DEFAULT_SETTINGS.interfaceLanguage
      };
      const changedKeys = [];
      for (const key of Object.keys(newSettings)) {
        if (newSettings[key] !== void 0 && newSettings[key] !== currentSettings[key]) {
          changedKeys.push(key);
        }
      }
      const updatedSettings = {
        ...currentSettings,
        ...newSettings
      };
      await chrome.storage.sync.set({
        nativeLanguage: updatedSettings.nativeLanguage,
        targetLanguage: updatedSettings.targetLanguage,
        interfaceLanguage: updatedSettings.interfaceLanguage
      });
      this.logger.debug("Saved settings:", updatedSettings, "Changed keys:", changedKeys);
      sendResponse({ success: true, settings: updatedSettings });
      if (changedKeys.length > 0) {
        this.broadcastSettingsChange(updatedSettings, changedKeys);
      }
    } catch (error) {
      this.logger.error("Failed to save settings:", error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : "Failed to save settings"
      });
    }
  }
  /**
   * Broadcast settings change to all YouTube tabs
   * Content Scripts will update their UI accordingly (e.g., reload i18n, refresh MokiControl menu)
   */
  broadcastSettingsChange(settings, changedKeys) {
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
      this.logger.debug(
        `Broadcasting settings change to ${tabs.length} YouTube tabs. Changed: ${changedKeys.join(", ")}`
      );
      const data = { settings, changedKeys };
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            source: MessageSource.BACKGROUND,
            type: MessageType.SETTINGS_CHANGED,
            data,
            timestamp: Date.now()
          });
        }
      });
    });
  }
}
class BackgroundService {
  constructor() {
    __publicField(this, "logger", new Logger("[Background]"));
    __publicField(this, "nativeLng", "zh-CN");
    __publicField(this, "apiClient");
    __publicField(this, "authHandler");
    __publicField(this, "collectionHandler");
    __publicField(this, "settingsHandler");
    this.apiClient = APIClient.getInstance();
    this.authHandler = new AuthMessageHandler(this.apiClient, this.logger);
    const collectionManager = CollectionManager.getInstance(this.apiClient);
    this.collectionHandler = new CollectionMessageHandler(
      this.apiClient,
      collectionManager,
      this.logger
    );
    this.settingsHandler = new SettingsHandler(this.logger);
    this.setupMessageListeners();
  }
  /**
   * Sets up Chrome runtime message listeners
   */
  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.source === MessageSource.CONTENT_SCRIPT) {
        return this.handleContentScriptMessage(message, sender, sendResponse);
      } else if (message.source === MessageSource.POPUP) {
        return this.handlePopupMessage(message, sender, sendResponse);
      } else {
        this.logger.warn(`Unknown message source: ${message.source}`);
        return false;
      }
    });
  }
  /**
   * Handles messages from Content Scripts
   */
  handleContentScriptMessage(message, _sender, sendResponse) {
    switch (message.type) {
      case MessageType.TRANSLATE_REQUEST:
        this.handleTranslateRequest(message.data, sendResponse);
        return true;
      case MessageType.PHRASE_EXTRACT_REQUEST:
        this.handlePhraseExtractRequest(message.data, sendResponse);
        return true;
      case MessageType.COLLECTION_LOAD:
        this.collectionHandler.handleLoad(message.data, sendResponse);
        return true;
      case MessageType.COLLECTION_CREATE:
        this.collectionHandler.handleCreate(message.data, sendResponse);
        return true;
      case MessageType.COLLECTION_REMOVE:
        this.collectionHandler.handleRemove(message.data, sendResponse);
        return true;
      case MessageType.COLLECTION_CHECK:
        this.collectionHandler.handleCheck(message.data, sendResponse);
        return true;
      case MessageType.COLLECTION_GET_LEMMAS:
        this.collectionHandler.handleGetLemmas(message.data, sendResponse);
        return true;
      case MessageType.CHECK_AUTH:
        this.authHandler.handleContentScriptCheckAuth(sendResponse);
        return true;
      case MessageType.OPEN_POPUP:
        this.openPopup();
        break;
      case MessageType.API_CALL:
        this.handleAPICall(message.data, sendResponse);
        return true;
      default:
        this.logger.warn(`Unknown content script message type: ${message.type}`);
        break;
    }
    return false;
  }
  /**
   * Handles messages from Popup
   */
  handlePopupMessage(message, _sender, sendResponse) {
    switch (message.type) {
      case MessageType.AUTH_LOGIN:
        this.authHandler.handleLogin(message.data, sendResponse);
        return true;
      case MessageType.AUTH_LOGOUT:
        this.authHandler.handleLogout(sendResponse);
        return true;
      case MessageType.AUTH_REGISTER:
        this.authHandler.handleRegister(message.data, sendResponse);
        return true;
      case MessageType.AUTH_GET_USER:
        this.authHandler.handleGetUser(sendResponse);
        return true;
      case MessageType.CHECK_AUTH:
        this.authHandler.handlePopupCheckAuth(sendResponse);
        return true;
      case MessageType.SETTINGS_LOAD:
        this.settingsHandler.handleLoad(sendResponse);
        return true;
      case MessageType.SETTINGS_SAVE:
        this.settingsHandler.handleSave(message.data, sendResponse);
        return true;
      case MessageType.NATIVE_LANGUAGE_CHANGE:
        this.handleNativeLanguageChange(message.data.nativeLng);
        break;
      case MessageType.GET_SUBTITLE_DATA:
        sendResponse({
          source: MessageSource.BACKGROUND,
          type: MessageType.GET_SUBTITLE_DATA_RESPONSE,
          data: {
            subtitleData: null,
            message: "Background is stateless. Subtitle data is managed by Content Script."
          },
          timestamp: Date.now()
        });
        break;
      case MessageType.COLLECTION_REMOVE:
        this.collectionHandler.handleRemove(message.data, sendResponse);
        return true;
      case MessageType.API_CALL:
        this.handleAPICall(message.data, sendResponse);
        return true;
      default:
        this.logger.warn(`Unknown popup message type: ${message.type}`);
    }
    return false;
  }
  /**
   * Handles translation requests from Content Script.
   * Pure API proxy - no state management.
   */
  async handleTranslateRequest(data, sendResponse) {
    const { segments, sourceLng, targetLng } = data;
    try {
      const response = await this.apiClient.translate({
        segments,
        source_lng: sourceLng,
        target_lng: targetLng
      });
      if (response.segments.length !== segments.length) {
        throw new Error(
          `Translation count mismatch: expected ${segments.length}, got ${response.segments.length}`
        );
      }
      sendResponse({
        success: true,
        segments: response.segments
      });
    } catch (error) {
      this.logger.error("Translation request failed:", error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : "Translation failed"
      });
    }
  }
  /**
   * Handles phrase extraction requests from Content Script.
   * Pure API proxy - no state management.
   */
  async handlePhraseExtractRequest(data, sendResponse) {
    const { texts, language, nativeLng } = data;
    try {
      const response = await this.apiClient.extractPhrases({
        texts,
        language,
        native_lng: nativeLng
      });
      sendResponse({
        success: true,
        phrases: response.phrases
      });
    } catch (error) {
      this.logger.error("Phrase extraction request failed:", error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : "Phrase extraction failed"
      });
    }
  }
  /**
   * Opens the extension popup.
   */
  openPopup() {
    ;
    (async () => {
      try {
        await chrome.action.openPopup();
        this.logger.debug("Popup opened successfully");
      } catch (error) {
        this.logger.error("Failed to open popup:", error);
        chrome.tabs.create({
          url: chrome.runtime.getURL("popup.html")
        });
      }
    })();
  }
  /**
   * Handles native language change from Popup.
   * Broadcasts to all YouTube tabs.
   */
  handleNativeLanguageChange(newNativeLng) {
    if (this.nativeLng === newNativeLng) {
      return;
    }
    this.logger.debug(`Native language changed: ${this.nativeLng} → ${newNativeLng}`);
    this.nativeLng = newNativeLng;
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
      this.logger.debug(`Broadcasting language change to ${tabs.length} YouTube tabs`);
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            source: MessageSource.BACKGROUND,
            type: MessageType.NATIVE_LANGUAGE_CHANGE,
            data: { nativeLng: newNativeLng },
            timestamp: Date.now()
          });
        }
      });
    });
  }
  /**
   * Handles generic API calls.
   * Forwards method calls to APIClient.
   */
  async handleAPICall(data, sendResponse) {
    const { method, args } = data;
    try {
      await this.apiClient.waitForInitialization();
      const apiMethod = this.apiClient[method];
      if (typeof apiMethod !== "function") {
        throw new Error(`Unknown API method: ${method}`);
      }
      const result = await apiMethod.apply(this.apiClient, args);
      sendResponse({
        success: true,
        data: result
      });
    } catch (error) {
      this.logger.error(`API call '${method}' failed:`, error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : "API call failed"
      });
    }
  }
}
new BackgroundService();
//# sourceMappingURL=chunk-vo5pk0JH.js.map
