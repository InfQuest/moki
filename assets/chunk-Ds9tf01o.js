var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
  LogLevel2[LogLevel2["INFO"] = 1] = "INFO";
  LogLevel2[LogLevel2["WARNING"] = 2] = "WARNING";
  LogLevel2[LogLevel2["ERROR"] = 3] = "ERROR";
  return LogLevel2;
})(LogLevel || {});
class Logger {
  constructor(prefix = "") {
    __publicField(this, "level");
    __publicField(this, "prefix");
    this.prefix = prefix;
    const envLevel = "0";
    const levelNum = envLevel !== void 0 ? parseInt(envLevel, 0) : 1;
    this.level = levelNum >= 0 && levelNum <= 3 ? levelNum : 1;
  }
  /**
   * Sets the minimum log level for messages to be displayed
   * @param level - The log level ('debug', 'info', 'warning', or 'error')
   */
  setLevel(level) {
    this.level = LogLevel[level.toUpperCase()];
  }
  /**
   * Internal method to handle logging with timestamp and level filtering
   * @param level - The log level of this message
   * @param consoleMethod - The console method to use ('log', 'warn', or 'error')
   * @param args - The arguments to log
   */
  log(level, consoleMethod, ...args) {
    if (level >= this.level) {
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      console[consoleMethod](`[${timestamp}] ${this.prefix}`, ...args);
    }
  }
  /**
   * Logs a debug message
   * @param args - The arguments to log
   */
  debug(...args) {
    this.log(0, "log", "[DEBUG]", ...args);
  }
  /**
   * Logs an info message
   * @param args - The arguments to log
   */
  info(...args) {
    this.log(1, "log", "[INFO]", ...args);
  }
  /**
   * Logs a warning message
   * @param args - The arguments to log
   */
  warn(...args) {
    this.log(2, "warn", "[WARN]", ...args);
  }
  /**
   * Logs an error message
   * @param args - The arguments to log
   */
  error(...args) {
    this.log(3, "error", "[ERROR]", ...args);
  }
}
const logger = new Logger("[Moki]");
export {
  Logger
};
//# sourceMappingURL=chunk-Ds9tf01o.js.map
