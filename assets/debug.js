import { reactExports, jsxRuntimeExports, React, client } from "./chunk-DDi0q0f_.js";
import { MessageType, MessageSource } from "./chunk-BAX9q0V5.js";
import "./chunk-BD1GsdAo.js";
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
var toggleSelection = function() {
  var selection = document.getSelection();
  if (!selection.rangeCount) {
    return function() {
    };
  }
  var active = document.activeElement;
  var ranges = [];
  for (var i = 0; i < selection.rangeCount; i++) {
    ranges.push(selection.getRangeAt(i));
  }
  switch (active.tagName.toUpperCase()) {
    case "INPUT":
    case "TEXTAREA":
      active.blur();
      break;
    default:
      active = null;
      break;
  }
  selection.removeAllRanges();
  return function() {
    selection.type === "Caret" && selection.removeAllRanges();
    if (!selection.rangeCount) {
      ranges.forEach(function(range) {
        selection.addRange(range);
      });
    }
    active && active.focus();
  };
};
var deselectCurrent = toggleSelection;
var clipboardToIE11Formatting = {
  "text/plain": "Text",
  "text/html": "Url",
  "default": "Text"
};
var defaultMessage = "Copy to clipboard: #{key}, Enter";
function format(message) {
  var copyKey = (/mac os x/i.test(navigator.userAgent) ? "⌘" : "Ctrl") + "+C";
  return message.replace(/#{\s*key\s*}/g, copyKey);
}
function copy(text, options) {
  var debug, message, reselectPrevious, range, selection, mark, success = false;
  if (!options) {
    options = {};
  }
  debug = options.debug || false;
  try {
    reselectPrevious = deselectCurrent();
    range = document.createRange();
    selection = document.getSelection();
    mark = document.createElement("span");
    mark.textContent = text;
    mark.ariaHidden = "true";
    mark.style.all = "unset";
    mark.style.position = "fixed";
    mark.style.top = 0;
    mark.style.clip = "rect(0, 0, 0, 0)";
    mark.style.whiteSpace = "pre";
    mark.style.webkitUserSelect = "text";
    mark.style.MozUserSelect = "text";
    mark.style.msUserSelect = "text";
    mark.style.userSelect = "text";
    mark.addEventListener("copy", function(e) {
      e.stopPropagation();
      if (options.format) {
        e.preventDefault();
        if (typeof e.clipboardData === "undefined") {
          debug && console.warn("unable to use e.clipboardData");
          debug && console.warn("trying IE specific stuff");
          window.clipboardData.clearData();
          var format2 = clipboardToIE11Formatting[options.format] || clipboardToIE11Formatting["default"];
          window.clipboardData.setData(format2, text);
        } else {
          e.clipboardData.clearData();
          e.clipboardData.setData(options.format, text);
        }
      }
      if (options.onCopy) {
        e.preventDefault();
        options.onCopy(e.clipboardData);
      }
    });
    document.body.appendChild(mark);
    range.selectNodeContents(mark);
    selection.addRange(range);
    var successful = document.execCommand("copy");
    if (!successful) {
      throw new Error("copy command was unsuccessful");
    }
    success = true;
  } catch (err) {
    debug && console.error("unable to copy using execCommand: ", err);
    debug && console.warn("trying IE specific stuff");
    try {
      window.clipboardData.setData(options.format || "text", text);
      options.onCopy && options.onCopy(window.clipboardData);
      success = true;
    } catch (err2) {
      debug && console.error("unable to copy using clipboardData: ", err2);
      debug && console.error("falling back to prompt");
      message = format("message" in options ? options.message : defaultMessage);
      window.prompt(message, text);
    }
  } finally {
    if (selection) {
      if (typeof selection.removeRange == "function") {
        selection.removeRange(range);
      } else {
        selection.removeAllRanges();
      }
    }
    if (mark) {
      document.body.removeChild(mark);
    }
    reselectPrevious();
  }
  return success;
}
var copyToClipboard = copy;
function isObject(node) {
  return Object.prototype.toString.call(node) === "[object Object]";
}
function objectSize(node) {
  return Array.isArray(node) ? node.length : isObject(node) ? Object.keys(node).length : 0;
}
function stringifyForCopying(node, space) {
  if (typeof node === "string") {
    return node;
  }
  try {
    return JSON.stringify(node, (key, value) => {
      switch (typeof value) {
        case "bigint":
          return String(value) + "n";
        case "number":
        case "boolean":
        case "object":
        case "string":
          return value;
        default:
          return String(value);
      }
    }, space);
  } catch (error) {
    return `${error.name}: ${error.message}` || "JSON.stringify failed";
  }
}
function writeClipboard(value) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      yield navigator.clipboard.writeText(value);
    } catch (err) {
      copyToClipboard(value);
    }
  });
}
function isCollapsed(node, depth, indexOrName, collapsed, collapseObjectsAfterLength, customOptions) {
  if (customOptions && customOptions.collapsed !== void 0)
    return !!customOptions.collapsed;
  if (typeof collapsed === "boolean")
    return collapsed;
  if (typeof collapsed === "number" && depth > collapsed)
    return true;
  const size = objectSize(node);
  if (typeof collapsed === "function") {
    const result = safeCall(collapsed, [{ node, depth, indexOrName, size }]);
    if (typeof result === "boolean")
      return result;
  }
  if (Array.isArray(node) && size > collapseObjectsAfterLength)
    return true;
  if (isObject(node) && size > collapseObjectsAfterLength)
    return true;
  return false;
}
function isCollapsed_largeArray(node, depth, indexOrName, collapsed, collapseObjectsAfterLength, customOptions) {
  if (customOptions && customOptions.collapsed !== void 0)
    return !!customOptions.collapsed;
  if (typeof collapsed === "boolean")
    return collapsed;
  if (typeof collapsed === "number" && depth > collapsed)
    return true;
  const size = Math.ceil(node.length / 100);
  if (typeof collapsed === "function") {
    const result = safeCall(collapsed, [{ node, depth, indexOrName, size }]);
    if (typeof result === "boolean")
      return result;
  }
  if (Array.isArray(node) && size > collapseObjectsAfterLength)
    return true;
  if (isObject(node) && size > collapseObjectsAfterLength)
    return true;
  return false;
}
function ifDisplay(displaySize, depth, fold) {
  if (typeof displaySize === "boolean")
    return displaySize;
  if (typeof displaySize === "number" && depth > displaySize)
    return true;
  if (displaySize === "collapsed" && fold)
    return true;
  if (displaySize === "expanded" && !fold)
    return true;
  return false;
}
function safeCall(func, params) {
  try {
    return func(...params);
  } catch (event) {
    reportError(event);
  }
}
function editableAdd(editable) {
  if (editable === true)
    return true;
  if (isObject(editable) && editable.add === true)
    return true;
}
function editableEdit(editable) {
  if (editable === true)
    return true;
  if (isObject(editable) && editable.edit === true)
    return true;
}
function editableDelete(editable) {
  if (editable === true)
    return true;
  if (isObject(editable) && editable.delete === true)
    return true;
}
function isReactComponent(component) {
  return typeof component === "function";
}
function customAdd(customOptions) {
  return !customOptions || customOptions.add === void 0 || !!customOptions.add;
}
function customEdit(customOptions) {
  return !customOptions || customOptions.edit === void 0 || !!customOptions.edit;
}
function customDelete(customOptions) {
  return !customOptions || customOptions.delete === void 0 || !!customOptions.delete;
}
function customCopy(customOptions) {
  return !customOptions || customOptions.enableClipboard === void 0 || !!customOptions.enableClipboard;
}
function customMatchesURL(customOptions) {
  return !customOptions || customOptions.matchesURL === void 0 || !!customOptions.matchesURL;
}
function resolveEvalFailedNewValue(type, value) {
  if (type === "string") {
    return value.trim().replace(/^\"([\s\S]+?)\"$/, "$1");
  }
  return value;
}
var _path$8;
function _extends$8() {
  _extends$8 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$8.apply(this, arguments);
}
var SvgAngleDown = function SvgAngleDown2(props) {
  return /* @__PURE__ */ reactExports.createElement("svg", _extends$8({
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    fill: "none",
    viewBox: "0 0 16 16"
  }, props), _path$8 || (_path$8 = /* @__PURE__ */ reactExports.createElement("path", {
    fill: "currentColor",
    d: "M12.473 5.806a.666.666 0 0 0-.946 0L8.473 8.86a.667.667 0 0 1-.946 0L4.473 5.806a.667.667 0 1 0-.946.94l3.06 3.06a2 2 0 0 0 2.826 0l3.06-3.06a.667.667 0 0 0 0-.94Z"
  })));
};
var _path$7;
function _extends$7() {
  _extends$7 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$7.apply(this, arguments);
}
var SvgCopy = function SvgCopy2(props) {
  return /* @__PURE__ */ reactExports.createElement("svg", _extends$7({
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    fill: "none",
    viewBox: "0 0 24 24"
  }, props), _path$7 || (_path$7 = /* @__PURE__ */ reactExports.createElement("path", {
    fill: "currentColor",
    d: "M17.542 2.5h-4.75a3.963 3.963 0 0 0-3.959 3.958v4.75a3.963 3.963 0 0 0 3.959 3.959h4.75a3.963 3.963 0 0 0 3.958-3.959v-4.75A3.963 3.963 0 0 0 17.542 2.5Zm2.375 8.708a2.378 2.378 0 0 1-2.375 2.375h-4.75a2.378 2.378 0 0 1-2.375-2.375v-4.75a2.378 2.378 0 0 1 2.375-2.375h4.75a2.378 2.378 0 0 1 2.375 2.375v4.75Zm-4.75 6.334a3.963 3.963 0 0 1-3.959 3.958h-4.75A3.963 3.963 0 0 1 2.5 17.542v-4.75a3.963 3.963 0 0 1 3.958-3.959.791.791 0 1 1 0 1.584 2.378 2.378 0 0 0-2.375 2.375v4.75a2.378 2.378 0 0 0 2.375 2.375h4.75a2.378 2.378 0 0 0 2.375-2.375.792.792 0 1 1 1.584 0Z"
  })));
};
var _path$6, _path2$5;
function _extends$6() {
  _extends$6 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$6.apply(this, arguments);
}
var SvgCopied = function SvgCopied2(props) {
  return /* @__PURE__ */ reactExports.createElement("svg", _extends$6({
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    fill: "none",
    viewBox: "0 0 24 24"
  }, props), _path$6 || (_path$6 = /* @__PURE__ */ reactExports.createElement("path", {
    fill: "currentColor",
    d: "M17.25 3H6.75A3.755 3.755 0 0 0 3 6.75v10.5A3.754 3.754 0 0 0 6.75 21h10.5A3.754 3.754 0 0 0 21 17.25V6.75A3.755 3.755 0 0 0 17.25 3Zm2.25 14.25a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V6.75A2.25 2.25 0 0 1 6.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v10.5Z"
  })), _path2$5 || (_path2$5 = /* @__PURE__ */ reactExports.createElement("path", {
    fill: "#14C786",
    d: "M10.312 14.45 7.83 11.906a.625.625 0 0 0-.896 0 .659.659 0 0 0 0 .918l2.481 2.546a1.264 1.264 0 0 0 .896.381 1.237 1.237 0 0 0 .895-.38l5.858-6.011a.658.658 0 0 0 0-.919.625.625 0 0 0-.896 0l-5.857 6.01Z"
  })));
};
function CopyButton({ node, nodeMeta }) {
  const { customizeCopy, CopyComponent, CopiedComponent } = reactExports.useContext(JsonViewContext);
  const [copied, setCopied] = reactExports.useState(false);
  const copyHandler = (event) => {
    event.stopPropagation();
    const value = customizeCopy(node, nodeMeta);
    if (typeof value === "string" && value) {
      writeClipboard(value);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3e3);
  };
  return copied ? typeof CopiedComponent === "function" ? jsxRuntimeExports.jsx(CopiedComponent, { className: "json-view--copy", style: { display: "inline-block" } }) : jsxRuntimeExports.jsx(SvgCopied, { className: "json-view--copy", style: { display: "inline-block" } }) : typeof CopyComponent === "function" ? jsxRuntimeExports.jsx(CopyComponent, { onClick: copyHandler, className: "json-view--copy" }) : jsxRuntimeExports.jsx(SvgCopy, { onClick: copyHandler, className: "json-view--copy" });
}
function NameValue({ indexOrName, value, depth, deleteHandle, editHandle, parent, parentPath }) {
  const { displayArrayIndex } = reactExports.useContext(JsonViewContext);
  const isArray = Array.isArray(parent);
  return jsxRuntimeExports.jsxs("div", Object.assign({ className: "json-view--pair" }, { children: [!isArray || isArray && displayArrayIndex ? jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [jsxRuntimeExports.jsx("span", Object.assign({ className: typeof indexOrName === "number" ? "json-view--index" : "json-view--property" }, { children: indexOrName })), ":", " "] }) : jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {}), jsxRuntimeExports.jsx(JsonNode, { node: value, depth: depth + 1, deleteHandle: (indexOrName2, parentPath2) => deleteHandle(indexOrName2, parentPath2), editHandle: (indexOrName2, newValue, oldValue, parentPath2) => editHandle(indexOrName2, newValue, oldValue, parentPath2), parent, indexOrName, parentPath })] }));
}
var _path$5, _path2$4;
function _extends$5() {
  _extends$5 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$5.apply(this, arguments);
}
var SvgTrash = function SvgTrash2(props) {
  return /* @__PURE__ */ reactExports.createElement("svg", _extends$5({
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    fill: "none",
    viewBox: "0 0 24 24"
  }, props), _path$5 || (_path$5 = /* @__PURE__ */ reactExports.createElement("path", {
    fill: "currentColor",
    d: "M18.75 6h-2.325a3.757 3.757 0 0 0-3.675-3h-1.5a3.757 3.757 0 0 0-3.675 3H5.25a.75.75 0 0 0 0 1.5H6v9.75A3.754 3.754 0 0 0 9.75 21h4.5A3.754 3.754 0 0 0 18 17.25V7.5h.75a.75.75 0 1 0 0-1.5Zm-7.5-1.5h1.5A2.255 2.255 0 0 1 14.872 6H9.128a2.255 2.255 0 0 1 2.122-1.5Zm5.25 12.75a2.25 2.25 0 0 1-2.25 2.25h-4.5a2.25 2.25 0 0 1-2.25-2.25V7.5h9v9.75Z"
  })), _path2$4 || (_path2$4 = /* @__PURE__ */ reactExports.createElement("path", {
    fill: "#DA0000",
    d: "M10.5 16.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 1 0-1.5 0v4.5a.75.75 0 0 0 .75.75ZM13.5 16.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 1 0-1.5 0v4.5a.75.75 0 0 0 .75.75Z"
  })));
};
var _path$4, _path2$3;
function _extends$4() {
  _extends$4 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$4.apply(this, arguments);
}
var SvgAddSquare = function SvgAddSquare2(props) {
  return /* @__PURE__ */ reactExports.createElement("svg", _extends$4({
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    fill: "none",
    viewBox: "0 0 24 24"
  }, props), _path$4 || (_path$4 = /* @__PURE__ */ reactExports.createElement("path", {
    fill: "currentColor",
    d: "M21 6.75v10.5A3.754 3.754 0 0 1 17.25 21H6.75A3.754 3.754 0 0 1 3 17.25V6.75A3.754 3.754 0 0 1 6.75 3h10.5A3.754 3.754 0 0 1 21 6.75Zm-1.5 0c0-1.24-1.01-2.25-2.25-2.25H6.75C5.51 4.5 4.5 5.51 4.5 6.75v10.5c0 1.24 1.01 2.25 2.25 2.25h10.5c1.24 0 2.25-1.01 2.25-2.25V6.75Z"
  })), _path2$3 || (_path2$3 = /* @__PURE__ */ reactExports.createElement("path", {
    fill: "#14C786",
    d: "M15 12.75a.75.75 0 1 0 0-1.5h-2.25V9a.75.75 0 1 0-1.5 0v2.25H9a.75.75 0 1 0 0 1.5h2.25V15a.75.75 0 1 0 1.5 0v-2.25H15Z"
  })));
};
var _path$3, _path2$2;
function _extends$3() {
  _extends$3 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$3.apply(this, arguments);
}
var SvgDone = function SvgDone2(props) {
  return /* @__PURE__ */ reactExports.createElement("svg", _extends$3({
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    fill: "none",
    viewBox: "0 0 24 24"
  }, props), _path$3 || (_path$3 = /* @__PURE__ */ reactExports.createElement("path", {
    fill: "currentColor",
    d: "M12 3a9 9 0 1 0 9 9 9.01 9.01 0 0 0-9-9Zm0 16.5a7.5 7.5 0 1 1 7.5-7.5 7.509 7.509 0 0 1-7.5 7.5Z"
  })), _path2$2 || (_path2$2 = /* @__PURE__ */ reactExports.createElement("path", {
    fill: "#14C786",
    d: "m10.85 13.96-1.986-2.036a.5.5 0 0 0-.716 0 .527.527 0 0 0 0 .735l1.985 2.036a1.01 1.01 0 0 0 .717.305.99.99 0 0 0 .716-.305l4.686-4.808a.526.526 0 0 0 0-.735.5.5 0 0 0-.716 0l-4.687 4.809Z"
  })));
};
var _path$2, _path2$1;
function _extends$2() {
  _extends$2 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$2.apply(this, arguments);
}
var SvgCancel = function SvgCancel2(props) {
  return /* @__PURE__ */ reactExports.createElement("svg", _extends$2({
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    fill: "none",
    viewBox: "0 0 24 24"
  }, props), _path$2 || (_path$2 = /* @__PURE__ */ reactExports.createElement("path", {
    fill: "#DA0000",
    d: "M15 9a.75.75 0 0 0-1.06 0L12 10.94 10.06 9A.75.75 0 0 0 9 10.06L10.94 12 9 13.94A.75.75 0 0 0 10.06 15L12 13.06 13.94 15A.75.75 0 0 0 15 13.94L13.06 12 15 10.06A.75.75 0 0 0 15 9Z"
  })), _path2$1 || (_path2$1 = /* @__PURE__ */ reactExports.createElement("path", {
    fill: "currentColor",
    d: "M12 3a9 9 0 1 0 9 9 9.01 9.01 0 0 0-9-9Zm0 16.5a7.5 7.5 0 1 1 7.5-7.5 7.509 7.509 0 0 1-7.5 7.5Z"
  })));
};
function LargeArrayNode({ originNode, node, depth, index, deleteHandle: _deleteSelf, customOptions, startIndex, parent, parentPath }) {
  const { enableClipboard, src, onEdit, onChange, forceUpdate, displaySize, CustomOperation } = reactExports.useContext(JsonViewContext);
  const currentPath = [...parentPath, String(index)];
  const [fold, setFold] = reactExports.useState(true);
  const editHandle = reactExports.useCallback((indexOrName, newValue, oldValue) => {
    originNode[indexOrName] = newValue;
    if (onEdit)
      onEdit({
        newValue,
        oldValue,
        depth,
        src,
        indexOrName,
        parentType: "array",
        parentPath
      });
    if (onChange)
      onChange({ type: "edit", depth, src, indexOrName, parentType: "array", parentPath });
    forceUpdate();
  }, [node, onEdit, onChange, forceUpdate]);
  const deleteHandle = (index2) => {
    originNode.splice(index2, 1);
    if (_deleteSelf)
      _deleteSelf(index2, parentPath);
    forceUpdate();
  };
  const Icons = jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [!fold && jsxRuntimeExports.jsxs("span", Object.assign({ onClick: () => setFold(true), className: "jv-size-chevron" }, { children: [ifDisplay(displaySize, depth, fold) && jsxRuntimeExports.jsxs("span", Object.assign({ className: "jv-size" }, { children: [objectSize(node), " Items"] })), jsxRuntimeExports.jsx(SvgAngleDown, { className: "jv-chevron" })] })), !fold && enableClipboard && customCopy(customOptions) && jsxRuntimeExports.jsx(CopyButton, { node, nodeMeta: { depth, indexOrName: index, parent, parentPath, currentPath } }), typeof CustomOperation === "function" ? jsxRuntimeExports.jsx(CustomOperation, { node }) : null] });
  return jsxRuntimeExports.jsxs("div", { children: [jsxRuntimeExports.jsx("span", { children: "[" }), Icons, !fold ? jsxRuntimeExports.jsx("div", Object.assign({ className: "jv-indent" }, { children: node.map((n, i) => jsxRuntimeExports.jsx(NameValue, { indexOrName: i + startIndex, value: n, depth, parent: node, deleteHandle, editHandle, parentPath }, String(index) + String(i))) })) : jsxRuntimeExports.jsxs("button", Object.assign({ onClick: () => setFold(false), className: "jv-button" }, { children: [startIndex, " ... ", startIndex + node.length - 1] })), jsxRuntimeExports.jsx("span", { children: "]" })] });
}
function LargeArray({ node, depth, deleteHandle: _deleteSelf, indexOrName, customOptions, parent, parentPath }) {
  const currentPath = typeof indexOrName !== "undefined" ? [...parentPath, String(indexOrName)] : parentPath;
  const nestCollapsedArray = [];
  for (let i = 0; i < node.length; i += 100) {
    nestCollapsedArray.push(node.slice(i, i + 100));
  }
  const { collapsed, enableClipboard, collapseObjectsAfterLength, editable, onDelete, src, onAdd, CustomOperation, onChange, forceUpdate, displaySize } = reactExports.useContext(JsonViewContext);
  const [fold, setFold] = reactExports.useState(isCollapsed_largeArray(node, depth, indexOrName, collapsed, collapseObjectsAfterLength, customOptions));
  reactExports.useEffect(() => {
    setFold(isCollapsed_largeArray(node, depth, indexOrName, collapsed, collapseObjectsAfterLength, customOptions));
  }, [collapsed, collapseObjectsAfterLength]);
  const [deleting, setDeleting] = reactExports.useState(false);
  const deleteSelf = () => {
    setDeleting(false);
    if (_deleteSelf)
      _deleteSelf(indexOrName, parentPath);
    if (onDelete)
      onDelete({ value: node, depth, src, indexOrName, parentType: "array", parentPath });
    if (onChange)
      onChange({
        type: "delete",
        depth,
        src,
        indexOrName,
        parentType: "array",
        parentPath
      });
  };
  const [adding, setAdding] = reactExports.useState(false);
  const add = () => {
    const arr = node;
    arr.push(null);
    if (onAdd)
      onAdd({ indexOrName: arr.length - 1, depth, src, parentType: "array", parentPath });
    if (onChange)
      onChange({ type: "add", indexOrName: arr.length - 1, depth, src, parentType: "array", parentPath });
    forceUpdate();
  };
  const isEditing = deleting || adding;
  const cancel = () => {
    setDeleting(false);
    setAdding(false);
  };
  const Icons = jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [!fold && !isEditing && jsxRuntimeExports.jsxs("span", Object.assign({ onClick: () => setFold(true), className: "jv-size-chevron" }, { children: [ifDisplay(displaySize, depth, fold) && jsxRuntimeExports.jsxs("span", Object.assign({ className: "jv-size" }, { children: [node.length, " Items"] })), jsxRuntimeExports.jsx(SvgAngleDown, { className: "jv-chevron" })] })), isEditing && jsxRuntimeExports.jsx(SvgDone, { className: "json-view--edit", style: { display: "inline-block" }, onClick: adding ? add : deleteSelf }), isEditing && jsxRuntimeExports.jsx(SvgCancel, { className: "json-view--edit", style: { display: "inline-block" }, onClick: cancel }), !fold && !isEditing && enableClipboard && customCopy(customOptions) && jsxRuntimeExports.jsx(CopyButton, { node, nodeMeta: { depth, indexOrName, parent, parentPath, currentPath } }), !fold && !isEditing && editableAdd(editable) && customAdd(customOptions) && jsxRuntimeExports.jsx(SvgAddSquare, { className: "json-view--edit", onClick: () => {
    add();
  } }), !fold && !isEditing && editableDelete(editable) && customDelete(customOptions) && _deleteSelf && jsxRuntimeExports.jsx(SvgTrash, { className: "json-view--edit", onClick: () => setDeleting(true) }), typeof CustomOperation === "function" ? jsxRuntimeExports.jsx(CustomOperation, { node }) : null] });
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [jsxRuntimeExports.jsx("span", { children: "[" }), Icons, !fold ? jsxRuntimeExports.jsx("div", Object.assign({ className: "jv-indent" }, { children: nestCollapsedArray.map((item, index) => jsxRuntimeExports.jsx(LargeArrayNode, { originNode: node, node: item, depth, index, startIndex: index * 100, deleteHandle: _deleteSelf, customOptions, parentPath }, String(indexOrName) + String(index))) })) : jsxRuntimeExports.jsx("button", Object.assign({ onClick: () => setFold(false), className: "jv-button" }, { children: "..." })), jsxRuntimeExports.jsx("span", { children: "]" }), fold && ifDisplay(displaySize, depth, fold) && jsxRuntimeExports.jsxs("span", Object.assign({ onClick: () => setFold(false), className: "jv-size" }, { children: [node.length, " Items"] }))] });
}
function ObjectNode({ node, depth, indexOrName, deleteHandle: _deleteSelf, customOptions, parent, parentPath }) {
  const { collapsed, onCollapse, enableClipboard, ignoreLargeArray, collapseObjectsAfterLength, editable, onDelete, src, onAdd, onEdit, onChange, forceUpdate, displaySize, CustomOperation } = reactExports.useContext(JsonViewContext);
  const currentPath = typeof indexOrName !== "undefined" ? [...parentPath, String(indexOrName)] : parentPath;
  if (!ignoreLargeArray && Array.isArray(node) && node.length > 100) {
    return jsxRuntimeExports.jsx(LargeArray, { node, depth, indexOrName, deleteHandle: _deleteSelf, customOptions, parentPath: currentPath });
  }
  const isPlainObject = isObject(node);
  const [fold, _setFold] = reactExports.useState(isCollapsed(node, depth, indexOrName, collapsed, collapseObjectsAfterLength, customOptions));
  const setFold = (value) => {
    onCollapse === null || onCollapse === void 0 ? void 0 : onCollapse({ isCollapsing: !value, node, depth, indexOrName });
    _setFold(value);
  };
  reactExports.useEffect(() => {
    setFold(isCollapsed(node, depth, indexOrName, collapsed, collapseObjectsAfterLength, customOptions));
  }, [collapsed, collapseObjectsAfterLength]);
  const editHandle = reactExports.useCallback((indexOrName2, newValue, oldValue) => {
    if (Array.isArray(node)) {
      node[+indexOrName2] = newValue;
    } else if (node) {
      node[indexOrName2] = newValue;
    }
    if (onEdit)
      onEdit({
        newValue,
        oldValue,
        depth,
        src,
        indexOrName: indexOrName2,
        parentType: isPlainObject ? "object" : "array",
        parentPath: currentPath
      });
    if (onChange)
      onChange({ type: "edit", depth, src, indexOrName: indexOrName2, parentType: isPlainObject ? "object" : "array", parentPath: currentPath });
    forceUpdate();
  }, [node, onEdit, onChange, forceUpdate]);
  const deleteHandle = (indexOrName2) => {
    if (Array.isArray(node)) {
      node.splice(+indexOrName2, 1);
    } else if (node) {
      delete node[indexOrName2];
    }
    forceUpdate();
  };
  const [deleting, setDeleting] = reactExports.useState(false);
  const deleteSelf = () => {
    setDeleting(false);
    if (_deleteSelf)
      _deleteSelf(indexOrName, currentPath);
    if (onDelete)
      onDelete({ value: node, depth, src, indexOrName, parentType: isPlainObject ? "object" : "array", parentPath: currentPath });
    if (onChange)
      onChange({
        type: "delete",
        depth,
        src,
        indexOrName,
        parentType: isPlainObject ? "object" : "array",
        parentPath: currentPath
      });
  };
  const [adding, setAdding] = reactExports.useState(false);
  const inputRef = reactExports.useRef(null);
  const add = () => {
    var _a;
    if (isPlainObject) {
      const inputName = (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.value;
      if (inputName) {
        node[inputName] = null;
        if (inputRef.current)
          inputRef.current.value = "";
        setAdding(false);
        if (onAdd)
          onAdd({ indexOrName: inputName, depth, src, parentType: "object", parentPath: currentPath });
        if (onChange)
          onChange({ type: "add", indexOrName: inputName, depth, src, parentType: "object", parentPath: currentPath });
      }
    } else if (Array.isArray(node)) {
      const arr = node;
      arr.push(null);
      if (onAdd)
        onAdd({ indexOrName: arr.length - 1, depth, src, parentType: "array", parentPath: currentPath });
      if (onChange)
        onChange({ type: "add", indexOrName: arr.length - 1, depth, src, parentType: "array", parentPath: currentPath });
    }
    forceUpdate();
  };
  const handleAddKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      add();
    } else if (event.key === "Escape") {
      cancel();
    }
  };
  const isEditing = deleting || adding;
  const cancel = () => {
    setDeleting(false);
    setAdding(false);
  };
  const Icons = jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [!fold && !isEditing && jsxRuntimeExports.jsxs("span", Object.assign({ onClick: () => setFold(true), className: "jv-size-chevron" }, { children: [ifDisplay(displaySize, depth, fold) && jsxRuntimeExports.jsxs("span", Object.assign({ className: "jv-size" }, { children: [objectSize(node), " Items"] })), jsxRuntimeExports.jsx(SvgAngleDown, { className: "jv-chevron" })] })), adding && isPlainObject && jsxRuntimeExports.jsx("input", { className: "json-view--input", placeholder: "property", ref: inputRef, onKeyDown: handleAddKeyDown }), isEditing && jsxRuntimeExports.jsx(SvgDone, { className: "json-view--edit", style: { display: "inline-block" }, onClick: adding ? add : deleteSelf }), isEditing && jsxRuntimeExports.jsx(SvgCancel, { className: "json-view--edit", style: { display: "inline-block" }, onClick: cancel }), !fold && !isEditing && enableClipboard && customCopy(customOptions) && jsxRuntimeExports.jsx(CopyButton, { node, nodeMeta: { depth, indexOrName, parent, parentPath, currentPath } }), !fold && !isEditing && editableAdd(editable) && customAdd(customOptions) && jsxRuntimeExports.jsx(SvgAddSquare, { className: "json-view--edit", onClick: () => {
    if (isPlainObject) {
      setAdding(true);
      setTimeout(() => {
        var _a;
        return (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
      });
    } else {
      add();
    }
  } }), !fold && !isEditing && editableDelete(editable) && customDelete(customOptions) && _deleteSelf && jsxRuntimeExports.jsx(SvgTrash, { className: "json-view--edit", onClick: () => setDeleting(true) }), typeof CustomOperation === "function" ? jsxRuntimeExports.jsx(CustomOperation, { node }) : null] });
  if (Array.isArray(node)) {
    return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [jsxRuntimeExports.jsx("span", { children: "[" }), Icons, !fold ? jsxRuntimeExports.jsx("div", Object.assign({ className: "jv-indent" }, { children: node.map((n, i) => jsxRuntimeExports.jsx(NameValue, { indexOrName: i, value: n, depth, parent: node, deleteHandle, editHandle, parentPath: currentPath }, String(indexOrName) + String(i))) })) : jsxRuntimeExports.jsx("button", Object.assign({ onClick: () => setFold(false), className: "jv-button" }, { children: "..." })), jsxRuntimeExports.jsx("span", { children: "]" }), fold && ifDisplay(displaySize, depth, fold) && jsxRuntimeExports.jsxs("span", Object.assign({ onClick: () => setFold(false), className: "jv-size" }, { children: [objectSize(node), " Items"] }))] });
  } else if (isPlainObject) {
    return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [jsxRuntimeExports.jsx("span", { children: "{" }), Icons, !fold ? jsxRuntimeExports.jsx("div", Object.assign({ className: "jv-indent" }, { children: Object.entries(node).map(([name, value]) => jsxRuntimeExports.jsx(NameValue, { indexOrName: name, value, depth, parent: node, deleteHandle, editHandle, parentPath: currentPath }, String(indexOrName) + String(name))) })) : jsxRuntimeExports.jsx("button", Object.assign({ onClick: () => setFold(false), className: "jv-button" }, { children: "..." })), jsxRuntimeExports.jsx("span", { children: "}" }), fold && ifDisplay(displaySize, depth, fold) && jsxRuntimeExports.jsxs("span", Object.assign({ onClick: () => setFold(false), className: "jv-size" }, { children: [objectSize(node), " Items"] }))] });
  } else {
    return jsxRuntimeExports.jsx("span", { children: String(node) });
  }
}
const LongString = React.forwardRef(({ str, className, ctrlClick }, ref) => {
  let { collapseStringMode, collapseStringsAfterLength, customizeCollapseStringUI } = reactExports.useContext(JsonViewContext);
  const [truncated, setTruncated] = reactExports.useState(true);
  const strRef = reactExports.useRef(null);
  collapseStringsAfterLength = collapseStringsAfterLength > 0 ? collapseStringsAfterLength : 0;
  const str_show = str.replace(/\s+/g, " ");
  const collapseStringUI = typeof customizeCollapseStringUI === "function" ? customizeCollapseStringUI(str_show, truncated) : typeof customizeCollapseStringUI === "string" ? customizeCollapseStringUI : "...";
  const clickToTruncateOrEdit = (event) => {
    var _a;
    if ((event.ctrlKey || event.metaKey) && ctrlClick) {
      ctrlClick(event);
    } else {
      const selection = window.getSelection();
      if (selection && selection.anchorOffset !== selection.focusOffset && ((_a = selection.anchorNode) === null || _a === void 0 ? void 0 : _a.parentElement) === strRef.current)
        return;
      setTruncated(!truncated);
    }
  };
  if (str.length <= collapseStringsAfterLength)
    return jsxRuntimeExports.jsxs("span", Object.assign({ ref: strRef, className, onClick: ctrlClick }, { children: ['"', str, '"'] }));
  if (collapseStringMode === "address")
    return str.length <= 10 ? jsxRuntimeExports.jsxs("span", Object.assign({ ref: strRef, className, onClick: ctrlClick }, { children: ['"', str, '"'] })) : jsxRuntimeExports.jsxs("span", Object.assign({ ref: strRef, onClick: clickToTruncateOrEdit, className: className + " cursor-pointer" }, { children: ['"', truncated ? [str_show.slice(0, 6), collapseStringUI, str_show.slice(-4)] : str, '"'] }));
  if (collapseStringMode === "directly") {
    return jsxRuntimeExports.jsxs("span", Object.assign({ ref: strRef, onClick: clickToTruncateOrEdit, className: className + " cursor-pointer" }, { children: ['"', truncated ? [str_show.slice(0, collapseStringsAfterLength), collapseStringUI] : str, '"'] }));
  }
  if (collapseStringMode === "word") {
    let index_ahead = collapseStringsAfterLength;
    let index_behind = collapseStringsAfterLength + 1;
    let str_collapsed = str_show;
    let count = 1;
    while (true) {
      if (/\W/.test(str[index_ahead])) {
        str_collapsed = str.slice(0, index_ahead);
        break;
      }
      if (/\W/.test(str[index_behind])) {
        str_collapsed = str.slice(0, index_behind);
        break;
      }
      if (count === 6) {
        str_collapsed = str.slice(0, collapseStringsAfterLength);
        break;
      }
      count++;
      index_ahead--;
      index_behind++;
    }
    return jsxRuntimeExports.jsxs("span", Object.assign({ ref: strRef, onClick: clickToTruncateOrEdit, className: className + " cursor-pointer" }, { children: ['"', truncated ? [str_collapsed, collapseStringUI] : str, '"'] }));
  }
  return jsxRuntimeExports.jsxs("span", Object.assign({ ref: strRef, className }, { children: ['"', str, '"'] }));
});
var _path$1;
function _extends$1() {
  _extends$1 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$1.apply(this, arguments);
}
var SvgEdit = function SvgEdit2(props) {
  return /* @__PURE__ */ reactExports.createElement("svg", _extends$1({
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    fill: "none",
    viewBox: "0 0 24 24"
  }, props), _path$1 || (_path$1 = /* @__PURE__ */ reactExports.createElement("path", {
    fill: "currentColor",
    d: "M17.25 3H6.75A3.754 3.754 0 0 0 3 6.75v10.5A3.754 3.754 0 0 0 6.75 21h10.5A3.754 3.754 0 0 0 21 17.25V6.75A3.754 3.754 0 0 0 17.25 3Zm2.25 14.25c0 1.24-1.01 2.25-2.25 2.25H6.75c-1.24 0-2.25-1.01-2.25-2.25V6.75c0-1.24 1.01-2.25 2.25-2.25h10.5c1.24 0 2.25 1.01 2.25 2.25v10.5Zm-6.09-9.466-5.031 5.03a2.981 2.981 0 0 0-.879 2.121v1.19c0 .415.336.75.75.75h1.19c.8 0 1.554-.312 2.12-.879l5.03-5.03a2.252 2.252 0 0 0 0-3.182c-.85-.85-2.331-.85-3.18 0Zm-2.91 7.151c-.28.28-.666.44-1.06.44H9v-.44c0-.4.156-.777.44-1.06l3.187-3.188 1.06 1.061-3.187 3.188Zm5.03-5.03-.782.783-1.06-1.061.782-.782a.766.766 0 0 1 1.06 0 .75.75 0 0 1 0 1.06Z"
  })));
};
var _path, _path2;
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
var SvgLink = function SvgLink2(props) {
  return /* @__PURE__ */ reactExports.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    fill: "none",
    viewBox: "0 0 24 24"
  }, props), _path || (_path = /* @__PURE__ */ reactExports.createElement("path", {
    fill: "currentColor",
    d: "M6.75 3h5.5v1.5h-5.5C5.51 4.5 4.5 5.51 4.5 6.75v10.5c0 1.24 1.01 2.25 2.25 2.25h10.5c1.24 0 2.25-1.01 2.25-2.25v-5.5H21v5.5A3.754 3.754 0 0 1 17.25 21H6.75A3.754 3.754 0 0 1 3 17.25V6.75A3.754 3.754 0 0 1 6.75 3Z"
  })), _path2 || (_path2 = /* @__PURE__ */ reactExports.createElement("path", {
    fill: "currentColor",
    d: "M20.013 3h-3.946a.987.987 0 0 0 0 1.973h1.564l-6.342 6.342a1.004 1.004 0 0 0 0 1.396 1.004 1.004 0 0 0 1.396 0l6.342-6.342v1.564a.987.987 0 0 0 1.973 0V3.987A.987.987 0 0 0 20.013 3Z"
  })));
};
function JsonNode({ node, depth, deleteHandle: _deleteHandle, indexOrName, parent, editHandle, parentPath }) {
  const { collapseStringsAfterLength, enableClipboard, editable, src, onDelete, onChange, customizeNode, matchesURL, urlRegExp, EditComponent, DoneComponent, CancelComponent, CustomOperation } = reactExports.useContext(JsonViewContext);
  let customReturn;
  if (typeof customizeNode === "function")
    customReturn = safeCall(customizeNode, [{ node, depth, indexOrName }]);
  if (customReturn) {
    if (reactExports.isValidElement(customReturn))
      return customReturn;
    else if (isReactComponent(customReturn)) {
      const CustomComponent = customReturn;
      return jsxRuntimeExports.jsx(CustomComponent, { node, depth, indexOrName });
    }
  }
  if (Array.isArray(node) || isObject(node)) {
    return jsxRuntimeExports.jsx(ObjectNode, { parent, node, depth, indexOrName, deleteHandle: _deleteHandle, parentPath, customOptions: typeof customReturn === "object" ? customReturn : void 0 });
  } else {
    const type = typeof node;
    const currentPath = typeof indexOrName !== "undefined" ? [...parentPath, String(indexOrName)] : parentPath;
    const [editing, setEditing] = reactExports.useState(false);
    const [deleting, setDeleting] = reactExports.useState(false);
    const valueRef = reactExports.useRef(null);
    const edit = () => {
      setEditing(true);
      setTimeout(() => {
        var _a, _b;
        (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.selectAllChildren(valueRef.current);
        (_b = valueRef.current) === null || _b === void 0 ? void 0 : _b.focus();
      });
    };
    const done = reactExports.useCallback(() => {
      let newValue = valueRef.current.innerText;
      try {
        const parsedValue = JSON.parse(newValue);
        if (editHandle)
          editHandle(indexOrName, parsedValue, node, parentPath);
      } catch (e) {
        const trimmedStringValue = resolveEvalFailedNewValue(type, newValue);
        if (editHandle)
          editHandle(indexOrName, trimmedStringValue, node, parentPath);
      }
      setEditing(false);
    }, [editHandle, indexOrName, node, parentPath, type]);
    const cancel = () => {
      setEditing(false);
      setDeleting(false);
    };
    const deleteHandle = () => {
      setDeleting(false);
      if (_deleteHandle)
        _deleteHandle(indexOrName, parentPath);
      if (onDelete)
        onDelete({
          value: node,
          depth,
          src,
          indexOrName,
          parentType: Array.isArray(parent) ? "array" : "object",
          parentPath
        });
      if (onChange)
        onChange({
          depth,
          src,
          indexOrName,
          parentType: Array.isArray(parent) ? "array" : "object",
          type: "delete",
          parentPath
        });
    };
    const handleKeyDown = reactExports.useCallback((event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        done();
      } else if (event.key === "Escape") {
        cancel();
      }
    }, [done]);
    const isEditing = editing || deleting;
    const ctrlClick = !isEditing && editableEdit(editable) && customEdit(customReturn) && editHandle ? (event) => {
      if (event.ctrlKey || event.metaKey)
        edit();
    } : void 0;
    const Icons = jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [isEditing && (typeof DoneComponent === "function" ? jsxRuntimeExports.jsx(DoneComponent, { className: "json-view--edit", style: { display: "inline-block" }, onClick: deleting ? deleteHandle : done }) : jsxRuntimeExports.jsx(SvgDone, { className: "json-view--edit", style: { display: "inline-block" }, onClick: deleting ? deleteHandle : done })), isEditing && (typeof CancelComponent === "function" ? jsxRuntimeExports.jsx(CancelComponent, { className: "json-view--edit", style: { display: "inline-block" }, onClick: cancel }) : jsxRuntimeExports.jsx(SvgCancel, { className: "json-view--edit", style: { display: "inline-block" }, onClick: cancel })), !isEditing && enableClipboard && customCopy(customReturn) && jsxRuntimeExports.jsx(CopyButton, { node, nodeMeta: { depth, indexOrName, parent, parentPath, currentPath } }), !isEditing && matchesURL && type === "string" && urlRegExp.test(node) && customMatchesURL(customReturn) && jsxRuntimeExports.jsx("a", Object.assign({ href: node, target: "_blank", className: "json-view--link" }, { children: jsxRuntimeExports.jsx(SvgLink, {}) })), !isEditing && editableEdit(editable) && customEdit(customReturn) && editHandle && (typeof EditComponent === "function" ? jsxRuntimeExports.jsx(EditComponent, { className: "json-view--edit", onClick: edit }) : jsxRuntimeExports.jsx(SvgEdit, { className: "json-view--edit", onClick: edit })), !isEditing && editableDelete(editable) && customDelete(customReturn) && _deleteHandle && jsxRuntimeExports.jsx(SvgTrash, { className: "json-view--edit", onClick: () => setDeleting(true) }), typeof CustomOperation === "function" ? jsxRuntimeExports.jsx(CustomOperation, { node }) : null] });
    let className = "json-view--string";
    switch (type) {
      case "number":
      case "bigint":
        className = "json-view--number";
        break;
      case "boolean":
        className = "json-view--boolean";
        break;
      case "object":
        className = "json-view--null";
        break;
    }
    if (typeof (customReturn === null || customReturn === void 0 ? void 0 : customReturn.className) === "string")
      className += " " + customReturn.className;
    if (deleting)
      className += " json-view--deleting";
    let displayValue = String(node);
    if (type === "bigint")
      displayValue += "n";
    const EditingElement = reactExports.useMemo(() => jsxRuntimeExports.jsx("span", { contentEditable: true, className, dangerouslySetInnerHTML: { __html: type === "string" ? `"${displayValue}"` : displayValue }, ref: valueRef, onKeyDown: handleKeyDown }), [displayValue, type, handleKeyDown]);
    if (type === "string")
      return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [editing ? EditingElement : node.length > collapseStringsAfterLength ? jsxRuntimeExports.jsx(LongString, { str: node, ref: valueRef, className, ctrlClick }) : jsxRuntimeExports.jsxs("span", Object.assign({ className, onClick: ctrlClick }, { children: ['"', displayValue, '"'] })), Icons] });
    else {
      return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [editing ? EditingElement : jsxRuntimeExports.jsx("span", Object.assign({ className, onClick: ctrlClick }, { children: displayValue })), Icons] });
    }
  }
}
const defaultURLRegExp = /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/;
const JsonViewContext = reactExports.createContext({
  src: void 0,
  collapseStringsAfterLength: 99,
  collapseStringMode: "directly",
  customizeCollapseStringUI: void 0,
  collapseObjectsAfterLength: 20,
  collapsed: false,
  onCollapse: void 0,
  enableClipboard: true,
  editable: false,
  onEdit: void 0,
  onDelete: void 0,
  onAdd: void 0,
  onChange: void 0,
  forceUpdate: () => {
  },
  customizeNode: void 0,
  customizeCopy: () => {
  },
  displaySize: void 0,
  displayArrayIndex: true,
  matchesURL: false,
  urlRegExp: defaultURLRegExp,
  ignoreLargeArray: false,
  CopyComponent: void 0,
  CopiedComponent: void 0,
  EditComponent: void 0,
  CancelComponent: void 0,
  DoneComponent: void 0,
  CustomOperation: void 0
});
function JsonView({ src: _src, collapseStringsAfterLength = 99, collapseStringMode = "directly", customizeCollapseStringUI, collapseObjectsAfterLength = 99, collapsed, onCollapse, enableClipboard = true, editable = false, onEdit, onDelete, onAdd, onChange, dark = false, theme = "default", customizeNode, customizeCopy = (node) => stringifyForCopying(node), displaySize, displayArrayIndex = true, style, className, matchesURL = false, urlRegExp = defaultURLRegExp, ignoreLargeArray = false, CopyComponent, CopiedComponent, EditComponent, CancelComponent, DoneComponent, CustomOperation }) {
  const [_, update] = reactExports.useState(0);
  const forceUpdate = reactExports.useCallback(() => update((state) => ++state), []);
  const [src, setSrc] = reactExports.useState(_src);
  reactExports.useEffect(() => setSrc(_src), [_src]);
  return jsxRuntimeExports.jsx(JsonViewContext.Provider, Object.assign({ value: {
    src,
    collapseStringsAfterLength,
    collapseStringMode,
    customizeCollapseStringUI,
    collapseObjectsAfterLength,
    collapsed,
    onCollapse,
    enableClipboard,
    editable,
    onEdit,
    onDelete,
    onAdd,
    onChange,
    forceUpdate,
    customizeNode,
    customizeCopy,
    displaySize,
    displayArrayIndex,
    matchesURL,
    urlRegExp,
    ignoreLargeArray,
    CopyComponent,
    CopiedComponent,
    EditComponent,
    CancelComponent,
    DoneComponent,
    CustomOperation
  } }, { children: jsxRuntimeExports.jsx("code", Object.assign({ className: "json-view" + (dark ? " dark" : "") + (theme && theme !== "default" ? " json-view_" + theme : "") + (className ? " " + className : ""), style }, { children: jsxRuntimeExports.jsx(JsonNode, { node: src, depth: 1, editHandle: (indexOrName, newValue, oldValue, parentPath) => {
    setSrc(newValue);
    if (onEdit)
      onEdit({
        newValue,
        oldValue,
        depth: 1,
        src,
        indexOrName,
        parentType: null,
        parentPath
      });
    if (onChange)
      onChange({ type: "edit", depth: 1, src, indexOrName, parentType: null, parentPath });
  }, deleteHandle: (indexOrName, parentPath) => {
    setSrc(void 0);
    if (onDelete)
      onDelete({
        value: src,
        depth: 1,
        src,
        indexOrName,
        parentType: null,
        parentPath
      });
    if (onChange)
      onChange({
        depth: 1,
        src,
        indexOrName,
        parentType: null,
        type: "delete",
        parentPath
      });
  }, parentPath: [] }) })) }));
}
const getSubtitleFromContentScripts = async () => {
  const tabs = await chrome.tabs.query({ url: "*://*.youtube.com/*" });
  if (tabs.length === 0) {
    return [];
  }
  const results = await Promise.all(
    tabs.map(async (tab) => {
      var _a;
      if (!tab.id) {
        return {
          tabId: -1,
          tabTitle: tab.title || "Unknown",
          tabUrl: tab.url || "",
          subtitleData: null,
          error: "Tab ID not available"
        };
      }
      try {
        const response = await chrome.tabs.sendMessage(tab.id, {
          source: MessageSource.POPUP,
          type: MessageType.GET_SUBTITLE_DATA,
          data: {},
          timestamp: Date.now()
        });
        return {
          tabId: tab.id,
          tabTitle: tab.title || "Unknown",
          tabUrl: tab.url || "",
          subtitleData: ((_a = response == null ? void 0 : response.data) == null ? void 0 : _a.subtitleData) || null
        };
      } catch (error) {
        return {
          tabId: tab.id,
          tabTitle: tab.title || "Unknown",
          tabUrl: tab.url || "",
          subtitleData: null,
          error: error instanceof Error ? error.message : "Failed to get data"
        };
      }
    })
  );
  return results;
};
const DebugApp = () => {
  const [tabsData, setTabsData] = reactExports.useState([]);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubtitleFromContentScripts();
      setTabsData(data);
      if (data.length === 0) {
        setError("No YouTube tabs found. Please open a YouTube video with subtitles.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Failed to fetch subtitle data:", err);
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    fetchData();
  }, []);
  const filterData = (data) => {
    if (!searchTerm || !data) return data;
    if (data.segments && Array.isArray(data.segments)) {
      const filtered = {
        ...data,
        segments: data.segments.filter((seg) => {
          const content = (seg.nativeContent || "") + (seg.targetContent || "");
          return content.toLowerCase().includes(searchTerm.toLowerCase());
        })
      };
      return filtered;
    }
    return data;
  };
  const tabsWithData = tabsData.filter((t) => t.subtitleData !== null).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "debug-app", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "app-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "Moki Debug Page" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "app-subtitle", children: "Subtitle Data Inspector (Multi-Tab)" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "debug-controls", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          placeholder: "Search subtitles...",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          className: "search-input"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: fetchData, className: "refresh-button", children: "Refresh" })
    ] }),
    loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading", children: "Loading..." }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error", children: error }),
    tabsData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "debug-summary", children: [
      "Found ",
      tabsData.length,
      " YouTube tab(s), ",
      tabsWithData,
      " with subtitle data"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-sections", children: [
      tabsData.map((tabData) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "data-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tab-badge", children: [
            "Tab ",
            tabData.tabId
          ] }),
          tabData.tabTitle
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tab-url", children: tabData.tabUrl }),
        tabData.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tab-error", children: tabData.error }) : tabData.subtitleData ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          JsonView,
          {
            src: filterData(tabData.subtitleData),
            theme: "vscode",
            collapsed: 2,
            enableClipboard: true,
            style: { fontSize: "12px", padding: "10px" }
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "no-data", children: [
          "No subtitle data available",
          /* @__PURE__ */ jsxRuntimeExports.jsx("small", { children: "Make sure subtitles are enabled on this video" })
        ] })
      ] }, tabData.tabId)),
      tabsData.length === 0 && !loading && !error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "no-data", children: [
        "No YouTube tabs found",
        /* @__PURE__ */ jsxRuntimeExports.jsx("small", { children: "Please open a YouTube video to see subtitle data" })
      ] })
    ] })
  ] });
};
client.createRoot(document.getElementById("app")).render(/* @__PURE__ */ jsxRuntimeExports.jsx(DebugApp, {}));
//# sourceMappingURL=debug.js.map
