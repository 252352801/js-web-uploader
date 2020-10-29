(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.JSWebUploader = {}));
}(this, (function (exports) { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var runtime_1 = createCommonjsModule(function (module) {
	  /**
	   * Copyright (c) 2014-present, Facebook, Inc.
	   *
	   * This source code is licensed under the MIT license found in the
	   * LICENSE file in the root directory of this source tree.
	   */
	  var runtime = function (exports) {

	    var Op = Object.prototype;
	    var hasOwn = Op.hasOwnProperty;
	    var undefined$1; // More compressible than void 0.

	    var $Symbol = typeof Symbol === "function" ? Symbol : {};
	    var iteratorSymbol = $Symbol.iterator || "@@iterator";
	    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

	    function wrap(innerFn, outerFn, self, tryLocsList) {
	      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	      var generator = Object.create(protoGenerator.prototype);
	      var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
	      // .throw, and .return methods.

	      generator._invoke = makeInvokeMethod(innerFn, self, context);
	      return generator;
	    }

	    exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
	    // record like context.tryEntries[i].completion. This interface could
	    // have been (and was previously) designed to take a closure to be
	    // invoked without arguments, but in all the cases we care about we
	    // already have an existing method we want to call, so there's no need
	    // to create a new function object. We can even get away with assuming
	    // the method takes exactly one argument, since that happens to be true
	    // in every case, so we don't have to touch the arguments object. The
	    // only additional allocation required is the completion record, which
	    // has a stable shape and so hopefully should be cheap to allocate.

	    function tryCatch(fn, obj, arg) {
	      try {
	        return {
	          type: "normal",
	          arg: fn.call(obj, arg)
	        };
	      } catch (err) {
	        return {
	          type: "throw",
	          arg: err
	        };
	      }
	    }

	    var GenStateSuspendedStart = "suspendedStart";
	    var GenStateSuspendedYield = "suspendedYield";
	    var GenStateExecuting = "executing";
	    var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
	    // breaking out of the dispatch switch statement.

	    var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
	    // .constructor.prototype properties for functions that return Generator
	    // objects. For full spec compliance, you may wish to configure your
	    // minifier not to mangle the names of these two functions.

	    function Generator() {}

	    function GeneratorFunction() {}

	    function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
	    // don't natively support it.


	    var IteratorPrototype = {};

	    IteratorPrototype[iteratorSymbol] = function () {
	      return this;
	    };

	    var getProto = Object.getPrototypeOf;
	    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

	    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	      // This environment has a native %IteratorPrototype%; use it instead
	      // of the polyfill.
	      IteratorPrototype = NativeIteratorPrototype;
	    }

	    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
	    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	    GeneratorFunctionPrototype.constructor = GeneratorFunction;
	    GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction"; // Helper for defining the .next, .throw, and .return methods of the
	    // Iterator interface in terms of a single ._invoke method.

	    function defineIteratorMethods(prototype) {
	      ["next", "throw", "return"].forEach(function (method) {
	        prototype[method] = function (arg) {
	          return this._invoke(method, arg);
	        };
	      });
	    }

	    exports.isGeneratorFunction = function (genFun) {
	      var ctor = typeof genFun === "function" && genFun.constructor;
	      return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
	      // do is to check its .name property.
	      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
	    };

	    exports.mark = function (genFun) {
	      if (Object.setPrototypeOf) {
	        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	      } else {
	        genFun.__proto__ = GeneratorFunctionPrototype;

	        if (!(toStringTagSymbol in genFun)) {
	          genFun[toStringTagSymbol] = "GeneratorFunction";
	        }
	      }

	      genFun.prototype = Object.create(Gp);
	      return genFun;
	    }; // Within the body of any async function, `await x` is transformed to
	    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	    // `hasOwn.call(value, "__await")` to determine if the yielded value is
	    // meant to be awaited.


	    exports.awrap = function (arg) {
	      return {
	        __await: arg
	      };
	    };

	    function AsyncIterator(generator, PromiseImpl) {
	      function invoke(method, arg, resolve, reject) {
	        var record = tryCatch(generator[method], generator, arg);

	        if (record.type === "throw") {
	          reject(record.arg);
	        } else {
	          var result = record.arg;
	          var value = result.value;

	          if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
	            return PromiseImpl.resolve(value.__await).then(function (value) {
	              invoke("next", value, resolve, reject);
	            }, function (err) {
	              invoke("throw", err, resolve, reject);
	            });
	          }

	          return PromiseImpl.resolve(value).then(function (unwrapped) {
	            // When a yielded Promise is resolved, its final value becomes
	            // the .value of the Promise<{value,done}> result for the
	            // current iteration.
	            result.value = unwrapped;
	            resolve(result);
	          }, function (error) {
	            // If a rejected Promise was yielded, throw the rejection back
	            // into the async generator function so it can be handled there.
	            return invoke("throw", error, resolve, reject);
	          });
	        }
	      }

	      var previousPromise;

	      function enqueue(method, arg) {
	        function callInvokeWithMethodAndArg() {
	          return new PromiseImpl(function (resolve, reject) {
	            invoke(method, arg, resolve, reject);
	          });
	        }

	        return previousPromise = // If enqueue has been called before, then we want to wait until
	        // all previous Promises have been resolved before calling invoke,
	        // so that results are always delivered in the correct order. If
	        // enqueue has not been called before, then it is important to
	        // call invoke immediately, without waiting on a callback to fire,
	        // so that the async generator function has the opportunity to do
	        // any necessary setup in a predictable way. This predictability
	        // is why the Promise constructor synchronously invokes its
	        // executor callback, and why async functions synchronously
	        // execute code before the first await. Since we implement simple
	        // async functions in terms of async generators, it is especially
	        // important to get this right, even though it requires care.
	        previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
	        // invocations of the iterator.
	        callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
	      } // Define the unified helper method that is used to implement .next,
	      // .throw, and .return (see defineIteratorMethods).


	      this._invoke = enqueue;
	    }

	    defineIteratorMethods(AsyncIterator.prototype);

	    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	      return this;
	    };

	    exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
	    // AsyncIterator objects; they just return a Promise for the value of
	    // the final result produced by the iterator.

	    exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
	      if (PromiseImpl === void 0) PromiseImpl = Promise;
	      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
	      return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function (result) {
	        return result.done ? result.value : iter.next();
	      });
	    };

	    function makeInvokeMethod(innerFn, self, context) {
	      var state = GenStateSuspendedStart;
	      return function invoke(method, arg) {
	        if (state === GenStateExecuting) {
	          throw new Error("Generator is already running");
	        }

	        if (state === GenStateCompleted) {
	          if (method === "throw") {
	            throw arg;
	          } // Be forgiving, per 25.3.3.3.3 of the spec:
	          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


	          return doneResult();
	        }

	        context.method = method;
	        context.arg = arg;

	        while (true) {
	          var delegate = context.delegate;

	          if (delegate) {
	            var delegateResult = maybeInvokeDelegate(delegate, context);

	            if (delegateResult) {
	              if (delegateResult === ContinueSentinel) continue;
	              return delegateResult;
	            }
	          }

	          if (context.method === "next") {
	            // Setting context._sent for legacy support of Babel's
	            // function.sent implementation.
	            context.sent = context._sent = context.arg;
	          } else if (context.method === "throw") {
	            if (state === GenStateSuspendedStart) {
	              state = GenStateCompleted;
	              throw context.arg;
	            }

	            context.dispatchException(context.arg);
	          } else if (context.method === "return") {
	            context.abrupt("return", context.arg);
	          }

	          state = GenStateExecuting;
	          var record = tryCatch(innerFn, self, context);

	          if (record.type === "normal") {
	            // If an exception is thrown from innerFn, we leave state ===
	            // GenStateExecuting and loop back for another invocation.
	            state = context.done ? GenStateCompleted : GenStateSuspendedYield;

	            if (record.arg === ContinueSentinel) {
	              continue;
	            }

	            return {
	              value: record.arg,
	              done: context.done
	            };
	          } else if (record.type === "throw") {
	            state = GenStateCompleted; // Dispatch the exception by looping back around to the
	            // context.dispatchException(context.arg) call above.

	            context.method = "throw";
	            context.arg = record.arg;
	          }
	        }
	      };
	    } // Call delegate.iterator[context.method](context.arg) and handle the
	    // result, either by returning a { value, done } result from the
	    // delegate iterator, or by modifying context.method and context.arg,
	    // setting context.delegate to null, and returning the ContinueSentinel.


	    function maybeInvokeDelegate(delegate, context) {
	      var method = delegate.iterator[context.method];

	      if (method === undefined$1) {
	        // A .throw or .return when the delegate iterator has no .throw
	        // method always terminates the yield* loop.
	        context.delegate = null;

	        if (context.method === "throw") {
	          // Note: ["return"] must be used for ES3 parsing compatibility.
	          if (delegate.iterator["return"]) {
	            // If the delegate iterator has a return method, give it a
	            // chance to clean up.
	            context.method = "return";
	            context.arg = undefined$1;
	            maybeInvokeDelegate(delegate, context);

	            if (context.method === "throw") {
	              // If maybeInvokeDelegate(context) changed context.method from
	              // "return" to "throw", let that override the TypeError below.
	              return ContinueSentinel;
	            }
	          }

	          context.method = "throw";
	          context.arg = new TypeError("The iterator does not provide a 'throw' method");
	        }

	        return ContinueSentinel;
	      }

	      var record = tryCatch(method, delegate.iterator, context.arg);

	      if (record.type === "throw") {
	        context.method = "throw";
	        context.arg = record.arg;
	        context.delegate = null;
	        return ContinueSentinel;
	      }

	      var info = record.arg;

	      if (!info) {
	        context.method = "throw";
	        context.arg = new TypeError("iterator result is not an object");
	        context.delegate = null;
	        return ContinueSentinel;
	      }

	      if (info.done) {
	        // Assign the result of the finished delegate to the temporary
	        // variable specified by delegate.resultName (see delegateYield).
	        context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

	        context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
	        // exception, let the outer generator proceed normally. If
	        // context.method was "next", forget context.arg since it has been
	        // "consumed" by the delegate iterator. If context.method was
	        // "return", allow the original .return call to continue in the
	        // outer generator.

	        if (context.method !== "return") {
	          context.method = "next";
	          context.arg = undefined$1;
	        }
	      } else {
	        // Re-yield the result returned by the delegate method.
	        return info;
	      } // The delegate iterator is finished, so forget it and continue with
	      // the outer generator.


	      context.delegate = null;
	      return ContinueSentinel;
	    } // Define Generator.prototype.{next,throw,return} in terms of the
	    // unified ._invoke helper method.


	    defineIteratorMethods(Gp);
	    Gp[toStringTagSymbol] = "Generator"; // A Generator should always return itself as the iterator object when the
	    // @@iterator function is called on it. Some browsers' implementations of the
	    // iterator prototype chain incorrectly implement this, causing the Generator
	    // object to not be returned from this call. This ensures that doesn't happen.
	    // See https://github.com/facebook/regenerator/issues/274 for more details.

	    Gp[iteratorSymbol] = function () {
	      return this;
	    };

	    Gp.toString = function () {
	      return "[object Generator]";
	    };

	    function pushTryEntry(locs) {
	      var entry = {
	        tryLoc: locs[0]
	      };

	      if (1 in locs) {
	        entry.catchLoc = locs[1];
	      }

	      if (2 in locs) {
	        entry.finallyLoc = locs[2];
	        entry.afterLoc = locs[3];
	      }

	      this.tryEntries.push(entry);
	    }

	    function resetTryEntry(entry) {
	      var record = entry.completion || {};
	      record.type = "normal";
	      delete record.arg;
	      entry.completion = record;
	    }

	    function Context(tryLocsList) {
	      // The root entry object (effectively a try statement without a catch
	      // or a finally block) gives us a place to store values thrown from
	      // locations where there is no enclosing try statement.
	      this.tryEntries = [{
	        tryLoc: "root"
	      }];
	      tryLocsList.forEach(pushTryEntry, this);
	      this.reset(true);
	    }

	    exports.keys = function (object) {
	      var keys = [];

	      for (var key in object) {
	        keys.push(key);
	      }

	      keys.reverse(); // Rather than returning an object with a next method, we keep
	      // things simple and return the next function itself.

	      return function next() {
	        while (keys.length) {
	          var key = keys.pop();

	          if (key in object) {
	            next.value = key;
	            next.done = false;
	            return next;
	          }
	        } // To avoid creating an additional object, we just hang the .value
	        // and .done properties off the next function object itself. This
	        // also ensures that the minifier will not anonymize the function.


	        next.done = true;
	        return next;
	      };
	    };

	    function values(iterable) {
	      if (iterable) {
	        var iteratorMethod = iterable[iteratorSymbol];

	        if (iteratorMethod) {
	          return iteratorMethod.call(iterable);
	        }

	        if (typeof iterable.next === "function") {
	          return iterable;
	        }

	        if (!isNaN(iterable.length)) {
	          var i = -1,
	              next = function next() {
	            while (++i < iterable.length) {
	              if (hasOwn.call(iterable, i)) {
	                next.value = iterable[i];
	                next.done = false;
	                return next;
	              }
	            }

	            next.value = undefined$1;
	            next.done = true;
	            return next;
	          };

	          return next.next = next;
	        }
	      } // Return an iterator with no values.


	      return {
	        next: doneResult
	      };
	    }

	    exports.values = values;

	    function doneResult() {
	      return {
	        value: undefined$1,
	        done: true
	      };
	    }

	    Context.prototype = {
	      constructor: Context,
	      reset: function (skipTempReset) {
	        this.prev = 0;
	        this.next = 0; // Resetting context._sent for legacy support of Babel's
	        // function.sent implementation.

	        this.sent = this._sent = undefined$1;
	        this.done = false;
	        this.delegate = null;
	        this.method = "next";
	        this.arg = undefined$1;
	        this.tryEntries.forEach(resetTryEntry);

	        if (!skipTempReset) {
	          for (var name in this) {
	            // Not sure about the optimal order of these conditions:
	            if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
	              this[name] = undefined$1;
	            }
	          }
	        }
	      },
	      stop: function () {
	        this.done = true;
	        var rootEntry = this.tryEntries[0];
	        var rootRecord = rootEntry.completion;

	        if (rootRecord.type === "throw") {
	          throw rootRecord.arg;
	        }

	        return this.rval;
	      },
	      dispatchException: function (exception) {
	        if (this.done) {
	          throw exception;
	        }

	        var context = this;

	        function handle(loc, caught) {
	          record.type = "throw";
	          record.arg = exception;
	          context.next = loc;

	          if (caught) {
	            // If the dispatched exception was caught by a catch block,
	            // then let that catch block handle the exception normally.
	            context.method = "next";
	            context.arg = undefined$1;
	          }

	          return !!caught;
	        }

	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];
	          var record = entry.completion;

	          if (entry.tryLoc === "root") {
	            // Exception thrown outside of any try block that could handle
	            // it, so set the completion value of the entire function to
	            // throw the exception.
	            return handle("end");
	          }

	          if (entry.tryLoc <= this.prev) {
	            var hasCatch = hasOwn.call(entry, "catchLoc");
	            var hasFinally = hasOwn.call(entry, "finallyLoc");

	            if (hasCatch && hasFinally) {
	              if (this.prev < entry.catchLoc) {
	                return handle(entry.catchLoc, true);
	              } else if (this.prev < entry.finallyLoc) {
	                return handle(entry.finallyLoc);
	              }
	            } else if (hasCatch) {
	              if (this.prev < entry.catchLoc) {
	                return handle(entry.catchLoc, true);
	              }
	            } else if (hasFinally) {
	              if (this.prev < entry.finallyLoc) {
	                return handle(entry.finallyLoc);
	              }
	            } else {
	              throw new Error("try statement without catch or finally");
	            }
	          }
	        }
	      },
	      abrupt: function (type, arg) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
	            var finallyEntry = entry;
	            break;
	          }
	        }

	        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
	          // Ignore the finally entry if control is not jumping to a
	          // location outside the try/catch block.
	          finallyEntry = null;
	        }

	        var record = finallyEntry ? finallyEntry.completion : {};
	        record.type = type;
	        record.arg = arg;

	        if (finallyEntry) {
	          this.method = "next";
	          this.next = finallyEntry.finallyLoc;
	          return ContinueSentinel;
	        }

	        return this.complete(record);
	      },
	      complete: function (record, afterLoc) {
	        if (record.type === "throw") {
	          throw record.arg;
	        }

	        if (record.type === "break" || record.type === "continue") {
	          this.next = record.arg;
	        } else if (record.type === "return") {
	          this.rval = this.arg = record.arg;
	          this.method = "return";
	          this.next = "end";
	        } else if (record.type === "normal" && afterLoc) {
	          this.next = afterLoc;
	        }

	        return ContinueSentinel;
	      },
	      finish: function (finallyLoc) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.finallyLoc === finallyLoc) {
	            this.complete(entry.completion, entry.afterLoc);
	            resetTryEntry(entry);
	            return ContinueSentinel;
	          }
	        }
	      },
	      "catch": function (tryLoc) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.tryLoc === tryLoc) {
	            var record = entry.completion;

	            if (record.type === "throw") {
	              var thrown = record.arg;
	              resetTryEntry(entry);
	            }

	            return thrown;
	          }
	        } // The context.catch method must only be called with a location
	        // argument that corresponds to a known catch block.


	        throw new Error("illegal catch attempt");
	      },
	      delegateYield: function (iterable, resultName, nextLoc) {
	        this.delegate = {
	          iterator: values(iterable),
	          resultName: resultName,
	          nextLoc: nextLoc
	        };

	        if (this.method === "next") {
	          // Deliberately forget the last sent value so that we don't
	          // accidentally pass it on to the delegate.
	          this.arg = undefined$1;
	        }

	        return ContinueSentinel;
	      }
	    }; // Regardless of whether this script is executing as a CommonJS module
	    // or not, return the runtime object so that we can declare the variable
	    // regeneratorRuntime in the outer scope, which allows this module to be
	    // injected easily by `bin/regenerator --include-runtime script.js`.

	    return exports;
	  }( // If this script is executing as a CommonJS module, use module.exports
	  // as the regeneratorRuntime namespace. Otherwise create a new empty
	  // object. Either way, the resulting object will be used to initialize
	  // the regeneratorRuntime variable at the top of this file.
	   module.exports );

	  try {
	    regeneratorRuntime = runtime;
	  } catch (accidentalStrictMode) {
	    // This module should not be running in strict mode, so the above
	    // assignment should always work unless something is misconfigured. Just
	    // in case runtime.js accidentally runs in strict mode, we can escape
	    // strict mode using a global Function call. This could conceivably fail
	    // if a Content Security Policy forbids using Function, but in that case
	    // the proper solution is to fix the accidental strict mode problem. If
	    // you've misconfigured your bundler to force strict mode and applied a
	    // CSP to forbid Function, and you're not willing to fix either of those
	    // problems, please detail your unique predicament in a GitHub issue.
	    Function("r", "regeneratorRuntime = r")(runtime);
	  }
	});

	var regenerator = runtime_1;

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
	  try {
	    var info = gen[key](arg);
	    var value = info.value;
	  } catch (error) {
	    reject(error);
	    return;
	  }

	  if (info.done) {
	    resolve(value);
	  } else {
	    Promise.resolve(value).then(_next, _throw);
	  }
	}

	function _asyncToGenerator(fn) {
	  return function () {
	    var self = this,
	        args = arguments;
	    return new Promise(function (resolve, reject) {
	      var gen = fn.apply(self, args);

	      function _next(value) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
	      }

	      function _throw(err) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
	      }

	      _next(undefined);
	    });
	  };
	}

	var asyncToGenerator = _asyncToGenerator;

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	var classCallCheck = _classCallCheck;

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	var createClass = _createClass;

	function _defineProperty(obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	}

	var defineProperty = _defineProperty;

	var _typeof_1 = createCommonjsModule(function (module) {
	  function _typeof(obj) {
	    "@babel/helpers - typeof";

	    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
	      module.exports = _typeof = function _typeof(obj) {
	        return typeof obj;
	      };
	    } else {
	      module.exports = _typeof = function _typeof(obj) {
	        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	      };
	    }

	    return _typeof(obj);
	  }

	  module.exports = _typeof;
	});

	var md5 = createCommonjsModule(function (module) {
	  /**
	   * [js-md5]{@link https://github.com/emn178/js-md5}
	   *
	   * @namespace md5
	   * @version 0.7.3
	   * @author Chen, Yi-Cyuan [emn178@gmail.com]
	   * @copyright Chen, Yi-Cyuan 2014-2017
	   * @license MIT
	   */
	  (function () {
	    console.log('hello js-md5');

	    var ERROR = 'input is invalid type';
	    var WINDOW = typeof window === 'object';
	    var root = WINDOW ? window : {};

	    if (root.JS_MD5_NO_WINDOW) {
	      WINDOW = false;
	    }

	    var WEB_WORKER = !WINDOW && typeof self === 'object';
	    var NODE_JS = !root.JS_MD5_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node;

	    if (NODE_JS) {
	      root = commonjsGlobal;
	    } else if (WEB_WORKER) {
	      root = self;
	    }

	    var COMMON_JS = !root.JS_MD5_NO_COMMON_JS && 'object' === 'object' && module.exports;
	    var ARRAY_BUFFER = !root.JS_MD5_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
	    var HEX_CHARS = '0123456789abcdef'.split('');
	    var EXTRA = [128, 32768, 8388608, -2147483648];
	    var SHIFT = [0, 8, 16, 24];
	    var OUTPUT_TYPES = ['hex', 'array', 'digest', 'buffer', 'arrayBuffer', 'base64'];
	    var BASE64_ENCODE_CHAR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
	    var blocks = [],
	        buffer8;

	    if (ARRAY_BUFFER) {
	      var buffer = new ArrayBuffer(68);
	      buffer8 = new Uint8Array(buffer);
	      blocks = new Uint32Array(buffer);
	    }

	    if (root.JS_MD5_NO_NODE_JS || !Array.isArray) {
	      Array.isArray = function (obj) {
	        return Object.prototype.toString.call(obj) === '[object Array]';
	      };
	    }

	    if (ARRAY_BUFFER && (root.JS_MD5_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
	      ArrayBuffer.isView = function (obj) {
	        return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
	      };
	    }
	    /**
	     * @method hex
	     * @memberof md5
	     * @description Output hash as hex string
	     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
	     * @returns {String} Hex string
	     * @example
	     * md5.hex('The quick brown fox jumps over the lazy dog');
	     * // equal to
	     * md5('The quick brown fox jumps over the lazy dog');
	     */

	    /**
	     * @method digest
	     * @memberof md5
	     * @description Output hash as bytes array
	     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
	     * @returns {Array} Bytes array
	     * @example
	     * md5.digest('The quick brown fox jumps over the lazy dog');
	     */

	    /**
	     * @method array
	     * @memberof md5
	     * @description Output hash as bytes array
	     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
	     * @returns {Array} Bytes array
	     * @example
	     * md5.array('The quick brown fox jumps over the lazy dog');
	     */

	    /**
	     * @method arrayBuffer
	     * @memberof md5
	     * @description Output hash as ArrayBuffer
	     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
	     * @returns {ArrayBuffer} ArrayBuffer
	     * @example
	     * md5.arrayBuffer('The quick brown fox jumps over the lazy dog');
	     */

	    /**
	     * @method buffer
	     * @deprecated This maybe confuse with Buffer in node.js. Please use arrayBuffer instead.
	     * @memberof md5
	     * @description Output hash as ArrayBuffer
	     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
	     * @returns {ArrayBuffer} ArrayBuffer
	     * @example
	     * md5.buffer('The quick brown fox jumps over the lazy dog');
	     */

	    /**
	     * @method base64
	     * @memberof md5
	     * @description Output hash as base64 string
	     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
	     * @returns {String} base64 string
	     * @example
	     * md5.base64('The quick brown fox jumps over the lazy dog');
	     */


	    var createOutputMethod = function (outputType) {
	      return function (message) {
	        return new Md5(true).update(message)[outputType]();
	      };
	    };
	    /**
	     * @method create
	     * @memberof md5
	     * @description Create Md5 object
	     * @returns {Md5} Md5 object.
	     * @example
	     * var hash = md5.create();
	     */

	    /**
	     * @method update
	     * @memberof md5
	     * @description Create and update Md5 object
	     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
	     * @returns {Md5} Md5 object.
	     * @example
	     * var hash = md5.update('The quick brown fox jumps over the lazy dog');
	     * // equal to
	     * var hash = md5.create();
	     * hash.update('The quick brown fox jumps over the lazy dog');
	     */


	    var createMethod = function () {
	      var method = createOutputMethod('hex');

	      if (NODE_JS) {
	        method = nodeWrap(method);
	      }

	      method.create = function () {
	        return new Md5();
	      };

	      method.update = function (message) {
	        return method.create().update(message);
	      };

	      for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
	        var type = OUTPUT_TYPES[i];
	        method[type] = createOutputMethod(type);
	      }

	      return method;
	    };

	    var nodeWrap = function (method) {
	      var crypto = eval("require('crypto')");
	      var Buffer = eval("require('buffer').Buffer");

	      var nodeMethod = function (message) {
	        if (typeof message === 'string') {
	          return crypto.createHash('md5').update(message, 'utf8').digest('hex');
	        } else {
	          if (message === null || message === undefined) {
	            throw ERROR;
	          } else if (message.constructor === ArrayBuffer) {
	            message = new Uint8Array(message);
	          }
	        }

	        if (Array.isArray(message) || ArrayBuffer.isView(message) || message.constructor === Buffer) {
	          return crypto.createHash('md5').update(new Buffer(message)).digest('hex');
	        } else {
	          return method(message);
	        }
	      };

	      return nodeMethod;
	    };
	    /**
	     * Md5 class
	     * @class Md5
	     * @description This is internal class.
	     * @see {@link md5.create}
	     */


	    function Md5(sharedMemory) {
	      if (sharedMemory) {
	        blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
	        this.blocks = blocks;
	        this.buffer8 = buffer8;
	      } else {
	        if (ARRAY_BUFFER) {
	          var buffer = new ArrayBuffer(68);
	          this.buffer8 = new Uint8Array(buffer);
	          this.blocks = new Uint32Array(buffer);
	        } else {
	          this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	        }
	      }

	      this.h0 = this.h1 = this.h2 = this.h3 = this.start = this.bytes = this.hBytes = 0;
	      this.finalized = this.hashed = false;
	      this.first = true;
	    }
	    /**
	     * @method update
	     * @memberof Md5
	     * @instance
	     * @description Update hash
	     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
	     * @returns {Md5} Md5 object.
	     * @see {@link md5.update}
	     */


	    Md5.prototype.update = function (message) {
	      if (this.finalized) {
	        return;
	      }

	      var notString,
	          type = typeof message;

	      if (type !== 'string') {
	        if (type === 'object') {
	          if (message === null) {
	            throw ERROR;
	          } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
	            message = new Uint8Array(message);
	          } else if (!Array.isArray(message)) {
	            if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
	              throw ERROR;
	            }
	          }
	        } else {
	          throw ERROR;
	        }

	        notString = true;
	      }

	      var code,
	          index = 0,
	          i,
	          length = message.length,
	          blocks = this.blocks;
	      var buffer8 = this.buffer8;

	      while (index < length) {
	        if (this.hashed) {
	          this.hashed = false;
	          blocks[0] = blocks[16];
	          blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
	        }

	        if (notString) {
	          if (ARRAY_BUFFER) {
	            for (i = this.start; index < length && i < 64; ++index) {
	              buffer8[i++] = message[index];
	            }
	          } else {
	            for (i = this.start; index < length && i < 64; ++index) {
	              blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
	            }
	          }
	        } else {
	          if (ARRAY_BUFFER) {
	            for (i = this.start; index < length && i < 64; ++index) {
	              code = message.charCodeAt(index);

	              if (code < 0x80) {
	                buffer8[i++] = code;
	              } else if (code < 0x800) {
	                buffer8[i++] = 0xc0 | code >> 6;
	                buffer8[i++] = 0x80 | code & 0x3f;
	              } else if (code < 0xd800 || code >= 0xe000) {
	                buffer8[i++] = 0xe0 | code >> 12;
	                buffer8[i++] = 0x80 | code >> 6 & 0x3f;
	                buffer8[i++] = 0x80 | code & 0x3f;
	              } else {
	                code = 0x10000 + ((code & 0x3ff) << 10 | message.charCodeAt(++index) & 0x3ff);
	                buffer8[i++] = 0xf0 | code >> 18;
	                buffer8[i++] = 0x80 | code >> 12 & 0x3f;
	                buffer8[i++] = 0x80 | code >> 6 & 0x3f;
	                buffer8[i++] = 0x80 | code & 0x3f;
	              }
	            }
	          } else {
	            for (i = this.start; index < length && i < 64; ++index) {
	              code = message.charCodeAt(index);

	              if (code < 0x80) {
	                blocks[i >> 2] |= code << SHIFT[i++ & 3];
	              } else if (code < 0x800) {
	                blocks[i >> 2] |= (0xc0 | code >> 6) << SHIFT[i++ & 3];
	                blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
	              } else if (code < 0xd800 || code >= 0xe000) {
	                blocks[i >> 2] |= (0xe0 | code >> 12) << SHIFT[i++ & 3];
	                blocks[i >> 2] |= (0x80 | code >> 6 & 0x3f) << SHIFT[i++ & 3];
	                blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
	              } else {
	                code = 0x10000 + ((code & 0x3ff) << 10 | message.charCodeAt(++index) & 0x3ff);
	                blocks[i >> 2] |= (0xf0 | code >> 18) << SHIFT[i++ & 3];
	                blocks[i >> 2] |= (0x80 | code >> 12 & 0x3f) << SHIFT[i++ & 3];
	                blocks[i >> 2] |= (0x80 | code >> 6 & 0x3f) << SHIFT[i++ & 3];
	                blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
	              }
	            }
	          }
	        }

	        this.lastByteIndex = i;
	        this.bytes += i - this.start;

	        if (i >= 64) {
	          this.start = i - 64;
	          this.hash();
	          this.hashed = true;
	        } else {
	          this.start = i;
	        }
	      }

	      if (this.bytes > 4294967295) {
	        this.hBytes += this.bytes / 4294967296 << 0;
	        this.bytes = this.bytes % 4294967296;
	      }

	      return this;
	    };

	    Md5.prototype.finalize = function () {
	      if (this.finalized) {
	        return;
	      }

	      this.finalized = true;
	      var blocks = this.blocks,
	          i = this.lastByteIndex;
	      blocks[i >> 2] |= EXTRA[i & 3];

	      if (i >= 56) {
	        if (!this.hashed) {
	          this.hash();
	        }

	        blocks[0] = blocks[16];
	        blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
	      }

	      blocks[14] = this.bytes << 3;
	      blocks[15] = this.hBytes << 3 | this.bytes >>> 29;
	      this.hash();
	    };

	    Md5.prototype.hash = function () {
	      var a,
	          b,
	          c,
	          d,
	          bc,
	          da,
	          blocks = this.blocks;

	      if (this.first) {
	        a = blocks[0] - 680876937;
	        a = (a << 7 | a >>> 25) - 271733879 << 0;
	        d = (-1732584194 ^ a & 2004318071) + blocks[1] - 117830708;
	        d = (d << 12 | d >>> 20) + a << 0;
	        c = (-271733879 ^ d & (a ^ -271733879)) + blocks[2] - 1126478375;
	        c = (c << 17 | c >>> 15) + d << 0;
	        b = (a ^ c & (d ^ a)) + blocks[3] - 1316259209;
	        b = (b << 22 | b >>> 10) + c << 0;
	      } else {
	        a = this.h0;
	        b = this.h1;
	        c = this.h2;
	        d = this.h3;
	        a += (d ^ b & (c ^ d)) + blocks[0] - 680876936;
	        a = (a << 7 | a >>> 25) + b << 0;
	        d += (c ^ a & (b ^ c)) + blocks[1] - 389564586;
	        d = (d << 12 | d >>> 20) + a << 0;
	        c += (b ^ d & (a ^ b)) + blocks[2] + 606105819;
	        c = (c << 17 | c >>> 15) + d << 0;
	        b += (a ^ c & (d ^ a)) + blocks[3] - 1044525330;
	        b = (b << 22 | b >>> 10) + c << 0;
	      }

	      a += (d ^ b & (c ^ d)) + blocks[4] - 176418897;
	      a = (a << 7 | a >>> 25) + b << 0;
	      d += (c ^ a & (b ^ c)) + blocks[5] + 1200080426;
	      d = (d << 12 | d >>> 20) + a << 0;
	      c += (b ^ d & (a ^ b)) + blocks[6] - 1473231341;
	      c = (c << 17 | c >>> 15) + d << 0;
	      b += (a ^ c & (d ^ a)) + blocks[7] - 45705983;
	      b = (b << 22 | b >>> 10) + c << 0;
	      a += (d ^ b & (c ^ d)) + blocks[8] + 1770035416;
	      a = (a << 7 | a >>> 25) + b << 0;
	      d += (c ^ a & (b ^ c)) + blocks[9] - 1958414417;
	      d = (d << 12 | d >>> 20) + a << 0;
	      c += (b ^ d & (a ^ b)) + blocks[10] - 42063;
	      c = (c << 17 | c >>> 15) + d << 0;
	      b += (a ^ c & (d ^ a)) + blocks[11] - 1990404162;
	      b = (b << 22 | b >>> 10) + c << 0;
	      a += (d ^ b & (c ^ d)) + blocks[12] + 1804603682;
	      a = (a << 7 | a >>> 25) + b << 0;
	      d += (c ^ a & (b ^ c)) + blocks[13] - 40341101;
	      d = (d << 12 | d >>> 20) + a << 0;
	      c += (b ^ d & (a ^ b)) + blocks[14] - 1502002290;
	      c = (c << 17 | c >>> 15) + d << 0;
	      b += (a ^ c & (d ^ a)) + blocks[15] + 1236535329;
	      b = (b << 22 | b >>> 10) + c << 0;
	      a += (c ^ d & (b ^ c)) + blocks[1] - 165796510;
	      a = (a << 5 | a >>> 27) + b << 0;
	      d += (b ^ c & (a ^ b)) + blocks[6] - 1069501632;
	      d = (d << 9 | d >>> 23) + a << 0;
	      c += (a ^ b & (d ^ a)) + blocks[11] + 643717713;
	      c = (c << 14 | c >>> 18) + d << 0;
	      b += (d ^ a & (c ^ d)) + blocks[0] - 373897302;
	      b = (b << 20 | b >>> 12) + c << 0;
	      a += (c ^ d & (b ^ c)) + blocks[5] - 701558691;
	      a = (a << 5 | a >>> 27) + b << 0;
	      d += (b ^ c & (a ^ b)) + blocks[10] + 38016083;
	      d = (d << 9 | d >>> 23) + a << 0;
	      c += (a ^ b & (d ^ a)) + blocks[15] - 660478335;
	      c = (c << 14 | c >>> 18) + d << 0;
	      b += (d ^ a & (c ^ d)) + blocks[4] - 405537848;
	      b = (b << 20 | b >>> 12) + c << 0;
	      a += (c ^ d & (b ^ c)) + blocks[9] + 568446438;
	      a = (a << 5 | a >>> 27) + b << 0;
	      d += (b ^ c & (a ^ b)) + blocks[14] - 1019803690;
	      d = (d << 9 | d >>> 23) + a << 0;
	      c += (a ^ b & (d ^ a)) + blocks[3] - 187363961;
	      c = (c << 14 | c >>> 18) + d << 0;
	      b += (d ^ a & (c ^ d)) + blocks[8] + 1163531501;
	      b = (b << 20 | b >>> 12) + c << 0;
	      a += (c ^ d & (b ^ c)) + blocks[13] - 1444681467;
	      a = (a << 5 | a >>> 27) + b << 0;
	      d += (b ^ c & (a ^ b)) + blocks[2] - 51403784;
	      d = (d << 9 | d >>> 23) + a << 0;
	      c += (a ^ b & (d ^ a)) + blocks[7] + 1735328473;
	      c = (c << 14 | c >>> 18) + d << 0;
	      b += (d ^ a & (c ^ d)) + blocks[12] - 1926607734;
	      b = (b << 20 | b >>> 12) + c << 0;
	      bc = b ^ c;
	      a += (bc ^ d) + blocks[5] - 378558;
	      a = (a << 4 | a >>> 28) + b << 0;
	      d += (bc ^ a) + blocks[8] - 2022574463;
	      d = (d << 11 | d >>> 21) + a << 0;
	      da = d ^ a;
	      c += (da ^ b) + blocks[11] + 1839030562;
	      c = (c << 16 | c >>> 16) + d << 0;
	      b += (da ^ c) + blocks[14] - 35309556;
	      b = (b << 23 | b >>> 9) + c << 0;
	      bc = b ^ c;
	      a += (bc ^ d) + blocks[1] - 1530992060;
	      a = (a << 4 | a >>> 28) + b << 0;
	      d += (bc ^ a) + blocks[4] + 1272893353;
	      d = (d << 11 | d >>> 21) + a << 0;
	      da = d ^ a;
	      c += (da ^ b) + blocks[7] - 155497632;
	      c = (c << 16 | c >>> 16) + d << 0;
	      b += (da ^ c) + blocks[10] - 1094730640;
	      b = (b << 23 | b >>> 9) + c << 0;
	      bc = b ^ c;
	      a += (bc ^ d) + blocks[13] + 681279174;
	      a = (a << 4 | a >>> 28) + b << 0;
	      d += (bc ^ a) + blocks[0] - 358537222;
	      d = (d << 11 | d >>> 21) + a << 0;
	      da = d ^ a;
	      c += (da ^ b) + blocks[3] - 722521979;
	      c = (c << 16 | c >>> 16) + d << 0;
	      b += (da ^ c) + blocks[6] + 76029189;
	      b = (b << 23 | b >>> 9) + c << 0;
	      bc = b ^ c;
	      a += (bc ^ d) + blocks[9] - 640364487;
	      a = (a << 4 | a >>> 28) + b << 0;
	      d += (bc ^ a) + blocks[12] - 421815835;
	      d = (d << 11 | d >>> 21) + a << 0;
	      da = d ^ a;
	      c += (da ^ b) + blocks[15] + 530742520;
	      c = (c << 16 | c >>> 16) + d << 0;
	      b += (da ^ c) + blocks[2] - 995338651;
	      b = (b << 23 | b >>> 9) + c << 0;
	      a += (c ^ (b | ~d)) + blocks[0] - 198630844;
	      a = (a << 6 | a >>> 26) + b << 0;
	      d += (b ^ (a | ~c)) + blocks[7] + 1126891415;
	      d = (d << 10 | d >>> 22) + a << 0;
	      c += (a ^ (d | ~b)) + blocks[14] - 1416354905;
	      c = (c << 15 | c >>> 17) + d << 0;
	      b += (d ^ (c | ~a)) + blocks[5] - 57434055;
	      b = (b << 21 | b >>> 11) + c << 0;
	      a += (c ^ (b | ~d)) + blocks[12] + 1700485571;
	      a = (a << 6 | a >>> 26) + b << 0;
	      d += (b ^ (a | ~c)) + blocks[3] - 1894986606;
	      d = (d << 10 | d >>> 22) + a << 0;
	      c += (a ^ (d | ~b)) + blocks[10] - 1051523;
	      c = (c << 15 | c >>> 17) + d << 0;
	      b += (d ^ (c | ~a)) + blocks[1] - 2054922799;
	      b = (b << 21 | b >>> 11) + c << 0;
	      a += (c ^ (b | ~d)) + blocks[8] + 1873313359;
	      a = (a << 6 | a >>> 26) + b << 0;
	      d += (b ^ (a | ~c)) + blocks[15] - 30611744;
	      d = (d << 10 | d >>> 22) + a << 0;
	      c += (a ^ (d | ~b)) + blocks[6] - 1560198380;
	      c = (c << 15 | c >>> 17) + d << 0;
	      b += (d ^ (c | ~a)) + blocks[13] + 1309151649;
	      b = (b << 21 | b >>> 11) + c << 0;
	      a += (c ^ (b | ~d)) + blocks[4] - 145523070;
	      a = (a << 6 | a >>> 26) + b << 0;
	      d += (b ^ (a | ~c)) + blocks[11] - 1120210379;
	      d = (d << 10 | d >>> 22) + a << 0;
	      c += (a ^ (d | ~b)) + blocks[2] + 718787259;
	      c = (c << 15 | c >>> 17) + d << 0;
	      b += (d ^ (c | ~a)) + blocks[9] - 343485551;
	      b = (b << 21 | b >>> 11) + c << 0;

	      if (this.first) {
	        this.h0 = a + 1732584193 << 0;
	        this.h1 = b - 271733879 << 0;
	        this.h2 = c - 1732584194 << 0;
	        this.h3 = d + 271733878 << 0;
	        this.first = false;
	      } else {
	        this.h0 = this.h0 + a << 0;
	        this.h1 = this.h1 + b << 0;
	        this.h2 = this.h2 + c << 0;
	        this.h3 = this.h3 + d << 0;
	      }
	    };
	    /**
	     * @method hex
	     * @memberof Md5
	     * @instance
	     * @description Output hash as hex string
	     * @returns {String} Hex string
	     * @see {@link md5.hex}
	     * @example
	     * hash.hex();
	     */


	    Md5.prototype.hex = function () {
	      this.finalize();
	      var h0 = this.h0,
	          h1 = this.h1,
	          h2 = this.h2,
	          h3 = this.h3;
	      return HEX_CHARS[h0 >> 4 & 0x0F] + HEX_CHARS[h0 & 0x0F] + HEX_CHARS[h0 >> 12 & 0x0F] + HEX_CHARS[h0 >> 8 & 0x0F] + HEX_CHARS[h0 >> 20 & 0x0F] + HEX_CHARS[h0 >> 16 & 0x0F] + HEX_CHARS[h0 >> 28 & 0x0F] + HEX_CHARS[h0 >> 24 & 0x0F] + HEX_CHARS[h1 >> 4 & 0x0F] + HEX_CHARS[h1 & 0x0F] + HEX_CHARS[h1 >> 12 & 0x0F] + HEX_CHARS[h1 >> 8 & 0x0F] + HEX_CHARS[h1 >> 20 & 0x0F] + HEX_CHARS[h1 >> 16 & 0x0F] + HEX_CHARS[h1 >> 28 & 0x0F] + HEX_CHARS[h1 >> 24 & 0x0F] + HEX_CHARS[h2 >> 4 & 0x0F] + HEX_CHARS[h2 & 0x0F] + HEX_CHARS[h2 >> 12 & 0x0F] + HEX_CHARS[h2 >> 8 & 0x0F] + HEX_CHARS[h2 >> 20 & 0x0F] + HEX_CHARS[h2 >> 16 & 0x0F] + HEX_CHARS[h2 >> 28 & 0x0F] + HEX_CHARS[h2 >> 24 & 0x0F] + HEX_CHARS[h3 >> 4 & 0x0F] + HEX_CHARS[h3 & 0x0F] + HEX_CHARS[h3 >> 12 & 0x0F] + HEX_CHARS[h3 >> 8 & 0x0F] + HEX_CHARS[h3 >> 20 & 0x0F] + HEX_CHARS[h3 >> 16 & 0x0F] + HEX_CHARS[h3 >> 28 & 0x0F] + HEX_CHARS[h3 >> 24 & 0x0F];
	    };
	    /**
	     * @method toString
	     * @memberof Md5
	     * @instance
	     * @description Output hash as hex string
	     * @returns {String} Hex string
	     * @see {@link md5.hex}
	     * @example
	     * hash.toString();
	     */


	    Md5.prototype.toString = Md5.prototype.hex;
	    /**
	     * @method digest
	     * @memberof Md5
	     * @instance
	     * @description Output hash as bytes array
	     * @returns {Array} Bytes array
	     * @see {@link md5.digest}
	     * @example
	     * hash.digest();
	     */

	    Md5.prototype.digest = function () {
	      this.finalize();
	      var h0 = this.h0,
	          h1 = this.h1,
	          h2 = this.h2,
	          h3 = this.h3;
	      return [h0 & 0xFF, h0 >> 8 & 0xFF, h0 >> 16 & 0xFF, h0 >> 24 & 0xFF, h1 & 0xFF, h1 >> 8 & 0xFF, h1 >> 16 & 0xFF, h1 >> 24 & 0xFF, h2 & 0xFF, h2 >> 8 & 0xFF, h2 >> 16 & 0xFF, h2 >> 24 & 0xFF, h3 & 0xFF, h3 >> 8 & 0xFF, h3 >> 16 & 0xFF, h3 >> 24 & 0xFF];
	    };
	    /**
	     * @method array
	     * @memberof Md5
	     * @instance
	     * @description Output hash as bytes array
	     * @returns {Array} Bytes array
	     * @see {@link md5.array}
	     * @example
	     * hash.array();
	     */


	    Md5.prototype.array = Md5.prototype.digest;
	    /**
	     * @method arrayBuffer
	     * @memberof Md5
	     * @instance
	     * @description Output hash as ArrayBuffer
	     * @returns {ArrayBuffer} ArrayBuffer
	     * @see {@link md5.arrayBuffer}
	     * @example
	     * hash.arrayBuffer();
	     */

	    Md5.prototype.arrayBuffer = function () {
	      this.finalize();
	      var buffer = new ArrayBuffer(16);
	      var blocks = new Uint32Array(buffer);
	      blocks[0] = this.h0;
	      blocks[1] = this.h1;
	      blocks[2] = this.h2;
	      blocks[3] = this.h3;
	      return buffer;
	    };
	    /**
	     * @method buffer
	     * @deprecated This maybe confuse with Buffer in node.js. Please use arrayBuffer instead.
	     * @memberof Md5
	     * @instance
	     * @description Output hash as ArrayBuffer
	     * @returns {ArrayBuffer} ArrayBuffer
	     * @see {@link md5.buffer}
	     * @example
	     * hash.buffer();
	     */


	    Md5.prototype.buffer = Md5.prototype.arrayBuffer;
	    /**
	     * @method base64
	     * @memberof Md5
	     * @instance
	     * @description Output hash as base64 string
	     * @returns {String} base64 string
	     * @see {@link md5.base64}
	     * @example
	     * hash.base64();
	     */

	    Md5.prototype.base64 = function () {
	      var v1,
	          v2,
	          v3,
	          base64Str = '',
	          bytes = this.array();

	      for (var i = 0; i < 15;) {
	        v1 = bytes[i++];
	        v2 = bytes[i++];
	        v3 = bytes[i++];
	        base64Str += BASE64_ENCODE_CHAR[v1 >>> 2] + BASE64_ENCODE_CHAR[(v1 << 4 | v2 >>> 4) & 63] + BASE64_ENCODE_CHAR[(v2 << 2 | v3 >>> 6) & 63] + BASE64_ENCODE_CHAR[v3 & 63];
	      }

	      v1 = bytes[i];
	      base64Str += BASE64_ENCODE_CHAR[v1 >>> 2] + BASE64_ENCODE_CHAR[v1 << 4 & 63] + '==';
	      return base64Str;
	    };

	    var exports = createMethod();

	    if (COMMON_JS) {
	      module.exports = exports;
	    } else {
	      /**
	       * @method md5
	       * @description Md5 hash function, export to global in browsers.
	       * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
	       * @returns {String} md5 hashes
	       * @example
	       * md5(''); // d41d8cd98f00b204e9800998ecf8427e
	       * md5('The quick brown fox jumps over the lazy dog'); // 9e107d9d372bb6826bd81d3542a419d6
	       * md5('The quick brown fox jumps over the lazy dog.'); // e4d909c290d0fb1ca068ffaddf22cbd0
	       *
	       * // It also supports UTF-8 encoding
	       * md5('中文'); // a7bac2239fcdcb3a067903d8077c4a07
	       *
	       * // It also supports byte `Array`, `Uint8Array`, `ArrayBuffer`
	       * md5([]); // d41d8cd98f00b204e9800998ecf8427e
	       * md5(new Uint8Array([])); // d41d8cd98f00b204e9800998ecf8427e
	       */
	      root.md5 = exports;
	    }
	  })();
	});

	var md5$1;

	var blobSlice = function () {
	  return File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
	}();
	/**
	 * md5计算文件hash值
	 * @description 依赖 SparkMD5
	 * @param {File} file 文件对象
	 * @returns {Promise<string>} file hash
	 */


	function MD5file(file) {
	  return new Promise(function (resolve, reject) {
	    var fileReader = new FileReader();
	    fileReader.readAsArrayBuffer(blobSlice.call(file));

	    fileReader.onload = function (e) {
	      if (!md5$1) {
	        md5$1 = md5;
	      }

	      console.log('md5', md5$1);
	      resolve(md5$1(e.target.result));
	    };

	    fileReader.onerror = function () {
	      reject(new Error('ReadAsArrayBuffer error!'));
	    };
	  });
	}
	/**
	 * 是否是非空对象
	 * @param {*} val
	 * @returns boolean
	 */

	function isObj(val) {
	  return val && _typeof_1(val) === 'object' && val.toString() === '[object Object]';
	}
	/**
	 * 是否是函数
	 * @param {*} fn
	 * @returns boolean
	 */

	function isFn(fn) {
	  return typeof fn === 'function';
	}
	/**
	 * 是否是Promise
	 * @param {*} p
	 * @returns {boolean}
	 */

	function isPromise(p) {
	  return p && (_typeof_1(p) === 'object' && isFn(p.then) || p.toString() === '[object Promise]');
	}
	/**
	 * 是否是input元素
	 */

	function isInputElem(elem) {
	  return elem && elem.nodeType === 1 && elem.nodeName === 'INPUT';
	}
	/**
	 *文件分块
	 * @param {File} file
	 * @param {number} chunkSize 分块大小
	 * @returns {Number}
	 */

	function sliceFile(file, chunkSize) {
	  if (file instanceof File) {
	    var count = Math.ceil(file.size / chunkSize);
	    var chunks = [];
	    var i = 0;

	    while (i < count) {
	      var start = i * chunkSize;
	      var end = start + chunkSize >= file.size ? file.size : start + chunkSize;
	      chunks.push(blobSlice.call(file, start, end));
	      i++;
	    }

	    return chunks;
	  }
	}
	function upload(opts) {
	  var _this = this;

	  // opts = {
	  //   name: '',
	  //   file: null,
	  //   headers: {},
	  //   data: {},
	  //   url: '',
	  //   progress: () => {},
	  //   success: () => {},
	  //   error: () => {},
	  //   withCredentials: false
	  // }
	  var xhr = new XMLHttpRequest();
	  var fd = new FormData();
	  fd.append(opts.name, opts.file);
	  var data = opts.data;

	  if (isObj(data)) {
	    for (var o in data) {
	      fd.append(o, data[o]);
	    }
	  }

	  xhr.open('POST', opts.url); // 请求头设置

	  if (opts.headers) {
	    for (var _o in opts.headers) {
	      xhr.setRequestHeader(_o, opts.headers[_o]);
	    }
	  }

	  if (opts.withCredentials !== undefined) {
	    xhr.setRequestHeader('withCredentials', opts.withCredentials);
	  }

	  xhr.upload.onprogress = function (ev) {
	    if (isFn(opts.progress)) {
	      opts.progress.call(_this, ev);
	    }
	  };

	  xhr.onload = function (ev) {
	    if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) {
	      if (isFn(opts.error)) {
	        opts.error(ev);
	      }
	    } else {
	      if (isFn(opts.success)) {
	        var isResJson = xhr.getResponseHeader('Content-type').indexOf('application/json') >= 0;
	        var res = xhr.responseText;

	        if (isResJson) {
	          try {
	            res = JSON.parse(res);
	          } catch (err) {
	            throw new Error(err);
	          }
	        }

	        opts.success(res);
	      }
	    }
	  };

	  xhr.onerror = function (ev) {
	    if (isFn(opts.error)) {
	      opts.error(ev);
	    }
	  };

	  xhr.send(fd);
	  return xhr;
	}

	var UploadOptions = function UploadOptions() {
	  var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'file';
	  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	  var headers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
	  var withCredentials = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

	  classCallCheck(this, UploadOptions);

	  defineProperty(this, "url", void 0);

	  defineProperty(this, "name", void 0);

	  defineProperty(this, "data", void 0);

	  defineProperty(this, "headers", void 0);

	  defineProperty(this, "withCredentials", void 0);

	  this.url = url;
	  this.name = name;
	  this.data = data;
	  this.headers = headers;
	  this.withCredentials = withCredentials;
	};

	var UploadEvent = /*#__PURE__*/function () {
	  function UploadEvent() {
	    classCallCheck(this, UploadEvent);

	    defineProperty(this, "handlersMap", {});
	  }

	  createClass(UploadEvent, [{
	    key: "on",
	    // static events =[
	    //   'select',
	    //   'countExceed',
	    //   'sizeExceed',
	    //   'beforeRemove',
	    //   'remove',
	    //   'beforeChunk',
	    //   'afterChunk',
	    //   'beforeHash',
	    //   'afterHash',
	    //   'beforeChunkUpload',
	    //   'chunkUpload',
	    //   'chunkProgress',
	    //   'chunkSuccess',
	    //   'chunkError',
	    //   'beforeUpload',
	    //   'upload',
	    //   'progress,',
	    //   'success',
	    //   'error'
	    // ]
	    value: function on(evName, fn) {
	      if (!Array.isArray(this.handlersMap[evName])) {
	        this.handlersMap[evName] = [];
	      }

	      this.handlersMap[evName].push(fn);
	    }
	  }, {
	    key: "off",
	    value: function off(evName, fn) {
	      var handlers = this.handlersMap[evName];

	      if (Array.isArray(handlers)) {
	        var actionIndex = handlers.findIndex(function (ele) {
	          return ele === fn;
	        });

	        if (actionIndex >= 0) {
	          handlers.splice(actionIndex, 1);
	        }
	      }
	    }
	  }, {
	    key: "trigger",
	    value: function trigger(evName) {
	      var _this = this;

	      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	      }

	      var handlers = this.handlersMap[evName];

	      if (handlers instanceof Array) {
	        return handlers.filter(function (fn) {
	          return isFn(fn);
	        }).map(function (fn) {
	          return fn.call.apply(fn, [_this].concat(args));
	        });
	      }
	    }
	  }]);

	  return UploadEvent;
	}();

	function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

	function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
	var Chunk = /*#__PURE__*/function () {
	  function Chunk(blob, index, qf) {
	    classCallCheck(this, Chunk);

	    defineProperty(this, "queueFile", void 0);

	    defineProperty(this, "index", 0);

	    defineProperty(this, "blob", void 0);

	    defineProperty(this, "percent", 0);

	    defineProperty(this, "uploaded", false);

	    defineProperty(this, "xhr", void 0);

	    defineProperty(this, "uploadEvent", new UploadEvent());

	    defineProperty(this, "response", null);

	    defineProperty(this, "uploading", false);

	    this.blob = blob;
	    this.index = index;
	    this.queueFile = qf;
	  }

	  createClass(Chunk, [{
	    key: "onProgress",
	    value: function onProgress(handler) {
	      this.uploadEvent.on('progresss', handler);
	    }
	  }, {
	    key: "onSuccess",
	    value: function onSuccess(handler) {
	      this.uploadEvent.on('success', handler);
	    }
	  }, {
	    key: "onError",
	    value: function onError(handler) {
	      this.uploadEvent.on('error', handler);
	    }
	    /**
	     * 中断请求
	     */

	  }, {
	    key: "abort",
	    value: function abort() {
	      if (this.xhr) {
	        this.xhr.abort(); // this.percent = 0
	      }
	    }
	  }, {
	    key: "setSuccess",
	    value: function setSuccess(res) {
	      this.percent = 100;
	      this.uploaded = true;
	      this.response = res;
	      this.uploadEvent.trigger('success', this);
	    }
	    /**
	     * 上传
	     * @returns {promise}
	     */

	  }, {
	    key: "upload",
	    value: function upload$1(opts) {
	      var _this = this;

	      return new Promise( /*#__PURE__*/function () {
	        var _ref = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(resolve, reject) {
	          var info, data, headers;
	          return regenerator.wrap(function _callee$(_context) {
	            while (1) {
	              switch (_context.prev = _context.next) {
	                case 0:
	                  info = _objectSpread(_objectSpread({}, _this.queueFile), {}, {
	                    chunk: _this.blob,
	                    chunkIndex: _this.index
	                  });
	                  data = isFn(opts.data) ? opts.data.call(_this, info) : opts.data;
	                  headers = isFn(opts.headers) ? opts.headers.call(_this, info) : opts.headers; // 判断是否是fn
	                  // 是则执行fn 得到结果res
	                  // 如果结果是一个promise 取promise结果;否则直接取res

	                  if (!isPromise(data)) {
	                    _context.next = 7;
	                    break;
	                  }

	                  _context.next = 6;
	                  return data;

	                case 6:
	                  data = _context.sent;

	                case 7:
	                  _this.uploading = true;
	                  _this.xhr = upload(_objectSpread(_objectSpread({}, opts), {}, {
	                    // file: this.blob,
	                    file: new File([_this.blob], _this.queueFile.file.name),
	                    data: data,
	                    headers: headers,
	                    progress: function progress(ev) {
	                      _this.status = _this.percent = _this.computePercent(ev.total, ev.loaded);

	                      _this.uploadEvent.trigger('progress', ev);

	                      if (isFn(_this.progresshandler)) {
	                        _this.uploadEvent.trigger('progress', ev);
	                      }
	                    },
	                    success: function success(res) {
	                      _this.status = 'success';
	                      _this.uploaded = true;
	                      _this.percent = 100;
	                      _this.response = res;
	                      _this.uploading = false;

	                      _this.uploadEvent.trigger('success', res, _this);

	                      resolve(res);
	                    },
	                    error: function error(res) {
	                      _this.status = 'error';
	                      _this.response = res;

	                      _this.uploadEvent.trigger('error', res);

	                      reject(res);
	                    }
	                  }));

	                case 9:
	                case "end":
	                  return _context.stop();
	              }
	            }
	          }, _callee);
	        }));

	        return function (_x, _x2) {
	          return _ref.apply(this, arguments);
	        };
	      }());
	    }
	  }, {
	    key: "computePercent",
	    value: function computePercent(total, loaded) {
	      return Math.round(loaded / total * 10000) / 100;
	    }
	  }]);

	  return Chunk;
	}();

	/** 队列文件状态 */
	var QF_STATUS = {
	  pending: 'pending',
	  // 等待上传
	  ready: 'ready',
	  // 准备就绪
	  hashing: 'hashing',
	  // 正在计算hash值
	  hashed: 'hashed',
	  // 计算hash值完成
	  chunking: 'chunking',
	  // 正在进行文件分块
	  chunked: 'chunked',
	  // 文件分块完成
	  checking: 'checking',
	  // 检测文件状态
	  checked: 'checked',
	  // 检测文件状态完成
	  uploading: 'uploading',
	  // 正在上传
	  abort: 'abort',
	  // 中断
	  success: 'success',
	  // 上传成功
	  error: 'error' // 上传失败

	};
	/** 上传类型 */

	var UPLOAD_TYPE = {
	  concurrent: 0,
	  // 并发上传
	  serial: 1 // 串行上传

	};

	/** 队列文件 */

	var QueueFile = /*#__PURE__*/function () {
	  /** 文件对象 */

	  /** 文件哈希值 */

	  /** 压缩后的文件 */

	  /** 文件的base64数据 */

	  /** 压缩后的文件base64数据 */

	  /** 分块大小 */

	  /** 上传方式 */

	  /** 分块数据 */

	  /** 上传百分比 */

	  /** 状态 <string>  pending待处理 ready就绪 progress上传中 success上传成功 error上传失败 */

	  /** 服务器返回 */

	  /** 上传时参数 */

	  /** 是否获取文件hash值 */

	  /** hash方法 */
	  function QueueFile(opts) {
	    classCallCheck(this, QueueFile);

	    defineProperty(this, "file", null);

	    defineProperty(this, "fileHash", '');

	    defineProperty(this, "compressFile", null);

	    defineProperty(this, "fileBase64Data", '');

	    defineProperty(this, "compressFileBase64Data", '');

	    defineProperty(this, "chunkSize", 0);

	    defineProperty(this, "uploadType", UPLOAD_TYPE.serial);

	    defineProperty(this, "chunks", [] // {
	    //   index: 0, // 第几个分块
	    //   blob: null, // 分块bob数据
	    //   percent: 0, // 上传进度
	    //   uploaded: false // 是否已上传
	    // }
	    );

	    defineProperty(this, "percent", 0);

	    defineProperty(this, "status", QF_STATUS.pending);

	    defineProperty(this, "response", '');

	    defineProperty(this, "uploadOptions", null);

	    defineProperty(this, "isHashFile", false);

	    defineProperty(this, "hashMethod", null);

	    defineProperty(this, "uploadEvent", new UploadEvent());

	    defineProperty(this, "checkMethod", null);

	    for (var o in opts) {
	      if (this.hasOwnProperty(o)) {
	        this[o] = opts[o];
	      }
	    }
	  }
	  /**
	   * 初始化分块列表
	   */


	  createClass(QueueFile, [{
	    key: "initChunks",
	    value: function initChunks() {
	      var _this = this;

	      this.uploadEvent.trigger('beforeChunk', this);
	      this.changeStatus(QF_STATUS.chunking);
	      var chunkSize = 0;

	      if (typeof this.chunkSize === 'function') {
	        chunkSize = this.chunkSize(this.file);
	      } else {
	        chunkSize = this.chunkSize;
	      }

	      var wouldSlice = typeof chunkSize === 'number' && chunkSize > 0; // 文件分块

	      if (wouldSlice) {
	        this.chunks = (sliceFile(this.file, chunkSize) || []).map(function (blob, index) {
	          var chunk = new Chunk(blob, index, _this);
	          return chunk;
	        });
	      } else {
	        //
	        this.chunks = [new Chunk(this.file, 0, this.file)];
	      }

	      this.chunks.forEach(function (chunk) {
	        _this.subscribeChunkEvens(chunk);
	      });
	      this.uploadEvent.trigger('afterChunk', this);
	      this.changeStatus(QF_STATUS.chunked);
	    }
	    /**
	     * 订阅分块对象的事件
	     * @param {Chunk} chunk
	     */

	  }, {
	    key: "subscribeChunkEvens",
	    value: function subscribeChunkEvens(chunk) {
	      var _this2 = this;

	      chunk.onProgress(function (ev) {
	        _this2.computePercent();

	        _this2.uploadEvent.trigger('progress', ev, _this2.percent);
	      });
	      chunk.onSuccess(function () {
	        _this2.computePercent();

	        if (_this2.testIsSuccess()) {
	          _this2.changeStatus(QF_STATUS.success);
	        }

	        if (_this2.chunkSize > 0 && _this2.chunks.length > 1) {
	          var _this2$uploadEvent;

	          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	          }

	          (_this2$uploadEvent = _this2.uploadEvent).trigger.apply(_this2$uploadEvent, ['success', _this2].concat(args));
	        } else {
	          _this2.uploadEvent.trigger('success', _this2);
	        }
	      });
	      chunk.onError(function (ev) {
	        _this2.changeStatus(QF_STATUS.error);

	        _this2.uploadEvent.trigger('error', ev);
	      });
	    }
	    /**
	     * 监听上传进度事件
	     * @param {function} fn
	     */

	  }, {
	    key: "onProgress",
	    value: function onProgress(fn) {
	      this.uploadEvent.on('progress', fn);
	    }
	    /**
	     * 监听成功事件
	     * @param {function} fn
	     */

	  }, {
	    key: "onSuccess",
	    value: function onSuccess(fn) {
	      this.uploadEvent.on('success', fn);
	    }
	    /**
	     * 监听失败事件
	     * @param {function} fn
	     */

	  }, {
	    key: "onError",
	    value: function onError(fn) {
	      this.uploadEvent.on('error', fn);
	    }
	    /**
	     * 分片之前
	     * @param {function} fn
	     */

	  }, {
	    key: "beforeChunk",
	    value: function beforeChunk(fn) {
	      this.uploadEvent.on('beforeChunk', fn);
	    }
	    /**
	     * 分片之后
	     * @param {function} fn
	     */

	  }, {
	    key: "afterChunk",
	    value: function afterChunk(fn) {
	      this.uploadEvent.on('afterChunk', fn);
	    }
	    /**
	     * hash之前
	     * @param {function} fn
	     */

	  }, {
	    key: "beforeHash",
	    value: function beforeHash(fn) {
	      this.uploadEvent.on('beforeHash', fn);
	    }
	    /**
	     * hash之后
	     * @param {*} fn
	     */

	  }, {
	    key: "afterHash",
	    value: function afterHash(fn) {
	      this.uploadEvent.on('afterHash', fn);
	    }
	    /**
	     * 计算百分比进度
	     *  @param {*} fn
	     */

	  }, {
	    key: "computePercent",
	    value: function computePercent() {
	      this.percent = Math.round(this.chunks.map(function (chunk) {
	        return chunk.percent;
	      }).reduce(function (a, b) {
	        return a + b;
	      }) / this.chunks.length * 100) / 100;
	    }
	    /** 检测是否上传成功 */

	  }, {
	    key: "testIsSuccess",
	    value: function testIsSuccess() {
	      return this.chunks.every(function (chunk) {
	        return chunk.uploaded && chunk.percent >= 100;
	      });
	    }
	    /**
	     * 上传
	     */

	  }, {
	    key: "upload",
	    value: function () {
	      var _upload = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
	        var uploadedAll;
	        return regenerator.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (!(this.status !== QF_STATUS.abort)) {
	                  _context.next = 13;
	                  break;
	                }

	                if (!this.chunks.length) {
	                  this.initChunks();
	                }

	                if (!this.isHashFile) {
	                  _context.next = 5;
	                  break;
	                }

	                _context.next = 5;
	                return this.hashFile();

	              case 5:
	                uploadedAll = false;

	                if (!(typeof this.checkMethod === 'function')) {
	                  _context.next = 10;
	                  break;
	                }

	                _context.next = 9;
	                return this.checkUploaded();

	              case 9:
	                uploadedAll = _context.sent;

	              case 10:
	                if (!uploadedAll) {
	                  _context.next = 13;
	                  break;
	                }

	                this.changeStatus(QF_STATUS.success);
	                return _context.abrupt("return");

	              case 13:
	                this.changeStatus(QF_STATUS.uploading);
	                _context.t0 = this.uploadType;
	                _context.next = _context.t0 === UPLOAD_TYPE.concurrent ? 17 : _context.t0 === UPLOAD_TYPE.serial ? 19 : 20;
	                break;

	              case 17:
	                // 并行上传
	                this.concurrentUpload();
	                return _context.abrupt("return", Promise.resolve(this));

	              case 19:
	                return _context.abrupt("return", this.serialUpload());

	              case 20:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));

	      function upload() {
	        return _upload.apply(this, arguments);
	      }

	      return upload;
	    }()
	  }, {
	    key: "checkUploaded",
	    value: function checkUploaded() {
	      var _this3 = this;

	      return new Promise(function (resolve) {
	        _this3.changeStatus(QF_STATUS.checking);

	        var cb = function cb(statusArr, res) {
	          var allSuccess = true;

	          if (statusArr instanceof Array && statusArr.length === _this3.chunks.length) {
	            statusArr.forEach(function (s, i) {
	              if (s) {
	                _this3.chunks[i].setSuccess(res);
	              } else {
	                allSuccess = false;
	              }
	            });
	          } else {
	            allSuccess = false;
	          }

	          _this3.changeStatus(QF_STATUS.checked);

	          resolve(allSuccess);
	        };

	        _this3.checkMethod(_this3, cb);
	      });
	    }
	    /**
	     * 改变状态
	     * @param {*} status
	     */

	  }, {
	    key: "changeStatus",
	    value: function changeStatus(status) {
	      this.status = status;
	    }
	    /**
	     * 并行上传
	     * @param {boolean} 是否从开始位置上传
	     */

	  }, {
	    key: "concurrentUpload",
	    value: function concurrentUpload(isStart) {
	      var _this4 = this;

	      this.chunks.forEach(function (chunk) {
	        chunk.upload(_this4.uploadOptions).catch(function () {
	          // 有一个分块上传失败，立即中止其他分块的上传
	          _this4.abort();

	          _this4.changeStatus(QF_STATUS.error);
	        });
	      });
	    }
	    /**
	     * 串行上传
	     * @param {boolean} 是否从开始位置上传
	     */

	  }, {
	    key: "serialUpload",
	    value: function serialUpload(isStart) {
	      var _this5 = this;

	      return new Promise(function (resolve) {
	        var fn = /*#__PURE__*/function () {
	          var _ref = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2(index) {
	            var success, newIndex;
	            return regenerator.wrap(function _callee2$(_context2) {
	              while (1) {
	                switch (_context2.prev = _context2.next) {
	                  case 0:
	                    if (!(index < _this5.chunks.length && index >= 0)) {
	                      _context2.next = 8;
	                      break;
	                    }

	                    _context2.next = 3;
	                    return _this5.uploadChunk(index).catch(function () {
	                      _this5.changeStatus(QF_STATUS.error);

	                      return false;
	                    });

	                  case 3:
	                    success = _context2.sent;

	                    if (success) {
	                      _context2.next = 6;
	                      break;
	                    }

	                    return _context2.abrupt("return");

	                  case 6:
	                    newIndex = _this5.chunks.findIndex(function (ele) {
	                      return !ele.uploaded;
	                    });

	                    if (newIndex >= 0) {
	                      fn(newIndex);
	                    } else {
	                      resolve(_this5.chunks);
	                    }

	                  case 8:
	                  case "end":
	                    return _context2.stop();
	                }
	              }
	            }, _callee2);
	          }));

	          return function fn(_x) {
	            return _ref.apply(this, arguments);
	          };
	        }();

	        var index = isStart ? 0 : _this5.chunks.findIndex(function (ele) {
	          return !ele.uploaded;
	        });

	        if (index >= 0) {
	          fn(index);
	        }
	      });
	    }
	    /**
	     *上传指定分块
	     *@param {number} index
	     */

	  }, {
	    key: "uploadChunk",
	    value: function uploadChunk(index) {
	      return this.chunks[index].upload(this.uploadOptions);
	    }
	    /**
	     * 中止
	     */

	  }, {
	    key: "abort",
	    value: function abort() {
	      this.changeStatus(QF_STATUS.abort);
	      this.computePercent();
	      this.chunks.filter(function (ck) {
	        return ck.uploading;
	      }).forEach(function (chk) {
	        chk.abort();
	      });
	    }
	    /**
	     * 计算文件哈希值
	     */

	  }, {
	    key: "hashFile",
	    value: function hashFile() {
	      var _this6 = this;

	      this.uploadEvent.trigger('beforeHash', this);
	      this.changeStatus(QF_STATUS.hashing);
	      var method = typeof this.hashMethod === 'function' ? this.hashMethod : MD5file;
	      return method(this.file).then(function (res) {
	        _this6.fileHash = res;

	        _this6.uploadEvent.trigger('afterHash', _this6);

	        _this6.changeStatus(QF_STATUS.hashed);

	        return res;
	      });
	    }
	  }]);

	  return QueueFile;
	}();

	var Uploader = /*#__PURE__*/function () {
	  /** 上传file Input */

	  /** 上传队列 */

	  /** 分块大小 */

	  /** 分块的上传方式 默认并发上传 */

	  /** 上传地址 */

	  /** 是否压缩 */

	  /** 压缩配置参数 */

	  /** 请求头 */

	  /** 上传时的额外参数，key&value对象或者一个返回key&value对象的函数 如果是函数，函数的参数为 file,chunk,chunkCount,chunkIndex */

	  /** 上传的文件字段名 */

	  /** 支持发送 cookie 凭证信息 */

	  /** 已上传的文件列表 */

	  /** 最大个数限制 */

	  /** 单个文件大小限制 */

	  /** 是否自动上传 */

	  /** 触发事件 */

	  /** 上传事件处理 */
	  // /** 各个钩子函数 */
	  // handlers = {
	  //   countExceed: [], // 传入参数依次为 totalCount,maxCount, files
	  //   sizeExceeded: [], // totalCount, maxCount, files
	  //   select: [], // files
	  //   beforeRemove: [],
	  //   remove: [],
	  //   beforeUpload: [],
	  //   progress: [],
	  //   success: [],
	  //   error: []
	  // }
	  // 是否计算文件hash值

	  /** 默认算法MD5 */

	  /** 检测上传状态的方法 传入参数（file） resolve状态列表 如[0,0,0,1,1,1] */
	  function Uploader(opts) {
	    var _this = this;

	    classCallCheck(this, Uploader);

	    defineProperty(this, "inputElem", null);

	    defineProperty(this, "queue", []);

	    defineProperty(this, "chunkSize", 0);

	    defineProperty(this, "uploadType", UPLOAD_TYPE.concurrent);

	    defineProperty(this, "uploadUrl", '');

	    defineProperty(this, "compress", false);

	    defineProperty(this, "compressConfig", {
	      scale: 1,
	      quality: 1
	    });

	    defineProperty(this, "headers", {});

	    defineProperty(this, "data", {});

	    defineProperty(this, "name", 'file');

	    defineProperty(this, "withCredentials", false);

	    defineProperty(this, "fileList", []);

	    defineProperty(this, "maxCount", 100);

	    defineProperty(this, "maxSize", 0);

	    defineProperty(this, "autoUpload", false);

	    defineProperty(this, "triggerEvent", 'change');

	    defineProperty(this, "uploadEvent", new UploadEvent());

	    defineProperty(this, "hashFile", false);

	    defineProperty(this, "hashMethod", null);

	    defineProperty(this, "checkMethod", null);

	    if (isObj(opts)) {
	      for (var o in opts) {
	        if (this.hasOwnProperty(o)) {
	          this[o] = opts[o];
	        }

	        if (o === 'uploadType') {
	          this.setUploadType(opts[o]);
	        }
	      }
	    }

	    if (isInputElem(this.inputElem)) {
	      this.inputElem.addEventListener(this.triggerEvent, /*#__PURE__*/function () {
	        var _ref = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(ev) {
	          var target, files, selectResults;
	          return regenerator.wrap(function _callee$(_context) {
	            while (1) {
	              switch (_context.prev = _context.next) {
	                case 0:
	                  ev = ev || window.event;
	                  target = ev.target || ev.srcElement;
	                  files = target.files;

	                  if (!(files && files.length)) {
	                    _context.next = 15;
	                    break;
	                  }

	                  selectResults = _this.trigger('select', files); // 有监听且执行结果不全为真时，中止

	                  _context.next = 7;
	                  return _this.canContinueAfterTrigger(selectResults);

	                case 7:
	                  if (_context.sent) {
	                    _context.next = 9;
	                    break;
	                  }

	                  return _context.abrupt("return");

	                case 9:
	                  if (_this.checkCountExceed(files)) {
	                    _context.next = 11;
	                    break;
	                  }

	                  return _context.abrupt("return");

	                case 11:
	                  if (_this.checkSizeExceed(files)) {
	                    _context.next = 13;
	                    break;
	                  }

	                  return _context.abrupt("return");

	                case 13:
	                  _this.initQueue(files);

	                  if (_this.autoUpload) {
	                    _this.upload();
	                  }

	                case 15:
	                case "end":
	                  return _context.stop();
	              }
	            }
	          }, _callee);
	        }));

	        return function (_x) {
	          return _ref.apply(this, arguments);
	        };
	      }());
	    }
	  }
	  /**
	   * 初始化队列
	   * @param {File[]} files 文件对象列表
	   */


	  createClass(Uploader, [{
	    key: "initQueue",
	    value: function initQueue(files) {
	      var _this2 = this;

	      var len = files.length > this.maxCount ? this.maxCount : files.length;
	      Array.prototype.forEach.call(files, function (file, index) {
	        if (index >= len) return false;
	        var qf = new QueueFile({
	          file: file,
	          isHashFile: !!_this2.hashFile,
	          hashMethod: _this2.hashMethod,
	          checkMethod: _this2.checkMethod,
	          uploadType: _this2.uploadType
	        });
	        qf.chunkSize = _this2.chunkSize;
	        qf.changeStatus(QF_STATUS.ready);
	        qf.uploadOptions = new UploadOptions(_this2.uploadUrl, _this2.name, _this2.data, _this2.headers, _this2.withCredentials);

	        _this2.subscribeQueueFileEvents(qf);

	        _this2.queue.push(qf);
	      });
	    }
	    /**
	     *订阅队列文件的事件
	     * @param {QueueFile} qf
	     */

	  }, {
	    key: "subscribeQueueFileEvents",
	    value: function subscribeQueueFileEvents(qf) {
	      var _this3 = this;

	      var trigger = function trigger(evName) {
	        return function () {
	          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	          }

	          return _this3.trigger.apply(_this3, [evName].concat(args));
	        };
	      };

	      qf.beforeChunk(trigger('beforeChunk'));
	      qf.afterChunk(trigger('afterChunk'));
	      qf.beforeHash(trigger('beforeHash'));
	      qf.afterHash(trigger('afterHash'));
	      qf.onProgress(trigger('progress'));
	      qf.onSuccess(trigger('success'));
	      qf.onError(trigger('error'));
	    }
	    /**
	     * 监听事件
	     * @param {string} evName
	     * @param {function} action
	     */

	  }, {
	    key: "on",
	    value: function on(evName, action) {
	      this.uploadEvent.on(evName, action);
	    }
	    /**
	     * 触发事件
	     * @param {string} evName
	     * @param  {...any} args
	     */

	  }, {
	    key: "trigger",
	    value: function trigger(evName) {
	      var _this$uploadEvent;

	      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	        args[_key2 - 1] = arguments[_key2];
	      }

	      return (_this$uploadEvent = this.uploadEvent).trigger.apply(_this$uploadEvent, [evName].concat(args));
	    }
	    /**
	     * 文件选定时
	     * @param {function} fn
	     */

	  }, {
	    key: "onSelect",
	    value: function onSelect(fn) {
	      this.on('select', fn);
	    }
	    /**
	     * 移除文件之前
	     * @param {function} fn
	     */

	  }, {
	    key: "beforeRemove",
	    value: function beforeRemove(fn) {
	      this.on('beforeRemove', fn);
	    }
	    /**
	     * 移除文件时
	     * @param {function} fn
	     */

	  }, {
	    key: "onRemove",
	    value: function onRemove(fn) {
	      this.on('remove', fn);
	    }
	    /**
	     * 上传文件之前
	     * @param {function} fn
	     */

	  }, {
	    key: "beforeUpload",
	    value: function beforeUpload(fn) {
	      this.on('beforeUpload', fn);
	    }
	    /**
	     * 上传成功时
	     * @param {function} fn
	     */

	  }, {
	    key: "onSuccess",
	    value: function onSuccess(fn) {
	      this.on('success', fn);
	    }
	    /**
	     * 上传文件失败时
	     * @param {function} fn
	     */

	  }, {
	    key: "onError",
	    value: function onError(fn) {
	      this.on('error', fn);
	    }
	    /**
	     * 文件超出数量时
	     * @param {function} fn
	     */

	  }, {
	    key: "onCountExceed",
	    value: function onCountExceed(fn) {
	      this.on('countExceed', fn);
	    }
	    /**
	     * 文件超出大小时
	     * @param {function} fn
	     */

	  }, {
	    key: "onSizeExceed",
	    value: function onSizeExceed(fn) {
	      this.on('sizeExceed', fn);
	    }
	    /**
	     * 上传文件进度
	     * @param {function} fn
	     */

	  }, {
	    key: "onProgress",
	    value: function onProgress(fn) {
	      this.on('progress', fn);
	    }
	    /** 分片之前 */

	  }, {
	    key: "beforeChunk",
	    value: function beforeChunk(fn) {
	      this.on('beforeChunk', fn);
	    }
	    /**
	     * 分片之后
	     * @param {function} fn
	     */

	  }, {
	    key: "afterChunk",
	    value: function afterChunk(fn) {
	      this.on('afterChunk', fn);
	    }
	    /**
	     * hash之前
	     * @param {function} fn
	     */

	  }, {
	    key: "beforeHash",
	    value: function beforeHash(fn) {
	      this.on('beforeHash', fn);
	    }
	    /**
	     *hash之后
	     * @param {*} fn
	     */

	  }, {
	    key: "afterHash",
	    value: function afterHash(fn) {
	      this.on('afterHash', fn);
	    }
	  }, {
	    key: "setOptions",
	    value: function setOptions(opts) {
	      var _this4 = this;

	      Object.keys(opts).forEach(function (k) {
	        if (_this4.hasOwnProperty(k) && typeof opts[field] !== 'function') {
	          _this4[k] = opts[k];
	        }
	      });
	    }
	    /**
	     * 触发事件后是否可继续
	     * @param {*} res 触发后的返回结果
	     */

	  }, {
	    key: "canContinueAfterTrigger",
	    value: function () {
	      var _canContinueAfterTrigger = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2(res) {
	        var _this5 = this;

	        var canContinueList;
	        return regenerator.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                if (!(res instanceof Array)) {
	                  _context2.next = 6;
	                  break;
	                }

	                _context2.next = 3;
	                return Promise.all(res.map(function (r) {
	                  var val = isPromise(r) ? r : _this5.isContinue(r);
	                  return Promise.resolve(val);
	                }));

	              case 3:
	                canContinueList = _context2.sent;

	                if (canContinueList.every(function (ele) {
	                  return !!ele;
	                })) {
	                  _context2.next = 6;
	                  break;
	                }

	                return _context2.abrupt("return", false);

	              case 6:
	                return _context2.abrupt("return", true);

	              case 7:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2);
	      }));

	      function canContinueAfterTrigger(_x2) {
	        return _canContinueAfterTrigger.apply(this, arguments);
	      }

	      return canContinueAfterTrigger;
	    }()
	    /** 提交 */

	  }, {
	    key: "upload",
	    value: function () {
	      var _upload = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3() {
	        var beforeUploadRes, canContinue;
	        return regenerator.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                beforeUploadRes = this.trigger('beforeUpload', this.queue);
	                _context3.next = 3;
	                return this.canContinueAfterTrigger(beforeUploadRes);

	              case 3:
	                canContinue = _context3.sent;

	                if (canContinue) {
	                  _context3.next = 6;
	                  break;
	                }

	                return _context3.abrupt("return");

	              case 6:
	                _context3.t0 = this.uploadType;
	                _context3.next = _context3.t0 === UPLOAD_TYPE.concurrent ? 9 : _context3.t0 === UPLOAD_TYPE.serial ? 11 : 13;
	                break;

	              case 9:
	                this.concurrentUpload();
	                return _context3.abrupt("break", 13);

	              case 11:
	                this.serialUpload();
	                return _context3.abrupt("break", 13);

	              case 13:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));

	      function upload() {
	        return _upload.apply(this, arguments);
	      }

	      return upload;
	    }()
	    /**
	     * 并行上传
	     */

	  }, {
	    key: "concurrentUpload",
	    value: function () {
	      var _concurrentUpload = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee5() {
	        return regenerator.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                this.queue.forEach( /*#__PURE__*/function () {
	                  var _ref2 = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee4(qf) {
	                    return regenerator.wrap(function _callee4$(_context4) {
	                      while (1) {
	                        switch (_context4.prev = _context4.next) {
	                          case 0:
	                            // 生成hash值
	                            qf.upload();

	                          case 1:
	                          case "end":
	                            return _context4.stop();
	                        }
	                      }
	                    }, _callee4);
	                  }));

	                  return function (_x3) {
	                    return _ref2.apply(this, arguments);
	                  };
	                }());

	              case 1:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this);
	      }));

	      function concurrentUpload() {
	        return _concurrentUpload.apply(this, arguments);
	      }

	      return concurrentUpload;
	    }()
	    /**
	     * 串行上传
	     */

	  }, {
	    key: "serialUpload",
	    value: function serialUpload() {
	      var _this6 = this;

	      var fn = /*#__PURE__*/function () {
	        var _ref3 = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee6(index) {
	          var qf, newIndex;
	          return regenerator.wrap(function _callee6$(_context6) {
	            while (1) {
	              switch (_context6.prev = _context6.next) {
	                case 0:
	                  qf = _this6.queue[index];
	                  _context6.next = 3;
	                  return qf.upload();

	                case 3:
	                  newIndex = index + 1;

	                  if (newIndex < _this6.queue.length) {
	                    fn(newIndex);
	                  }

	                case 5:
	                case "end":
	                  return _context6.stop();
	              }
	            }
	          }, _callee6);
	        }));

	        return function fn(_x4) {
	          return _ref3.apply(this, arguments);
	        };
	      }();

	      fn(0);
	    }
	    /** 中断上传 */

	  }, {
	    key: "abort",
	    value: function abort() {
	      this.QueueFile.forEach(function (qf) {
	        qf.abort();
	      });
	    }
	    /**
	     * 根据函数返回值判断是否继续执行
	     * @param {*} returnVal
	     * @returns {Boolean}
	     */

	  }, {
	    key: "isContinue",
	    value: function () {
	      var _isContinue = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee7(returnVal) {
	        var invalidValues;
	        return regenerator.wrap(function _callee7$(_context7) {
	          while (1) {
	            switch (_context7.prev = _context7.next) {
	              case 0:
	                invalidValues = [false, 0, '', null];
	                return _context7.abrupt("return", !invalidValues.some(function (val) {
	                  return val === returnVal;
	                }));

	              case 2:
	              case "end":
	                return _context7.stop();
	            }
	          }
	        }, _callee7);
	      }));

	      function isContinue(_x5) {
	        return _isContinue.apply(this, arguments);
	      }

	      return isContinue;
	    }()
	    /**
	     * 检测文件数量
	     * @param {File[]} files 文件列表
	     * @returns {Boolean} 是否继续执行
	     */

	  }, {
	    key: "checkCountExceed",
	    value: function checkCountExceed(files) {
	      var totalCount = files.length + this.queue.length;

	      if (this.maxCount && files.length && totalCount > this.maxCount) {
	        this.trigger('countExceed', totalCount, this.maxCount);
	        return false;
	      }

	      return true;
	    }
	    /**
	     * 检测单个文件大小
	     * @param {File[]} files 文件列表
	     * @returns {Boolean} 是否继续执行
	     */

	  }, {
	    key: "checkSizeExceed",
	    value: function checkSizeExceed(files) {
	      var _this7 = this;

	      if (!this.maxSize) return true;
	      var eFiles = files.filter(function (ele) {
	        return ele.size > _this7.maxSize;
	      });

	      if (eFiles.length) {
	        this.trigger('sizeExceed', eFiles, this.maxSize);
	        return false;
	      }
	    }
	    /**
	     * 删除指定下标的队列文件
	     * @param {number} index
	     */

	  }, {
	    key: "remove",
	    value: function () {
	      var _remove = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee8(index) {
	        var beforeRemoveRes, canContinue;
	        return regenerator.wrap(function _callee8$(_context8) {
	          while (1) {
	            switch (_context8.prev = _context8.next) {
	              case 0:
	                beforeRemoveRes = this.trigger('beforeRemove', this.queue);
	                _context8.next = 3;
	                return this.canContinueAfterTrigger(beforeRemoveRes);

	              case 3:
	                canContinue = _context8.sent;

	                if (canContinue) {
	                  this.queue.splice(index, 1);
	                  this.trigger('remove', this.queue);
	                }

	              case 5:
	              case "end":
	                return _context8.stop();
	            }
	          }
	        }, _callee8, this);
	      }));

	      function remove(_x6) {
	        return _remove.apply(this, arguments);
	      }

	      return remove;
	    }()
	    /**
	     * 设置上传方式
	     * @param {*} val
	     */

	  }, {
	    key: "setUploadType",
	    value: function setUploadType(val) {
	      this.uploadType = +val;
	    }
	  }]);

	  return Uploader;
	}(); // export function reactive(data, callback) {
	//   function reactObj(obj, path) {
	//     if (Array.isArray(obj)) {
	//       // push shit unshit pop splice
	//       // 数组响应
	//     } else if (obj && typeof obj === 'object') {
	//       const keys = Object.keys(obj)
	//       keys.forEach(key => {
	//         let val = obj[key]
	//         if (!(Array.isArray(val) || (val && typeof val === 'object'))) {
	//           Object.defineProperty(obj, key, {
	//             get() {
	//               return val
	//             },
	//             set(newVal) {
	//               if (typeof callback === 'function') {
	//                 callback(data, path || key)
	//               }
	//               val = newVal
	//             }
	//           })
	//         } else {
	//           reactObj(val, path ? path + '.' + key : key)
	//         }
	//       })
	//     } else {
	//       return obj
	//     }
	//   }
	//   reactObj(data)
	//   data = null
	//   callback = null
	// }

	exports.Chunk = Chunk;
	exports.QueueFile = QueueFile;
	exports.Uploader = Uploader;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
