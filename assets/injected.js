var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class XHRInterceptor {
  constructor() {
    __publicField(this, "originalOpen", XMLHttpRequest.prototype.open);
    __publicField(this, "originalSend", XMLHttpRequest.prototype.send);
    this.setupInterceptors();
  }
  /**
   * Sets up interceptors for XMLHttpRequest open and send methods
   */
  setupInterceptors() {
    const self = this;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      const xhr = this;
      const urlString = typeof url === "string" ? url : url.toString();
      xhr._intercepted = {
        url: urlString,
        method,
        timestamp: Date.now()
      };
      return self.originalOpen.apply(this, [method, urlString, ...args]);
    };
    XMLHttpRequest.prototype.send = function(body) {
      var _a;
      const xhr = this;
      const url = (_a = xhr._intercepted) == null ? void 0 : _a.url;
      if (url && self.isSubtitleRequest(url)) {
        console.log("[XHRInterceptor] Detected timedtext request:", url);
        self.notifyContentScript("SUBTITLE_URL_DETECTED", {
          url,
          method: xhr._intercepted.method
        });
      }
      return self.originalSend.call(this, body);
    };
  }
  /**
   * Check if a URL matches subtitle file patterns
   * @param url - The URL to check
   * @returns True if the URL appears to be a subtitle request
   */
  isSubtitleRequest(url) {
    const subtitlePatterns = [
      /timedtext/,
      /\.vtt(\?|$)/,
      /\.srt(\?|$)/,
      /subtitles?/,
      /captions?/,
      /\.ttml(\?|$)/
    ];
    return subtitlePatterns.some((pattern) => pattern.test(url));
  }
  /**
   * Sends a message to the content script via postMessage
   * @param type - The message type to send
   * @param data - The data payload to include in the message
   */
  notifyContentScript(type, data) {
    window.postMessage(
      {
        source: "XHR_INTERCEPTED",
        type,
        data,
        timestamp: Date.now()
      },
      "*"
    );
  }
}
class FetchInterceptor {
  constructor() {
    __publicField(this, "originalFetch", window.fetch.bind(window));
    this.setupInterceptor();
  }
  setupInterceptor() {
    const self = this;
    window.fetch = async function(input, init) {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const response = await self.originalFetch(input, init);
      if (self.isPlayerApiRequest(url)) {
        const clonedResponse = response.clone();
        self.handlePlayerApiResponse(clonedResponse).catch((error) => {
          console.error("[FetchInterceptor] Failed to process player API response:", error);
        });
      }
      return response;
    };
  }
  isPlayerApiRequest(url) {
    return /\/youtubei\/v1\/player/.test(url);
  }
  async handlePlayerApiResponse(response) {
    var _a;
    try {
      if (!response.ok) return;
      const data = await response.json();
      if (!((_a = data.videoDetails) == null ? void 0 : _a.videoId)) return;
      window.postMessage(
        {
          source: "INJECTED_SCRIPT",
          type: "VIDEO_METADATA",
          data: {
            playerResponse: data,
            initialData: null
          },
          timestamp: Date.now()
        },
        "*"
      );
    } catch (error) {
      console.error("[FetchInterceptor] Failed to parse Player API response:", error);
    }
  }
}
class VideoMetadataExtractor {
  constructor() {
    this.setupMessageListener();
    this.sendInitialDataIfAvailable();
  }
  /**
   * Listen for requests from Content Script
   */
  setupMessageListener() {
    window.addEventListener("message", (event) => {
      var _a, _b;
      if (event.source !== window) return;
      if (((_a = event.data) == null ? void 0 : _a.source) === "CONTENT_SCRIPT" && ((_b = event.data) == null ? void 0 : _b.type) === "GET_VIDEO_METADATA") {
        this.sendVideoMetadata();
      }
    });
  }
  /**
   * Send initial data if ytInitialPlayerResponse is already available
   * Uses a small delay to ensure YouTube has finished setting up its data
   */
  sendInitialDataIfAvailable() {
    if (this.hasYouTubeData()) {
      this.sendVideoMetadata();
      return;
    }
    const delays = [100, 500, 1e3, 2e3];
    delays.forEach((delay) => {
      setTimeout(() => {
        if (this.hasYouTubeData()) {
          this.sendVideoMetadata();
        }
      }, delay);
    });
  }
  /**
   * Check if YouTube data is available
   */
  hasYouTubeData() {
    const win = window;
    return !!(win.ytInitialPlayerResponse || win.ytInitialData);
  }
  /**
   * Extract and send video metadata to Content Script
   */
  sendVideoMetadata() {
    const win = window;
    window.postMessage(
      {
        source: "INJECTED_SCRIPT",
        type: "VIDEO_METADATA",
        data: {
          playerResponse: win.ytInitialPlayerResponse || null,
          initialData: win.ytInitialData || null
        },
        timestamp: Date.now()
      },
      "*"
    );
  }
}
;
(() => {
  if (!window._xhrInterceptorInitialized) {
    ;
    window._xhrInterceptorInitialized = true;
    new XHRInterceptor();
    new FetchInterceptor();
    new VideoMetadataExtractor();
    console.log(
      "[Interceptor] XHR/Fetch Interceptors and Video Metadata Extractor initialized in page context"
    );
  }
})();
//# sourceMappingURL=injected.js.map
