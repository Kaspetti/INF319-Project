(function (events) {
	'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	/**
	 * Obliterator Iterator Class
	 * ===========================
	 *
	 * Simple class representing the library's iterators.
	 */

	/**
	 * Iterator class.
	 *
	 * @constructor
	 * @param {function} next - Next function.
	 */
	function Iterator$2(next) {
	  if (typeof next !== 'function')
	    throw new Error('obliterator/iterator: expecting a function!');

	  this.next = next;
	}

	/**
	 * If symbols are supported, we add `next` to `Symbol.iterator`.
	 */
	if (typeof Symbol !== 'undefined')
	  Iterator$2.prototype[Symbol.iterator] = function () {
	    return this;
	  };

	/**
	 * Returning an iterator of the given values.
	 *
	 * @param  {any...} values - Values.
	 * @return {Iterator}
	 */
	Iterator$2.of = function () {
	  var args = arguments,
	    l = args.length,
	    i = 0;

	  return new Iterator$2(function () {
	    if (i >= l) return {done: true};

	    return {done: false, value: args[i++]};
	  });
	};

	/**
	 * Returning an empty iterator.
	 *
	 * @return {Iterator}
	 */
	Iterator$2.empty = function () {
	  var iterator = new Iterator$2(function () {
	    return {done: true};
	  });

	  return iterator;
	};

	/**
	 * Returning an iterator over the given indexed sequence.
	 *
	 * @param  {string|Array} sequence - Target sequence.
	 * @return {Iterator}
	 */
	Iterator$2.fromSequence = function (sequence) {
	  var i = 0,
	    l = sequence.length;

	  return new Iterator$2(function () {
	    if (i >= l) return {done: true};

	    return {done: false, value: sequence[i++]};
	  });
	};

	/**
	 * Returning whether the given value is an iterator.
	 *
	 * @param  {any} value - Value.
	 * @return {boolean}
	 */
	Iterator$2.is = function (value) {
	  if (value instanceof Iterator$2) return true;

	  return (
	    typeof value === 'object' &&
	    value !== null &&
	    typeof value.next === 'function'
	  );
	};

	/**
	 * Exporting.
	 */
	var iterator = Iterator$2;

	var Iterator$3 = /*@__PURE__*/getDefaultExportFromCjs(iterator);

	var support$1 = {};

	support$1.ARRAY_BUFFER_SUPPORT = typeof ArrayBuffer !== 'undefined';
	support$1.SYMBOL_SUPPORT = typeof Symbol !== 'undefined';

	/**
	 * Obliterator Iter Function
	 * ==========================
	 *
	 * Function coercing values to an iterator. It can be quite useful when needing
	 * to handle iterables and iterators the same way.
	 */

	var Iterator$1 = iterator;
	var support = support$1;

	var ARRAY_BUFFER_SUPPORT = support.ARRAY_BUFFER_SUPPORT;
	var SYMBOL_SUPPORT = support.SYMBOL_SUPPORT;

	function iterOrNull(target) {
	  // Indexed sequence
	  if (
	    typeof target === 'string' ||
	    Array.isArray(target) ||
	    (ARRAY_BUFFER_SUPPORT && ArrayBuffer.isView(target))
	  )
	    return Iterator$1.fromSequence(target);

	  // Invalid value
	  if (typeof target !== 'object' || target === null) return null;

	  // Iterable
	  if (SYMBOL_SUPPORT && typeof target[Symbol.iterator] === 'function')
	    return target[Symbol.iterator]();

	  // Iterator duck-typing
	  if (typeof target.next === 'function') return target;

	  // Invalid object
	  return null;
	}

	var iter$2 = function iter(target) {
	  var iterator = iterOrNull(target);

	  if (!iterator)
	    throw new Error(
	      'obliterator: target is not iterable nor a valid iterator.'
	    );

	  return iterator;
	};

	/* eslint no-constant-condition: 0 */

	/**
	 * Obliterator Take Function
	 * ==========================
	 *
	 * Function taking n or every value of the given iterator and returns them
	 * into an array.
	 */
	var iter$1 = iter$2;

	/**
	 * Take.
	 *
	 * @param  {Iterable} iterable - Target iterable.
	 * @param  {number}   [n]      - Optional number of items to take.
	 * @return {array}
	 */
	var take = function take(iterable, n) {
	  var l = arguments.length > 1 ? n : Infinity,
	    array = l !== Infinity ? new Array(l) : [],
	    step,
	    i = 0;

	  var iterator = iter$1(iterable);

	  while (true) {
	    if (i === l) return array;

	    step = iterator.next();

	    if (step.done) {
	      if (i !== n) array.length = i;

	      return array;
	    }

	    array[i++] = step.value;
	  }
	};

	var take$1 = /*@__PURE__*/getDefaultExportFromCjs(take);

	/**
	 * Obliterator Chain Function
	 * ===========================
	 *
	 * Variadic function combining the given iterables.
	 */

	var Iterator = iterator;
	var iter = iter$2;

	/**
	 * Chain.
	 *
	 * @param  {...Iterator} iterables - Target iterables.
	 * @return {Iterator}
	 */
	var chain = function chain() {
	  var iterables = arguments;
	  var current = null;
	  var i = -1;

	  /* eslint-disable no-constant-condition */
	  return new Iterator(function next() {
	    var step = null;

	    do {
	      if (current === null) {
	        i++;

	        if (i >= iterables.length) return {done: true};

	        current = iter(iterables[i]);
	      }

	      step = current.next();

	      if (step.done === true) {
	        current = null;
	        continue;
	      }

	      break;
	    } while (true);

	    return step;
	  });
	};

	var chain$1 = /*@__PURE__*/getDefaultExportFromCjs(chain);

	/**
	 * Graphology Utilities
	 * =====================
	 *
	 * Collection of helpful functions used by the implementation.
	 */

	/**
	 * Object.assign-like polyfill.
	 *
	 * @param  {object} target       - First object.
	 * @param  {object} [...objects] - Objects to merge.
	 * @return {object}
	 */
	function assignPolyfill() {
	  const target = arguments[0];

	  for (let i = 1, l = arguments.length; i < l; i++) {
	    if (!arguments[i]) continue;

	    for (const k in arguments[i]) target[k] = arguments[i][k];
	  }

	  return target;
	}

	let assign$1 = assignPolyfill;

	if (typeof Object.assign === 'function') assign$1 = Object.assign;

	/**
	 * Function returning the first matching edge for given path.
	 * Note: this function does not check the existence of source & target. This
	 * must be performed by the caller.
	 *
	 * @param  {Graph}  graph  - Target graph.
	 * @param  {any}    source - Source node.
	 * @param  {any}    target - Target node.
	 * @param  {string} type   - Type of the edge (mixed, directed or undirected).
	 * @return {string|null}
	 */
	function getMatchingEdge(graph, source, target, type) {
	  const sourceData = graph._nodes.get(source);

	  let edge = null;

	  if (!sourceData) return edge;

	  if (type === 'mixed') {
	    edge =
	      (sourceData.out && sourceData.out[target]) ||
	      (sourceData.undirected && sourceData.undirected[target]);
	  } else if (type === 'directed') {
	    edge = sourceData.out && sourceData.out[target];
	  } else {
	    edge = sourceData.undirected && sourceData.undirected[target];
	  }

	  return edge;
	}

	/**
	 * Checks whether the given value is a plain object.
	 *
	 * @param  {mixed}   value - Target value.
	 * @return {boolean}
	 */
	function isPlainObject(value) {
	  // NOTE: as per https://github.com/graphology/graphology/issues/149
	  // this function has been loosened not to reject object instances
	  // coming from other JavaScript contexts. It has also been chosen
	  // not to improve it to avoid obvious false positives and avoid
	  // taking a performance hit. People should really use TypeScript
	  // if they want to avoid feeding subtly irrelvant attribute objects.
	  return typeof value === 'object' && value !== null;
	}

	/**
	 * Checks whether the given object is empty.
	 *
	 * @param  {object}  o - Target Object.
	 * @return {boolean}
	 */
	function isEmpty(o) {
	  let k;

	  for (k in o) return false;

	  return true;
	}

	/**
	 * Creates a "private" property for the given member name by concealing it
	 * using the `enumerable` option.
	 *
	 * @param {object} target - Target object.
	 * @param {string} name   - Member name.
	 */
	function privateProperty(target, name, value) {
	  Object.defineProperty(target, name, {
	    enumerable: false,
	    configurable: false,
	    writable: true,
	    value
	  });
	}

	/**
	 * Creates a read-only property for the given member name & the given getter.
	 *
	 * @param {object}   target - Target object.
	 * @param {string}   name   - Member name.
	 * @param {mixed}    value  - The attached getter or fixed value.
	 */
	function readOnlyProperty(target, name, value) {
	  const descriptor = {
	    enumerable: true,
	    configurable: true
	  };

	  if (typeof value === 'function') {
	    descriptor.get = value;
	  } else {
	    descriptor.value = value;
	    descriptor.writable = false;
	  }

	  Object.defineProperty(target, name, descriptor);
	}

	/**
	 * Returns whether the given object constitute valid hints.
	 *
	 * @param {object} hints - Target object.
	 */
	function validateHints(hints) {
	  if (!isPlainObject(hints)) return false;

	  if (hints.attributes && !Array.isArray(hints.attributes)) return false;

	  return true;
	}

	/**
	 * Creates a function generating incremental ids for edges.
	 *
	 * @return {function}
	 */
	function incrementalIdStartingFromRandomByte() {
	  let i = Math.floor(Math.random() * 256) & 0xff;

	  return () => {
	    return i++;
	  };
	}

	/**
	 * Graphology Custom Errors
	 * =========================
	 *
	 * Defining custom errors for ease of use & easy unit tests across
	 * implementations (normalized typology rather than relying on error
	 * messages to check whether the correct error was found).
	 */
	class GraphError extends Error {
	  constructor(message) {
	    super();
	    this.name = 'GraphError';
	    this.message = message;
	  }
	}

	class InvalidArgumentsGraphError extends GraphError {
	  constructor(message) {
	    super(message);
	    this.name = 'InvalidArgumentsGraphError';

	    // This is V8 specific to enhance stack readability
	    if (typeof Error.captureStackTrace === 'function')
	      Error.captureStackTrace(
	        this,
	        InvalidArgumentsGraphError.prototype.constructor
	      );
	  }
	}

	class NotFoundGraphError extends GraphError {
	  constructor(message) {
	    super(message);
	    this.name = 'NotFoundGraphError';

	    // This is V8 specific to enhance stack readability
	    if (typeof Error.captureStackTrace === 'function')
	      Error.captureStackTrace(this, NotFoundGraphError.prototype.constructor);
	  }
	}

	class UsageGraphError extends GraphError {
	  constructor(message) {
	    super(message);
	    this.name = 'UsageGraphError';

	    // This is V8 specific to enhance stack readability
	    if (typeof Error.captureStackTrace === 'function')
	      Error.captureStackTrace(this, UsageGraphError.prototype.constructor);
	  }
	}

	/**
	 * Graphology Internal Data Classes
	 * =================================
	 *
	 * Internal classes hopefully reduced to structs by engines & storing
	 * necessary information for nodes & edges.
	 *
	 * Note that those classes don't rely on the `class` keyword to avoid some
	 * cruft introduced by most of ES2015 transpilers.
	 */

	/**
	 * MixedNodeData class.
	 *
	 * @constructor
	 * @param {string} string     - The node's key.
	 * @param {object} attributes - Node's attributes.
	 */
	function MixedNodeData(key, attributes) {
	  // Attributes
	  this.key = key;
	  this.attributes = attributes;

	  this.clear();
	}

	MixedNodeData.prototype.clear = function () {
	  // Degrees
	  this.inDegree = 0;
	  this.outDegree = 0;
	  this.undirectedDegree = 0;
	  this.undirectedLoops = 0;
	  this.directedLoops = 0;

	  // Indices
	  this.in = {};
	  this.out = {};
	  this.undirected = {};
	};

	/**
	 * DirectedNodeData class.
	 *
	 * @constructor
	 * @param {string} string     - The node's key.
	 * @param {object} attributes - Node's attributes.
	 */
	function DirectedNodeData(key, attributes) {
	  // Attributes
	  this.key = key;
	  this.attributes = attributes;

	  this.clear();
	}

	DirectedNodeData.prototype.clear = function () {
	  // Degrees
	  this.inDegree = 0;
	  this.outDegree = 0;
	  this.directedLoops = 0;

	  // Indices
	  this.in = {};
	  this.out = {};
	};

	/**
	 * UndirectedNodeData class.
	 *
	 * @constructor
	 * @param {string} string     - The node's key.
	 * @param {object} attributes - Node's attributes.
	 */
	function UndirectedNodeData(key, attributes) {
	  // Attributes
	  this.key = key;
	  this.attributes = attributes;

	  this.clear();
	}

	UndirectedNodeData.prototype.clear = function () {
	  // Degrees
	  this.undirectedDegree = 0;
	  this.undirectedLoops = 0;

	  // Indices
	  this.undirected = {};
	};

	/**
	 * EdgeData class.
	 *
	 * @constructor
	 * @param {boolean} undirected   - Whether the edge is undirected.
	 * @param {string}  string       - The edge's key.
	 * @param {string}  source       - Source of the edge.
	 * @param {string}  target       - Target of the edge.
	 * @param {object}  attributes   - Edge's attributes.
	 */
	function EdgeData(undirected, key, source, target, attributes) {
	  // Attributes
	  this.key = key;
	  this.attributes = attributes;
	  this.undirected = undirected;

	  // Extremities
	  this.source = source;
	  this.target = target;
	}

	EdgeData.prototype.attach = function () {
	  let outKey = 'out';
	  let inKey = 'in';

	  if (this.undirected) outKey = inKey = 'undirected';

	  const source = this.source.key;
	  const target = this.target.key;

	  // Handling source
	  this.source[outKey][target] = this;

	  if (this.undirected && source === target) return;

	  // Handling target
	  this.target[inKey][source] = this;
	};

	EdgeData.prototype.attachMulti = function () {
	  let outKey = 'out';
	  let inKey = 'in';

	  const source = this.source.key;
	  const target = this.target.key;

	  if (this.undirected) outKey = inKey = 'undirected';

	  // Handling source
	  const adj = this.source[outKey];
	  const head = adj[target];

	  if (typeof head === 'undefined') {
	    adj[target] = this;

	    // Self-loop optimization
	    if (!(this.undirected && source === target)) {
	      // Handling target
	      this.target[inKey][source] = this;
	    }

	    return;
	  }

	  // Prepending to doubly-linked list
	  head.previous = this;
	  this.next = head;

	  // Pointing to new head
	  // NOTE: use mutating swap later to avoid lookup?
	  adj[target] = this;
	  this.target[inKey][source] = this;
	};

	EdgeData.prototype.detach = function () {
	  const source = this.source.key;
	  const target = this.target.key;

	  let outKey = 'out';
	  let inKey = 'in';

	  if (this.undirected) outKey = inKey = 'undirected';

	  delete this.source[outKey][target];

	  // No-op delete in case of undirected self-loop
	  delete this.target[inKey][source];
	};

	EdgeData.prototype.detachMulti = function () {
	  const source = this.source.key;
	  const target = this.target.key;

	  let outKey = 'out';
	  let inKey = 'in';

	  if (this.undirected) outKey = inKey = 'undirected';

	  // Deleting from doubly-linked list
	  if (this.previous === undefined) {
	    // We are dealing with the head

	    // Should we delete the adjacency entry because it is now empty?
	    if (this.next === undefined) {
	      delete this.source[outKey][target];

	      // No-op delete in case of undirected self-loop
	      delete this.target[inKey][source];
	    } else {
	      // Detaching
	      this.next.previous = undefined;

	      // NOTE: could avoid the lookups by creating a #.become mutating method
	      this.source[outKey][target] = this.next;

	      // No-op delete in case of undirected self-loop
	      this.target[inKey][source] = this.next;
	    }
	  } else {
	    // We are dealing with another list node
	    this.previous.next = this.next;

	    // If not last
	    if (this.next !== undefined) {
	      this.next.previous = this.previous;
	    }
	  }
	};

	/**
	 * Graphology Node Attributes methods
	 * ===================================
	 */

	const NODE = 0;
	const SOURCE = 1;
	const TARGET = 2;
	const OPPOSITE = 3;

	function findRelevantNodeData(
	  graph,
	  method,
	  mode,
	  nodeOrEdge,
	  nameOrEdge,
	  add1,
	  add2
	) {
	  let nodeData, edgeData, arg1, arg2;

	  nodeOrEdge = '' + nodeOrEdge;

	  if (mode === NODE) {
	    nodeData = graph._nodes.get(nodeOrEdge);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.${method}: could not find the "${nodeOrEdge}" node in the graph.`
	      );

	    arg1 = nameOrEdge;
	    arg2 = add1;
	  } else if (mode === OPPOSITE) {
	    nameOrEdge = '' + nameOrEdge;

	    edgeData = graph._edges.get(nameOrEdge);

	    if (!edgeData)
	      throw new NotFoundGraphError(
	        `Graph.${method}: could not find the "${nameOrEdge}" edge in the graph.`
	      );

	    const source = edgeData.source.key;
	    const target = edgeData.target.key;

	    if (nodeOrEdge === source) {
	      nodeData = edgeData.target;
	    } else if (nodeOrEdge === target) {
	      nodeData = edgeData.source;
	    } else {
	      throw new NotFoundGraphError(
	        `Graph.${method}: the "${nodeOrEdge}" node is not attached to the "${nameOrEdge}" edge (${source}, ${target}).`
	      );
	    }

	    arg1 = add1;
	    arg2 = add2;
	  } else {
	    edgeData = graph._edges.get(nodeOrEdge);

	    if (!edgeData)
	      throw new NotFoundGraphError(
	        `Graph.${method}: could not find the "${nodeOrEdge}" edge in the graph.`
	      );

	    if (mode === SOURCE) {
	      nodeData = edgeData.source;
	    } else {
	      nodeData = edgeData.target;
	    }

	    arg1 = nameOrEdge;
	    arg2 = add1;
	  }

	  return [nodeData, arg1, arg2];
	}

	function attachNodeAttributeGetter(Class, method, mode) {
	  Class.prototype[method] = function (nodeOrEdge, nameOrEdge, add1) {
	    const [data, name] = findRelevantNodeData(
	      this,
	      method,
	      mode,
	      nodeOrEdge,
	      nameOrEdge,
	      add1
	    );

	    return data.attributes[name];
	  };
	}

	function attachNodeAttributesGetter(Class, method, mode) {
	  Class.prototype[method] = function (nodeOrEdge, nameOrEdge) {
	    const [data] = findRelevantNodeData(
	      this,
	      method,
	      mode,
	      nodeOrEdge,
	      nameOrEdge
	    );

	    return data.attributes;
	  };
	}

	function attachNodeAttributeChecker(Class, method, mode) {
	  Class.prototype[method] = function (nodeOrEdge, nameOrEdge, add1) {
	    const [data, name] = findRelevantNodeData(
	      this,
	      method,
	      mode,
	      nodeOrEdge,
	      nameOrEdge,
	      add1
	    );

	    return data.attributes.hasOwnProperty(name);
	  };
	}

	function attachNodeAttributeSetter(Class, method, mode) {
	  Class.prototype[method] = function (nodeOrEdge, nameOrEdge, add1, add2) {
	    const [data, name, value] = findRelevantNodeData(
	      this,
	      method,
	      mode,
	      nodeOrEdge,
	      nameOrEdge,
	      add1,
	      add2
	    );

	    data.attributes[name] = value;

	    // Emitting
	    this.emit('nodeAttributesUpdated', {
	      key: data.key,
	      type: 'set',
	      attributes: data.attributes,
	      name
	    });

	    return this;
	  };
	}

	function attachNodeAttributeUpdater(Class, method, mode) {
	  Class.prototype[method] = function (nodeOrEdge, nameOrEdge, add1, add2) {
	    const [data, name, updater] = findRelevantNodeData(
	      this,
	      method,
	      mode,
	      nodeOrEdge,
	      nameOrEdge,
	      add1,
	      add2
	    );

	    if (typeof updater !== 'function')
	      throw new InvalidArgumentsGraphError(
	        `Graph.${method}: updater should be a function.`
	      );

	    const attributes = data.attributes;
	    const value = updater(attributes[name]);

	    attributes[name] = value;

	    // Emitting
	    this.emit('nodeAttributesUpdated', {
	      key: data.key,
	      type: 'set',
	      attributes: data.attributes,
	      name
	    });

	    return this;
	  };
	}

	function attachNodeAttributeRemover(Class, method, mode) {
	  Class.prototype[method] = function (nodeOrEdge, nameOrEdge, add1) {
	    const [data, name] = findRelevantNodeData(
	      this,
	      method,
	      mode,
	      nodeOrEdge,
	      nameOrEdge,
	      add1
	    );

	    delete data.attributes[name];

	    // Emitting
	    this.emit('nodeAttributesUpdated', {
	      key: data.key,
	      type: 'remove',
	      attributes: data.attributes,
	      name
	    });

	    return this;
	  };
	}

	function attachNodeAttributesReplacer(Class, method, mode) {
	  Class.prototype[method] = function (nodeOrEdge, nameOrEdge, add1) {
	    const [data, attributes] = findRelevantNodeData(
	      this,
	      method,
	      mode,
	      nodeOrEdge,
	      nameOrEdge,
	      add1
	    );

	    if (!isPlainObject(attributes))
	      throw new InvalidArgumentsGraphError(
	        `Graph.${method}: provided attributes are not a plain object.`
	      );

	    data.attributes = attributes;

	    // Emitting
	    this.emit('nodeAttributesUpdated', {
	      key: data.key,
	      type: 'replace',
	      attributes: data.attributes
	    });

	    return this;
	  };
	}

	function attachNodeAttributesMerger(Class, method, mode) {
	  Class.prototype[method] = function (nodeOrEdge, nameOrEdge, add1) {
	    const [data, attributes] = findRelevantNodeData(
	      this,
	      method,
	      mode,
	      nodeOrEdge,
	      nameOrEdge,
	      add1
	    );

	    if (!isPlainObject(attributes))
	      throw new InvalidArgumentsGraphError(
	        `Graph.${method}: provided attributes are not a plain object.`
	      );

	    assign$1(data.attributes, attributes);

	    // Emitting
	    this.emit('nodeAttributesUpdated', {
	      key: data.key,
	      type: 'merge',
	      attributes: data.attributes,
	      data: attributes
	    });

	    return this;
	  };
	}

	function attachNodeAttributesUpdater(Class, method, mode) {
	  Class.prototype[method] = function (nodeOrEdge, nameOrEdge, add1) {
	    const [data, updater] = findRelevantNodeData(
	      this,
	      method,
	      mode,
	      nodeOrEdge,
	      nameOrEdge,
	      add1
	    );

	    if (typeof updater !== 'function')
	      throw new InvalidArgumentsGraphError(
	        `Graph.${method}: provided updater is not a function.`
	      );

	    data.attributes = updater(data.attributes);

	    // Emitting
	    this.emit('nodeAttributesUpdated', {
	      key: data.key,
	      type: 'update',
	      attributes: data.attributes
	    });

	    return this;
	  };
	}

	/**
	 * List of methods to attach.
	 */
	const NODE_ATTRIBUTES_METHODS = [
	  {
	    name: element => `get${element}Attribute`,
	    attacher: attachNodeAttributeGetter
	  },
	  {
	    name: element => `get${element}Attributes`,
	    attacher: attachNodeAttributesGetter
	  },
	  {
	    name: element => `has${element}Attribute`,
	    attacher: attachNodeAttributeChecker
	  },
	  {
	    name: element => `set${element}Attribute`,
	    attacher: attachNodeAttributeSetter
	  },
	  {
	    name: element => `update${element}Attribute`,
	    attacher: attachNodeAttributeUpdater
	  },
	  {
	    name: element => `remove${element}Attribute`,
	    attacher: attachNodeAttributeRemover
	  },
	  {
	    name: element => `replace${element}Attributes`,
	    attacher: attachNodeAttributesReplacer
	  },
	  {
	    name: element => `merge${element}Attributes`,
	    attacher: attachNodeAttributesMerger
	  },
	  {
	    name: element => `update${element}Attributes`,
	    attacher: attachNodeAttributesUpdater
	  }
	];

	/**
	 * Attach every attributes-related methods to a Graph class.
	 *
	 * @param {function} Graph - Target class.
	 */
	function attachNodeAttributesMethods(Graph) {
	  NODE_ATTRIBUTES_METHODS.forEach(function ({name, attacher}) {
	    // For nodes
	    attacher(Graph, name('Node'), NODE);

	    // For sources
	    attacher(Graph, name('Source'), SOURCE);

	    // For targets
	    attacher(Graph, name('Target'), TARGET);

	    // For opposites
	    attacher(Graph, name('Opposite'), OPPOSITE);
	  });
	}

	/**
	 * Graphology Edge Attributes methods
	 * ===================================
	 */

	/**
	 * Attach an attribute getter method onto the provided class.
	 *
	 * @param {function} Class         - Target class.
	 * @param {string}   method        - Method name.
	 * @param {string}   type          - Type of the edge to find.
	 */
	function attachEdgeAttributeGetter(Class, method, type) {
	  /**
	   * Get the desired attribute for the given element (node or edge).
	   *
	   * Arity 2:
	   * @param  {any}    element - Target element.
	   * @param  {string} name    - Attribute's name.
	   *
	   * Arity 3 (only for edges):
	   * @param  {any}     source - Source element.
	   * @param  {any}     target - Target element.
	   * @param  {string}  name   - Attribute's name.
	   *
	   * @return {mixed}          - The attribute's value.
	   *
	   * @throws {Error} - Will throw if too many arguments are provided.
	   * @throws {Error} - Will throw if any of the elements is not found.
	   */
	  Class.prototype[method] = function (element, name) {
	    let data;

	    if (this.type !== 'mixed' && type !== 'mixed' && type !== this.type)
	      throw new UsageGraphError(
	        `Graph.${method}: cannot find this type of edges in your ${this.type} graph.`
	      );

	    if (arguments.length > 2) {
	      if (this.multi)
	        throw new UsageGraphError(
	          `Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`
	        );

	      const source = '' + element;
	      const target = '' + name;

	      name = arguments[2];

	      data = getMatchingEdge(this, source, target, type);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`
	        );
	    } else {
	      if (type !== 'mixed')
	        throw new UsageGraphError(
	          `Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`
	        );

	      element = '' + element;
	      data = this._edges.get(element);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find the "${element}" edge in the graph.`
	        );
	    }

	    return data.attributes[name];
	  };
	}

	/**
	 * Attach an attributes getter method onto the provided class.
	 *
	 * @param {function} Class       - Target class.
	 * @param {string}   method      - Method name.
	 * @param {string}   type        - Type of the edge to find.
	 */
	function attachEdgeAttributesGetter(Class, method, type) {
	  /**
	   * Retrieves all the target element's attributes.
	   *
	   * Arity 2:
	   * @param  {any}    element - Target element.
	   *
	   * Arity 3 (only for edges):
	   * @param  {any}     source - Source element.
	   * @param  {any}     target - Target element.
	   *
	   * @return {object}          - The element's attributes.
	   *
	   * @throws {Error} - Will throw if too many arguments are provided.
	   * @throws {Error} - Will throw if any of the elements is not found.
	   */
	  Class.prototype[method] = function (element) {
	    let data;

	    if (this.type !== 'mixed' && type !== 'mixed' && type !== this.type)
	      throw new UsageGraphError(
	        `Graph.${method}: cannot find this type of edges in your ${this.type} graph.`
	      );

	    if (arguments.length > 1) {
	      if (this.multi)
	        throw new UsageGraphError(
	          `Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`
	        );

	      const source = '' + element,
	        target = '' + arguments[1];

	      data = getMatchingEdge(this, source, target, type);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`
	        );
	    } else {
	      if (type !== 'mixed')
	        throw new UsageGraphError(
	          `Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`
	        );

	      element = '' + element;
	      data = this._edges.get(element);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find the "${element}" edge in the graph.`
	        );
	    }

	    return data.attributes;
	  };
	}

	/**
	 * Attach an attribute checker method onto the provided class.
	 *
	 * @param {function} Class       - Target class.
	 * @param {string}   method      - Method name.
	 * @param {string}   type        - Type of the edge to find.
	 */
	function attachEdgeAttributeChecker(Class, method, type) {
	  /**
	   * Checks whether the desired attribute is set for the given element (node or edge).
	   *
	   * Arity 2:
	   * @param  {any}    element - Target element.
	   * @param  {string} name    - Attribute's name.
	   *
	   * Arity 3 (only for edges):
	   * @param  {any}     source - Source element.
	   * @param  {any}     target - Target element.
	   * @param  {string}  name   - Attribute's name.
	   *
	   * @return {boolean}
	   *
	   * @throws {Error} - Will throw if too many arguments are provided.
	   * @throws {Error} - Will throw if any of the elements is not found.
	   */
	  Class.prototype[method] = function (element, name) {
	    let data;

	    if (this.type !== 'mixed' && type !== 'mixed' && type !== this.type)
	      throw new UsageGraphError(
	        `Graph.${method}: cannot find this type of edges in your ${this.type} graph.`
	      );

	    if (arguments.length > 2) {
	      if (this.multi)
	        throw new UsageGraphError(
	          `Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`
	        );

	      const source = '' + element;
	      const target = '' + name;

	      name = arguments[2];

	      data = getMatchingEdge(this, source, target, type);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`
	        );
	    } else {
	      if (type !== 'mixed')
	        throw new UsageGraphError(
	          `Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`
	        );

	      element = '' + element;
	      data = this._edges.get(element);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find the "${element}" edge in the graph.`
	        );
	    }

	    return data.attributes.hasOwnProperty(name);
	  };
	}

	/**
	 * Attach an attribute setter method onto the provided class.
	 *
	 * @param {function} Class         - Target class.
	 * @param {string}   method        - Method name.
	 * @param {string}   type          - Type of the edge to find.
	 */
	function attachEdgeAttributeSetter(Class, method, type) {
	  /**
	   * Set the desired attribute for the given element (node or edge).
	   *
	   * Arity 2:
	   * @param  {any}    element - Target element.
	   * @param  {string} name    - Attribute's name.
	   * @param  {mixed}  value   - New attribute value.
	   *
	   * Arity 3 (only for edges):
	   * @param  {any}     source - Source element.
	   * @param  {any}     target - Target element.
	   * @param  {string}  name   - Attribute's name.
	   * @param  {mixed}  value   - New attribute value.
	   *
	   * @return {Graph}          - Returns itself for chaining.
	   *
	   * @throws {Error} - Will throw if too many arguments are provided.
	   * @throws {Error} - Will throw if any of the elements is not found.
	   */
	  Class.prototype[method] = function (element, name, value) {
	    let data;

	    if (this.type !== 'mixed' && type !== 'mixed' && type !== this.type)
	      throw new UsageGraphError(
	        `Graph.${method}: cannot find this type of edges in your ${this.type} graph.`
	      );

	    if (arguments.length > 3) {
	      if (this.multi)
	        throw new UsageGraphError(
	          `Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`
	        );

	      const source = '' + element;
	      const target = '' + name;

	      name = arguments[2];
	      value = arguments[3];

	      data = getMatchingEdge(this, source, target, type);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`
	        );
	    } else {
	      if (type !== 'mixed')
	        throw new UsageGraphError(
	          `Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`
	        );

	      element = '' + element;
	      data = this._edges.get(element);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find the "${element}" edge in the graph.`
	        );
	    }

	    data.attributes[name] = value;

	    // Emitting
	    this.emit('edgeAttributesUpdated', {
	      key: data.key,
	      type: 'set',
	      attributes: data.attributes,
	      name
	    });

	    return this;
	  };
	}

	/**
	 * Attach an attribute updater method onto the provided class.
	 *
	 * @param {function} Class         - Target class.
	 * @param {string}   method        - Method name.
	 * @param {string}   type          - Type of the edge to find.
	 */
	function attachEdgeAttributeUpdater(Class, method, type) {
	  /**
	   * Update the desired attribute for the given element (node or edge) using
	   * the provided function.
	   *
	   * Arity 2:
	   * @param  {any}      element - Target element.
	   * @param  {string}   name    - Attribute's name.
	   * @param  {function} updater - Updater function.
	   *
	   * Arity 3 (only for edges):
	   * @param  {any}      source  - Source element.
	   * @param  {any}      target  - Target element.
	   * @param  {string}   name    - Attribute's name.
	   * @param  {function} updater - Updater function.
	   *
	   * @return {Graph}            - Returns itself for chaining.
	   *
	   * @throws {Error} - Will throw if too many arguments are provided.
	   * @throws {Error} - Will throw if any of the elements is not found.
	   */
	  Class.prototype[method] = function (element, name, updater) {
	    let data;

	    if (this.type !== 'mixed' && type !== 'mixed' && type !== this.type)
	      throw new UsageGraphError(
	        `Graph.${method}: cannot find this type of edges in your ${this.type} graph.`
	      );

	    if (arguments.length > 3) {
	      if (this.multi)
	        throw new UsageGraphError(
	          `Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`
	        );

	      const source = '' + element;
	      const target = '' + name;

	      name = arguments[2];
	      updater = arguments[3];

	      data = getMatchingEdge(this, source, target, type);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`
	        );
	    } else {
	      if (type !== 'mixed')
	        throw new UsageGraphError(
	          `Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`
	        );

	      element = '' + element;
	      data = this._edges.get(element);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find the "${element}" edge in the graph.`
	        );
	    }

	    if (typeof updater !== 'function')
	      throw new InvalidArgumentsGraphError(
	        `Graph.${method}: updater should be a function.`
	      );

	    data.attributes[name] = updater(data.attributes[name]);

	    // Emitting
	    this.emit('edgeAttributesUpdated', {
	      key: data.key,
	      type: 'set',
	      attributes: data.attributes,
	      name
	    });

	    return this;
	  };
	}

	/**
	 * Attach an attribute remover method onto the provided class.
	 *
	 * @param {function} Class         - Target class.
	 * @param {string}   method        - Method name.
	 * @param {string}   type          - Type of the edge to find.
	 */
	function attachEdgeAttributeRemover(Class, method, type) {
	  /**
	   * Remove the desired attribute for the given element (node or edge).
	   *
	   * Arity 2:
	   * @param  {any}    element - Target element.
	   * @param  {string} name    - Attribute's name.
	   *
	   * Arity 3 (only for edges):
	   * @param  {any}     source - Source element.
	   * @param  {any}     target - Target element.
	   * @param  {string}  name   - Attribute's name.
	   *
	   * @return {Graph}          - Returns itself for chaining.
	   *
	   * @throws {Error} - Will throw if too many arguments are provided.
	   * @throws {Error} - Will throw if any of the elements is not found.
	   */
	  Class.prototype[method] = function (element, name) {
	    let data;

	    if (this.type !== 'mixed' && type !== 'mixed' && type !== this.type)
	      throw new UsageGraphError(
	        `Graph.${method}: cannot find this type of edges in your ${this.type} graph.`
	      );

	    if (arguments.length > 2) {
	      if (this.multi)
	        throw new UsageGraphError(
	          `Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`
	        );

	      const source = '' + element;
	      const target = '' + name;

	      name = arguments[2];

	      data = getMatchingEdge(this, source, target, type);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`
	        );
	    } else {
	      if (type !== 'mixed')
	        throw new UsageGraphError(
	          `Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`
	        );

	      element = '' + element;
	      data = this._edges.get(element);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find the "${element}" edge in the graph.`
	        );
	    }

	    delete data.attributes[name];

	    // Emitting
	    this.emit('edgeAttributesUpdated', {
	      key: data.key,
	      type: 'remove',
	      attributes: data.attributes,
	      name
	    });

	    return this;
	  };
	}

	/**
	 * Attach an attribute replacer method onto the provided class.
	 *
	 * @param {function} Class         - Target class.
	 * @param {string}   method        - Method name.
	 * @param {string}   type          - Type of the edge to find.
	 */
	function attachEdgeAttributesReplacer(Class, method, type) {
	  /**
	   * Replace the attributes for the given element (node or edge).
	   *
	   * Arity 2:
	   * @param  {any}    element    - Target element.
	   * @param  {object} attributes - New attributes.
	   *
	   * Arity 3 (only for edges):
	   * @param  {any}     source     - Source element.
	   * @param  {any}     target     - Target element.
	   * @param  {object}  attributes - New attributes.
	   *
	   * @return {Graph}              - Returns itself for chaining.
	   *
	   * @throws {Error} - Will throw if too many arguments are provided.
	   * @throws {Error} - Will throw if any of the elements is not found.
	   */
	  Class.prototype[method] = function (element, attributes) {
	    let data;

	    if (this.type !== 'mixed' && type !== 'mixed' && type !== this.type)
	      throw new UsageGraphError(
	        `Graph.${method}: cannot find this type of edges in your ${this.type} graph.`
	      );

	    if (arguments.length > 2) {
	      if (this.multi)
	        throw new UsageGraphError(
	          `Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`
	        );

	      const source = '' + element,
	        target = '' + attributes;

	      attributes = arguments[2];

	      data = getMatchingEdge(this, source, target, type);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`
	        );
	    } else {
	      if (type !== 'mixed')
	        throw new UsageGraphError(
	          `Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`
	        );

	      element = '' + element;
	      data = this._edges.get(element);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find the "${element}" edge in the graph.`
	        );
	    }

	    if (!isPlainObject(attributes))
	      throw new InvalidArgumentsGraphError(
	        `Graph.${method}: provided attributes are not a plain object.`
	      );

	    data.attributes = attributes;

	    // Emitting
	    this.emit('edgeAttributesUpdated', {
	      key: data.key,
	      type: 'replace',
	      attributes: data.attributes
	    });

	    return this;
	  };
	}

	/**
	 * Attach an attribute merger method onto the provided class.
	 *
	 * @param {function} Class         - Target class.
	 * @param {string}   method        - Method name.
	 * @param {string}   type          - Type of the edge to find.
	 */
	function attachEdgeAttributesMerger(Class, method, type) {
	  /**
	   * Merge the attributes for the given element (node or edge).
	   *
	   * Arity 2:
	   * @param  {any}    element    - Target element.
	   * @param  {object} attributes - Attributes to merge.
	   *
	   * Arity 3 (only for edges):
	   * @param  {any}     source     - Source element.
	   * @param  {any}     target     - Target element.
	   * @param  {object}  attributes - Attributes to merge.
	   *
	   * @return {Graph}              - Returns itself for chaining.
	   *
	   * @throws {Error} - Will throw if too many arguments are provided.
	   * @throws {Error} - Will throw if any of the elements is not found.
	   */
	  Class.prototype[method] = function (element, attributes) {
	    let data;

	    if (this.type !== 'mixed' && type !== 'mixed' && type !== this.type)
	      throw new UsageGraphError(
	        `Graph.${method}: cannot find this type of edges in your ${this.type} graph.`
	      );

	    if (arguments.length > 2) {
	      if (this.multi)
	        throw new UsageGraphError(
	          `Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`
	        );

	      const source = '' + element,
	        target = '' + attributes;

	      attributes = arguments[2];

	      data = getMatchingEdge(this, source, target, type);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`
	        );
	    } else {
	      if (type !== 'mixed')
	        throw new UsageGraphError(
	          `Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`
	        );

	      element = '' + element;
	      data = this._edges.get(element);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find the "${element}" edge in the graph.`
	        );
	    }

	    if (!isPlainObject(attributes))
	      throw new InvalidArgumentsGraphError(
	        `Graph.${method}: provided attributes are not a plain object.`
	      );

	    assign$1(data.attributes, attributes);

	    // Emitting
	    this.emit('edgeAttributesUpdated', {
	      key: data.key,
	      type: 'merge',
	      attributes: data.attributes,
	      data: attributes
	    });

	    return this;
	  };
	}

	/**
	 * Attach an attribute updater method onto the provided class.
	 *
	 * @param {function} Class         - Target class.
	 * @param {string}   method        - Method name.
	 * @param {string}   type          - Type of the edge to find.
	 */
	function attachEdgeAttributesUpdater(Class, method, type) {
	  /**
	   * Update the attributes of the given element (node or edge).
	   *
	   * Arity 2:
	   * @param  {any}      element - Target element.
	   * @param  {function} updater - Updater function.
	   *
	   * Arity 3 (only for edges):
	   * @param  {any}      source  - Source element.
	   * @param  {any}      target  - Target element.
	   * @param  {function} updater - Updater function.
	   *
	   * @return {Graph}            - Returns itself for chaining.
	   *
	   * @throws {Error} - Will throw if too many arguments are provided.
	   * @throws {Error} - Will throw if any of the elements is not found.
	   */
	  Class.prototype[method] = function (element, updater) {
	    let data;

	    if (this.type !== 'mixed' && type !== 'mixed' && type !== this.type)
	      throw new UsageGraphError(
	        `Graph.${method}: cannot find this type of edges in your ${this.type} graph.`
	      );

	    if (arguments.length > 2) {
	      if (this.multi)
	        throw new UsageGraphError(
	          `Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`
	        );

	      const source = '' + element,
	        target = '' + updater;

	      updater = arguments[2];

	      data = getMatchingEdge(this, source, target, type);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`
	        );
	    } else {
	      if (type !== 'mixed')
	        throw new UsageGraphError(
	          `Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`
	        );

	      element = '' + element;
	      data = this._edges.get(element);

	      if (!data)
	        throw new NotFoundGraphError(
	          `Graph.${method}: could not find the "${element}" edge in the graph.`
	        );
	    }

	    if (typeof updater !== 'function')
	      throw new InvalidArgumentsGraphError(
	        `Graph.${method}: provided updater is not a function.`
	      );

	    data.attributes = updater(data.attributes);

	    // Emitting
	    this.emit('edgeAttributesUpdated', {
	      key: data.key,
	      type: 'update',
	      attributes: data.attributes
	    });

	    return this;
	  };
	}

	/**
	 * List of methods to attach.
	 */
	const EDGE_ATTRIBUTES_METHODS = [
	  {
	    name: element => `get${element}Attribute`,
	    attacher: attachEdgeAttributeGetter
	  },
	  {
	    name: element => `get${element}Attributes`,
	    attacher: attachEdgeAttributesGetter
	  },
	  {
	    name: element => `has${element}Attribute`,
	    attacher: attachEdgeAttributeChecker
	  },
	  {
	    name: element => `set${element}Attribute`,
	    attacher: attachEdgeAttributeSetter
	  },
	  {
	    name: element => `update${element}Attribute`,
	    attacher: attachEdgeAttributeUpdater
	  },
	  {
	    name: element => `remove${element}Attribute`,
	    attacher: attachEdgeAttributeRemover
	  },
	  {
	    name: element => `replace${element}Attributes`,
	    attacher: attachEdgeAttributesReplacer
	  },
	  {
	    name: element => `merge${element}Attributes`,
	    attacher: attachEdgeAttributesMerger
	  },
	  {
	    name: element => `update${element}Attributes`,
	    attacher: attachEdgeAttributesUpdater
	  }
	];

	/**
	 * Attach every attributes-related methods to a Graph class.
	 *
	 * @param {function} Graph - Target class.
	 */
	function attachEdgeAttributesMethods(Graph) {
	  EDGE_ATTRIBUTES_METHODS.forEach(function ({name, attacher}) {
	    // For edges
	    attacher(Graph, name('Edge'), 'mixed');

	    // For directed edges
	    attacher(Graph, name('DirectedEdge'), 'directed');

	    // For undirected edges
	    attacher(Graph, name('UndirectedEdge'), 'undirected');
	  });
	}

	/**
	 * Graphology Edge Iteration
	 * ==========================
	 *
	 * Attaching some methods to the Graph class to be able to iterate over a
	 * graph's edges.
	 */

	/**
	 * Definitions.
	 */
	const EDGES_ITERATION = [
	  {
	    name: 'edges',
	    type: 'mixed'
	  },
	  {
	    name: 'inEdges',
	    type: 'directed',
	    direction: 'in'
	  },
	  {
	    name: 'outEdges',
	    type: 'directed',
	    direction: 'out'
	  },
	  {
	    name: 'inboundEdges',
	    type: 'mixed',
	    direction: 'in'
	  },
	  {
	    name: 'outboundEdges',
	    type: 'mixed',
	    direction: 'out'
	  },
	  {
	    name: 'directedEdges',
	    type: 'directed'
	  },
	  {
	    name: 'undirectedEdges',
	    type: 'undirected'
	  }
	];

	/**
	 * Function iterating over edges from the given object to match one of them.
	 *
	 * @param {object}   object   - Target object.
	 * @param {function} callback - Function to call.
	 */
	function forEachSimple(breakable, object, callback, avoid) {
	  let shouldBreak = false;

	  for (const k in object) {
	    if (k === avoid) continue;

	    const edgeData = object[k];

	    shouldBreak = callback(
	      edgeData.key,
	      edgeData.attributes,
	      edgeData.source.key,
	      edgeData.target.key,
	      edgeData.source.attributes,
	      edgeData.target.attributes,
	      edgeData.undirected
	    );

	    if (breakable && shouldBreak) return edgeData.key;
	  }

	  return;
	}

	function forEachMulti(breakable, object, callback, avoid) {
	  let edgeData, source, target;

	  let shouldBreak = false;

	  for (const k in object) {
	    if (k === avoid) continue;

	    edgeData = object[k];

	    do {
	      source = edgeData.source;
	      target = edgeData.target;

	      shouldBreak = callback(
	        edgeData.key,
	        edgeData.attributes,
	        source.key,
	        target.key,
	        source.attributes,
	        target.attributes,
	        edgeData.undirected
	      );

	      if (breakable && shouldBreak) return edgeData.key;

	      edgeData = edgeData.next;
	    } while (edgeData !== undefined);
	  }

	  return;
	}

	/**
	 * Function returning an iterator over edges from the given object.
	 *
	 * @param  {object}   object - Target object.
	 * @return {Iterator}
	 */
	function createIterator(object, avoid) {
	  const keys = Object.keys(object);
	  const l = keys.length;

	  let edgeData;
	  let i = 0;

	  return new Iterator$3(function next() {
	    do {
	      if (!edgeData) {
	        if (i >= l) return {done: true};

	        const k = keys[i++];

	        if (k === avoid) {
	          edgeData = undefined;
	          continue;
	        }

	        edgeData = object[k];
	      } else {
	        edgeData = edgeData.next;
	      }
	    } while (!edgeData);

	    return {
	      done: false,
	      value: {
	        edge: edgeData.key,
	        attributes: edgeData.attributes,
	        source: edgeData.source.key,
	        target: edgeData.target.key,
	        sourceAttributes: edgeData.source.attributes,
	        targetAttributes: edgeData.target.attributes,
	        undirected: edgeData.undirected
	      }
	    };
	  });
	}

	/**
	 * Function iterating over the egdes from the object at given key to match
	 * one of them.
	 *
	 * @param {object}   object   - Target object.
	 * @param {mixed}    k        - Neighbor key.
	 * @param {function} callback - Callback to use.
	 */
	function forEachForKeySimple(breakable, object, k, callback) {
	  const edgeData = object[k];

	  if (!edgeData) return;

	  const sourceData = edgeData.source;
	  const targetData = edgeData.target;

	  if (
	    callback(
	      edgeData.key,
	      edgeData.attributes,
	      sourceData.key,
	      targetData.key,
	      sourceData.attributes,
	      targetData.attributes,
	      edgeData.undirected
	    ) &&
	    breakable
	  )
	    return edgeData.key;
	}

	function forEachForKeyMulti(breakable, object, k, callback) {
	  let edgeData = object[k];

	  if (!edgeData) return;

	  let shouldBreak = false;

	  do {
	    shouldBreak = callback(
	      edgeData.key,
	      edgeData.attributes,
	      edgeData.source.key,
	      edgeData.target.key,
	      edgeData.source.attributes,
	      edgeData.target.attributes,
	      edgeData.undirected
	    );

	    if (breakable && shouldBreak) return edgeData.key;

	    edgeData = edgeData.next;
	  } while (edgeData !== undefined);

	  return;
	}

	/**
	 * Function returning an iterator over the egdes from the object at given key.
	 *
	 * @param  {object}   object   - Target object.
	 * @param  {mixed}    k        - Neighbor key.
	 * @return {Iterator}
	 */
	function createIteratorForKey(object, k) {
	  let edgeData = object[k];

	  if (edgeData.next !== undefined) {
	    return new Iterator$3(function () {
	      if (!edgeData) return {done: true};

	      const value = {
	        edge: edgeData.key,
	        attributes: edgeData.attributes,
	        source: edgeData.source.key,
	        target: edgeData.target.key,
	        sourceAttributes: edgeData.source.attributes,
	        targetAttributes: edgeData.target.attributes,
	        undirected: edgeData.undirected
	      };

	      edgeData = edgeData.next;

	      return {
	        done: false,
	        value
	      };
	    });
	  }

	  return Iterator$3.of({
	    edge: edgeData.key,
	    attributes: edgeData.attributes,
	    source: edgeData.source.key,
	    target: edgeData.target.key,
	    sourceAttributes: edgeData.source.attributes,
	    targetAttributes: edgeData.target.attributes,
	    undirected: edgeData.undirected
	  });
	}

	/**
	 * Function creating an array of edges for the given type.
	 *
	 * @param  {Graph}   graph - Target Graph instance.
	 * @param  {string}  type  - Type of edges to retrieve.
	 * @return {array}         - Array of edges.
	 */
	function createEdgeArray(graph, type) {
	  if (graph.size === 0) return [];

	  if (type === 'mixed' || type === graph.type) {
	    if (typeof Array.from === 'function')
	      return Array.from(graph._edges.keys());

	    return take$1(graph._edges.keys(), graph._edges.size);
	  }

	  const size =
	    type === 'undirected' ? graph.undirectedSize : graph.directedSize;

	  const list = new Array(size),
	    mask = type === 'undirected';

	  const iterator = graph._edges.values();

	  let i = 0;
	  let step, data;

	  while (((step = iterator.next()), step.done !== true)) {
	    data = step.value;

	    if (data.undirected === mask) list[i++] = data.key;
	  }

	  return list;
	}

	/**
	 * Function iterating over a graph's edges using a callback to match one of
	 * them.
	 *
	 * @param  {Graph}    graph    - Target Graph instance.
	 * @param  {string}   type     - Type of edges to retrieve.
	 * @param  {function} callback - Function to call.
	 */
	function forEachEdge(breakable, graph, type, callback) {
	  if (graph.size === 0) return;

	  const shouldFilter = type !== 'mixed' && type !== graph.type;
	  const mask = type === 'undirected';

	  let step, data;
	  let shouldBreak = false;
	  const iterator = graph._edges.values();

	  while (((step = iterator.next()), step.done !== true)) {
	    data = step.value;

	    if (shouldFilter && data.undirected !== mask) continue;

	    const {key, attributes, source, target} = data;

	    shouldBreak = callback(
	      key,
	      attributes,
	      source.key,
	      target.key,
	      source.attributes,
	      target.attributes,
	      data.undirected
	    );

	    if (breakable && shouldBreak) return key;
	  }

	  return;
	}

	/**
	 * Function creating an iterator of edges for the given type.
	 *
	 * @param  {Graph}    graph - Target Graph instance.
	 * @param  {string}   type  - Type of edges to retrieve.
	 * @return {Iterator}
	 */
	function createEdgeIterator(graph, type) {
	  if (graph.size === 0) return Iterator$3.empty();

	  const shouldFilter = type !== 'mixed' && type !== graph.type;
	  const mask = type === 'undirected';

	  const iterator = graph._edges.values();

	  return new Iterator$3(function next() {
	    let step, data;

	    // eslint-disable-next-line no-constant-condition
	    while (true) {
	      step = iterator.next();

	      if (step.done) return step;

	      data = step.value;

	      if (shouldFilter && data.undirected !== mask) continue;

	      break;
	    }

	    const value = {
	      edge: data.key,
	      attributes: data.attributes,
	      source: data.source.key,
	      target: data.target.key,
	      sourceAttributes: data.source.attributes,
	      targetAttributes: data.target.attributes,
	      undirected: data.undirected
	    };

	    return {value, done: false};
	  });
	}

	/**
	 * Function iterating over a node's edges using a callback to match one of them.
	 *
	 * @param  {boolean}  multi     - Whether the graph is multi or not.
	 * @param  {string}   type      - Type of edges to retrieve.
	 * @param  {string}   direction - In or out?
	 * @param  {any}      nodeData  - Target node's data.
	 * @param  {function} callback  - Function to call.
	 */
	function forEachEdgeForNode(
	  breakable,
	  multi,
	  type,
	  direction,
	  nodeData,
	  callback
	) {
	  const fn = multi ? forEachMulti : forEachSimple;

	  let found;

	  if (type !== 'undirected') {
	    if (direction !== 'out') {
	      found = fn(breakable, nodeData.in, callback);

	      if (breakable && found) return found;
	    }
	    if (direction !== 'in') {
	      found = fn(
	        breakable,
	        nodeData.out,
	        callback,
	        !direction ? nodeData.key : undefined
	      );

	      if (breakable && found) return found;
	    }
	  }

	  if (type !== 'directed') {
	    found = fn(breakable, nodeData.undirected, callback);

	    if (breakable && found) return found;
	  }

	  return;
	}

	/**
	 * Function creating an array of edges for the given type & the given node.
	 *
	 * @param  {boolean} multi     - Whether the graph is multi or not.
	 * @param  {string}  type      - Type of edges to retrieve.
	 * @param  {string}  direction - In or out?
	 * @param  {any}     nodeData  - Target node's data.
	 * @return {array}             - Array of edges.
	 */
	function createEdgeArrayForNode(multi, type, direction, nodeData) {
	  const edges = []; // TODO: possibility to know size beforehand or factorize with map

	  forEachEdgeForNode(false, multi, type, direction, nodeData, function (key) {
	    edges.push(key);
	  });

	  return edges;
	}

	/**
	 * Function iterating over a node's edges using a callback.
	 *
	 * @param  {string}   type      - Type of edges to retrieve.
	 * @param  {string}   direction - In or out?
	 * @param  {any}      nodeData  - Target node's data.
	 * @return {Iterator}
	 */
	function createEdgeIteratorForNode(type, direction, nodeData) {
	  let iterator = Iterator$3.empty();

	  if (type !== 'undirected') {
	    if (direction !== 'out' && typeof nodeData.in !== 'undefined')
	      iterator = chain$1(iterator, createIterator(nodeData.in));
	    if (direction !== 'in' && typeof nodeData.out !== 'undefined')
	      iterator = chain$1(
	        iterator,
	        createIterator(nodeData.out, !direction ? nodeData.key : undefined)
	      );
	  }

	  if (type !== 'directed' && typeof nodeData.undirected !== 'undefined') {
	    iterator = chain$1(iterator, createIterator(nodeData.undirected));
	  }

	  return iterator;
	}

	/**
	 * Function iterating over edges for the given path using a callback to match
	 * one of them.
	 *
	 * @param  {string}   type       - Type of edges to retrieve.
	 * @param  {boolean}  multi      - Whether the graph is multi.
	 * @param  {string}   direction  - In or out?
	 * @param  {NodeData} sourceData - Source node's data.
	 * @param  {string}   target     - Target node.
	 * @param  {function} callback   - Function to call.
	 */
	function forEachEdgeForPath(
	  breakable,
	  type,
	  multi,
	  direction,
	  sourceData,
	  target,
	  callback
	) {
	  const fn = multi ? forEachForKeyMulti : forEachForKeySimple;

	  let found;

	  if (type !== 'undirected') {
	    if (typeof sourceData.in !== 'undefined' && direction !== 'out') {
	      found = fn(breakable, sourceData.in, target, callback);

	      if (breakable && found) return found;
	    }

	    if (
	      typeof sourceData.out !== 'undefined' &&
	      direction !== 'in' &&
	      (direction || sourceData.key !== target)
	    ) {
	      found = fn(breakable, sourceData.out, target, callback);

	      if (breakable && found) return found;
	    }
	  }

	  if (type !== 'directed') {
	    if (typeof sourceData.undirected !== 'undefined') {
	      found = fn(breakable, sourceData.undirected, target, callback);

	      if (breakable && found) return found;
	    }
	  }

	  return;
	}

	/**
	 * Function creating an array of edges for the given path.
	 *
	 * @param  {string}   type       - Type of edges to retrieve.
	 * @param  {boolean}  multi      - Whether the graph is multi.
	 * @param  {string}   direction  - In or out?
	 * @param  {NodeData} sourceData - Source node's data.
	 * @param  {any}      target     - Target node.
	 * @return {array}               - Array of edges.
	 */
	function createEdgeArrayForPath(type, multi, direction, sourceData, target) {
	  const edges = []; // TODO: possibility to know size beforehand or factorize with map

	  forEachEdgeForPath(
	    false,
	    type,
	    multi,
	    direction,
	    sourceData,
	    target,
	    function (key) {
	      edges.push(key);
	    }
	  );

	  return edges;
	}

	/**
	 * Function returning an iterator over edges for the given path.
	 *
	 * @param  {string}   type       - Type of edges to retrieve.
	 * @param  {string}   direction  - In or out?
	 * @param  {NodeData} sourceData - Source node's data.
	 * @param  {string}   target     - Target node.
	 * @param  {function} callback   - Function to call.
	 */
	function createEdgeIteratorForPath(type, direction, sourceData, target) {
	  let iterator = Iterator$3.empty();

	  if (type !== 'undirected') {
	    if (
	      typeof sourceData.in !== 'undefined' &&
	      direction !== 'out' &&
	      target in sourceData.in
	    )
	      iterator = chain$1(iterator, createIteratorForKey(sourceData.in, target));

	    if (
	      typeof sourceData.out !== 'undefined' &&
	      direction !== 'in' &&
	      target in sourceData.out &&
	      (direction || sourceData.key !== target)
	    )
	      iterator = chain$1(iterator, createIteratorForKey(sourceData.out, target));
	  }

	  if (type !== 'directed') {
	    if (
	      typeof sourceData.undirected !== 'undefined' &&
	      target in sourceData.undirected
	    )
	      iterator = chain$1(
	        iterator,
	        createIteratorForKey(sourceData.undirected, target)
	      );
	  }

	  return iterator;
	}

	/**
	 * Function attaching an edge array creator method to the Graph prototype.
	 *
	 * @param {function} Class       - Target class.
	 * @param {object}   description - Method description.
	 */
	function attachEdgeArrayCreator(Class, description) {
	  const {name, type, direction} = description;

	  /**
	   * Function returning an array of certain edges.
	   *
	   * Arity 0: Return all the relevant edges.
	   *
	   * Arity 1: Return all of a node's relevant edges.
	   * @param  {any}   node   - Target node.
	   *
	   * Arity 2: Return the relevant edges across the given path.
	   * @param  {any}   source - Source node.
	   * @param  {any}   target - Target node.
	   *
	   * @return {array|number} - The edges or the number of edges.
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  Class.prototype[name] = function (source, target) {
	    // Early termination
	    if (type !== 'mixed' && this.type !== 'mixed' && type !== this.type)
	      return [];

	    if (!arguments.length) return createEdgeArray(this, type);

	    if (arguments.length === 1) {
	      source = '' + source;

	      const nodeData = this._nodes.get(source);

	      if (typeof nodeData === 'undefined')
	        throw new NotFoundGraphError(
	          `Graph.${name}: could not find the "${source}" node in the graph.`
	        );

	      // Iterating over a node's edges
	      return createEdgeArrayForNode(
	        this.multi,
	        type === 'mixed' ? this.type : type,
	        direction,
	        nodeData
	      );
	    }

	    if (arguments.length === 2) {
	      source = '' + source;
	      target = '' + target;

	      const sourceData = this._nodes.get(source);

	      if (!sourceData)
	        throw new NotFoundGraphError(
	          `Graph.${name}:  could not find the "${source}" source node in the graph.`
	        );

	      if (!this._nodes.has(target))
	        throw new NotFoundGraphError(
	          `Graph.${name}:  could not find the "${target}" target node in the graph.`
	        );

	      // Iterating over the edges between source & target
	      return createEdgeArrayForPath(
	        type,
	        this.multi,
	        direction,
	        sourceData,
	        target
	      );
	    }

	    throw new InvalidArgumentsGraphError(
	      `Graph.${name}: too many arguments (expecting 0, 1 or 2 and got ${arguments.length}).`
	    );
	  };
	}

	/**
	 * Function attaching a edge callback iterator method to the Graph prototype.
	 *
	 * @param {function} Class       - Target class.
	 * @param {object}   description - Method description.
	 */
	function attachForEachEdge(Class, description) {
	  const {name, type, direction} = description;

	  const forEachName = 'forEach' + name[0].toUpperCase() + name.slice(1, -1);

	  /**
	   * Function iterating over the graph's relevant edges by applying the given
	   * callback.
	   *
	   * Arity 1: Iterate over all the relevant edges.
	   * @param  {function} callback - Callback to use.
	   *
	   * Arity 2: Iterate over all of a node's relevant edges.
	   * @param  {any}      node     - Target node.
	   * @param  {function} callback - Callback to use.
	   *
	   * Arity 3: Iterate over the relevant edges across the given path.
	   * @param  {any}      source   - Source node.
	   * @param  {any}      target   - Target node.
	   * @param  {function} callback - Callback to use.
	   *
	   * @return {undefined}
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  Class.prototype[forEachName] = function (source, target, callback) {
	    // Early termination
	    if (type !== 'mixed' && this.type !== 'mixed' && type !== this.type) return;

	    if (arguments.length === 1) {
	      callback = source;
	      return forEachEdge(false, this, type, callback);
	    }

	    if (arguments.length === 2) {
	      source = '' + source;
	      callback = target;

	      const nodeData = this._nodes.get(source);

	      if (typeof nodeData === 'undefined')
	        throw new NotFoundGraphError(
	          `Graph.${forEachName}: could not find the "${source}" node in the graph.`
	        );

	      // Iterating over a node's edges
	      // TODO: maybe attach the sub method to the instance dynamically?
	      return forEachEdgeForNode(
	        false,
	        this.multi,
	        type === 'mixed' ? this.type : type,
	        direction,
	        nodeData,
	        callback
	      );
	    }

	    if (arguments.length === 3) {
	      source = '' + source;
	      target = '' + target;

	      const sourceData = this._nodes.get(source);

	      if (!sourceData)
	        throw new NotFoundGraphError(
	          `Graph.${forEachName}:  could not find the "${source}" source node in the graph.`
	        );

	      if (!this._nodes.has(target))
	        throw new NotFoundGraphError(
	          `Graph.${forEachName}:  could not find the "${target}" target node in the graph.`
	        );

	      // Iterating over the edges between source & target
	      return forEachEdgeForPath(
	        false,
	        type,
	        this.multi,
	        direction,
	        sourceData,
	        target,
	        callback
	      );
	    }

	    throw new InvalidArgumentsGraphError(
	      `Graph.${forEachName}: too many arguments (expecting 1, 2 or 3 and got ${arguments.length}).`
	    );
	  };

	  /**
	   * Function mapping the graph's relevant edges by applying the given
	   * callback.
	   *
	   * Arity 1: Map all the relevant edges.
	   * @param  {function} callback - Callback to use.
	   *
	   * Arity 2: Map all of a node's relevant edges.
	   * @param  {any}      node     - Target node.
	   * @param  {function} callback - Callback to use.
	   *
	   * Arity 3: Map the relevant edges across the given path.
	   * @param  {any}      source   - Source node.
	   * @param  {any}      target   - Target node.
	   * @param  {function} callback - Callback to use.
	   *
	   * @return {undefined}
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  const mapName = 'map' + name[0].toUpperCase() + name.slice(1);

	  Class.prototype[mapName] = function () {
	    const args = Array.prototype.slice.call(arguments);
	    const callback = args.pop();

	    let result;

	    // We know the result length beforehand
	    if (args.length === 0) {
	      let length = 0;

	      if (type !== 'directed') length += this.undirectedSize;
	      if (type !== 'undirected') length += this.directedSize;

	      result = new Array(length);

	      let i = 0;

	      args.push((e, ea, s, t, sa, ta, u) => {
	        result[i++] = callback(e, ea, s, t, sa, ta, u);
	      });
	    }

	    // We don't know the result length beforehand
	    // TODO: we can in some instances of simple graphs, knowing degree
	    else {
	      result = [];

	      args.push((e, ea, s, t, sa, ta, u) => {
	        result.push(callback(e, ea, s, t, sa, ta, u));
	      });
	    }

	    this[forEachName].apply(this, args);

	    return result;
	  };

	  /**
	   * Function filtering the graph's relevant edges using the provided predicate
	   * function.
	   *
	   * Arity 1: Filter all the relevant edges.
	   * @param  {function} predicate - Predicate to use.
	   *
	   * Arity 2: Filter all of a node's relevant edges.
	   * @param  {any}      node      - Target node.
	   * @param  {function} predicate - Predicate to use.
	   *
	   * Arity 3: Filter the relevant edges across the given path.
	   * @param  {any}      source    - Source node.
	   * @param  {any}      target    - Target node.
	   * @param  {function} predicate - Predicate to use.
	   *
	   * @return {undefined}
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  const filterName = 'filter' + name[0].toUpperCase() + name.slice(1);

	  Class.prototype[filterName] = function () {
	    const args = Array.prototype.slice.call(arguments);
	    const callback = args.pop();

	    const result = [];

	    args.push((e, ea, s, t, sa, ta, u) => {
	      if (callback(e, ea, s, t, sa, ta, u)) result.push(e);
	    });

	    this[forEachName].apply(this, args);

	    return result;
	  };

	  /**
	   * Function reducing the graph's relevant edges using the provided accumulator
	   * function.
	   *
	   * Arity 1: Reduce all the relevant edges.
	   * @param  {function} accumulator  - Accumulator to use.
	   * @param  {any}      initialValue - Initial value.
	   *
	   * Arity 2: Reduce all of a node's relevant edges.
	   * @param  {any}      node         - Target node.
	   * @param  {function} accumulator  - Accumulator to use.
	   * @param  {any}      initialValue - Initial value.
	   *
	   * Arity 3: Reduce the relevant edges across the given path.
	   * @param  {any}      source       - Source node.
	   * @param  {any}      target       - Target node.
	   * @param  {function} accumulator  - Accumulator to use.
	   * @param  {any}      initialValue - Initial value.
	   *
	   * @return {undefined}
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  const reduceName = 'reduce' + name[0].toUpperCase() + name.slice(1);

	  Class.prototype[reduceName] = function () {
	    let args = Array.prototype.slice.call(arguments);

	    if (args.length < 2 || args.length > 4) {
	      throw new InvalidArgumentsGraphError(
	        `Graph.${reduceName}: invalid number of arguments (expecting 2, 3 or 4 and got ${args.length}).`
	      );
	    }

	    if (
	      typeof args[args.length - 1] === 'function' &&
	      typeof args[args.length - 2] !== 'function'
	    ) {
	      throw new InvalidArgumentsGraphError(
	        `Graph.${reduceName}: missing initial value. You must provide it because the callback takes more than one argument and we cannot infer the initial value from the first iteration, as you could with a simple array.`
	      );
	    }

	    let callback;
	    let initialValue;

	    if (args.length === 2) {
	      callback = args[0];
	      initialValue = args[1];
	      args = [];
	    } else if (args.length === 3) {
	      callback = args[1];
	      initialValue = args[2];
	      args = [args[0]];
	    } else if (args.length === 4) {
	      callback = args[2];
	      initialValue = args[3];
	      args = [args[0], args[1]];
	    }

	    let accumulator = initialValue;

	    args.push((e, ea, s, t, sa, ta, u) => {
	      accumulator = callback(accumulator, e, ea, s, t, sa, ta, u);
	    });

	    this[forEachName].apply(this, args);

	    return accumulator;
	  };
	}

	/**
	 * Function attaching a breakable edge callback iterator method to the Graph
	 * prototype.
	 *
	 * @param {function} Class       - Target class.
	 * @param {object}   description - Method description.
	 */
	function attachFindEdge(Class, description) {
	  const {name, type, direction} = description;

	  const findEdgeName = 'find' + name[0].toUpperCase() + name.slice(1, -1);

	  /**
	   * Function iterating over the graph's relevant edges in order to match
	   * one of them using the provided predicate function.
	   *
	   * Arity 1: Iterate over all the relevant edges.
	   * @param  {function} callback - Callback to use.
	   *
	   * Arity 2: Iterate over all of a node's relevant edges.
	   * @param  {any}      node     - Target node.
	   * @param  {function} callback - Callback to use.
	   *
	   * Arity 3: Iterate over the relevant edges across the given path.
	   * @param  {any}      source   - Source node.
	   * @param  {any}      target   - Target node.
	   * @param  {function} callback - Callback to use.
	   *
	   * @return {undefined}
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  Class.prototype[findEdgeName] = function (source, target, callback) {
	    // Early termination
	    if (type !== 'mixed' && this.type !== 'mixed' && type !== this.type)
	      return false;

	    if (arguments.length === 1) {
	      callback = source;
	      return forEachEdge(true, this, type, callback);
	    }

	    if (arguments.length === 2) {
	      source = '' + source;
	      callback = target;

	      const nodeData = this._nodes.get(source);

	      if (typeof nodeData === 'undefined')
	        throw new NotFoundGraphError(
	          `Graph.${findEdgeName}: could not find the "${source}" node in the graph.`
	        );

	      // Iterating over a node's edges
	      // TODO: maybe attach the sub method to the instance dynamically?
	      return forEachEdgeForNode(
	        true,
	        this.multi,
	        type === 'mixed' ? this.type : type,
	        direction,
	        nodeData,
	        callback
	      );
	    }

	    if (arguments.length === 3) {
	      source = '' + source;
	      target = '' + target;

	      const sourceData = this._nodes.get(source);

	      if (!sourceData)
	        throw new NotFoundGraphError(
	          `Graph.${findEdgeName}:  could not find the "${source}" source node in the graph.`
	        );

	      if (!this._nodes.has(target))
	        throw new NotFoundGraphError(
	          `Graph.${findEdgeName}:  could not find the "${target}" target node in the graph.`
	        );

	      // Iterating over the edges between source & target
	      return forEachEdgeForPath(
	        true,
	        type,
	        this.multi,
	        direction,
	        sourceData,
	        target,
	        callback
	      );
	    }

	    throw new InvalidArgumentsGraphError(
	      `Graph.${findEdgeName}: too many arguments (expecting 1, 2 or 3 and got ${arguments.length}).`
	    );
	  };

	  /**
	   * Function iterating over the graph's relevant edges in order to assert
	   * whether any one of them matches the provided predicate function.
	   *
	   * Arity 1: Iterate over all the relevant edges.
	   * @param  {function} callback - Callback to use.
	   *
	   * Arity 2: Iterate over all of a node's relevant edges.
	   * @param  {any}      node     - Target node.
	   * @param  {function} callback - Callback to use.
	   *
	   * Arity 3: Iterate over the relevant edges across the given path.
	   * @param  {any}      source   - Source node.
	   * @param  {any}      target   - Target node.
	   * @param  {function} callback - Callback to use.
	   *
	   * @return {undefined}
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  const someName = 'some' + name[0].toUpperCase() + name.slice(1, -1);

	  Class.prototype[someName] = function () {
	    const args = Array.prototype.slice.call(arguments);
	    const callback = args.pop();

	    args.push((e, ea, s, t, sa, ta, u) => {
	      return callback(e, ea, s, t, sa, ta, u);
	    });

	    const found = this[findEdgeName].apply(this, args);

	    if (found) return true;

	    return false;
	  };

	  /**
	   * Function iterating over the graph's relevant edges in order to assert
	   * whether all of them matche the provided predicate function.
	   *
	   * Arity 1: Iterate over all the relevant edges.
	   * @param  {function} callback - Callback to use.
	   *
	   * Arity 2: Iterate over all of a node's relevant edges.
	   * @param  {any}      node     - Target node.
	   * @param  {function} callback - Callback to use.
	   *
	   * Arity 3: Iterate over the relevant edges across the given path.
	   * @param  {any}      source   - Source node.
	   * @param  {any}      target   - Target node.
	   * @param  {function} callback - Callback to use.
	   *
	   * @return {undefined}
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  const everyName = 'every' + name[0].toUpperCase() + name.slice(1, -1);

	  Class.prototype[everyName] = function () {
	    const args = Array.prototype.slice.call(arguments);
	    const callback = args.pop();

	    args.push((e, ea, s, t, sa, ta, u) => {
	      return !callback(e, ea, s, t, sa, ta, u);
	    });

	    const found = this[findEdgeName].apply(this, args);

	    if (found) return false;

	    return true;
	  };
	}

	/**
	 * Function attaching an edge iterator method to the Graph prototype.
	 *
	 * @param {function} Class       - Target class.
	 * @param {object}   description - Method description.
	 */
	function attachEdgeIteratorCreator(Class, description) {
	  const {name: originalName, type, direction} = description;

	  const name = originalName.slice(0, -1) + 'Entries';

	  /**
	   * Function returning an iterator over the graph's edges.
	   *
	   * Arity 0: Iterate over all the relevant edges.
	   *
	   * Arity 1: Iterate over all of a node's relevant edges.
	   * @param  {any}   node   - Target node.
	   *
	   * Arity 2: Iterate over the relevant edges across the given path.
	   * @param  {any}   source - Source node.
	   * @param  {any}   target - Target node.
	   *
	   * @return {array|number} - The edges or the number of edges.
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  Class.prototype[name] = function (source, target) {
	    // Early termination
	    if (type !== 'mixed' && this.type !== 'mixed' && type !== this.type)
	      return Iterator$3.empty();

	    if (!arguments.length) return createEdgeIterator(this, type);

	    if (arguments.length === 1) {
	      source = '' + source;

	      const sourceData = this._nodes.get(source);

	      if (!sourceData)
	        throw new NotFoundGraphError(
	          `Graph.${name}: could not find the "${source}" node in the graph.`
	        );

	      // Iterating over a node's edges
	      return createEdgeIteratorForNode(type, direction, sourceData);
	    }

	    if (arguments.length === 2) {
	      source = '' + source;
	      target = '' + target;

	      const sourceData = this._nodes.get(source);

	      if (!sourceData)
	        throw new NotFoundGraphError(
	          `Graph.${name}:  could not find the "${source}" source node in the graph.`
	        );

	      if (!this._nodes.has(target))
	        throw new NotFoundGraphError(
	          `Graph.${name}:  could not find the "${target}" target node in the graph.`
	        );

	      // Iterating over the edges between source & target
	      return createEdgeIteratorForPath(type, direction, sourceData, target);
	    }

	    throw new InvalidArgumentsGraphError(
	      `Graph.${name}: too many arguments (expecting 0, 1 or 2 and got ${arguments.length}).`
	    );
	  };
	}

	/**
	 * Function attaching every edge iteration method to the Graph class.
	 *
	 * @param {function} Graph - Graph class.
	 */
	function attachEdgeIterationMethods(Graph) {
	  EDGES_ITERATION.forEach(description => {
	    attachEdgeArrayCreator(Graph, description);
	    attachForEachEdge(Graph, description);
	    attachFindEdge(Graph, description);
	    attachEdgeIteratorCreator(Graph, description);
	  });
	}

	/**
	 * Graphology Neighbor Iteration
	 * ==============================
	 *
	 * Attaching some methods to the Graph class to be able to iterate over
	 * neighbors.
	 */

	/**
	 * Definitions.
	 */
	const NEIGHBORS_ITERATION = [
	  {
	    name: 'neighbors',
	    type: 'mixed'
	  },
	  {
	    name: 'inNeighbors',
	    type: 'directed',
	    direction: 'in'
	  },
	  {
	    name: 'outNeighbors',
	    type: 'directed',
	    direction: 'out'
	  },
	  {
	    name: 'inboundNeighbors',
	    type: 'mixed',
	    direction: 'in'
	  },
	  {
	    name: 'outboundNeighbors',
	    type: 'mixed',
	    direction: 'out'
	  },
	  {
	    name: 'directedNeighbors',
	    type: 'directed'
	  },
	  {
	    name: 'undirectedNeighbors',
	    type: 'undirected'
	  }
	];

	/**
	 * Helpers.
	 */
	function CompositeSetWrapper() {
	  this.A = null;
	  this.B = null;
	}

	CompositeSetWrapper.prototype.wrap = function (set) {
	  if (this.A === null) this.A = set;
	  else if (this.B === null) this.B = set;
	};

	CompositeSetWrapper.prototype.has = function (key) {
	  if (this.A !== null && key in this.A) return true;
	  if (this.B !== null && key in this.B) return true;
	  return false;
	};

	/**
	 * Function iterating over the given node's relevant neighbors to match
	 * one of them using a predicated function.
	 *
	 * @param  {string}   type      - Type of neighbors.
	 * @param  {string}   direction - Direction.
	 * @param  {any}      nodeData  - Target node's data.
	 * @param  {function} callback  - Callback to use.
	 */
	function forEachInObjectOnce(breakable, visited, nodeData, object, callback) {
	  for (const k in object) {
	    const edgeData = object[k];

	    const sourceData = edgeData.source;
	    const targetData = edgeData.target;

	    const neighborData = sourceData === nodeData ? targetData : sourceData;

	    if (visited && visited.has(neighborData.key)) continue;

	    const shouldBreak = callback(neighborData.key, neighborData.attributes);

	    if (breakable && shouldBreak) return neighborData.key;
	  }

	  return;
	}

	function forEachNeighbor(breakable, type, direction, nodeData, callback) {
	  // If we want only undirected or in or out, we can roll some optimizations
	  if (type !== 'mixed') {
	    if (type === 'undirected')
	      return forEachInObjectOnce(
	        breakable,
	        null,
	        nodeData,
	        nodeData.undirected,
	        callback
	      );

	    if (typeof direction === 'string')
	      return forEachInObjectOnce(
	        breakable,
	        null,
	        nodeData,
	        nodeData[direction],
	        callback
	      );
	  }

	  // Else we need to keep a set of neighbors not to return duplicates
	  // We cheat by querying the other adjacencies
	  const visited = new CompositeSetWrapper();

	  let found;

	  if (type !== 'undirected') {
	    if (direction !== 'out') {
	      found = forEachInObjectOnce(
	        breakable,
	        null,
	        nodeData,
	        nodeData.in,
	        callback
	      );

	      if (breakable && found) return found;

	      visited.wrap(nodeData.in);
	    }
	    if (direction !== 'in') {
	      found = forEachInObjectOnce(
	        breakable,
	        visited,
	        nodeData,
	        nodeData.out,
	        callback
	      );

	      if (breakable && found) return found;

	      visited.wrap(nodeData.out);
	    }
	  }

	  if (type !== 'directed') {
	    found = forEachInObjectOnce(
	      breakable,
	      visited,
	      nodeData,
	      nodeData.undirected,
	      callback
	    );

	    if (breakable && found) return found;
	  }

	  return;
	}

	/**
	 * Function creating an array of relevant neighbors for the given node.
	 *
	 * @param  {string}       type      - Type of neighbors.
	 * @param  {string}       direction - Direction.
	 * @param  {any}          nodeData  - Target node's data.
	 * @return {Array}                  - The list of neighbors.
	 */
	function createNeighborArrayForNode(type, direction, nodeData) {
	  // If we want only undirected or in or out, we can roll some optimizations
	  if (type !== 'mixed') {
	    if (type === 'undirected') return Object.keys(nodeData.undirected);

	    if (typeof direction === 'string') return Object.keys(nodeData[direction]);
	  }

	  const neighbors = [];

	  forEachNeighbor(false, type, direction, nodeData, function (key) {
	    neighbors.push(key);
	  });

	  return neighbors;
	}

	/**
	 * Function returning an iterator over the given node's relevant neighbors.
	 *
	 * @param  {string}   type      - Type of neighbors.
	 * @param  {string}   direction - Direction.
	 * @param  {any}      nodeData  - Target node's data.
	 * @return {Iterator}
	 */
	function createDedupedObjectIterator(visited, nodeData, object) {
	  const keys = Object.keys(object);
	  const l = keys.length;

	  let i = 0;

	  return new Iterator$3(function next() {
	    let neighborData = null;

	    do {
	      if (i >= l) {
	        if (visited) visited.wrap(object);
	        return {done: true};
	      }

	      const edgeData = object[keys[i++]];

	      const sourceData = edgeData.source;
	      const targetData = edgeData.target;

	      neighborData = sourceData === nodeData ? targetData : sourceData;

	      if (visited && visited.has(neighborData.key)) {
	        neighborData = null;
	        continue;
	      }
	    } while (neighborData === null);

	    return {
	      done: false,
	      value: {neighbor: neighborData.key, attributes: neighborData.attributes}
	    };
	  });
	}

	function createNeighborIterator(type, direction, nodeData) {
	  // If we want only undirected or in or out, we can roll some optimizations
	  if (type !== 'mixed') {
	    if (type === 'undirected')
	      return createDedupedObjectIterator(null, nodeData, nodeData.undirected);

	    if (typeof direction === 'string')
	      return createDedupedObjectIterator(null, nodeData, nodeData[direction]);
	  }

	  let iterator = Iterator$3.empty();

	  // Else we need to keep a set of neighbors not to return duplicates
	  // We cheat by querying the other adjacencies
	  const visited = new CompositeSetWrapper();

	  if (type !== 'undirected') {
	    if (direction !== 'out') {
	      iterator = chain$1(
	        iterator,
	        createDedupedObjectIterator(visited, nodeData, nodeData.in)
	      );
	    }
	    if (direction !== 'in') {
	      iterator = chain$1(
	        iterator,
	        createDedupedObjectIterator(visited, nodeData, nodeData.out)
	      );
	    }
	  }

	  if (type !== 'directed') {
	    iterator = chain$1(
	      iterator,
	      createDedupedObjectIterator(visited, nodeData, nodeData.undirected)
	    );
	  }

	  return iterator;
	}

	/**
	 * Function attaching a neighbors array creator method to the Graph prototype.
	 *
	 * @param {function} Class       - Target class.
	 * @param {object}   description - Method description.
	 */
	function attachNeighborArrayCreator(Class, description) {
	  const {name, type, direction} = description;

	  /**
	   * Function returning an array of certain neighbors.
	   *
	   * @param  {any}   node   - Target node.
	   * @return {array} - The neighbors of neighbors.
	   *
	   * @throws {Error} - Will throw if node is not found in the graph.
	   */
	  Class.prototype[name] = function (node) {
	    // Early termination
	    if (type !== 'mixed' && this.type !== 'mixed' && type !== this.type)
	      return [];

	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (typeof nodeData === 'undefined')
	      throw new NotFoundGraphError(
	        `Graph.${name}: could not find the "${node}" node in the graph.`
	      );

	    // Here, we want to iterate over a node's relevant neighbors
	    return createNeighborArrayForNode(
	      type === 'mixed' ? this.type : type,
	      direction,
	      nodeData
	    );
	  };
	}

	/**
	 * Function attaching a neighbors callback iterator method to the Graph prototype.
	 *
	 * @param {function} Class       - Target class.
	 * @param {object}   description - Method description.
	 */
	function attachForEachNeighbor(Class, description) {
	  const {name, type, direction} = description;

	  const forEachName = 'forEach' + name[0].toUpperCase() + name.slice(1, -1);

	  /**
	   * Function iterating over all the relevant neighbors using a callback.
	   *
	   * @param  {any}      node     - Target node.
	   * @param  {function} callback - Callback to use.
	   * @return {undefined}
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  Class.prototype[forEachName] = function (node, callback) {
	    // Early termination
	    if (type !== 'mixed' && this.type !== 'mixed' && type !== this.type) return;

	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (typeof nodeData === 'undefined')
	      throw new NotFoundGraphError(
	        `Graph.${forEachName}: could not find the "${node}" node in the graph.`
	      );

	    // Here, we want to iterate over a node's relevant neighbors
	    forEachNeighbor(
	      false,
	      type === 'mixed' ? this.type : type,
	      direction,
	      nodeData,
	      callback
	    );
	  };

	  /**
	   * Function mapping the relevant neighbors using a callback.
	   *
	   * @param  {any}      node     - Target node.
	   * @param  {function} callback - Callback to use.
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  const mapName = 'map' + name[0].toUpperCase() + name.slice(1);

	  Class.prototype[mapName] = function (node, callback) {
	    // TODO: optimize when size is known beforehand
	    const result = [];

	    this[forEachName](node, (n, a) => {
	      result.push(callback(n, a));
	    });

	    return result;
	  };

	  /**
	   * Function filtering the relevant neighbors using a callback.
	   *
	   * @param  {any}      node     - Target node.
	   * @param  {function} callback - Callback to use.
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  const filterName = 'filter' + name[0].toUpperCase() + name.slice(1);

	  Class.prototype[filterName] = function (node, callback) {
	    const result = [];

	    this[forEachName](node, (n, a) => {
	      if (callback(n, a)) result.push(n);
	    });

	    return result;
	  };

	  /**
	   * Function reducing the relevant neighbors using a callback.
	   *
	   * @param  {any}      node     - Target node.
	   * @param  {function} callback - Callback to use.
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  const reduceName = 'reduce' + name[0].toUpperCase() + name.slice(1);

	  Class.prototype[reduceName] = function (node, callback, initialValue) {
	    if (arguments.length < 3)
	      throw new InvalidArgumentsGraphError(
	        `Graph.${reduceName}: missing initial value. You must provide it because the callback takes more than one argument and we cannot infer the initial value from the first iteration, as you could with a simple array.`
	      );

	    let accumulator = initialValue;

	    this[forEachName](node, (n, a) => {
	      accumulator = callback(accumulator, n, a);
	    });

	    return accumulator;
	  };
	}

	/**
	 * Function attaching a breakable neighbors callback iterator method to the
	 * Graph prototype.
	 *
	 * @param {function} Class       - Target class.
	 * @param {object}   description - Method description.
	 */
	function attachFindNeighbor(Class, description) {
	  const {name, type, direction} = description;

	  const capitalizedSingular = name[0].toUpperCase() + name.slice(1, -1);

	  const findName = 'find' + capitalizedSingular;

	  /**
	   * Function iterating over all the relevant neighbors using a callback.
	   *
	   * @param  {any}      node     - Target node.
	   * @param  {function} callback - Callback to use.
	   * @return {undefined}
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  Class.prototype[findName] = function (node, callback) {
	    // Early termination
	    if (type !== 'mixed' && this.type !== 'mixed' && type !== this.type) return;

	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (typeof nodeData === 'undefined')
	      throw new NotFoundGraphError(
	        `Graph.${findName}: could not find the "${node}" node in the graph.`
	      );

	    // Here, we want to iterate over a node's relevant neighbors
	    return forEachNeighbor(
	      true,
	      type === 'mixed' ? this.type : type,
	      direction,
	      nodeData,
	      callback
	    );
	  };

	  /**
	   * Function iterating over all the relevant neighbors to find if any of them
	   * matches the given predicate.
	   *
	   * @param  {any}      node     - Target node.
	   * @param  {function} callback - Callback to use.
	   * @return {boolean}
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  const someName = 'some' + capitalizedSingular;

	  Class.prototype[someName] = function (node, callback) {
	    const found = this[findName](node, callback);

	    if (found) return true;

	    return false;
	  };

	  /**
	   * Function iterating over all the relevant neighbors to find if all of them
	   * matche the given predicate.
	   *
	   * @param  {any}      node     - Target node.
	   * @param  {function} callback - Callback to use.
	   * @return {boolean}
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  const everyName = 'every' + capitalizedSingular;

	  Class.prototype[everyName] = function (node, callback) {
	    const found = this[findName](node, (n, a) => {
	      return !callback(n, a);
	    });

	    if (found) return false;

	    return true;
	  };
	}

	/**
	 * Function attaching a neighbors callback iterator method to the Graph prototype.
	 *
	 * @param {function} Class       - Target class.
	 * @param {object}   description - Method description.
	 */
	function attachNeighborIteratorCreator(Class, description) {
	  const {name, type, direction} = description;

	  const iteratorName = name.slice(0, -1) + 'Entries';

	  /**
	   * Function returning an iterator over all the relevant neighbors.
	   *
	   * @param  {any}      node     - Target node.
	   * @return {Iterator}
	   *
	   * @throws {Error} - Will throw if there are too many arguments.
	   */
	  Class.prototype[iteratorName] = function (node) {
	    // Early termination
	    if (type !== 'mixed' && this.type !== 'mixed' && type !== this.type)
	      return Iterator$3.empty();

	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (typeof nodeData === 'undefined')
	      throw new NotFoundGraphError(
	        `Graph.${iteratorName}: could not find the "${node}" node in the graph.`
	      );

	    // Here, we want to iterate over a node's relevant neighbors
	    return createNeighborIterator(
	      type === 'mixed' ? this.type : type,
	      direction,
	      nodeData
	    );
	  };
	}

	/**
	 * Function attaching every neighbor iteration method to the Graph class.
	 *
	 * @param {function} Graph - Graph class.
	 */
	function attachNeighborIterationMethods(Graph) {
	  NEIGHBORS_ITERATION.forEach(description => {
	    attachNeighborArrayCreator(Graph, description);
	    attachForEachNeighbor(Graph, description);
	    attachFindNeighbor(Graph, description);
	    attachNeighborIteratorCreator(Graph, description);
	  });
	}

	/**
	 * Graphology Adjacency Iteration
	 * ===============================
	 *
	 * Attaching some methods to the Graph class to be able to iterate over a
	 * graph's adjacency.
	 */

	/**
	 * Function iterating over a simple graph's adjacency using a callback.
	 *
	 * @param {boolean}  breakable         - Can we break?
	 * @param {boolean}  assymetric        - Whether to emit undirected edges only once.
	 * @param {boolean}  disconnectedNodes - Whether to emit disconnected nodes.
	 * @param {Graph}    graph             - Target Graph instance.
	 * @param {callback} function          - Iteration callback.
	 */
	function forEachAdjacency(
	  breakable,
	  assymetric,
	  disconnectedNodes,
	  graph,
	  callback
	) {
	  const iterator = graph._nodes.values();

	  const type = graph.type;

	  let step, sourceData, neighbor, adj, edgeData, targetData;

	  while (((step = iterator.next()), step.done !== true)) {
	    let hasEdges = false;

	    sourceData = step.value;

	    if (type !== 'undirected') {
	      adj = sourceData.out;

	      for (neighbor in adj) {
	        edgeData = adj[neighbor];

	        do {
	          targetData = edgeData.target;

	          hasEdges = true;
	          callback(
	            sourceData.key,
	            targetData.key,
	            sourceData.attributes,
	            targetData.attributes,
	            edgeData.key,
	            edgeData.attributes,
	            edgeData.undirected
	          );

	          edgeData = edgeData.next;
	        } while (edgeData);
	      }
	    }

	    if (type !== 'directed') {
	      adj = sourceData.undirected;

	      for (neighbor in adj) {
	        if (assymetric && sourceData.key > neighbor) continue;

	        edgeData = adj[neighbor];

	        do {
	          targetData = edgeData.target;

	          if (targetData.key !== neighbor) targetData = edgeData.source;

	          hasEdges = true;
	          callback(
	            sourceData.key,
	            targetData.key,
	            sourceData.attributes,
	            targetData.attributes,
	            edgeData.key,
	            edgeData.attributes,
	            edgeData.undirected
	          );

	          edgeData = edgeData.next;
	        } while (edgeData);
	      }
	    }

	    if (disconnectedNodes && !hasEdges) {
	      callback(
	        sourceData.key,
	        null,
	        sourceData.attributes,
	        null,
	        null,
	        null,
	        null
	      );
	    }
	  }

	  return;
	}

	/**
	 * Graphology Serialization Utilities
	 * ===================================
	 *
	 * Collection of functions used by the graph serialization schemes.
	 */

	/**
	 * Formats internal node data into a serialized node.
	 *
	 * @param  {any}    key  - The node's key.
	 * @param  {object} data - Internal node's data.
	 * @return {array}       - The serialized node.
	 */
	function serializeNode(key, data) {
	  const serialized = {key};

	  if (!isEmpty(data.attributes))
	    serialized.attributes = assign$1({}, data.attributes);

	  return serialized;
	}

	/**
	 * Formats internal edge data into a serialized edge.
	 *
	 * @param  {string} type - The graph's type.
	 * @param  {any}    key  - The edge's key.
	 * @param  {object} data - Internal edge's data.
	 * @return {array}       - The serialized edge.
	 */
	function serializeEdge(type, key, data) {
	  const serialized = {
	    key,
	    source: data.source.key,
	    target: data.target.key
	  };

	  if (!isEmpty(data.attributes))
	    serialized.attributes = assign$1({}, data.attributes);

	  if (type === 'mixed' && data.undirected) serialized.undirected = true;

	  return serialized;
	}

	/**
	 * Checks whether the given value is a serialized node.
	 *
	 * @param  {mixed} value - Target value.
	 * @return {string|null}
	 */
	function validateSerializedNode(value) {
	  if (!isPlainObject(value))
	    throw new InvalidArgumentsGraphError(
	      'Graph.import: invalid serialized node. A serialized node should be a plain object with at least a "key" property.'
	    );

	  if (!('key' in value))
	    throw new InvalidArgumentsGraphError(
	      'Graph.import: serialized node is missing its key.'
	    );

	  if (
	    'attributes' in value &&
	    (!isPlainObject(value.attributes) || value.attributes === null)
	  )
	    throw new InvalidArgumentsGraphError(
	      'Graph.import: invalid attributes. Attributes should be a plain object, null or omitted.'
	    );
	}

	/**
	 * Checks whether the given value is a serialized edge.
	 *
	 * @param  {mixed} value - Target value.
	 * @return {string|null}
	 */
	function validateSerializedEdge(value) {
	  if (!isPlainObject(value))
	    throw new InvalidArgumentsGraphError(
	      'Graph.import: invalid serialized edge. A serialized edge should be a plain object with at least a "source" & "target" property.'
	    );

	  if (!('source' in value))
	    throw new InvalidArgumentsGraphError(
	      'Graph.import: serialized edge is missing its source.'
	    );

	  if (!('target' in value))
	    throw new InvalidArgumentsGraphError(
	      'Graph.import: serialized edge is missing its target.'
	    );

	  if (
	    'attributes' in value &&
	    (!isPlainObject(value.attributes) || value.attributes === null)
	  )
	    throw new InvalidArgumentsGraphError(
	      'Graph.import: invalid attributes. Attributes should be a plain object, null or omitted.'
	    );

	  if ('undirected' in value && typeof value.undirected !== 'boolean')
	    throw new InvalidArgumentsGraphError(
	      'Graph.import: invalid undirectedness information. Undirected should be boolean or omitted.'
	    );
	}

	/* eslint no-nested-ternary: 0 */

	/**
	 * Constants.
	 */
	const INSTANCE_ID = incrementalIdStartingFromRandomByte();

	/**
	 * Enums.
	 */
	const TYPES = new Set(['directed', 'undirected', 'mixed']);

	const EMITTER_PROPS = new Set([
	  'domain',
	  '_events',
	  '_eventsCount',
	  '_maxListeners'
	]);

	const EDGE_ADD_METHODS = [
	  {
	    name: verb => `${verb}Edge`,
	    generateKey: true
	  },
	  {
	    name: verb => `${verb}DirectedEdge`,
	    generateKey: true,
	    type: 'directed'
	  },
	  {
	    name: verb => `${verb}UndirectedEdge`,
	    generateKey: true,
	    type: 'undirected'
	  },
	  {
	    name: verb => `${verb}EdgeWithKey`
	  },
	  {
	    name: verb => `${verb}DirectedEdgeWithKey`,
	    type: 'directed'
	  },
	  {
	    name: verb => `${verb}UndirectedEdgeWithKey`,
	    type: 'undirected'
	  }
	];

	/**
	 * Default options.
	 */
	const DEFAULTS = {
	  allowSelfLoops: true,
	  multi: false,
	  type: 'mixed'
	};

	/**
	 * Abstract functions used by the Graph class for various methods.
	 */

	/**
	 * Internal method used to add a node to the given graph
	 *
	 * @param  {Graph}   graph           - Target graph.
	 * @param  {any}     node            - The node's key.
	 * @param  {object}  [attributes]    - Optional attributes.
	 * @return {NodeData}                - Created node data.
	 */
	function addNode(graph, node, attributes) {
	  if (attributes && !isPlainObject(attributes))
	    throw new InvalidArgumentsGraphError(
	      `Graph.addNode: invalid attributes. Expecting an object but got "${attributes}"`
	    );

	  // String coercion
	  node = '' + node;
	  attributes = attributes || {};

	  if (graph._nodes.has(node))
	    throw new UsageGraphError(
	      `Graph.addNode: the "${node}" node already exist in the graph.`
	    );

	  const data = new graph.NodeDataClass(node, attributes);

	  // Adding the node to internal register
	  graph._nodes.set(node, data);

	  // Emitting
	  graph.emit('nodeAdded', {
	    key: node,
	    attributes
	  });

	  return data;
	}

	/**
	 * Same as the above but without sanity checks because we call this in contexts
	 * where necessary checks were already done.
	 */
	function unsafeAddNode(graph, node, attributes) {
	  const data = new graph.NodeDataClass(node, attributes);

	  graph._nodes.set(node, data);

	  graph.emit('nodeAdded', {
	    key: node,
	    attributes
	  });

	  return data;
	}

	/**
	 * Internal method used to add an arbitrary edge to the given graph.
	 *
	 * @param  {Graph}   graph           - Target graph.
	 * @param  {string}  name            - Name of the child method for errors.
	 * @param  {boolean} mustGenerateKey - Should the graph generate an id?
	 * @param  {boolean} undirected      - Whether the edge is undirected.
	 * @param  {any}     edge            - The edge's key.
	 * @param  {any}     source          - The source node.
	 * @param  {any}     target          - The target node.
	 * @param  {object}  [attributes]    - Optional attributes.
	 * @return {any}                     - The edge.
	 *
	 * @throws {Error} - Will throw if the graph is of the wrong type.
	 * @throws {Error} - Will throw if the given attributes are not an object.
	 * @throws {Error} - Will throw if source or target doesn't exist.
	 * @throws {Error} - Will throw if the edge already exist.
	 */
	function addEdge(
	  graph,
	  name,
	  mustGenerateKey,
	  undirected,
	  edge,
	  source,
	  target,
	  attributes
	) {
	  // Checking validity of operation
	  if (!undirected && graph.type === 'undirected')
	    throw new UsageGraphError(
	      `Graph.${name}: you cannot add a directed edge to an undirected graph. Use the #.addEdge or #.addUndirectedEdge instead.`
	    );

	  if (undirected && graph.type === 'directed')
	    throw new UsageGraphError(
	      `Graph.${name}: you cannot add an undirected edge to a directed graph. Use the #.addEdge or #.addDirectedEdge instead.`
	    );

	  if (attributes && !isPlainObject(attributes))
	    throw new InvalidArgumentsGraphError(
	      `Graph.${name}: invalid attributes. Expecting an object but got "${attributes}"`
	    );

	  // Coercion of source & target:
	  source = '' + source;
	  target = '' + target;
	  attributes = attributes || {};

	  if (!graph.allowSelfLoops && source === target)
	    throw new UsageGraphError(
	      `Graph.${name}: source & target are the same ("${source}"), thus creating a loop explicitly forbidden by this graph 'allowSelfLoops' option set to false.`
	    );

	  const sourceData = graph._nodes.get(source),
	    targetData = graph._nodes.get(target);

	  if (!sourceData)
	    throw new NotFoundGraphError(
	      `Graph.${name}: source node "${source}" not found.`
	    );

	  if (!targetData)
	    throw new NotFoundGraphError(
	      `Graph.${name}: target node "${target}" not found.`
	    );

	  // Must the graph generate an id for this edge?
	  const eventData = {
	    key: null,
	    undirected,
	    source,
	    target,
	    attributes
	  };

	  if (mustGenerateKey) {
	    // NOTE: in this case we can guarantee that the key does not already
	    // exist and is already correctly casted as a string
	    edge = graph._edgeKeyGenerator();
	  } else {
	    // Coercion of edge key
	    edge = '' + edge;

	    // Here, we have a key collision
	    if (graph._edges.has(edge))
	      throw new UsageGraphError(
	        `Graph.${name}: the "${edge}" edge already exists in the graph.`
	      );
	  }

	  // Here, we might have a source / target collision
	  if (
	    !graph.multi &&
	    (undirected
	      ? typeof sourceData.undirected[target] !== 'undefined'
	      : typeof sourceData.out[target] !== 'undefined')
	  ) {
	    throw new UsageGraphError(
	      `Graph.${name}: an edge linking "${source}" to "${target}" already exists. If you really want to add multiple edges linking those nodes, you should create a multi graph by using the 'multi' option.`
	    );
	  }

	  // Storing some data
	  const edgeData = new EdgeData(
	    undirected,
	    edge,
	    sourceData,
	    targetData,
	    attributes
	  );

	  // Adding the edge to the internal register
	  graph._edges.set(edge, edgeData);

	  // Incrementing node degree counters
	  const isSelfLoop = source === target;

	  if (undirected) {
	    sourceData.undirectedDegree++;
	    targetData.undirectedDegree++;

	    if (isSelfLoop) {
	      sourceData.undirectedLoops++;
	      graph._undirectedSelfLoopCount++;
	    }
	  } else {
	    sourceData.outDegree++;
	    targetData.inDegree++;

	    if (isSelfLoop) {
	      sourceData.directedLoops++;
	      graph._directedSelfLoopCount++;
	    }
	  }

	  // Updating relevant index
	  if (graph.multi) edgeData.attachMulti();
	  else edgeData.attach();

	  if (undirected) graph._undirectedSize++;
	  else graph._directedSize++;

	  // Emitting
	  eventData.key = edge;

	  graph.emit('edgeAdded', eventData);

	  return edge;
	}

	/**
	 * Internal method used to add an arbitrary edge to the given graph.
	 *
	 * @param  {Graph}   graph           - Target graph.
	 * @param  {string}  name            - Name of the child method for errors.
	 * @param  {boolean} mustGenerateKey - Should the graph generate an id?
	 * @param  {boolean} undirected      - Whether the edge is undirected.
	 * @param  {any}     edge            - The edge's key.
	 * @param  {any}     source          - The source node.
	 * @param  {any}     target          - The target node.
	 * @param  {object}  [attributes]    - Optional attributes.
	 * @param  {boolean} [asUpdater]       - Are we updating or merging?
	 * @return {any}                     - The edge.
	 *
	 * @throws {Error} - Will throw if the graph is of the wrong type.
	 * @throws {Error} - Will throw if the given attributes are not an object.
	 * @throws {Error} - Will throw if source or target doesn't exist.
	 * @throws {Error} - Will throw if the edge already exist.
	 */
	function mergeEdge(
	  graph,
	  name,
	  mustGenerateKey,
	  undirected,
	  edge,
	  source,
	  target,
	  attributes,
	  asUpdater
	) {
	  // Checking validity of operation
	  if (!undirected && graph.type === 'undirected')
	    throw new UsageGraphError(
	      `Graph.${name}: you cannot merge/update a directed edge to an undirected graph. Use the #.mergeEdge/#.updateEdge or #.addUndirectedEdge instead.`
	    );

	  if (undirected && graph.type === 'directed')
	    throw new UsageGraphError(
	      `Graph.${name}: you cannot merge/update an undirected edge to a directed graph. Use the #.mergeEdge/#.updateEdge or #.addDirectedEdge instead.`
	    );

	  if (attributes) {
	    if (asUpdater) {
	      if (typeof attributes !== 'function')
	        throw new InvalidArgumentsGraphError(
	          `Graph.${name}: invalid updater function. Expecting a function but got "${attributes}"`
	        );
	    } else {
	      if (!isPlainObject(attributes))
	        throw new InvalidArgumentsGraphError(
	          `Graph.${name}: invalid attributes. Expecting an object but got "${attributes}"`
	        );
	    }
	  }

	  // Coercion of source & target:
	  source = '' + source;
	  target = '' + target;

	  let updater;

	  if (asUpdater) {
	    updater = attributes;
	    attributes = undefined;
	  }

	  if (!graph.allowSelfLoops && source === target)
	    throw new UsageGraphError(
	      `Graph.${name}: source & target are the same ("${source}"), thus creating a loop explicitly forbidden by this graph 'allowSelfLoops' option set to false.`
	    );

	  let sourceData = graph._nodes.get(source);
	  let targetData = graph._nodes.get(target);
	  let edgeData;

	  // Do we need to handle duplicate?
	  let alreadyExistingEdgeData;

	  if (!mustGenerateKey) {
	    edgeData = graph._edges.get(edge);

	    if (edgeData) {
	      // Here, we need to ensure, if the user gave a key, that source & target
	      // are consistent
	      if (edgeData.source.key !== source || edgeData.target.key !== target) {
	        // If source or target inconsistent
	        if (
	          !undirected ||
	          edgeData.source.key !== target ||
	          edgeData.target.key !== source
	        ) {
	          // If directed, or source/target aren't flipped
	          throw new UsageGraphError(
	            `Graph.${name}: inconsistency detected when attempting to merge the "${edge}" edge with "${source}" source & "${target}" target vs. ("${edgeData.source.key}", "${edgeData.target.key}").`
	          );
	        }
	      }

	      alreadyExistingEdgeData = edgeData;
	    }
	  }

	  // Here, we might have a source / target collision
	  if (!alreadyExistingEdgeData && !graph.multi && sourceData) {
	    alreadyExistingEdgeData = undirected
	      ? sourceData.undirected[target]
	      : sourceData.out[target];
	  }

	  // Handling duplicates
	  if (alreadyExistingEdgeData) {
	    const info = [alreadyExistingEdgeData.key, false, false, false];

	    // We can skip the attribute merging part if the user did not provide them
	    if (asUpdater ? !updater : !attributes) return info;

	    // Updating the attributes
	    if (asUpdater) {
	      const oldAttributes = alreadyExistingEdgeData.attributes;
	      alreadyExistingEdgeData.attributes = updater(oldAttributes);

	      graph.emit('edgeAttributesUpdated', {
	        type: 'replace',
	        key: alreadyExistingEdgeData.key,
	        attributes: alreadyExistingEdgeData.attributes
	      });
	    }

	    // Merging the attributes
	    else {
	      assign$1(alreadyExistingEdgeData.attributes, attributes);

	      graph.emit('edgeAttributesUpdated', {
	        type: 'merge',
	        key: alreadyExistingEdgeData.key,
	        attributes: alreadyExistingEdgeData.attributes,
	        data: attributes
	      });
	    }

	    return info;
	  }

	  attributes = attributes || {};

	  if (asUpdater && updater) attributes = updater(attributes);

	  // Must the graph generate an id for this edge?
	  const eventData = {
	    key: null,
	    undirected,
	    source,
	    target,
	    attributes
	  };

	  if (mustGenerateKey) {
	    // NOTE: in this case we can guarantee that the key does not already
	    // exist and is already correctly casted as a string
	    edge = graph._edgeKeyGenerator();
	  } else {
	    // Coercion of edge key
	    edge = '' + edge;

	    // Here, we have a key collision
	    if (graph._edges.has(edge))
	      throw new UsageGraphError(
	        `Graph.${name}: the "${edge}" edge already exists in the graph.`
	      );
	  }

	  let sourceWasAdded = false;
	  let targetWasAdded = false;

	  if (!sourceData) {
	    sourceData = unsafeAddNode(graph, source, {});
	    sourceWasAdded = true;

	    if (source === target) {
	      targetData = sourceData;
	      targetWasAdded = true;
	    }
	  }
	  if (!targetData) {
	    targetData = unsafeAddNode(graph, target, {});
	    targetWasAdded = true;
	  }

	  // Storing some data
	  edgeData = new EdgeData(undirected, edge, sourceData, targetData, attributes);

	  // Adding the edge to the internal register
	  graph._edges.set(edge, edgeData);

	  // Incrementing node degree counters
	  const isSelfLoop = source === target;

	  if (undirected) {
	    sourceData.undirectedDegree++;
	    targetData.undirectedDegree++;

	    if (isSelfLoop) {
	      sourceData.undirectedLoops++;
	      graph._undirectedSelfLoopCount++;
	    }
	  } else {
	    sourceData.outDegree++;
	    targetData.inDegree++;

	    if (isSelfLoop) {
	      sourceData.directedLoops++;
	      graph._directedSelfLoopCount++;
	    }
	  }

	  // Updating relevant index
	  if (graph.multi) edgeData.attachMulti();
	  else edgeData.attach();

	  if (undirected) graph._undirectedSize++;
	  else graph._directedSize++;

	  // Emitting
	  eventData.key = edge;

	  graph.emit('edgeAdded', eventData);

	  return [edge, true, sourceWasAdded, targetWasAdded];
	}

	/**
	 * Internal method used to drop an edge.
	 *
	 * @param  {Graph}    graph    - Target graph.
	 * @param  {EdgeData} edgeData - Data of the edge to drop.
	 */
	function dropEdgeFromData(graph, edgeData) {
	  // Dropping the edge from the register
	  graph._edges.delete(edgeData.key);

	  // Updating related degrees
	  const {source: sourceData, target: targetData, attributes} = edgeData;

	  const undirected = edgeData.undirected;

	  const isSelfLoop = sourceData === targetData;

	  if (undirected) {
	    sourceData.undirectedDegree--;
	    targetData.undirectedDegree--;

	    if (isSelfLoop) {
	      sourceData.undirectedLoops--;
	      graph._undirectedSelfLoopCount--;
	    }
	  } else {
	    sourceData.outDegree--;
	    targetData.inDegree--;

	    if (isSelfLoop) {
	      sourceData.directedLoops--;
	      graph._directedSelfLoopCount--;
	    }
	  }

	  // Clearing index
	  if (graph.multi) edgeData.detachMulti();
	  else edgeData.detach();

	  if (undirected) graph._undirectedSize--;
	  else graph._directedSize--;

	  // Emitting
	  graph.emit('edgeDropped', {
	    key: edgeData.key,
	    attributes,
	    source: sourceData.key,
	    target: targetData.key,
	    undirected
	  });
	}

	/**
	 * Graph class
	 *
	 * @constructor
	 * @param  {object}  [options] - Options:
	 * @param  {boolean}   [allowSelfLoops] - Allow self loops?
	 * @param  {string}    [type]           - Type of the graph.
	 * @param  {boolean}   [map]            - Allow references as keys?
	 * @param  {boolean}   [multi]          - Allow parallel edges?
	 *
	 * @throws {Error} - Will throw if the arguments are not valid.
	 */
	class Graph extends events.EventEmitter {
	  constructor(options) {
	    super();

	    //-- Solving options
	    options = assign$1({}, DEFAULTS, options);

	    // Enforcing options validity
	    if (typeof options.multi !== 'boolean')
	      throw new InvalidArgumentsGraphError(
	        `Graph.constructor: invalid 'multi' option. Expecting a boolean but got "${options.multi}".`
	      );

	    if (!TYPES.has(options.type))
	      throw new InvalidArgumentsGraphError(
	        `Graph.constructor: invalid 'type' option. Should be one of "mixed", "directed" or "undirected" but got "${options.type}".`
	      );

	    if (typeof options.allowSelfLoops !== 'boolean')
	      throw new InvalidArgumentsGraphError(
	        `Graph.constructor: invalid 'allowSelfLoops' option. Expecting a boolean but got "${options.allowSelfLoops}".`
	      );

	    //-- Private properties

	    // Utilities
	    const NodeDataClass =
	      options.type === 'mixed'
	        ? MixedNodeData
	        : options.type === 'directed'
	        ? DirectedNodeData
	        : UndirectedNodeData;

	    privateProperty(this, 'NodeDataClass', NodeDataClass);

	    // Internal edge key generator

	    // NOTE: this internal generator produce keys that are strings
	    // composed of a weird prefix, an incremental instance id starting from
	    // a random byte and finally an internal instance incremental id.
	    // All this to avoid intra-frame and cross-frame adversarial inputs
	    // that can force a single #.addEdge call to degenerate into a O(n)
	    // available key search loop.

	    // It also ensures that automatically generated edge keys are unlikely
	    // to produce collisions with arbitrary keys given by users.
	    const instancePrefix = 'geid_' + INSTANCE_ID() + '_';
	    let edgeId = 0;

	    const edgeKeyGenerator = () => {
	      let availableEdgeKey;

	      do {
	        availableEdgeKey = instancePrefix + edgeId++;
	      } while (this._edges.has(availableEdgeKey));

	      return availableEdgeKey;
	    };

	    // Indexes
	    privateProperty(this, '_attributes', {});
	    privateProperty(this, '_nodes', new Map());
	    privateProperty(this, '_edges', new Map());
	    privateProperty(this, '_directedSize', 0);
	    privateProperty(this, '_undirectedSize', 0);
	    privateProperty(this, '_directedSelfLoopCount', 0);
	    privateProperty(this, '_undirectedSelfLoopCount', 0);
	    privateProperty(this, '_edgeKeyGenerator', edgeKeyGenerator);

	    // Options
	    privateProperty(this, '_options', options);

	    // Emitter properties
	    EMITTER_PROPS.forEach(prop => privateProperty(this, prop, this[prop]));

	    //-- Properties readers
	    readOnlyProperty(this, 'order', () => this._nodes.size);
	    readOnlyProperty(this, 'size', () => this._edges.size);
	    readOnlyProperty(this, 'directedSize', () => this._directedSize);
	    readOnlyProperty(this, 'undirectedSize', () => this._undirectedSize);
	    readOnlyProperty(
	      this,
	      'selfLoopCount',
	      () => this._directedSelfLoopCount + this._undirectedSelfLoopCount
	    );
	    readOnlyProperty(
	      this,
	      'directedSelfLoopCount',
	      () => this._directedSelfLoopCount
	    );
	    readOnlyProperty(
	      this,
	      'undirectedSelfLoopCount',
	      () => this._undirectedSelfLoopCount
	    );
	    readOnlyProperty(this, 'multi', this._options.multi);
	    readOnlyProperty(this, 'type', this._options.type);
	    readOnlyProperty(this, 'allowSelfLoops', this._options.allowSelfLoops);
	    readOnlyProperty(this, 'implementation', () => 'graphology');
	  }

	  _resetInstanceCounters() {
	    this._directedSize = 0;
	    this._undirectedSize = 0;
	    this._directedSelfLoopCount = 0;
	    this._undirectedSelfLoopCount = 0;
	  }

	  /**---------------------------------------------------------------------------
	   * Read
	   **---------------------------------------------------------------------------
	   */

	  /**
	   * Method returning whether the given node is found in the graph.
	   *
	   * @param  {any}     node - The node.
	   * @return {boolean}
	   */
	  hasNode(node) {
	    return this._nodes.has('' + node);
	  }

	  /**
	   * Method returning whether the given directed edge is found in the graph.
	   *
	   * Arity 1:
	   * @param  {any}     edge - The edge's key.
	   *
	   * Arity 2:
	   * @param  {any}     source - The edge's source.
	   * @param  {any}     target - The edge's target.
	   *
	   * @return {boolean}
	   *
	   * @throws {Error} - Will throw if the arguments are invalid.
	   */
	  hasDirectedEdge(source, target) {
	    // Early termination
	    if (this.type === 'undirected') return false;

	    if (arguments.length === 1) {
	      const edge = '' + source;

	      const edgeData = this._edges.get(edge);

	      return !!edgeData && !edgeData.undirected;
	    } else if (arguments.length === 2) {
	      source = '' + source;
	      target = '' + target;

	      // If the node source or the target is not in the graph we break
	      const nodeData = this._nodes.get(source);

	      if (!nodeData) return false;

	      // Is there a directed edge pointing toward target?
	      return nodeData.out.hasOwnProperty(target);
	    }

	    throw new InvalidArgumentsGraphError(
	      `Graph.hasDirectedEdge: invalid arity (${arguments.length}, instead of 1 or 2). You can either ask for an edge id or for the existence of an edge between a source & a target.`
	    );
	  }

	  /**
	   * Method returning whether the given undirected edge is found in the graph.
	   *
	   * Arity 1:
	   * @param  {any}     edge - The edge's key.
	   *
	   * Arity 2:
	   * @param  {any}     source - The edge's source.
	   * @param  {any}     target - The edge's target.
	   *
	   * @return {boolean}
	   *
	   * @throws {Error} - Will throw if the arguments are invalid.
	   */
	  hasUndirectedEdge(source, target) {
	    // Early termination
	    if (this.type === 'directed') return false;

	    if (arguments.length === 1) {
	      const edge = '' + source;

	      const edgeData = this._edges.get(edge);

	      return !!edgeData && edgeData.undirected;
	    } else if (arguments.length === 2) {
	      source = '' + source;
	      target = '' + target;

	      // If the node source or the target is not in the graph we break
	      const nodeData = this._nodes.get(source);

	      if (!nodeData) return false;

	      // Is there a directed edge pointing toward target?
	      return nodeData.undirected.hasOwnProperty(target);
	    }

	    throw new InvalidArgumentsGraphError(
	      `Graph.hasDirectedEdge: invalid arity (${arguments.length}, instead of 1 or 2). You can either ask for an edge id or for the existence of an edge between a source & a target.`
	    );
	  }

	  /**
	   * Method returning whether the given edge is found in the graph.
	   *
	   * Arity 1:
	   * @param  {any}     edge - The edge's key.
	   *
	   * Arity 2:
	   * @param  {any}     source - The edge's source.
	   * @param  {any}     target - The edge's target.
	   *
	   * @return {boolean}
	   *
	   * @throws {Error} - Will throw if the arguments are invalid.
	   */
	  hasEdge(source, target) {
	    if (arguments.length === 1) {
	      const edge = '' + source;

	      return this._edges.has(edge);
	    } else if (arguments.length === 2) {
	      source = '' + source;
	      target = '' + target;

	      // If the node source or the target is not in the graph we break
	      const nodeData = this._nodes.get(source);

	      if (!nodeData) return false;

	      // Is there a directed edge pointing toward target?
	      return (
	        (typeof nodeData.out !== 'undefined' &&
	          nodeData.out.hasOwnProperty(target)) ||
	        (typeof nodeData.undirected !== 'undefined' &&
	          nodeData.undirected.hasOwnProperty(target))
	      );
	    }

	    throw new InvalidArgumentsGraphError(
	      `Graph.hasEdge: invalid arity (${arguments.length}, instead of 1 or 2). You can either ask for an edge id or for the existence of an edge between a source & a target.`
	    );
	  }

	  /**
	   * Method returning the edge matching source & target in a directed fashion.
	   *
	   * @param  {any} source - The edge's source.
	   * @param  {any} target - The edge's target.
	   *
	   * @return {any|undefined}
	   *
	   * @throws {Error} - Will throw if the graph is multi.
	   * @throws {Error} - Will throw if source or target doesn't exist.
	   */
	  directedEdge(source, target) {
	    if (this.type === 'undirected') return;

	    source = '' + source;
	    target = '' + target;

	    if (this.multi)
	      throw new UsageGraphError(
	        'Graph.directedEdge: this method is irrelevant with multigraphs since there might be multiple edges between source & target. See #.directedEdges instead.'
	      );

	    const sourceData = this._nodes.get(source);

	    if (!sourceData)
	      throw new NotFoundGraphError(
	        `Graph.directedEdge: could not find the "${source}" source node in the graph.`
	      );

	    if (!this._nodes.has(target))
	      throw new NotFoundGraphError(
	        `Graph.directedEdge: could not find the "${target}" target node in the graph.`
	      );

	    const edgeData = (sourceData.out && sourceData.out[target]) || undefined;

	    if (edgeData) return edgeData.key;
	  }

	  /**
	   * Method returning the edge matching source & target in a undirected fashion.
	   *
	   * @param  {any} source - The edge's source.
	   * @param  {any} target - The edge's target.
	   *
	   * @return {any|undefined}
	   *
	   * @throws {Error} - Will throw if the graph is multi.
	   * @throws {Error} - Will throw if source or target doesn't exist.
	   */
	  undirectedEdge(source, target) {
	    if (this.type === 'directed') return;

	    source = '' + source;
	    target = '' + target;

	    if (this.multi)
	      throw new UsageGraphError(
	        'Graph.undirectedEdge: this method is irrelevant with multigraphs since there might be multiple edges between source & target. See #.undirectedEdges instead.'
	      );

	    const sourceData = this._nodes.get(source);

	    if (!sourceData)
	      throw new NotFoundGraphError(
	        `Graph.undirectedEdge: could not find the "${source}" source node in the graph.`
	      );

	    if (!this._nodes.has(target))
	      throw new NotFoundGraphError(
	        `Graph.undirectedEdge: could not find the "${target}" target node in the graph.`
	      );

	    const edgeData =
	      (sourceData.undirected && sourceData.undirected[target]) || undefined;

	    if (edgeData) return edgeData.key;
	  }

	  /**
	   * Method returning the edge matching source & target in a mixed fashion.
	   *
	   * @param  {any} source - The edge's source.
	   * @param  {any} target - The edge's target.
	   *
	   * @return {any|undefined}
	   *
	   * @throws {Error} - Will throw if the graph is multi.
	   * @throws {Error} - Will throw if source or target doesn't exist.
	   */
	  edge(source, target) {
	    if (this.multi)
	      throw new UsageGraphError(
	        'Graph.edge: this method is irrelevant with multigraphs since there might be multiple edges between source & target. See #.edges instead.'
	      );

	    source = '' + source;
	    target = '' + target;

	    const sourceData = this._nodes.get(source);

	    if (!sourceData)
	      throw new NotFoundGraphError(
	        `Graph.edge: could not find the "${source}" source node in the graph.`
	      );

	    if (!this._nodes.has(target))
	      throw new NotFoundGraphError(
	        `Graph.edge: could not find the "${target}" target node in the graph.`
	      );

	    const edgeData =
	      (sourceData.out && sourceData.out[target]) ||
	      (sourceData.undirected && sourceData.undirected[target]) ||
	      undefined;

	    if (edgeData) return edgeData.key;
	  }

	  /**
	   * Method returning whether two nodes are directed neighbors.
	   *
	   * @param  {any}     node     - The node's key.
	   * @param  {any}     neighbor - The neighbor's key.
	   * @return {boolean}
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  areDirectedNeighbors(node, neighbor) {
	    node = '' + node;
	    neighbor = '' + neighbor;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.areDirectedNeighbors: could not find the "${node}" node in the graph.`
	      );

	    if (this.type === 'undirected') return false;

	    return neighbor in nodeData.in || neighbor in nodeData.out;
	  }

	  /**
	   * Method returning whether two nodes are out neighbors.
	   *
	   * @param  {any}     node     - The node's key.
	   * @param  {any}     neighbor - The neighbor's key.
	   * @return {boolean}
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  areOutNeighbors(node, neighbor) {
	    node = '' + node;
	    neighbor = '' + neighbor;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.areOutNeighbors: could not find the "${node}" node in the graph.`
	      );

	    if (this.type === 'undirected') return false;

	    return neighbor in nodeData.out;
	  }

	  /**
	   * Method returning whether two nodes are in neighbors.
	   *
	   * @param  {any}     node     - The node's key.
	   * @param  {any}     neighbor - The neighbor's key.
	   * @return {boolean}
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  areInNeighbors(node, neighbor) {
	    node = '' + node;
	    neighbor = '' + neighbor;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.areInNeighbors: could not find the "${node}" node in the graph.`
	      );

	    if (this.type === 'undirected') return false;

	    return neighbor in nodeData.in;
	  }

	  /**
	   * Method returning whether two nodes are undirected neighbors.
	   *
	   * @param  {any}     node     - The node's key.
	   * @param  {any}     neighbor - The neighbor's key.
	   * @return {boolean}
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  areUndirectedNeighbors(node, neighbor) {
	    node = '' + node;
	    neighbor = '' + neighbor;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.areUndirectedNeighbors: could not find the "${node}" node in the graph.`
	      );

	    if (this.type === 'directed') return false;

	    return neighbor in nodeData.undirected;
	  }

	  /**
	   * Method returning whether two nodes are neighbors.
	   *
	   * @param  {any}     node     - The node's key.
	   * @param  {any}     neighbor - The neighbor's key.
	   * @return {boolean}
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  areNeighbors(node, neighbor) {
	    node = '' + node;
	    neighbor = '' + neighbor;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.areNeighbors: could not find the "${node}" node in the graph.`
	      );

	    if (this.type !== 'undirected') {
	      if (neighbor in nodeData.in || neighbor in nodeData.out) return true;
	    }

	    if (this.type !== 'directed') {
	      if (neighbor in nodeData.undirected) return true;
	    }

	    return false;
	  }

	  /**
	   * Method returning whether two nodes are inbound neighbors.
	   *
	   * @param  {any}     node     - The node's key.
	   * @param  {any}     neighbor - The neighbor's key.
	   * @return {boolean}
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  areInboundNeighbors(node, neighbor) {
	    node = '' + node;
	    neighbor = '' + neighbor;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.areInboundNeighbors: could not find the "${node}" node in the graph.`
	      );

	    if (this.type !== 'undirected') {
	      if (neighbor in nodeData.in) return true;
	    }

	    if (this.type !== 'directed') {
	      if (neighbor in nodeData.undirected) return true;
	    }

	    return false;
	  }

	  /**
	   * Method returning whether two nodes are outbound neighbors.
	   *
	   * @param  {any}     node     - The node's key.
	   * @param  {any}     neighbor - The neighbor's key.
	   * @return {boolean}
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  areOutboundNeighbors(node, neighbor) {
	    node = '' + node;
	    neighbor = '' + neighbor;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.areOutboundNeighbors: could not find the "${node}" node in the graph.`
	      );

	    if (this.type !== 'undirected') {
	      if (neighbor in nodeData.out) return true;
	    }

	    if (this.type !== 'directed') {
	      if (neighbor in nodeData.undirected) return true;
	    }

	    return false;
	  }

	  /**
	   * Method returning the given node's in degree.
	   *
	   * @param  {any}     node - The node's key.
	   * @return {number}       - The node's in degree.
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  inDegree(node) {
	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.inDegree: could not find the "${node}" node in the graph.`
	      );

	    if (this.type === 'undirected') return 0;

	    return nodeData.inDegree;
	  }

	  /**
	   * Method returning the given node's out degree.
	   *
	   * @param  {any}     node - The node's key.
	   * @return {number}       - The node's in degree.
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  outDegree(node) {
	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.outDegree: could not find the "${node}" node in the graph.`
	      );

	    if (this.type === 'undirected') return 0;

	    return nodeData.outDegree;
	  }

	  /**
	   * Method returning the given node's directed degree.
	   *
	   * @param  {any}     node - The node's key.
	   * @return {number}       - The node's in degree.
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  directedDegree(node) {
	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.directedDegree: could not find the "${node}" node in the graph.`
	      );

	    if (this.type === 'undirected') return 0;

	    return nodeData.inDegree + nodeData.outDegree;
	  }

	  /**
	   * Method returning the given node's undirected degree.
	   *
	   * @param  {any}     node - The node's key.
	   * @return {number}       - The node's in degree.
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  undirectedDegree(node) {
	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.undirectedDegree: could not find the "${node}" node in the graph.`
	      );

	    if (this.type === 'directed') return 0;

	    return nodeData.undirectedDegree;
	  }

	  /**
	   * Method returning the given node's inbound degree.
	   *
	   * @param  {any}     node - The node's key.
	   * @return {number}       - The node's inbound degree.
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  inboundDegree(node) {
	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.inboundDegree: could not find the "${node}" node in the graph.`
	      );

	    let degree = 0;

	    if (this.type !== 'directed') {
	      degree += nodeData.undirectedDegree;
	    }

	    if (this.type !== 'undirected') {
	      degree += nodeData.inDegree;
	    }

	    return degree;
	  }

	  /**
	   * Method returning the given node's outbound degree.
	   *
	   * @param  {any}     node - The node's key.
	   * @return {number}       - The node's outbound degree.
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  outboundDegree(node) {
	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.outboundDegree: could not find the "${node}" node in the graph.`
	      );

	    let degree = 0;

	    if (this.type !== 'directed') {
	      degree += nodeData.undirectedDegree;
	    }

	    if (this.type !== 'undirected') {
	      degree += nodeData.outDegree;
	    }

	    return degree;
	  }

	  /**
	   * Method returning the given node's directed degree.
	   *
	   * @param  {any}     node - The node's key.
	   * @return {number}       - The node's degree.
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  degree(node) {
	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.degree: could not find the "${node}" node in the graph.`
	      );

	    let degree = 0;

	    if (this.type !== 'directed') {
	      degree += nodeData.undirectedDegree;
	    }

	    if (this.type !== 'undirected') {
	      degree += nodeData.inDegree + nodeData.outDegree;
	    }

	    return degree;
	  }

	  /**
	   * Method returning the given node's in degree without considering self loops.
	   *
	   * @param  {any}     node - The node's key.
	   * @return {number}       - The node's in degree.
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  inDegreeWithoutSelfLoops(node) {
	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.inDegreeWithoutSelfLoops: could not find the "${node}" node in the graph.`
	      );

	    if (this.type === 'undirected') return 0;

	    return nodeData.inDegree - nodeData.directedLoops;
	  }

	  /**
	   * Method returning the given node's out degree without considering self loops.
	   *
	   * @param  {any}     node - The node's key.
	   * @return {number}       - The node's in degree.
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  outDegreeWithoutSelfLoops(node) {
	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.outDegreeWithoutSelfLoops: could not find the "${node}" node in the graph.`
	      );

	    if (this.type === 'undirected') return 0;

	    return nodeData.outDegree - nodeData.directedLoops;
	  }

	  /**
	   * Method returning the given node's directed degree without considering self loops.
	   *
	   * @param  {any}     node - The node's key.
	   * @return {number}       - The node's in degree.
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  directedDegreeWithoutSelfLoops(node) {
	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.directedDegreeWithoutSelfLoops: could not find the "${node}" node in the graph.`
	      );

	    if (this.type === 'undirected') return 0;

	    return nodeData.inDegree + nodeData.outDegree - nodeData.directedLoops * 2;
	  }

	  /**
	   * Method returning the given node's undirected degree without considering self loops.
	   *
	   * @param  {any}     node - The node's key.
	   * @return {number}       - The node's in degree.
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  undirectedDegreeWithoutSelfLoops(node) {
	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.undirectedDegreeWithoutSelfLoops: could not find the "${node}" node in the graph.`
	      );

	    if (this.type === 'directed') return 0;

	    return nodeData.undirectedDegree - nodeData.undirectedLoops * 2;
	  }

	  /**
	   * Method returning the given node's inbound degree without considering self loops.
	   *
	   * @param  {any}     node - The node's key.
	   * @return {number}       - The node's inbound degree.
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  inboundDegreeWithoutSelfLoops(node) {
	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.inboundDegreeWithoutSelfLoops: could not find the "${node}" node in the graph.`
	      );

	    let degree = 0;
	    let loops = 0;

	    if (this.type !== 'directed') {
	      degree += nodeData.undirectedDegree;
	      loops += nodeData.undirectedLoops * 2;
	    }

	    if (this.type !== 'undirected') {
	      degree += nodeData.inDegree;
	      loops += nodeData.directedLoops;
	    }

	    return degree - loops;
	  }

	  /**
	   * Method returning the given node's outbound degree without considering self loops.
	   *
	   * @param  {any}     node - The node's key.
	   * @return {number}       - The node's outbound degree.
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  outboundDegreeWithoutSelfLoops(node) {
	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.outboundDegreeWithoutSelfLoops: could not find the "${node}" node in the graph.`
	      );

	    let degree = 0;
	    let loops = 0;

	    if (this.type !== 'directed') {
	      degree += nodeData.undirectedDegree;
	      loops += nodeData.undirectedLoops * 2;
	    }

	    if (this.type !== 'undirected') {
	      degree += nodeData.outDegree;
	      loops += nodeData.directedLoops;
	    }

	    return degree - loops;
	  }

	  /**
	   * Method returning the given node's directed degree without considering self loops.
	   *
	   * @param  {any}     node - The node's key.
	   * @return {number}       - The node's degree.
	   *
	   * @throws {Error} - Will throw if the node isn't in the graph.
	   */
	  degreeWithoutSelfLoops(node) {
	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.degreeWithoutSelfLoops: could not find the "${node}" node in the graph.`
	      );

	    let degree = 0;
	    let loops = 0;

	    if (this.type !== 'directed') {
	      degree += nodeData.undirectedDegree;
	      loops += nodeData.undirectedLoops * 2;
	    }

	    if (this.type !== 'undirected') {
	      degree += nodeData.inDegree + nodeData.outDegree;
	      loops += nodeData.directedLoops * 2;
	    }

	    return degree - loops;
	  }

	  /**
	   * Method returning the given edge's source.
	   *
	   * @param  {any} edge - The edge's key.
	   * @return {any}      - The edge's source.
	   *
	   * @throws {Error} - Will throw if the edge isn't in the graph.
	   */
	  source(edge) {
	    edge = '' + edge;

	    const data = this._edges.get(edge);

	    if (!data)
	      throw new NotFoundGraphError(
	        `Graph.source: could not find the "${edge}" edge in the graph.`
	      );

	    return data.source.key;
	  }

	  /**
	   * Method returning the given edge's target.
	   *
	   * @param  {any} edge - The edge's key.
	   * @return {any}      - The edge's target.
	   *
	   * @throws {Error} - Will throw if the edge isn't in the graph.
	   */
	  target(edge) {
	    edge = '' + edge;

	    const data = this._edges.get(edge);

	    if (!data)
	      throw new NotFoundGraphError(
	        `Graph.target: could not find the "${edge}" edge in the graph.`
	      );

	    return data.target.key;
	  }

	  /**
	   * Method returning the given edge's extremities.
	   *
	   * @param  {any}   edge - The edge's key.
	   * @return {array}      - The edge's extremities.
	   *
	   * @throws {Error} - Will throw if the edge isn't in the graph.
	   */
	  extremities(edge) {
	    edge = '' + edge;

	    const edgeData = this._edges.get(edge);

	    if (!edgeData)
	      throw new NotFoundGraphError(
	        `Graph.extremities: could not find the "${edge}" edge in the graph.`
	      );

	    return [edgeData.source.key, edgeData.target.key];
	  }

	  /**
	   * Given a node & an edge, returns the other extremity of the edge.
	   *
	   * @param  {any}   node - The node's key.
	   * @param  {any}   edge - The edge's key.
	   * @return {any}        - The related node.
	   *
	   * @throws {Error} - Will throw if the edge isn't in the graph or if the
	   *                   edge & node are not related.
	   */
	  opposite(node, edge) {
	    node = '' + node;
	    edge = '' + edge;

	    const data = this._edges.get(edge);

	    if (!data)
	      throw new NotFoundGraphError(
	        `Graph.opposite: could not find the "${edge}" edge in the graph.`
	      );

	    const source = data.source.key;
	    const target = data.target.key;

	    if (node === source) return target;
	    if (node === target) return source;

	    throw new NotFoundGraphError(
	      `Graph.opposite: the "${node}" node is not attached to the "${edge}" edge (${source}, ${target}).`
	    );
	  }

	  /**
	   * Returns whether the given edge has the given node as extremity.
	   *
	   * @param  {any}     edge - The edge's key.
	   * @param  {any}     node - The node's key.
	   * @return {boolean}      - The related node.
	   *
	   * @throws {Error} - Will throw if either the node or the edge isn't in the graph.
	   */
	  hasExtremity(edge, node) {
	    edge = '' + edge;
	    node = '' + node;

	    const data = this._edges.get(edge);

	    if (!data)
	      throw new NotFoundGraphError(
	        `Graph.hasExtremity: could not find the "${edge}" edge in the graph.`
	      );

	    return data.source.key === node || data.target.key === node;
	  }

	  /**
	   * Method returning whether the given edge is undirected.
	   *
	   * @param  {any}     edge - The edge's key.
	   * @return {boolean}
	   *
	   * @throws {Error} - Will throw if the edge isn't in the graph.
	   */
	  isUndirected(edge) {
	    edge = '' + edge;

	    const data = this._edges.get(edge);

	    if (!data)
	      throw new NotFoundGraphError(
	        `Graph.isUndirected: could not find the "${edge}" edge in the graph.`
	      );

	    return data.undirected;
	  }

	  /**
	   * Method returning whether the given edge is directed.
	   *
	   * @param  {any}     edge - The edge's key.
	   * @return {boolean}
	   *
	   * @throws {Error} - Will throw if the edge isn't in the graph.
	   */
	  isDirected(edge) {
	    edge = '' + edge;

	    const data = this._edges.get(edge);

	    if (!data)
	      throw new NotFoundGraphError(
	        `Graph.isDirected: could not find the "${edge}" edge in the graph.`
	      );

	    return !data.undirected;
	  }

	  /**
	   * Method returning whether the given edge is a self loop.
	   *
	   * @param  {any}     edge - The edge's key.
	   * @return {boolean}
	   *
	   * @throws {Error} - Will throw if the edge isn't in the graph.
	   */
	  isSelfLoop(edge) {
	    edge = '' + edge;

	    const data = this._edges.get(edge);

	    if (!data)
	      throw new NotFoundGraphError(
	        `Graph.isSelfLoop: could not find the "${edge}" edge in the graph.`
	      );

	    return data.source === data.target;
	  }

	  /**---------------------------------------------------------------------------
	   * Mutation
	   **---------------------------------------------------------------------------
	   */

	  /**
	   * Method used to add a node to the graph.
	   *
	   * @param  {any}    node         - The node.
	   * @param  {object} [attributes] - Optional attributes.
	   * @return {any}                 - The node.
	   *
	   * @throws {Error} - Will throw if the given node already exist.
	   * @throws {Error} - Will throw if the given attributes are not an object.
	   */
	  addNode(node, attributes) {
	    const nodeData = addNode(this, node, attributes);

	    return nodeData.key;
	  }

	  /**
	   * Method used to merge a node into the graph.
	   *
	   * @param  {any}    node         - The node.
	   * @param  {object} [attributes] - Optional attributes.
	   * @return {any}                 - The node.
	   */
	  mergeNode(node, attributes) {
	    if (attributes && !isPlainObject(attributes))
	      throw new InvalidArgumentsGraphError(
	        `Graph.mergeNode: invalid attributes. Expecting an object but got "${attributes}"`
	      );

	    // String coercion
	    node = '' + node;
	    attributes = attributes || {};

	    // If the node already exists, we merge the attributes
	    let data = this._nodes.get(node);

	    if (data) {
	      if (attributes) {
	        assign$1(data.attributes, attributes);

	        this.emit('nodeAttributesUpdated', {
	          type: 'merge',
	          key: node,
	          attributes: data.attributes,
	          data: attributes
	        });
	      }
	      return [node, false];
	    }

	    data = new this.NodeDataClass(node, attributes);

	    // Adding the node to internal register
	    this._nodes.set(node, data);

	    // Emitting
	    this.emit('nodeAdded', {
	      key: node,
	      attributes
	    });

	    return [node, true];
	  }

	  /**
	   * Method used to add a node if it does not exist in the graph or else to
	   * update its attributes using a function.
	   *
	   * @param  {any}      node      - The node.
	   * @param  {function} [updater] - Optional updater function.
	   * @return {any}                - The node.
	   */
	  updateNode(node, updater) {
	    if (updater && typeof updater !== 'function')
	      throw new InvalidArgumentsGraphError(
	        `Graph.updateNode: invalid updater function. Expecting a function but got "${updater}"`
	      );

	    // String coercion
	    node = '' + node;

	    // If the node already exists, we update the attributes
	    let data = this._nodes.get(node);

	    if (data) {
	      if (updater) {
	        const oldAttributes = data.attributes;
	        data.attributes = updater(oldAttributes);

	        this.emit('nodeAttributesUpdated', {
	          type: 'replace',
	          key: node,
	          attributes: data.attributes
	        });
	      }
	      return [node, false];
	    }

	    const attributes = updater ? updater({}) : {};

	    data = new this.NodeDataClass(node, attributes);

	    // Adding the node to internal register
	    this._nodes.set(node, data);

	    // Emitting
	    this.emit('nodeAdded', {
	      key: node,
	      attributes
	    });

	    return [node, true];
	  }

	  /**
	   * Method used to drop a single node & all its attached edges from the graph.
	   *
	   * @param  {any}    node - The node.
	   * @return {Graph}
	   *
	   * @throws {Error} - Will throw if the node doesn't exist.
	   */
	  dropNode(node) {
	    node = '' + node;

	    const nodeData = this._nodes.get(node);

	    if (!nodeData)
	      throw new NotFoundGraphError(
	        `Graph.dropNode: could not find the "${node}" node in the graph.`
	      );

	    let edgeData;

	    // Removing attached edges
	    // NOTE: we could be faster here, but this is such a pain to maintain
	    if (this.type !== 'undirected') {
	      for (const neighbor in nodeData.out) {
	        edgeData = nodeData.out[neighbor];

	        do {
	          dropEdgeFromData(this, edgeData);
	          edgeData = edgeData.next;
	        } while (edgeData);
	      }

	      for (const neighbor in nodeData.in) {
	        edgeData = nodeData.in[neighbor];

	        do {
	          dropEdgeFromData(this, edgeData);
	          edgeData = edgeData.next;
	        } while (edgeData);
	      }
	    }

	    if (this.type !== 'directed') {
	      for (const neighbor in nodeData.undirected) {
	        edgeData = nodeData.undirected[neighbor];

	        do {
	          dropEdgeFromData(this, edgeData);
	          edgeData = edgeData.next;
	        } while (edgeData);
	      }
	    }

	    // Dropping the node from the register
	    this._nodes.delete(node);

	    // Emitting
	    this.emit('nodeDropped', {
	      key: node,
	      attributes: nodeData.attributes
	    });
	  }

	  /**
	   * Method used to drop a single edge from the graph.
	   *
	   * Arity 1:
	   * @param  {any}    edge - The edge.
	   *
	   * Arity 2:
	   * @param  {any}    source - Source node.
	   * @param  {any}    target - Target node.
	   *
	   * @return {Graph}
	   *
	   * @throws {Error} - Will throw if the edge doesn't exist.
	   */
	  dropEdge(edge) {
	    let edgeData;

	    if (arguments.length > 1) {
	      const source = '' + arguments[0];
	      const target = '' + arguments[1];

	      edgeData = getMatchingEdge(this, source, target, this.type);

	      if (!edgeData)
	        throw new NotFoundGraphError(
	          `Graph.dropEdge: could not find the "${source}" -> "${target}" edge in the graph.`
	        );
	    } else {
	      edge = '' + edge;

	      edgeData = this._edges.get(edge);

	      if (!edgeData)
	        throw new NotFoundGraphError(
	          `Graph.dropEdge: could not find the "${edge}" edge in the graph.`
	        );
	    }

	    dropEdgeFromData(this, edgeData);

	    return this;
	  }

	  /**
	   * Method used to drop a single directed edge from the graph.
	   *
	   * @param  {any}    source - Source node.
	   * @param  {any}    target - Target node.
	   *
	   * @return {Graph}
	   *
	   * @throws {Error} - Will throw if the edge doesn't exist.
	   */
	  dropDirectedEdge(source, target) {
	    if (arguments.length < 2)
	      throw new UsageGraphError(
	        'Graph.dropDirectedEdge: it does not make sense to try and drop a directed edge by key. What if the edge with this key is undirected? Use #.dropEdge for this purpose instead.'
	      );

	    if (this.multi)
	      throw new UsageGraphError(
	        'Graph.dropDirectedEdge: cannot use a {source,target} combo when dropping an edge in a MultiGraph since we cannot infer the one you want to delete as there could be multiple ones.'
	      );

	    source = '' + source;
	    target = '' + target;

	    const edgeData = getMatchingEdge(this, source, target, 'directed');

	    if (!edgeData)
	      throw new NotFoundGraphError(
	        `Graph.dropDirectedEdge: could not find a "${source}" -> "${target}" edge in the graph.`
	      );

	    dropEdgeFromData(this, edgeData);

	    return this;
	  }

	  /**
	   * Method used to drop a single undirected edge from the graph.
	   *
	   * @param  {any}    source - Source node.
	   * @param  {any}    target - Target node.
	   *
	   * @return {Graph}
	   *
	   * @throws {Error} - Will throw if the edge doesn't exist.
	   */
	  dropUndirectedEdge(source, target) {
	    if (arguments.length < 2)
	      throw new UsageGraphError(
	        'Graph.dropUndirectedEdge: it does not make sense to drop a directed edge by key. What if the edge with this key is undirected? Use #.dropEdge for this purpose instead.'
	      );

	    if (this.multi)
	      throw new UsageGraphError(
	        'Graph.dropUndirectedEdge: cannot use a {source,target} combo when dropping an edge in a MultiGraph since we cannot infer the one you want to delete as there could be multiple ones.'
	      );

	    const edgeData = getMatchingEdge(this, source, target, 'undirected');

	    if (!edgeData)
	      throw new NotFoundGraphError(
	        `Graph.dropUndirectedEdge: could not find a "${source}" -> "${target}" edge in the graph.`
	      );

	    dropEdgeFromData(this, edgeData);

	    return this;
	  }

	  /**
	   * Method used to remove every edge & every node from the graph.
	   *
	   * @return {Graph}
	   */
	  clear() {
	    // Clearing edges
	    this._edges.clear();

	    // Clearing nodes
	    this._nodes.clear();

	    // Reset counters
	    this._resetInstanceCounters();

	    // Emitting
	    this.emit('cleared');
	  }

	  /**
	   * Method used to remove every edge from the graph.
	   *
	   * @return {Graph}
	   */
	  clearEdges() {
	    // Clearing structure index
	    const iterator = this._nodes.values();

	    let step;

	    while (((step = iterator.next()), step.done !== true)) {
	      step.value.clear();
	    }

	    // Clearing edges
	    this._edges.clear();

	    // Reset counters
	    this._resetInstanceCounters();

	    // Emitting
	    this.emit('edgesCleared');
	  }

	  /**---------------------------------------------------------------------------
	   * Attributes-related methods
	   **---------------------------------------------------------------------------
	   */

	  /**
	   * Method returning the desired graph's attribute.
	   *
	   * @param  {string} name - Name of the attribute.
	   * @return {any}
	   */
	  getAttribute(name) {
	    return this._attributes[name];
	  }

	  /**
	   * Method returning the graph's attributes.
	   *
	   * @return {object}
	   */
	  getAttributes() {
	    return this._attributes;
	  }

	  /**
	   * Method returning whether the graph has the desired attribute.
	   *
	   * @param  {string}  name - Name of the attribute.
	   * @return {boolean}
	   */
	  hasAttribute(name) {
	    return this._attributes.hasOwnProperty(name);
	  }

	  /**
	   * Method setting a value for the desired graph's attribute.
	   *
	   * @param  {string}  name  - Name of the attribute.
	   * @param  {any}     value - Value for the attribute.
	   * @return {Graph}
	   */
	  setAttribute(name, value) {
	    this._attributes[name] = value;

	    // Emitting
	    this.emit('attributesUpdated', {
	      type: 'set',
	      attributes: this._attributes,
	      name
	    });

	    return this;
	  }

	  /**
	   * Method using a function to update the desired graph's attribute's value.
	   *
	   * @param  {string}   name    - Name of the attribute.
	   * @param  {function} updater - Function use to update the attribute's value.
	   * @return {Graph}
	   */
	  updateAttribute(name, updater) {
	    if (typeof updater !== 'function')
	      throw new InvalidArgumentsGraphError(
	        'Graph.updateAttribute: updater should be a function.'
	      );

	    const value = this._attributes[name];

	    this._attributes[name] = updater(value);

	    // Emitting
	    this.emit('attributesUpdated', {
	      type: 'set',
	      attributes: this._attributes,
	      name
	    });

	    return this;
	  }

	  /**
	   * Method removing the desired graph's attribute.
	   *
	   * @param  {string} name  - Name of the attribute.
	   * @return {Graph}
	   */
	  removeAttribute(name) {
	    delete this._attributes[name];

	    // Emitting
	    this.emit('attributesUpdated', {
	      type: 'remove',
	      attributes: this._attributes,
	      name
	    });

	    return this;
	  }

	  /**
	   * Method replacing the graph's attributes.
	   *
	   * @param  {object} attributes - New attributes.
	   * @return {Graph}
	   *
	   * @throws {Error} - Will throw if given attributes are not a plain object.
	   */
	  replaceAttributes(attributes) {
	    if (!isPlainObject(attributes))
	      throw new InvalidArgumentsGraphError(
	        'Graph.replaceAttributes: provided attributes are not a plain object.'
	      );

	    this._attributes = attributes;

	    // Emitting
	    this.emit('attributesUpdated', {
	      type: 'replace',
	      attributes: this._attributes
	    });

	    return this;
	  }

	  /**
	   * Method merging the graph's attributes.
	   *
	   * @param  {object} attributes - Attributes to merge.
	   * @return {Graph}
	   *
	   * @throws {Error} - Will throw if given attributes are not a plain object.
	   */
	  mergeAttributes(attributes) {
	    if (!isPlainObject(attributes))
	      throw new InvalidArgumentsGraphError(
	        'Graph.mergeAttributes: provided attributes are not a plain object.'
	      );

	    assign$1(this._attributes, attributes);

	    // Emitting
	    this.emit('attributesUpdated', {
	      type: 'merge',
	      attributes: this._attributes,
	      data: attributes
	    });

	    return this;
	  }

	  /**
	   * Method updating the graph's attributes.
	   *
	   * @param  {function} updater - Function used to update the attributes.
	   * @return {Graph}
	   *
	   * @throws {Error} - Will throw if given updater is not a function.
	   */
	  updateAttributes(updater) {
	    if (typeof updater !== 'function')
	      throw new InvalidArgumentsGraphError(
	        'Graph.updateAttributes: provided updater is not a function.'
	      );

	    this._attributes = updater(this._attributes);

	    // Emitting
	    this.emit('attributesUpdated', {
	      type: 'update',
	      attributes: this._attributes
	    });

	    return this;
	  }

	  /**
	   * Method used to update each node's attributes using the given function.
	   *
	   * @param {function}  updater - Updater function to use.
	   * @param {object}    [hints] - Optional hints.
	   */
	  updateEachNodeAttributes(updater, hints) {
	    if (typeof updater !== 'function')
	      throw new InvalidArgumentsGraphError(
	        'Graph.updateEachNodeAttributes: expecting an updater function.'
	      );

	    if (hints && !validateHints(hints))
	      throw new InvalidArgumentsGraphError(
	        'Graph.updateEachNodeAttributes: invalid hints. Expecting an object having the following shape: {attributes?: [string]}'
	      );

	    const iterator = this._nodes.values();

	    let step, nodeData;

	    while (((step = iterator.next()), step.done !== true)) {
	      nodeData = step.value;
	      nodeData.attributes = updater(nodeData.key, nodeData.attributes);
	    }

	    this.emit('eachNodeAttributesUpdated', {
	      hints: hints ? hints : null
	    });
	  }

	  /**
	   * Method used to update each edge's attributes using the given function.
	   *
	   * @param {function}  updater - Updater function to use.
	   * @param {object}    [hints] - Optional hints.
	   */
	  updateEachEdgeAttributes(updater, hints) {
	    if (typeof updater !== 'function')
	      throw new InvalidArgumentsGraphError(
	        'Graph.updateEachEdgeAttributes: expecting an updater function.'
	      );

	    if (hints && !validateHints(hints))
	      throw new InvalidArgumentsGraphError(
	        'Graph.updateEachEdgeAttributes: invalid hints. Expecting an object having the following shape: {attributes?: [string]}'
	      );

	    const iterator = this._edges.values();

	    let step, edgeData, sourceData, targetData;

	    while (((step = iterator.next()), step.done !== true)) {
	      edgeData = step.value;
	      sourceData = edgeData.source;
	      targetData = edgeData.target;

	      edgeData.attributes = updater(
	        edgeData.key,
	        edgeData.attributes,
	        sourceData.key,
	        targetData.key,
	        sourceData.attributes,
	        targetData.attributes,
	        edgeData.undirected
	      );
	    }

	    this.emit('eachEdgeAttributesUpdated', {
	      hints: hints ? hints : null
	    });
	  }

	  /**---------------------------------------------------------------------------
	   * Iteration-related methods
	   **---------------------------------------------------------------------------
	   */

	  /**
	   * Method iterating over the graph's adjacency using the given callback.
	   *
	   * @param  {function}  callback - Callback to use.
	   */
	  forEachAdjacencyEntry(callback) {
	    if (typeof callback !== 'function')
	      throw new InvalidArgumentsGraphError(
	        'Graph.forEachAdjacencyEntry: expecting a callback.'
	      );

	    forEachAdjacency(false, false, false, this, callback);
	  }
	  forEachAdjacencyEntryWithOrphans(callback) {
	    if (typeof callback !== 'function')
	      throw new InvalidArgumentsGraphError(
	        'Graph.forEachAdjacencyEntryWithOrphans: expecting a callback.'
	      );

	    forEachAdjacency(false, false, true, this, callback);
	  }

	  /**
	   * Method iterating over the graph's assymetric adjacency using the given callback.
	   *
	   * @param  {function}  callback - Callback to use.
	   */
	  forEachAssymetricAdjacencyEntry(callback) {
	    if (typeof callback !== 'function')
	      throw new InvalidArgumentsGraphError(
	        'Graph.forEachAssymetricAdjacencyEntry: expecting a callback.'
	      );

	    forEachAdjacency(false, true, false, this, callback);
	  }
	  forEachAssymetricAdjacencyEntryWithOrphans(callback) {
	    if (typeof callback !== 'function')
	      throw new InvalidArgumentsGraphError(
	        'Graph.forEachAssymetricAdjacencyEntryWithOrphans: expecting a callback.'
	      );

	    forEachAdjacency(false, true, true, this, callback);
	  }

	  /**
	   * Method returning the list of the graph's nodes.
	   *
	   * @return {array} - The nodes.
	   */
	  nodes() {
	    if (typeof Array.from === 'function') return Array.from(this._nodes.keys());

	    return take$1(this._nodes.keys(), this._nodes.size);
	  }

	  /**
	   * Method iterating over the graph's nodes using the given callback.
	   *
	   * @param  {function}  callback - Callback (key, attributes, index).
	   */
	  forEachNode(callback) {
	    if (typeof callback !== 'function')
	      throw new InvalidArgumentsGraphError(
	        'Graph.forEachNode: expecting a callback.'
	      );

	    const iterator = this._nodes.values();

	    let step, nodeData;

	    while (((step = iterator.next()), step.done !== true)) {
	      nodeData = step.value;
	      callback(nodeData.key, nodeData.attributes);
	    }
	  }

	  /**
	   * Method iterating attempting to find a node matching the given predicate
	   * function.
	   *
	   * @param  {function}  callback - Callback (key, attributes).
	   */
	  findNode(callback) {
	    if (typeof callback !== 'function')
	      throw new InvalidArgumentsGraphError(
	        'Graph.findNode: expecting a callback.'
	      );

	    const iterator = this._nodes.values();

	    let step, nodeData;

	    while (((step = iterator.next()), step.done !== true)) {
	      nodeData = step.value;

	      if (callback(nodeData.key, nodeData.attributes)) return nodeData.key;
	    }

	    return;
	  }

	  /**
	   * Method mapping nodes.
	   *
	   * @param  {function}  callback - Callback (key, attributes).
	   */
	  mapNodes(callback) {
	    if (typeof callback !== 'function')
	      throw new InvalidArgumentsGraphError(
	        'Graph.mapNode: expecting a callback.'
	      );

	    const iterator = this._nodes.values();

	    let step, nodeData;

	    const result = new Array(this.order);
	    let i = 0;

	    while (((step = iterator.next()), step.done !== true)) {
	      nodeData = step.value;
	      result[i++] = callback(nodeData.key, nodeData.attributes);
	    }

	    return result;
	  }

	  /**
	   * Method returning whether some node verify the given predicate.
	   *
	   * @param  {function}  callback - Callback (key, attributes).
	   */
	  someNode(callback) {
	    if (typeof callback !== 'function')
	      throw new InvalidArgumentsGraphError(
	        'Graph.someNode: expecting a callback.'
	      );

	    const iterator = this._nodes.values();

	    let step, nodeData;

	    while (((step = iterator.next()), step.done !== true)) {
	      nodeData = step.value;

	      if (callback(nodeData.key, nodeData.attributes)) return true;
	    }

	    return false;
	  }

	  /**
	   * Method returning whether all node verify the given predicate.
	   *
	   * @param  {function}  callback - Callback (key, attributes).
	   */
	  everyNode(callback) {
	    if (typeof callback !== 'function')
	      throw new InvalidArgumentsGraphError(
	        'Graph.everyNode: expecting a callback.'
	      );

	    const iterator = this._nodes.values();

	    let step, nodeData;

	    while (((step = iterator.next()), step.done !== true)) {
	      nodeData = step.value;

	      if (!callback(nodeData.key, nodeData.attributes)) return false;
	    }

	    return true;
	  }

	  /**
	   * Method filtering nodes.
	   *
	   * @param  {function}  callback - Callback (key, attributes).
	   */
	  filterNodes(callback) {
	    if (typeof callback !== 'function')
	      throw new InvalidArgumentsGraphError(
	        'Graph.filterNodes: expecting a callback.'
	      );

	    const iterator = this._nodes.values();

	    let step, nodeData;

	    const result = [];

	    while (((step = iterator.next()), step.done !== true)) {
	      nodeData = step.value;

	      if (callback(nodeData.key, nodeData.attributes))
	        result.push(nodeData.key);
	    }

	    return result;
	  }

	  /**
	   * Method reducing nodes.
	   *
	   * @param  {function}  callback - Callback (accumulator, key, attributes).
	   */
	  reduceNodes(callback, initialValue) {
	    if (typeof callback !== 'function')
	      throw new InvalidArgumentsGraphError(
	        'Graph.reduceNodes: expecting a callback.'
	      );

	    if (arguments.length < 2)
	      throw new InvalidArgumentsGraphError(
	        'Graph.reduceNodes: missing initial value. You must provide it because the callback takes more than one argument and we cannot infer the initial value from the first iteration, as you could with a simple array.'
	      );

	    let accumulator = initialValue;

	    const iterator = this._nodes.values();

	    let step, nodeData;

	    while (((step = iterator.next()), step.done !== true)) {
	      nodeData = step.value;
	      accumulator = callback(accumulator, nodeData.key, nodeData.attributes);
	    }

	    return accumulator;
	  }

	  /**
	   * Method returning an iterator over the graph's node entries.
	   *
	   * @return {Iterator}
	   */
	  nodeEntries() {
	    const iterator = this._nodes.values();

	    return new Iterator$3(() => {
	      const step = iterator.next();

	      if (step.done) return step;

	      const data = step.value;

	      return {
	        value: {node: data.key, attributes: data.attributes},
	        done: false
	      };
	    });
	  }

	  /**---------------------------------------------------------------------------
	   * Serialization
	   **---------------------------------------------------------------------------
	   */

	  /**
	   * Method used to export the whole graph.
	   *
	   * @return {object} - The serialized graph.
	   */
	  export() {
	    const nodes = new Array(this._nodes.size);

	    let i = 0;

	    this._nodes.forEach((data, key) => {
	      nodes[i++] = serializeNode(key, data);
	    });

	    const edges = new Array(this._edges.size);

	    i = 0;

	    this._edges.forEach((data, key) => {
	      edges[i++] = serializeEdge(this.type, key, data);
	    });

	    return {
	      options: {
	        type: this.type,
	        multi: this.multi,
	        allowSelfLoops: this.allowSelfLoops
	      },
	      attributes: this.getAttributes(),
	      nodes,
	      edges
	    };
	  }

	  /**
	   * Method used to import a serialized graph.
	   *
	   * @param  {object|Graph} data  - The serialized graph.
	   * @param  {boolean}      merge - Whether to merge data.
	   * @return {Graph}              - Returns itself for chaining.
	   */
	  import(data, merge = false) {
	    // Importing a Graph instance directly
	    if (data instanceof Graph) {
	      // Nodes
	      data.forEachNode((n, a) => {
	        if (merge) this.mergeNode(n, a);
	        else this.addNode(n, a);
	      });

	      // Edges
	      data.forEachEdge((e, a, s, t, _sa, _ta, u) => {
	        if (merge) {
	          if (u) this.mergeUndirectedEdgeWithKey(e, s, t, a);
	          else this.mergeDirectedEdgeWithKey(e, s, t, a);
	        } else {
	          if (u) this.addUndirectedEdgeWithKey(e, s, t, a);
	          else this.addDirectedEdgeWithKey(e, s, t, a);
	        }
	      });

	      return this;
	    }

	    // Importing a serialized graph
	    if (!isPlainObject(data))
	      throw new InvalidArgumentsGraphError(
	        'Graph.import: invalid argument. Expecting a serialized graph or, alternatively, a Graph instance.'
	      );

	    if (data.attributes) {
	      if (!isPlainObject(data.attributes))
	        throw new InvalidArgumentsGraphError(
	          'Graph.import: invalid attributes. Expecting a plain object.'
	        );

	      if (merge) this.mergeAttributes(data.attributes);
	      else this.replaceAttributes(data.attributes);
	    }

	    let i, l, list, node, edge;

	    if (data.nodes) {
	      list = data.nodes;

	      if (!Array.isArray(list))
	        throw new InvalidArgumentsGraphError(
	          'Graph.import: invalid nodes. Expecting an array.'
	        );

	      for (i = 0, l = list.length; i < l; i++) {
	        node = list[i];

	        // Validating
	        validateSerializedNode(node);

	        // Adding the node
	        const {key, attributes} = node;

	        if (merge) this.mergeNode(key, attributes);
	        else this.addNode(key, attributes);
	      }
	    }

	    if (data.edges) {
	      let undirectedByDefault = false;

	      if (this.type === 'undirected') {
	        undirectedByDefault = true;
	      }

	      list = data.edges;

	      if (!Array.isArray(list))
	        throw new InvalidArgumentsGraphError(
	          'Graph.import: invalid edges. Expecting an array.'
	        );

	      for (i = 0, l = list.length; i < l; i++) {
	        edge = list[i];

	        // Validating
	        validateSerializedEdge(edge);

	        // Adding the edge
	        const {
	          source,
	          target,
	          attributes,
	          undirected = undirectedByDefault
	        } = edge;

	        let method;

	        if ('key' in edge) {
	          method = merge
	            ? undirected
	              ? this.mergeUndirectedEdgeWithKey
	              : this.mergeDirectedEdgeWithKey
	            : undirected
	            ? this.addUndirectedEdgeWithKey
	            : this.addDirectedEdgeWithKey;

	          method.call(this, edge.key, source, target, attributes);
	        } else {
	          method = merge
	            ? undirected
	              ? this.mergeUndirectedEdge
	              : this.mergeDirectedEdge
	            : undirected
	            ? this.addUndirectedEdge
	            : this.addDirectedEdge;

	          method.call(this, source, target, attributes);
	        }
	      }
	    }

	    return this;
	  }

	  /**---------------------------------------------------------------------------
	   * Utils
	   **---------------------------------------------------------------------------
	   */

	  /**
	   * Method returning a null copy of the graph, i.e. a graph without nodes
	   * & edges but with the exact same options.
	   *
	   * @param  {object} options - Options to merge with the current ones.
	   * @return {Graph}          - The null copy.
	   */
	  nullCopy(options) {
	    const graph = new Graph(assign$1({}, this._options, options));
	    graph.replaceAttributes(assign$1({}, this.getAttributes()));
	    return graph;
	  }

	  /**
	   * Method returning an empty copy of the graph, i.e. a graph without edges but
	   * with the exact same options.
	   *
	   * @param  {object} options - Options to merge with the current ones.
	   * @return {Graph}          - The empty copy.
	   */
	  emptyCopy(options) {
	    const graph = this.nullCopy(options);

	    this._nodes.forEach((nodeData, key) => {
	      const attributes = assign$1({}, nodeData.attributes);

	      // NOTE: no need to emit events since user cannot access the instance yet
	      nodeData = new graph.NodeDataClass(key, attributes);
	      graph._nodes.set(key, nodeData);
	    });

	    return graph;
	  }

	  /**
	   * Method returning an exact copy of the graph.
	   *
	   * @param  {object} options - Upgrade options.
	   * @return {Graph}          - The copy.
	   */
	  copy(options) {
	    options = options || {};

	    if (
	      typeof options.type === 'string' &&
	      options.type !== this.type &&
	      options.type !== 'mixed'
	    )
	      throw new UsageGraphError(
	        `Graph.copy: cannot create an incompatible copy from "${this.type}" type to "${options.type}" because this would mean losing information about the current graph.`
	      );

	    if (
	      typeof options.multi === 'boolean' &&
	      options.multi !== this.multi &&
	      options.multi !== true
	    )
	      throw new UsageGraphError(
	        'Graph.copy: cannot create an incompatible copy by downgrading a multi graph to a simple one because this would mean losing information about the current graph.'
	      );

	    if (
	      typeof options.allowSelfLoops === 'boolean' &&
	      options.allowSelfLoops !== this.allowSelfLoops &&
	      options.allowSelfLoops !== true
	    )
	      throw new UsageGraphError(
	        'Graph.copy: cannot create an incompatible copy from a graph allowing self loops to one that does not because this would mean losing information about the current graph.'
	      );

	    const graph = this.emptyCopy(options);

	    const iterator = this._edges.values();

	    let step, edgeData;

	    while (((step = iterator.next()), step.done !== true)) {
	      edgeData = step.value;

	      // NOTE: no need to emit events since user cannot access the instance yet
	      addEdge(
	        graph,
	        'copy',
	        false,
	        edgeData.undirected,
	        edgeData.key,
	        edgeData.source.key,
	        edgeData.target.key,
	        assign$1({}, edgeData.attributes)
	      );
	    }

	    return graph;
	  }

	  /**---------------------------------------------------------------------------
	   * Known methods
	   **---------------------------------------------------------------------------
	   */

	  /**
	   * Method used by JavaScript to perform JSON serialization.
	   *
	   * @return {object} - The serialized graph.
	   */
	  toJSON() {
	    return this.export();
	  }

	  /**
	   * Method returning [object Graph].
	   */
	  toString() {
	    return '[object Graph]';
	  }

	  /**
	   * Method used internally by node's console to display a custom object.
	   *
	   * @return {object} - Formatted object representation of the graph.
	   */
	  inspect() {
	    const nodes = {};
	    this._nodes.forEach((data, key) => {
	      nodes[key] = data.attributes;
	    });

	    const edges = {},
	      multiIndex = {};

	    this._edges.forEach((data, key) => {
	      const direction = data.undirected ? '--' : '->';

	      let label = '';

	      let source = data.source.key;
	      let target = data.target.key;
	      let tmp;

	      if (data.undirected && source > target) {
	        tmp = source;
	        source = target;
	        target = tmp;
	      }

	      const desc = `(${source})${direction}(${target})`;

	      if (!key.startsWith('geid_')) {
	        label += `[${key}]: `;
	      } else if (this.multi) {
	        if (typeof multiIndex[desc] === 'undefined') {
	          multiIndex[desc] = 0;
	        } else {
	          multiIndex[desc]++;
	        }

	        label += `${multiIndex[desc]}. `;
	      }

	      label += desc;

	      edges[label] = data.attributes;
	    });

	    const dummy = {};

	    for (const k in this) {
	      if (
	        this.hasOwnProperty(k) &&
	        !EMITTER_PROPS.has(k) &&
	        typeof this[k] !== 'function' &&
	        typeof k !== 'symbol'
	      )
	        dummy[k] = this[k];
	    }

	    dummy.attributes = this._attributes;
	    dummy.nodes = nodes;
	    dummy.edges = edges;

	    privateProperty(dummy, 'constructor', this.constructor);

	    return dummy;
	  }
	}

	/**
	 * Attaching methods to the prototype.
	 *
	 * Here, we are attaching a wide variety of methods to the Graph class'
	 * prototype when those are very numerous and when their creation is
	 * abstracted.
	 */

	/**
	 * Attaching custom inspect method for node >= 10.
	 */
	if (typeof Symbol !== 'undefined')
	  Graph.prototype[Symbol.for('nodejs.util.inspect.custom')] =
	    Graph.prototype.inspect;

	/**
	 * Related to edge addition.
	 */
	EDGE_ADD_METHODS.forEach(method => {
	  ['add', 'merge', 'update'].forEach(verb => {
	    const name = method.name(verb);
	    const fn = verb === 'add' ? addEdge : mergeEdge;

	    if (method.generateKey) {
	      Graph.prototype[name] = function (source, target, attributes) {
	        return fn(
	          this,
	          name,
	          true,
	          (method.type || this.type) === 'undirected',
	          null,
	          source,
	          target,
	          attributes,
	          verb === 'update'
	        );
	      };
	    } else {
	      Graph.prototype[name] = function (edge, source, target, attributes) {
	        return fn(
	          this,
	          name,
	          false,
	          (method.type || this.type) === 'undirected',
	          edge,
	          source,
	          target,
	          attributes,
	          verb === 'update'
	        );
	      };
	    }
	  });
	});

	/**
	 * Attributes-related.
	 */
	attachNodeAttributesMethods(Graph);
	attachEdgeAttributesMethods(Graph);

	/**
	 * Edge iteration-related.
	 */
	attachEdgeIterationMethods(Graph);

	/**
	 * Neighbor iteration-related.
	 */
	attachNeighborIterationMethods(Graph);

	/**
	 * Graphology Helper Classes
	 * ==========================
	 *
	 * Building some higher-order classes instantiating the graph with
	 * predefinite options.
	 */

	/**
	 * Alternative constructors.
	 */
	class DirectedGraph extends Graph {
	  constructor(options) {
	    const finalOptions = assign$1({type: 'directed'}, options);

	    if ('multi' in finalOptions && finalOptions.multi !== false)
	      throw new InvalidArgumentsGraphError(
	        'DirectedGraph.from: inconsistent indication that the graph should be multi in given options!'
	      );

	    if (finalOptions.type !== 'directed')
	      throw new InvalidArgumentsGraphError(
	        'DirectedGraph.from: inconsistent "' +
	          finalOptions.type +
	          '" type in given options!'
	      );

	    super(finalOptions);
	  }
	}
	class UndirectedGraph extends Graph {
	  constructor(options) {
	    const finalOptions = assign$1({type: 'undirected'}, options);

	    if ('multi' in finalOptions && finalOptions.multi !== false)
	      throw new InvalidArgumentsGraphError(
	        'UndirectedGraph.from: inconsistent indication that the graph should be multi in given options!'
	      );

	    if (finalOptions.type !== 'undirected')
	      throw new InvalidArgumentsGraphError(
	        'UndirectedGraph.from: inconsistent "' +
	          finalOptions.type +
	          '" type in given options!'
	      );

	    super(finalOptions);
	  }
	}
	class MultiGraph extends Graph {
	  constructor(options) {
	    const finalOptions = assign$1({multi: true}, options);

	    if ('multi' in finalOptions && finalOptions.multi !== true)
	      throw new InvalidArgumentsGraphError(
	        'MultiGraph.from: inconsistent indication that the graph should be simple in given options!'
	      );

	    super(finalOptions);
	  }
	}
	class MultiDirectedGraph extends Graph {
	  constructor(options) {
	    const finalOptions = assign$1({type: 'directed', multi: true}, options);

	    if ('multi' in finalOptions && finalOptions.multi !== true)
	      throw new InvalidArgumentsGraphError(
	        'MultiDirectedGraph.from: inconsistent indication that the graph should be simple in given options!'
	      );

	    if (finalOptions.type !== 'directed')
	      throw new InvalidArgumentsGraphError(
	        'MultiDirectedGraph.from: inconsistent "' +
	          finalOptions.type +
	          '" type in given options!'
	      );

	    super(finalOptions);
	  }
	}
	class MultiUndirectedGraph extends Graph {
	  constructor(options) {
	    const finalOptions = assign$1({type: 'undirected', multi: true}, options);

	    if ('multi' in finalOptions && finalOptions.multi !== true)
	      throw new InvalidArgumentsGraphError(
	        'MultiUndirectedGraph.from: inconsistent indication that the graph should be simple in given options!'
	      );

	    if (finalOptions.type !== 'undirected')
	      throw new InvalidArgumentsGraphError(
	        'MultiUndirectedGraph.from: inconsistent "' +
	          finalOptions.type +
	          '" type in given options!'
	      );

	    super(finalOptions);
	  }
	}

	/**
	 * Attaching static #.from method to each of the constructors.
	 */
	function attachStaticFromMethod(Class) {
	  /**
	   * Builds a graph from serialized data or another graph's data.
	   *
	   * @param  {Graph|SerializedGraph} data      - Hydratation data.
	   * @param  {object}                [options] - Options.
	   * @return {Class}
	   */
	  Class.from = function (data, options) {
	    // Merging given options with serialized ones
	    const finalOptions = assign$1({}, data.options, options);

	    const instance = new Class(finalOptions);
	    instance.import(data);

	    return instance;
	  };
	}

	attachStaticFromMethod(Graph);
	attachStaticFromMethod(DirectedGraph);
	attachStaticFromMethod(UndirectedGraph);
	attachStaticFromMethod(MultiGraph);
	attachStaticFromMethod(MultiDirectedGraph);
	attachStaticFromMethod(MultiUndirectedGraph);

	Graph.Graph = Graph;
	Graph.DirectedGraph = DirectedGraph;
	Graph.UndirectedGraph = UndirectedGraph;
	Graph.MultiGraph = MultiGraph;
	Graph.MultiDirectedGraph = MultiDirectedGraph;
	Graph.MultiUndirectedGraph = MultiUndirectedGraph;

	Graph.InvalidArgumentsGraphError = InvalidArgumentsGraphError;
	Graph.NotFoundGraphError = NotFoundGraphError;
	Graph.UsageGraphError = UsageGraphError;

	/**
	 * Graphology isGraph
	 * ===================
	 *
	 * Very simple function aiming at ensuring the given variable is a
	 * graphology instance.
	 */

	/**
	 * Checking the value is a graphology instance.
	 *
	 * @param  {any}     value - Target value.
	 * @return {boolean}
	 */
	var isGraph$1 = function isGraph(value) {
	  return (
	    value !== null &&
	    typeof value === 'object' &&
	    typeof value.addUndirectedEdgeWithKey === 'function' &&
	    typeof value.dropNode === 'function' &&
	    typeof value.multi === 'boolean'
	  );
	};

	var isGraph$2 = /*@__PURE__*/getDefaultExportFromCjs(isGraph$1);

	var getters = {};

	/**
	 * Graphology Weight Getter
	 * =========================
	 *
	 * Function creating weight getters.
	 */

	function coerceWeight(value) {
	  // Ensuring target value is a correct number
	  if (typeof value !== 'number' || isNaN(value)) return 1;

	  return value;
	}

	function createNodeValueGetter(nameOrFunction, defaultValue) {
	  var getter = {};

	  var coerceToDefault = function (v) {
	    if (typeof v === 'undefined') return defaultValue;

	    return v;
	  };

	  if (typeof defaultValue === 'function') coerceToDefault = defaultValue;

	  var get = function (attributes) {
	    return coerceToDefault(attributes[nameOrFunction]);
	  };

	  var returnDefault = function () {
	    return coerceToDefault(undefined);
	  };

	  if (typeof nameOrFunction === 'string') {
	    getter.fromAttributes = get;
	    getter.fromGraph = function (graph, node) {
	      return get(graph.getNodeAttributes(node));
	    };
	    getter.fromEntry = function (node, attributes) {
	      return get(attributes);
	    };
	  } else if (typeof nameOrFunction === 'function') {
	    getter.fromAttributes = function () {
	      throw new Error(
	        'graphology-utils/getters/createNodeValueGetter: irrelevant usage.'
	      );
	    };
	    getter.fromGraph = function (graph, node) {
	      return coerceToDefault(
	        nameOrFunction(node, graph.getNodeAttributes(node))
	      );
	    };
	    getter.fromEntry = function (node, attributes) {
	      return coerceToDefault(nameOrFunction(node, attributes));
	    };
	  } else {
	    getter.fromAttributes = returnDefault;
	    getter.fromGraph = returnDefault;
	    getter.fromEntry = returnDefault;
	  }

	  return getter;
	}

	function createEdgeValueGetter(nameOrFunction, defaultValue) {
	  var getter = {};

	  var coerceToDefault = function (v) {
	    if (typeof v === 'undefined') return defaultValue;

	    return v;
	  };

	  if (typeof defaultValue === 'function') coerceToDefault = defaultValue;

	  var get = function (attributes) {
	    return coerceToDefault(attributes[nameOrFunction]);
	  };

	  var returnDefault = function () {
	    return coerceToDefault(undefined);
	  };

	  if (typeof nameOrFunction === 'string') {
	    getter.fromAttributes = get;
	    getter.fromGraph = function (graph, edge) {
	      return get(graph.getEdgeAttributes(edge));
	    };
	    getter.fromEntry = function (edge, attributes) {
	      return get(attributes);
	    };
	    getter.fromPartialEntry = getter.fromEntry;
	    getter.fromMinimalEntry = getter.fromEntry;
	  } else if (typeof nameOrFunction === 'function') {
	    getter.fromAttributes = function () {
	      throw new Error(
	        'graphology-utils/getters/createEdgeValueGetter: irrelevant usage.'
	      );
	    };
	    getter.fromGraph = function (graph, edge) {
	      // TODO: we can do better, check #310
	      var extremities = graph.extremities(edge);
	      return coerceToDefault(
	        nameOrFunction(
	          edge,
	          graph.getEdgeAttributes(edge),
	          extremities[0],
	          extremities[1],
	          graph.getNodeAttributes(extremities[0]),
	          graph.getNodeAttributes(extremities[1]),
	          graph.isUndirected(edge)
	        )
	      );
	    };
	    getter.fromEntry = function (e, a, s, t, sa, ta, u) {
	      return coerceToDefault(nameOrFunction(e, a, s, t, sa, ta, u));
	    };
	    getter.fromPartialEntry = function (e, a, s, t) {
	      return coerceToDefault(nameOrFunction(e, a, s, t));
	    };
	    getter.fromMinimalEntry = function (e, a) {
	      return coerceToDefault(nameOrFunction(e, a));
	    };
	  } else {
	    getter.fromAttributes = returnDefault;
	    getter.fromGraph = returnDefault;
	    getter.fromEntry = returnDefault;
	    getter.fromMinimalEntry = returnDefault;
	  }

	  return getter;
	}

	getters.createNodeValueGetter = createNodeValueGetter;
	getters.createEdgeValueGetter = createEdgeValueGetter;
	getters.createEdgeWeightGetter = function (name) {
	  return createEdgeValueGetter(name, coerceWeight);
	};

	/* eslint no-constant-condition: 0 */

	/**
	 * Graphology ForceAtlas2 Iteration
	 * =================================
	 *
	 * Function used to perform a single iteration of the algorithm.
	 */

	/**
	 * Matrices properties accessors.
	 */
	var NODE_X = 0;
	var NODE_Y = 1;
	var NODE_DX = 2;
	var NODE_DY = 3;
	var NODE_OLD_DX = 4;
	var NODE_OLD_DY = 5;
	var NODE_MASS = 6;
	var NODE_CONVERGENCE = 7;
	var NODE_SIZE = 8;
	var NODE_FIXED = 9;

	var EDGE_SOURCE = 0;
	var EDGE_TARGET = 1;
	var EDGE_WEIGHT = 2;

	var REGION_NODE = 0;
	var REGION_CENTER_X = 1;
	var REGION_CENTER_Y = 2;
	var REGION_SIZE = 3;
	var REGION_NEXT_SIBLING = 4;
	var REGION_FIRST_CHILD = 5;
	var REGION_MASS = 6;
	var REGION_MASS_CENTER_X = 7;
	var REGION_MASS_CENTER_Y = 8;

	var SUBDIVISION_ATTEMPTS = 3;

	/**
	 * Constants.
	 */
	var PPN$1 = 10;
	var PPE$1 = 3;
	var PPR = 9;

	var MAX_FORCE = 10;

	/**
	 * Function used to perform a single interation of the algorithm.
	 *
	 * @param  {object}       options    - Layout options.
	 * @param  {Float32Array} NodeMatrix - Node data.
	 * @param  {Float32Array} EdgeMatrix - Edge data.
	 * @return {object}                  - Some metadata.
	 */
	var iterate$1 = function iterate(options, NodeMatrix, EdgeMatrix) {
	  // Initializing variables
	  var l, r, n, n1, n2, rn, e, w, g, s;

	  var order = NodeMatrix.length,
	    size = EdgeMatrix.length;

	  var adjustSizes = options.adjustSizes;

	  var thetaSquared = options.barnesHutTheta * options.barnesHutTheta;

	  var outboundAttCompensation, coefficient, xDist, yDist, ewc, distance, factor;

	  var RegionMatrix = [];

	  // 1) Initializing layout data
	  //-----------------------------

	  // Resetting positions & computing max values
	  for (n = 0; n < order; n += PPN$1) {
	    NodeMatrix[n + NODE_OLD_DX] = NodeMatrix[n + NODE_DX];
	    NodeMatrix[n + NODE_OLD_DY] = NodeMatrix[n + NODE_DY];
	    NodeMatrix[n + NODE_DX] = 0;
	    NodeMatrix[n + NODE_DY] = 0;
	  }

	  // If outbound attraction distribution, compensate
	  if (options.outboundAttractionDistribution) {
	    outboundAttCompensation = 0;
	    for (n = 0; n < order; n += PPN$1) {
	      outboundAttCompensation += NodeMatrix[n + NODE_MASS];
	    }

	    outboundAttCompensation /= order / PPN$1;
	  }

	  // 1.bis) Barnes-Hut computation
	  //------------------------------

	  if (options.barnesHutOptimize) {
	    // Setting up
	    var minX = Infinity,
	      maxX = -Infinity,
	      minY = Infinity,
	      maxY = -Infinity,
	      q,
	      q2,
	      subdivisionAttempts;

	    // Computing min and max values
	    for (n = 0; n < order; n += PPN$1) {
	      minX = Math.min(minX, NodeMatrix[n + NODE_X]);
	      maxX = Math.max(maxX, NodeMatrix[n + NODE_X]);
	      minY = Math.min(minY, NodeMatrix[n + NODE_Y]);
	      maxY = Math.max(maxY, NodeMatrix[n + NODE_Y]);
	    }

	    // squarify bounds, it's a quadtree
	    var dx = maxX - minX,
	      dy = maxY - minY;
	    if (dx > dy) {
	      minY -= (dx - dy) / 2;
	      maxY = minY + dx;
	    } else {
	      minX -= (dy - dx) / 2;
	      maxX = minX + dy;
	    }

	    // Build the Barnes Hut root region
	    RegionMatrix[0 + REGION_NODE] = -1;
	    RegionMatrix[0 + REGION_CENTER_X] = (minX + maxX) / 2;
	    RegionMatrix[0 + REGION_CENTER_Y] = (minY + maxY) / 2;
	    RegionMatrix[0 + REGION_SIZE] = Math.max(maxX - minX, maxY - minY);
	    RegionMatrix[0 + REGION_NEXT_SIBLING] = -1;
	    RegionMatrix[0 + REGION_FIRST_CHILD] = -1;
	    RegionMatrix[0 + REGION_MASS] = 0;
	    RegionMatrix[0 + REGION_MASS_CENTER_X] = 0;
	    RegionMatrix[0 + REGION_MASS_CENTER_Y] = 0;

	    // Add each node in the tree
	    l = 1;
	    for (n = 0; n < order; n += PPN$1) {
	      // Current region, starting with root
	      r = 0;
	      subdivisionAttempts = SUBDIVISION_ATTEMPTS;

	      while (true) {
	        // Are there sub-regions?

	        // We look at first child index
	        if (RegionMatrix[r + REGION_FIRST_CHILD] >= 0) {
	          // There are sub-regions

	          // We just iterate to find a "leaf" of the tree
	          // that is an empty region or a region with a single node
	          // (see next case)

	          // Find the quadrant of n
	          if (NodeMatrix[n + NODE_X] < RegionMatrix[r + REGION_CENTER_X]) {
	            if (NodeMatrix[n + NODE_Y] < RegionMatrix[r + REGION_CENTER_Y]) {
	              // Top Left quarter
	              q = RegionMatrix[r + REGION_FIRST_CHILD];
	            } else {
	              // Bottom Left quarter
	              q = RegionMatrix[r + REGION_FIRST_CHILD] + PPR;
	            }
	          } else {
	            if (NodeMatrix[n + NODE_Y] < RegionMatrix[r + REGION_CENTER_Y]) {
	              // Top Right quarter
	              q = RegionMatrix[r + REGION_FIRST_CHILD] + PPR * 2;
	            } else {
	              // Bottom Right quarter
	              q = RegionMatrix[r + REGION_FIRST_CHILD] + PPR * 3;
	            }
	          }

	          // Update center of mass and mass (we only do it for non-leave regions)
	          RegionMatrix[r + REGION_MASS_CENTER_X] =
	            (RegionMatrix[r + REGION_MASS_CENTER_X] *
	              RegionMatrix[r + REGION_MASS] +
	              NodeMatrix[n + NODE_X] * NodeMatrix[n + NODE_MASS]) /
	            (RegionMatrix[r + REGION_MASS] + NodeMatrix[n + NODE_MASS]);

	          RegionMatrix[r + REGION_MASS_CENTER_Y] =
	            (RegionMatrix[r + REGION_MASS_CENTER_Y] *
	              RegionMatrix[r + REGION_MASS] +
	              NodeMatrix[n + NODE_Y] * NodeMatrix[n + NODE_MASS]) /
	            (RegionMatrix[r + REGION_MASS] + NodeMatrix[n + NODE_MASS]);

	          RegionMatrix[r + REGION_MASS] += NodeMatrix[n + NODE_MASS];

	          // Iterate on the right quadrant
	          r = q;
	          continue;
	        } else {
	          // There are no sub-regions: we are in a "leaf"

	          // Is there a node in this leave?
	          if (RegionMatrix[r + REGION_NODE] < 0) {
	            // There is no node in region:
	            // we record node n and go on
	            RegionMatrix[r + REGION_NODE] = n;
	            break;
	          } else {
	            // There is a node in this region

	            // We will need to create sub-regions, stick the two
	            // nodes (the old one r[0] and the new one n) in two
	            // subregions. If they fall in the same quadrant,
	            // we will iterate.

	            // Create sub-regions
	            RegionMatrix[r + REGION_FIRST_CHILD] = l * PPR;
	            w = RegionMatrix[r + REGION_SIZE] / 2; // new size (half)

	            // NOTE: we use screen coordinates
	            // from Top Left to Bottom Right

	            // Top Left sub-region
	            g = RegionMatrix[r + REGION_FIRST_CHILD];

	            RegionMatrix[g + REGION_NODE] = -1;
	            RegionMatrix[g + REGION_CENTER_X] =
	              RegionMatrix[r + REGION_CENTER_X] - w;
	            RegionMatrix[g + REGION_CENTER_Y] =
	              RegionMatrix[r + REGION_CENTER_Y] - w;
	            RegionMatrix[g + REGION_SIZE] = w;
	            RegionMatrix[g + REGION_NEXT_SIBLING] = g + PPR;
	            RegionMatrix[g + REGION_FIRST_CHILD] = -1;
	            RegionMatrix[g + REGION_MASS] = 0;
	            RegionMatrix[g + REGION_MASS_CENTER_X] = 0;
	            RegionMatrix[g + REGION_MASS_CENTER_Y] = 0;

	            // Bottom Left sub-region
	            g += PPR;
	            RegionMatrix[g + REGION_NODE] = -1;
	            RegionMatrix[g + REGION_CENTER_X] =
	              RegionMatrix[r + REGION_CENTER_X] - w;
	            RegionMatrix[g + REGION_CENTER_Y] =
	              RegionMatrix[r + REGION_CENTER_Y] + w;
	            RegionMatrix[g + REGION_SIZE] = w;
	            RegionMatrix[g + REGION_NEXT_SIBLING] = g + PPR;
	            RegionMatrix[g + REGION_FIRST_CHILD] = -1;
	            RegionMatrix[g + REGION_MASS] = 0;
	            RegionMatrix[g + REGION_MASS_CENTER_X] = 0;
	            RegionMatrix[g + REGION_MASS_CENTER_Y] = 0;

	            // Top Right sub-region
	            g += PPR;
	            RegionMatrix[g + REGION_NODE] = -1;
	            RegionMatrix[g + REGION_CENTER_X] =
	              RegionMatrix[r + REGION_CENTER_X] + w;
	            RegionMatrix[g + REGION_CENTER_Y] =
	              RegionMatrix[r + REGION_CENTER_Y] - w;
	            RegionMatrix[g + REGION_SIZE] = w;
	            RegionMatrix[g + REGION_NEXT_SIBLING] = g + PPR;
	            RegionMatrix[g + REGION_FIRST_CHILD] = -1;
	            RegionMatrix[g + REGION_MASS] = 0;
	            RegionMatrix[g + REGION_MASS_CENTER_X] = 0;
	            RegionMatrix[g + REGION_MASS_CENTER_Y] = 0;

	            // Bottom Right sub-region
	            g += PPR;
	            RegionMatrix[g + REGION_NODE] = -1;
	            RegionMatrix[g + REGION_CENTER_X] =
	              RegionMatrix[r + REGION_CENTER_X] + w;
	            RegionMatrix[g + REGION_CENTER_Y] =
	              RegionMatrix[r + REGION_CENTER_Y] + w;
	            RegionMatrix[g + REGION_SIZE] = w;
	            RegionMatrix[g + REGION_NEXT_SIBLING] =
	              RegionMatrix[r + REGION_NEXT_SIBLING];
	            RegionMatrix[g + REGION_FIRST_CHILD] = -1;
	            RegionMatrix[g + REGION_MASS] = 0;
	            RegionMatrix[g + REGION_MASS_CENTER_X] = 0;
	            RegionMatrix[g + REGION_MASS_CENTER_Y] = 0;

	            l += 4;

	            // Now the goal is to find two different sub-regions
	            // for the two nodes: the one previously recorded (r[0])
	            // and the one we want to add (n)

	            // Find the quadrant of the old node
	            if (
	              NodeMatrix[RegionMatrix[r + REGION_NODE] + NODE_X] <
	              RegionMatrix[r + REGION_CENTER_X]
	            ) {
	              if (
	                NodeMatrix[RegionMatrix[r + REGION_NODE] + NODE_Y] <
	                RegionMatrix[r + REGION_CENTER_Y]
	              ) {
	                // Top Left quarter
	                q = RegionMatrix[r + REGION_FIRST_CHILD];
	              } else {
	                // Bottom Left quarter
	                q = RegionMatrix[r + REGION_FIRST_CHILD] + PPR;
	              }
	            } else {
	              if (
	                NodeMatrix[RegionMatrix[r + REGION_NODE] + NODE_Y] <
	                RegionMatrix[r + REGION_CENTER_Y]
	              ) {
	                // Top Right quarter
	                q = RegionMatrix[r + REGION_FIRST_CHILD] + PPR * 2;
	              } else {
	                // Bottom Right quarter
	                q = RegionMatrix[r + REGION_FIRST_CHILD] + PPR * 3;
	              }
	            }

	            // We remove r[0] from the region r, add its mass to r and record it in q
	            RegionMatrix[r + REGION_MASS] =
	              NodeMatrix[RegionMatrix[r + REGION_NODE] + NODE_MASS];
	            RegionMatrix[r + REGION_MASS_CENTER_X] =
	              NodeMatrix[RegionMatrix[r + REGION_NODE] + NODE_X];
	            RegionMatrix[r + REGION_MASS_CENTER_Y] =
	              NodeMatrix[RegionMatrix[r + REGION_NODE] + NODE_Y];

	            RegionMatrix[q + REGION_NODE] = RegionMatrix[r + REGION_NODE];
	            RegionMatrix[r + REGION_NODE] = -1;

	            // Find the quadrant of n
	            if (NodeMatrix[n + NODE_X] < RegionMatrix[r + REGION_CENTER_X]) {
	              if (NodeMatrix[n + NODE_Y] < RegionMatrix[r + REGION_CENTER_Y]) {
	                // Top Left quarter
	                q2 = RegionMatrix[r + REGION_FIRST_CHILD];
	              } else {
	                // Bottom Left quarter
	                q2 = RegionMatrix[r + REGION_FIRST_CHILD] + PPR;
	              }
	            } else {
	              if (NodeMatrix[n + NODE_Y] < RegionMatrix[r + REGION_CENTER_Y]) {
	                // Top Right quarter
	                q2 = RegionMatrix[r + REGION_FIRST_CHILD] + PPR * 2;
	              } else {
	                // Bottom Right quarter
	                q2 = RegionMatrix[r + REGION_FIRST_CHILD] + PPR * 3;
	              }
	            }

	            if (q === q2) {
	              // If both nodes are in the same quadrant,
	              // we have to try it again on this quadrant
	              if (subdivisionAttempts--) {
	                r = q;
	                continue; // while
	              } else {
	                // we are out of precision here, and we cannot subdivide anymore
	                // but we have to break the loop anyway
	                subdivisionAttempts = SUBDIVISION_ATTEMPTS;
	                break; // while
	              }
	            }

	            // If both quadrants are different, we record n
	            // in its quadrant
	            RegionMatrix[q2 + REGION_NODE] = n;
	            break;
	          }
	        }
	      }
	    }
	  }

	  // 2) Repulsion
	  //--------------
	  // NOTES: adjustSizes = antiCollision & scalingRatio = coefficient

	  if (options.barnesHutOptimize) {
	    coefficient = options.scalingRatio;

	    // Applying repulsion through regions
	    for (n = 0; n < order; n += PPN$1) {
	      // Computing leaf quad nodes iteration

	      r = 0; // Starting with root region
	      while (true) {
	        if (RegionMatrix[r + REGION_FIRST_CHILD] >= 0) {
	          // The region has sub-regions

	          // We run the Barnes Hut test to see if we are at the right distance
	          distance =
	            Math.pow(
	              NodeMatrix[n + NODE_X] - RegionMatrix[r + REGION_MASS_CENTER_X],
	              2
	            ) +
	            Math.pow(
	              NodeMatrix[n + NODE_Y] - RegionMatrix[r + REGION_MASS_CENTER_Y],
	              2
	            );

	          s = RegionMatrix[r + REGION_SIZE];

	          if ((4 * s * s) / distance < thetaSquared) {
	            // We treat the region as a single body, and we repulse

	            xDist =
	              NodeMatrix[n + NODE_X] - RegionMatrix[r + REGION_MASS_CENTER_X];
	            yDist =
	              NodeMatrix[n + NODE_Y] - RegionMatrix[r + REGION_MASS_CENTER_Y];

	            if (adjustSizes === true) {
	              //-- Linear Anti-collision Repulsion
	              if (distance > 0) {
	                factor =
	                  (coefficient *
	                    NodeMatrix[n + NODE_MASS] *
	                    RegionMatrix[r + REGION_MASS]) /
	                  distance;

	                NodeMatrix[n + NODE_DX] += xDist * factor;
	                NodeMatrix[n + NODE_DY] += yDist * factor;
	              } else if (distance < 0) {
	                factor =
	                  (-coefficient *
	                    NodeMatrix[n + NODE_MASS] *
	                    RegionMatrix[r + REGION_MASS]) /
	                  Math.sqrt(distance);

	                NodeMatrix[n + NODE_DX] += xDist * factor;
	                NodeMatrix[n + NODE_DY] += yDist * factor;
	              }
	            } else {
	              //-- Linear Repulsion
	              if (distance > 0) {
	                factor =
	                  (coefficient *
	                    NodeMatrix[n + NODE_MASS] *
	                    RegionMatrix[r + REGION_MASS]) /
	                  distance;

	                NodeMatrix[n + NODE_DX] += xDist * factor;
	                NodeMatrix[n + NODE_DY] += yDist * factor;
	              }
	            }

	            // When this is done, we iterate. We have to look at the next sibling.
	            r = RegionMatrix[r + REGION_NEXT_SIBLING];
	            if (r < 0) break; // No next sibling: we have finished the tree

	            continue;
	          } else {
	            // The region is too close and we have to look at sub-regions
	            r = RegionMatrix[r + REGION_FIRST_CHILD];
	            continue;
	          }
	        } else {
	          // The region has no sub-region
	          // If there is a node r[0] and it is not n, then repulse
	          rn = RegionMatrix[r + REGION_NODE];

	          if (rn >= 0 && rn !== n) {
	            xDist = NodeMatrix[n + NODE_X] - NodeMatrix[rn + NODE_X];
	            yDist = NodeMatrix[n + NODE_Y] - NodeMatrix[rn + NODE_Y];

	            distance = xDist * xDist + yDist * yDist;

	            if (adjustSizes === true) {
	              //-- Linear Anti-collision Repulsion
	              if (distance > 0) {
	                factor =
	                  (coefficient *
	                    NodeMatrix[n + NODE_MASS] *
	                    NodeMatrix[rn + NODE_MASS]) /
	                  distance;

	                NodeMatrix[n + NODE_DX] += xDist * factor;
	                NodeMatrix[n + NODE_DY] += yDist * factor;
	              } else if (distance < 0) {
	                factor =
	                  (-coefficient *
	                    NodeMatrix[n + NODE_MASS] *
	                    NodeMatrix[rn + NODE_MASS]) /
	                  Math.sqrt(distance);

	                NodeMatrix[n + NODE_DX] += xDist * factor;
	                NodeMatrix[n + NODE_DY] += yDist * factor;
	              }
	            } else {
	              //-- Linear Repulsion
	              if (distance > 0) {
	                factor =
	                  (coefficient *
	                    NodeMatrix[n + NODE_MASS] *
	                    NodeMatrix[rn + NODE_MASS]) /
	                  distance;

	                NodeMatrix[n + NODE_DX] += xDist * factor;
	                NodeMatrix[n + NODE_DY] += yDist * factor;
	              }
	            }
	          }

	          // When this is done, we iterate. We have to look at the next sibling.
	          r = RegionMatrix[r + REGION_NEXT_SIBLING];

	          if (r < 0) break; // No next sibling: we have finished the tree

	          continue;
	        }
	      }
	    }
	  } else {
	    coefficient = options.scalingRatio;

	    // Square iteration
	    for (n1 = 0; n1 < order; n1 += PPN$1) {
	      for (n2 = 0; n2 < n1; n2 += PPN$1) {
	        // Common to both methods
	        xDist = NodeMatrix[n1 + NODE_X] - NodeMatrix[n2 + NODE_X];
	        yDist = NodeMatrix[n1 + NODE_Y] - NodeMatrix[n2 + NODE_Y];

	        if (adjustSizes === true) {
	          //-- Anticollision Linear Repulsion
	          distance =
	            Math.sqrt(xDist * xDist + yDist * yDist) -
	            NodeMatrix[n1 + NODE_SIZE] -
	            NodeMatrix[n2 + NODE_SIZE];

	          if (distance > 0) {
	            factor =
	              (coefficient *
	                NodeMatrix[n1 + NODE_MASS] *
	                NodeMatrix[n2 + NODE_MASS]) /
	              distance /
	              distance;

	            // Updating nodes' dx and dy
	            NodeMatrix[n1 + NODE_DX] += xDist * factor;
	            NodeMatrix[n1 + NODE_DY] += yDist * factor;

	            NodeMatrix[n2 + NODE_DX] -= xDist * factor;
	            NodeMatrix[n2 + NODE_DY] -= yDist * factor;
	          } else if (distance < 0) {
	            factor =
	              100 *
	              coefficient *
	              NodeMatrix[n1 + NODE_MASS] *
	              NodeMatrix[n2 + NODE_MASS];

	            // Updating nodes' dx and dy
	            NodeMatrix[n1 + NODE_DX] += xDist * factor;
	            NodeMatrix[n1 + NODE_DY] += yDist * factor;

	            NodeMatrix[n2 + NODE_DX] -= xDist * factor;
	            NodeMatrix[n2 + NODE_DY] -= yDist * factor;
	          }
	        } else {
	          //-- Linear Repulsion
	          distance = Math.sqrt(xDist * xDist + yDist * yDist);

	          if (distance > 0) {
	            factor =
	              (coefficient *
	                NodeMatrix[n1 + NODE_MASS] *
	                NodeMatrix[n2 + NODE_MASS]) /
	              distance /
	              distance;

	            // Updating nodes' dx and dy
	            NodeMatrix[n1 + NODE_DX] += xDist * factor;
	            NodeMatrix[n1 + NODE_DY] += yDist * factor;

	            NodeMatrix[n2 + NODE_DX] -= xDist * factor;
	            NodeMatrix[n2 + NODE_DY] -= yDist * factor;
	          }
	        }
	      }
	    }
	  }

	  // 3) Gravity
	  //------------
	  g = options.gravity / options.scalingRatio;
	  coefficient = options.scalingRatio;
	  for (n = 0; n < order; n += PPN$1) {
	    factor = 0;

	    // Common to both methods
	    xDist = NodeMatrix[n + NODE_X];
	    yDist = NodeMatrix[n + NODE_Y];
	    distance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));

	    if (options.strongGravityMode) {
	      //-- Strong gravity
	      if (distance > 0) factor = coefficient * NodeMatrix[n + NODE_MASS] * g;
	    } else {
	      //-- Linear Anti-collision Repulsion n
	      if (distance > 0)
	        factor = (coefficient * NodeMatrix[n + NODE_MASS] * g) / distance;
	    }

	    // Updating node's dx and dy
	    NodeMatrix[n + NODE_DX] -= xDist * factor;
	    NodeMatrix[n + NODE_DY] -= yDist * factor;
	  }

	  // 4) Attraction
	  //---------------
	  coefficient =
	    1 * (options.outboundAttractionDistribution ? outboundAttCompensation : 1);

	  // TODO: simplify distance
	  // TODO: coefficient is always used as -c --> optimize?
	  for (e = 0; e < size; e += PPE$1) {
	    n1 = EdgeMatrix[e + EDGE_SOURCE];
	    n2 = EdgeMatrix[e + EDGE_TARGET];
	    w = EdgeMatrix[e + EDGE_WEIGHT];

	    // Edge weight influence
	    ewc = Math.pow(w, options.edgeWeightInfluence);

	    // Common measures
	    xDist = NodeMatrix[n1 + NODE_X] - NodeMatrix[n2 + NODE_X];
	    yDist = NodeMatrix[n1 + NODE_Y] - NodeMatrix[n2 + NODE_Y];

	    // Applying attraction to nodes
	    if (adjustSizes === true) {
	      distance =
	        Math.sqrt(xDist * xDist + yDist * yDist) -
	        NodeMatrix[n1 + NODE_SIZE] -
	        NodeMatrix[n2 + NODE_SIZE];

	      if (options.linLogMode) {
	        if (options.outboundAttractionDistribution) {
	          //-- LinLog Degree Distributed Anti-collision Attraction
	          if (distance > 0) {
	            factor =
	              (-coefficient * ewc * Math.log(1 + distance)) /
	              distance /
	              NodeMatrix[n1 + NODE_MASS];
	          }
	        } else {
	          //-- LinLog Anti-collision Attraction
	          if (distance > 0) {
	            factor = (-coefficient * ewc * Math.log(1 + distance)) / distance;
	          }
	        }
	      } else {
	        if (options.outboundAttractionDistribution) {
	          //-- Linear Degree Distributed Anti-collision Attraction
	          if (distance > 0) {
	            factor = (-coefficient * ewc) / NodeMatrix[n1 + NODE_MASS];
	          }
	        } else {
	          //-- Linear Anti-collision Attraction
	          if (distance > 0) {
	            factor = -coefficient * ewc;
	          }
	        }
	      }
	    } else {
	      distance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));

	      if (options.linLogMode) {
	        if (options.outboundAttractionDistribution) {
	          //-- LinLog Degree Distributed Attraction
	          if (distance > 0) {
	            factor =
	              (-coefficient * ewc * Math.log(1 + distance)) /
	              distance /
	              NodeMatrix[n1 + NODE_MASS];
	          }
	        } else {
	          //-- LinLog Attraction
	          if (distance > 0)
	            factor = (-coefficient * ewc * Math.log(1 + distance)) / distance;
	        }
	      } else {
	        if (options.outboundAttractionDistribution) {
	          //-- Linear Attraction Mass Distributed
	          // NOTE: Distance is set to 1 to override next condition
	          distance = 1;
	          factor = (-coefficient * ewc) / NodeMatrix[n1 + NODE_MASS];
	        } else {
	          //-- Linear Attraction
	          // NOTE: Distance is set to 1 to override next condition
	          distance = 1;
	          factor = -coefficient * ewc;
	        }
	      }
	    }

	    // Updating nodes' dx and dy
	    // TODO: if condition or factor = 1?
	    if (distance > 0) {
	      // Updating nodes' dx and dy
	      NodeMatrix[n1 + NODE_DX] += xDist * factor;
	      NodeMatrix[n1 + NODE_DY] += yDist * factor;

	      NodeMatrix[n2 + NODE_DX] -= xDist * factor;
	      NodeMatrix[n2 + NODE_DY] -= yDist * factor;
	    }
	  }

	  // 5) Apply Forces
	  //-----------------
	  var force, swinging, traction, nodespeed, newX, newY;

	  // MATH: sqrt and square distances
	  if (adjustSizes === true) {
	    for (n = 0; n < order; n += PPN$1) {
	      if (NodeMatrix[n + NODE_FIXED] !== 1) {
	        force = Math.sqrt(
	          Math.pow(NodeMatrix[n + NODE_DX], 2) +
	            Math.pow(NodeMatrix[n + NODE_DY], 2)
	        );

	        if (force > MAX_FORCE) {
	          NodeMatrix[n + NODE_DX] =
	            (NodeMatrix[n + NODE_DX] * MAX_FORCE) / force;
	          NodeMatrix[n + NODE_DY] =
	            (NodeMatrix[n + NODE_DY] * MAX_FORCE) / force;
	        }

	        swinging =
	          NodeMatrix[n + NODE_MASS] *
	          Math.sqrt(
	            (NodeMatrix[n + NODE_OLD_DX] - NodeMatrix[n + NODE_DX]) *
	              (NodeMatrix[n + NODE_OLD_DX] - NodeMatrix[n + NODE_DX]) +
	              (NodeMatrix[n + NODE_OLD_DY] - NodeMatrix[n + NODE_DY]) *
	                (NodeMatrix[n + NODE_OLD_DY] - NodeMatrix[n + NODE_DY])
	          );

	        traction =
	          Math.sqrt(
	            (NodeMatrix[n + NODE_OLD_DX] + NodeMatrix[n + NODE_DX]) *
	              (NodeMatrix[n + NODE_OLD_DX] + NodeMatrix[n + NODE_DX]) +
	              (NodeMatrix[n + NODE_OLD_DY] + NodeMatrix[n + NODE_DY]) *
	                (NodeMatrix[n + NODE_OLD_DY] + NodeMatrix[n + NODE_DY])
	          ) / 2;

	        nodespeed = (0.1 * Math.log(1 + traction)) / (1 + Math.sqrt(swinging));

	        // Updating node's positon
	        newX =
	          NodeMatrix[n + NODE_X] +
	          NodeMatrix[n + NODE_DX] * (nodespeed / options.slowDown);
	        NodeMatrix[n + NODE_X] = newX;

	        newY =
	          NodeMatrix[n + NODE_Y] +
	          NodeMatrix[n + NODE_DY] * (nodespeed / options.slowDown);
	        NodeMatrix[n + NODE_Y] = newY;
	      }
	    }
	  } else {
	    for (n = 0; n < order; n += PPN$1) {
	      if (NodeMatrix[n + NODE_FIXED] !== 1) {
	        swinging =
	          NodeMatrix[n + NODE_MASS] *
	          Math.sqrt(
	            (NodeMatrix[n + NODE_OLD_DX] - NodeMatrix[n + NODE_DX]) *
	              (NodeMatrix[n + NODE_OLD_DX] - NodeMatrix[n + NODE_DX]) +
	              (NodeMatrix[n + NODE_OLD_DY] - NodeMatrix[n + NODE_DY]) *
	                (NodeMatrix[n + NODE_OLD_DY] - NodeMatrix[n + NODE_DY])
	          );

	        traction =
	          Math.sqrt(
	            (NodeMatrix[n + NODE_OLD_DX] + NodeMatrix[n + NODE_DX]) *
	              (NodeMatrix[n + NODE_OLD_DX] + NodeMatrix[n + NODE_DX]) +
	              (NodeMatrix[n + NODE_OLD_DY] + NodeMatrix[n + NODE_DY]) *
	                (NodeMatrix[n + NODE_OLD_DY] + NodeMatrix[n + NODE_DY])
	          ) / 2;

	        nodespeed =
	          (NodeMatrix[n + NODE_CONVERGENCE] * Math.log(1 + traction)) /
	          (1 + Math.sqrt(swinging));

	        // Updating node convergence
	        NodeMatrix[n + NODE_CONVERGENCE] = Math.min(
	          1,
	          Math.sqrt(
	            (nodespeed *
	              (Math.pow(NodeMatrix[n + NODE_DX], 2) +
	                Math.pow(NodeMatrix[n + NODE_DY], 2))) /
	              (1 + Math.sqrt(swinging))
	          )
	        );

	        // Updating node's positon
	        newX =
	          NodeMatrix[n + NODE_X] +
	          NodeMatrix[n + NODE_DX] * (nodespeed / options.slowDown);
	        NodeMatrix[n + NODE_X] = newX;

	        newY =
	          NodeMatrix[n + NODE_Y] +
	          NodeMatrix[n + NODE_DY] * (nodespeed / options.slowDown);
	        NodeMatrix[n + NODE_Y] = newY;
	      }
	    }
	  }

	  // We return the information about the layout (no need to return the matrices)
	  return {};
	};

	var helpers$1 = {};

	/**
	 * Graphology ForceAtlas2 Helpers
	 * ===============================
	 *
	 * Miscellaneous helper functions.
	 */

	/**
	 * Constants.
	 */
	var PPN = 10;
	var PPE = 3;

	/**
	 * Very simple Object.assign-like function.
	 *
	 * @param  {object} target       - First object.
	 * @param  {object} [...objects] - Objects to merge.
	 * @return {object}
	 */
	helpers$1.assign = function (target) {
	  target = target || {};

	  var objects = Array.prototype.slice.call(arguments).slice(1),
	    i,
	    k,
	    l;

	  for (i = 0, l = objects.length; i < l; i++) {
	    if (!objects[i]) continue;

	    for (k in objects[i]) target[k] = objects[i][k];
	  }

	  return target;
	};

	/**
	 * Function used to validate the given settings.
	 *
	 * @param  {object}      settings - Settings to validate.
	 * @return {object|null}
	 */
	helpers$1.validateSettings = function (settings) {
	  if ('linLogMode' in settings && typeof settings.linLogMode !== 'boolean')
	    return {message: 'the `linLogMode` setting should be a boolean.'};

	  if (
	    'outboundAttractionDistribution' in settings &&
	    typeof settings.outboundAttractionDistribution !== 'boolean'
	  )
	    return {
	      message:
	        'the `outboundAttractionDistribution` setting should be a boolean.'
	    };

	  if ('adjustSizes' in settings && typeof settings.adjustSizes !== 'boolean')
	    return {message: 'the `adjustSizes` setting should be a boolean.'};

	  if (
	    'edgeWeightInfluence' in settings &&
	    typeof settings.edgeWeightInfluence !== 'number'
	  )
	    return {
	      message: 'the `edgeWeightInfluence` setting should be a number.'
	    };

	  if (
	    'scalingRatio' in settings &&
	    !(typeof settings.scalingRatio === 'number' && settings.scalingRatio >= 0)
	  )
	    return {message: 'the `scalingRatio` setting should be a number >= 0.'};

	  if (
	    'strongGravityMode' in settings &&
	    typeof settings.strongGravityMode !== 'boolean'
	  )
	    return {message: 'the `strongGravityMode` setting should be a boolean.'};

	  if (
	    'gravity' in settings &&
	    !(typeof settings.gravity === 'number' && settings.gravity >= 0)
	  )
	    return {message: 'the `gravity` setting should be a number >= 0.'};

	  if (
	    'slowDown' in settings &&
	    !(typeof settings.slowDown === 'number' || settings.slowDown >= 0)
	  )
	    return {message: 'the `slowDown` setting should be a number >= 0.'};

	  if (
	    'barnesHutOptimize' in settings &&
	    typeof settings.barnesHutOptimize !== 'boolean'
	  )
	    return {message: 'the `barnesHutOptimize` setting should be a boolean.'};

	  if (
	    'barnesHutTheta' in settings &&
	    !(
	      typeof settings.barnesHutTheta === 'number' &&
	      settings.barnesHutTheta >= 0
	    )
	  )
	    return {message: 'the `barnesHutTheta` setting should be a number >= 0.'};

	  return null;
	};

	/**
	 * Function generating a flat matrix for both nodes & edges of the given graph.
	 *
	 * @param  {Graph}    graph         - Target graph.
	 * @param  {function} getEdgeWeight - Edge weight getter function.
	 * @return {object}                 - Both matrices.
	 */
	helpers$1.graphToByteArrays = function (graph, getEdgeWeight) {
	  var order = graph.order;
	  var size = graph.size;
	  var index = {};
	  var j;

	  // NOTE: float32 could lead to issues if edge array needs to index large
	  // number of nodes.
	  var NodeMatrix = new Float32Array(order * PPN);
	  var EdgeMatrix = new Float32Array(size * PPE);

	  // Iterate through nodes
	  j = 0;
	  graph.forEachNode(function (node, attr) {
	    // Node index
	    index[node] = j;

	    // Populating byte array
	    NodeMatrix[j] = attr.x;
	    NodeMatrix[j + 1] = attr.y;
	    NodeMatrix[j + 2] = 0; // dx
	    NodeMatrix[j + 3] = 0; // dy
	    NodeMatrix[j + 4] = 0; // old_dx
	    NodeMatrix[j + 5] = 0; // old_dy
	    NodeMatrix[j + 6] = 1; // mass
	    NodeMatrix[j + 7] = 1; // convergence
	    NodeMatrix[j + 8] = attr.size || 1;
	    NodeMatrix[j + 9] = attr.fixed ? 1 : 0;
	    j += PPN;
	  });

	  // Iterate through edges
	  j = 0;
	  graph.forEachEdge(function (edge, attr, source, target, sa, ta, u) {
	    var sj = index[source];
	    var tj = index[target];

	    var weight = getEdgeWeight(edge, attr, source, target, sa, ta, u);

	    // Incrementing mass to be a node's weighted degree
	    NodeMatrix[sj + 6] += weight;
	    NodeMatrix[tj + 6] += weight;

	    // Populating byte array
	    EdgeMatrix[j] = sj;
	    EdgeMatrix[j + 1] = tj;
	    EdgeMatrix[j + 2] = weight;
	    j += PPE;
	  });

	  return {
	    nodes: NodeMatrix,
	    edges: EdgeMatrix
	  };
	};

	/**
	 * Function applying the layout back to the graph.
	 *
	 * @param {Graph}         graph         - Target graph.
	 * @param {Float32Array}  NodeMatrix    - Node matrix.
	 * @param {function|null} outputReducer - A node reducer.
	 */
	helpers$1.assignLayoutChanges = function (graph, NodeMatrix, outputReducer) {
	  var i = 0;

	  graph.updateEachNodeAttributes(function (node, attr) {
	    attr.x = NodeMatrix[i];
	    attr.y = NodeMatrix[i + 1];

	    i += PPN;

	    return outputReducer ? outputReducer(node, attr) : attr;
	  });
	};

	/**
	 * Function reading the positions (only) from the graph, to write them in the matrix.
	 *
	 * @param {Graph}        graph      - Target graph.
	 * @param {Float32Array} NodeMatrix - Node matrix.
	 */
	helpers$1.readGraphPositions = function (graph, NodeMatrix) {
	  var i = 0;

	  graph.forEachNode(function (node, attr) {
	    NodeMatrix[i] = attr.x;
	    NodeMatrix[i + 1] = attr.y;

	    i += PPN;
	  });
	};

	/**
	 * Function collecting the layout positions.
	 *
	 * @param  {Graph}         graph         - Target graph.
	 * @param  {Float32Array}  NodeMatrix    - Node matrix.
	 * @param  {function|null} outputReducer - A nodes reducer.
	 * @return {object}                      - Map to node positions.
	 */
	helpers$1.collectLayoutChanges = function (graph, NodeMatrix, outputReducer) {
	  var nodes = graph.nodes(),
	    positions = {};

	  for (var i = 0, j = 0, l = NodeMatrix.length; i < l; i += PPN) {
	    if (outputReducer) {
	      var newAttr = Object.assign({}, graph.getNodeAttributes(nodes[j]));
	      newAttr.x = NodeMatrix[i];
	      newAttr.y = NodeMatrix[i + 1];
	      newAttr = outputReducer(nodes[j], newAttr);
	      positions[nodes[j]] = {
	        x: newAttr.x,
	        y: newAttr.y
	      };
	    } else {
	      positions[nodes[j]] = {
	        x: NodeMatrix[i],
	        y: NodeMatrix[i + 1]
	      };
	    }

	    j++;
	  }

	  return positions;
	};

	/**
	 * Function returning a web worker from the given function.
	 *
	 * @param  {function}  fn - Function for the worker.
	 * @return {DOMString}
	 */
	helpers$1.createWorker = function createWorker(fn) {
	  var xURL = window.URL || window.webkitURL;
	  var code = fn.toString();
	  var objectUrl = xURL.createObjectURL(
	    new Blob(['(' + code + ').call(this);'], {type: 'text/javascript'})
	  );
	  var worker = new Worker(objectUrl);
	  xURL.revokeObjectURL(objectUrl);

	  return worker;
	};

	/**
	 * Graphology ForceAtlas2 Layout Default Settings
	 * ===============================================
	 */

	var defaults = {
	  linLogMode: false,
	  outboundAttractionDistribution: false,
	  adjustSizes: false,
	  edgeWeightInfluence: 1,
	  scalingRatio: 1,
	  strongGravityMode: false,
	  gravity: 1,
	  slowDown: 1,
	  barnesHutOptimize: false,
	  barnesHutTheta: 0.5
	};

	/**
	 * Graphology ForceAtlas2 Layout
	 * ==============================
	 *
	 * Library endpoint.
	 */

	var isGraph = isGraph$1;
	var createEdgeWeightGetter =
	  getters.createEdgeWeightGetter;
	var iterate = iterate$1;
	var helpers = helpers$1;

	var DEFAULT_SETTINGS$1 = defaults;

	/**
	 * Asbtract function used to run a certain number of iterations.
	 *
	 * @param  {boolean}       assign          - Whether to assign positions.
	 * @param  {Graph}         graph           - Target graph.
	 * @param  {object|number} params          - If number, params.iterations, else:
	 * @param  {function}        getWeight     - Edge weight getter function.
	 * @param  {number}          iterations    - Number of iterations.
	 * @param  {function|null}   outputReducer - A node reducer
	 * @param  {object}          [settings]    - Settings.
	 * @return {object|undefined}
	 */
	function abstractSynchronousLayout(assign, graph, params) {
	  if (!isGraph(graph))
	    throw new Error(
	      'graphology-layout-forceatlas2: the given graph is not a valid graphology instance.'
	    );

	  if (typeof params === 'number') params = {iterations: params};

	  var iterations = params.iterations;

	  if (typeof iterations !== 'number')
	    throw new Error(
	      'graphology-layout-forceatlas2: invalid number of iterations.'
	    );

	  if (iterations <= 0)
	    throw new Error(
	      'graphology-layout-forceatlas2: you should provide a positive number of iterations.'
	    );

	  var getEdgeWeight = createEdgeWeightGetter(
	    'getEdgeWeight' in params ? params.getEdgeWeight : 'weight'
	  ).fromEntry;

	  var outputReducer =
	    typeof params.outputReducer === 'function' ? params.outputReducer : null;

	  // Validating settings
	  var settings = helpers.assign({}, DEFAULT_SETTINGS$1, params.settings);
	  var validationError = helpers.validateSettings(settings);

	  if (validationError)
	    throw new Error(
	      'graphology-layout-forceatlas2: ' + validationError.message
	    );

	  // Building matrices
	  var matrices = helpers.graphToByteArrays(graph, getEdgeWeight);

	  var i;

	  // Iterating
	  for (i = 0; i < iterations; i++)
	    iterate(settings, matrices.nodes, matrices.edges);

	  // Applying
	  if (assign) {
	    helpers.assignLayoutChanges(graph, matrices.nodes, outputReducer);
	    return;
	  }

	  return helpers.collectLayoutChanges(graph, matrices.nodes);
	}

	/**
	 * Function returning sane layout settings for the given graph.
	 *
	 * @param  {Graph|number} graph - Target graph or graph order.
	 * @return {object}
	 */
	function inferSettings(graph) {
	  var order = typeof graph === 'number' ? graph : graph.order;

	  return {
	    barnesHutOptimize: order > 2000,
	    strongGravityMode: true,
	    gravity: 0.05,
	    scalingRatio: 10,
	    slowDown: 1 + Math.log(order)
	  };
	}

	/**
	 * Exporting.
	 */
	var synchronousLayout = abstractSynchronousLayout.bind(null, false);
	synchronousLayout.assign = abstractSynchronousLayout.bind(null, true);
	synchronousLayout.inferSettings = inferSettings;

	var graphologyLayoutForceatlas2 = synchronousLayout;

	var forceAtlas2 = /*@__PURE__*/getDefaultExportFromCjs(graphologyLayoutForceatlas2);

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function toPrimitive(t, r) {
	  if ("object" != typeof t || !t) return t;
	  var e = t[Symbol.toPrimitive];
	  if (void 0 !== e) {
	    var i = e.call(t, r);
	    if ("object" != typeof i) return i;
	    throw new TypeError("@@toPrimitive must return a primitive value.");
	  }
	  return (String )(t);
	}

	function toPropertyKey(t) {
	  var i = toPrimitive(t, "string");
	  return "symbol" == typeof i ? i : String(i);
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, toPropertyKey(descriptor.key), descriptor);
	  }
	}
	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  Object.defineProperty(Constructor, "prototype", {
	    writable: false
	  });
	  return Constructor;
	}

	function _getPrototypeOf(o) {
	  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
	    return o.__proto__ || Object.getPrototypeOf(o);
	  };
	  return _getPrototypeOf(o);
	}

	function _isNativeReflectConstruct() {
	  try {
	    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
	  } catch (t) {}
	  return (_isNativeReflectConstruct = function () {
	    return !!t;
	  })();
	}

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }
	  return self;
	}

	function _possibleConstructorReturn(self, call) {
	  if (call && (typeof call === "object" || typeof call === "function")) {
	    return call;
	  } else if (call !== void 0) {
	    throw new TypeError("Derived constructors may only return object or undefined");
	  }
	  return _assertThisInitialized(self);
	}

	function _callSuper(t, o, e) {
	  return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
	}

	function _setPrototypeOf(o, p) {
	  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
	    o.__proto__ = p;
	    return o;
	  };
	  return _setPrototypeOf(o, p);
	}

	function _inherits(subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function");
	  }
	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      writable: true,
	      configurable: true
	    }
	  });
	  Object.defineProperty(subClass, "prototype", {
	    writable: false
	  });
	  if (superClass) _setPrototypeOf(subClass, superClass);
	}

	function _arrayWithHoles(arr) {
	  if (Array.isArray(arr)) return arr;
	}

	function _iterableToArrayLimit(r, l) {
	  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
	  if (null != t) {
	    var e,
	      n,
	      i,
	      u,
	      a = [],
	      f = !0,
	      o = !1;
	    try {
	      if (i = (t = t.call(r)).next, 0 === l) {
	        if (Object(t) !== t) return;
	        f = !1;
	      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
	    } catch (r) {
	      o = !0, n = r;
	    } finally {
	      try {
	        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
	      } finally {
	        if (o) throw n;
	      }
	    }
	    return a;
	  }
	}

	function _arrayLikeToArray(arr, len) {
	  if (len == null || len > arr.length) len = arr.length;
	  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
	  return arr2;
	}

	function _unsupportedIterableToArray(o, minLen) {
	  if (!o) return;
	  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
	  var n = Object.prototype.toString.call(o).slice(8, -1);
	  if (n === "Object" && o.constructor) n = o.constructor.name;
	  if (n === "Map" || n === "Set") return Array.from(o);
	  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}

	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	function _slicedToArray(arr, i) {
	  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
	}

	var HTML_COLORS = {
	  black: "#000000",
	  silver: "#C0C0C0",
	  gray: "#808080",
	  grey: "#808080",
	  white: "#FFFFFF",
	  maroon: "#800000",
	  red: "#FF0000",
	  purple: "#800080",
	  fuchsia: "#FF00FF",
	  green: "#008000",
	  lime: "#00FF00",
	  olive: "#808000",
	  yellow: "#FFFF00",
	  navy: "#000080",
	  blue: "#0000FF",
	  teal: "#008080",
	  aqua: "#00FFFF",
	  darkblue: "#00008B",
	  mediumblue: "#0000CD",
	  darkgreen: "#006400",
	  darkcyan: "#008B8B",
	  deepskyblue: "#00BFFF",
	  darkturquoise: "#00CED1",
	  mediumspringgreen: "#00FA9A",
	  springgreen: "#00FF7F",
	  cyan: "#00FFFF",
	  midnightblue: "#191970",
	  dodgerblue: "#1E90FF",
	  lightseagreen: "#20B2AA",
	  forestgreen: "#228B22",
	  seagreen: "#2E8B57",
	  darkslategray: "#2F4F4F",
	  darkslategrey: "#2F4F4F",
	  limegreen: "#32CD32",
	  mediumseagreen: "#3CB371",
	  turquoise: "#40E0D0",
	  royalblue: "#4169E1",
	  steelblue: "#4682B4",
	  darkslateblue: "#483D8B",
	  mediumturquoise: "#48D1CC",
	  indigo: "#4B0082",
	  darkolivegreen: "#556B2F",
	  cadetblue: "#5F9EA0",
	  cornflowerblue: "#6495ED",
	  rebeccapurple: "#663399",
	  mediumaquamarine: "#66CDAA",
	  dimgray: "#696969",
	  dimgrey: "#696969",
	  slateblue: "#6A5ACD",
	  olivedrab: "#6B8E23",
	  slategray: "#708090",
	  slategrey: "#708090",
	  lightslategray: "#778899",
	  lightslategrey: "#778899",
	  mediumslateblue: "#7B68EE",
	  lawngreen: "#7CFC00",
	  chartreuse: "#7FFF00",
	  aquamarine: "#7FFFD4",
	  skyblue: "#87CEEB",
	  lightskyblue: "#87CEFA",
	  blueviolet: "#8A2BE2",
	  darkred: "#8B0000",
	  darkmagenta: "#8B008B",
	  saddlebrown: "#8B4513",
	  darkseagreen: "#8FBC8F",
	  lightgreen: "#90EE90",
	  mediumpurple: "#9370DB",
	  darkviolet: "#9400D3",
	  palegreen: "#98FB98",
	  darkorchid: "#9932CC",
	  yellowgreen: "#9ACD32",
	  sienna: "#A0522D",
	  brown: "#A52A2A",
	  darkgray: "#A9A9A9",
	  darkgrey: "#A9A9A9",
	  lightblue: "#ADD8E6",
	  greenyellow: "#ADFF2F",
	  paleturquoise: "#AFEEEE",
	  lightsteelblue: "#B0C4DE",
	  powderblue: "#B0E0E6",
	  firebrick: "#B22222",
	  darkgoldenrod: "#B8860B",
	  mediumorchid: "#BA55D3",
	  rosybrown: "#BC8F8F",
	  darkkhaki: "#BDB76B",
	  mediumvioletred: "#C71585",
	  indianred: "#CD5C5C",
	  peru: "#CD853F",
	  chocolate: "#D2691E",
	  tan: "#D2B48C",
	  lightgray: "#D3D3D3",
	  lightgrey: "#D3D3D3",
	  thistle: "#D8BFD8",
	  orchid: "#DA70D6",
	  goldenrod: "#DAA520",
	  palevioletred: "#DB7093",
	  crimson: "#DC143C",
	  gainsboro: "#DCDCDC",
	  plum: "#DDA0DD",
	  burlywood: "#DEB887",
	  lightcyan: "#E0FFFF",
	  lavender: "#E6E6FA",
	  darksalmon: "#E9967A",
	  violet: "#EE82EE",
	  palegoldenrod: "#EEE8AA",
	  lightcoral: "#F08080",
	  khaki: "#F0E68C",
	  aliceblue: "#F0F8FF",
	  honeydew: "#F0FFF0",
	  azure: "#F0FFFF",
	  sandybrown: "#F4A460",
	  wheat: "#F5DEB3",
	  beige: "#F5F5DC",
	  whitesmoke: "#F5F5F5",
	  mintcream: "#F5FFFA",
	  ghostwhite: "#F8F8FF",
	  salmon: "#FA8072",
	  antiquewhite: "#FAEBD7",
	  linen: "#FAF0E6",
	  lightgoldenrodyellow: "#FAFAD2",
	  oldlace: "#FDF5E6",
	  magenta: "#FF00FF",
	  deeppink: "#FF1493",
	  orangered: "#FF4500",
	  tomato: "#FF6347",
	  hotpink: "#FF69B4",
	  coral: "#FF7F50",
	  darkorange: "#FF8C00",
	  lightsalmon: "#FFA07A",
	  orange: "#FFA500",
	  lightpink: "#FFB6C1",
	  pink: "#FFC0CB",
	  gold: "#FFD700",
	  peachpuff: "#FFDAB9",
	  navajowhite: "#FFDEAD",
	  moccasin: "#FFE4B5",
	  bisque: "#FFE4C4",
	  mistyrose: "#FFE4E1",
	  blanchedalmond: "#FFEBCD",
	  papayawhip: "#FFEFD5",
	  lavenderblush: "#FFF0F5",
	  seashell: "#FFF5EE",
	  cornsilk: "#FFF8DC",
	  lemonchiffon: "#FFFACD",
	  floralwhite: "#FFFAF0",
	  snow: "#FFFAFA",
	  lightyellow: "#FFFFE0",
	  ivory: "#FFFFF0"
	};

	/**
	 * Memoized function returning a float-encoded color from various string
	 * formats describing colors.
	 */
	var INT8 = new Int8Array(4);
	var INT32 = new Int32Array(INT8.buffer, 0, 1);
	var FLOAT32 = new Float32Array(INT8.buffer, 0, 1);
	var RGBA_TEST_REGEX = /^\s*rgba?\s*\(/;
	var RGBA_EXTRACT_REGEX = /^\s*rgba?\s*\(\s*([0-9]*)\s*,\s*([0-9]*)\s*,\s*([0-9]*)(?:\s*,\s*(.*)?)?\)\s*$/;
	function parseColor(val) {
	  var r = 0; // byte
	  var g = 0; // byte
	  var b = 0; // byte
	  var a = 1; // float

	  // Handling hexadecimal notation
	  if (val[0] === "#") {
	    if (val.length === 4) {
	      r = parseInt(val.charAt(1) + val.charAt(1), 16);
	      g = parseInt(val.charAt(2) + val.charAt(2), 16);
	      b = parseInt(val.charAt(3) + val.charAt(3), 16);
	    } else {
	      r = parseInt(val.charAt(1) + val.charAt(2), 16);
	      g = parseInt(val.charAt(3) + val.charAt(4), 16);
	      b = parseInt(val.charAt(5) + val.charAt(6), 16);
	    }
	    if (val.length === 9) {
	      a = parseInt(val.charAt(7) + val.charAt(8), 16) / 255;
	    }
	  }

	  // Handling rgb notation
	  else if (RGBA_TEST_REGEX.test(val)) {
	    var match = val.match(RGBA_EXTRACT_REGEX);
	    if (match) {
	      r = +match[1];
	      g = +match[2];
	      b = +match[3];
	      if (match[4]) a = +match[4];
	    }
	  }
	  return {
	    r: r,
	    g: g,
	    b: b,
	    a: a
	  };
	}
	var FLOAT_COLOR_CACHE = {};
	for (var htmlColor in HTML_COLORS) {
	  FLOAT_COLOR_CACHE[htmlColor] = floatColor(HTML_COLORS[htmlColor]);
	  // Replicating cache for hex values for free
	  FLOAT_COLOR_CACHE[HTML_COLORS[htmlColor]] = FLOAT_COLOR_CACHE[htmlColor];
	}
	function rgbaToFloat(r, g, b, a, masking) {
	  INT32[0] = a << 24 | b << 16 | g << 8 | r;
	  INT32[0] = INT32[0] & 0xfeffffff;
	  return FLOAT32[0];
	}
	function floatColor(val) {
	  // The html color names are case-insensitive
	  val = val.toLowerCase();

	  // If the color is already computed, we yield it
	  if (typeof FLOAT_COLOR_CACHE[val] !== "undefined") return FLOAT_COLOR_CACHE[val];
	  var parsed = parseColor(val);
	  var r = parsed.r,
	    g = parsed.g,
	    b = parsed.b;
	  var a = parsed.a;
	  a = a * 255 | 0;
	  var color = rgbaToFloat(r, g, b, a);
	  FLOAT_COLOR_CACHE[val] = color;
	  return color;
	}
	var FLOAT_INDEX_CACHE = {};
	function indexToColor(index) {
	  // If the index is already computed, we yield it
	  if (typeof FLOAT_INDEX_CACHE[index] !== "undefined") return FLOAT_INDEX_CACHE[index];

	  // To address issue #1397, one strategy is to keep encoding 4 bytes colors,
	  // but with alpha hard-set to 1.0 (or 255):
	  var r = (index & 0x00ff0000) >>> 16;
	  var g = (index & 0x0000ff00) >>> 8;
	  var b = index & 0x000000ff;
	  var a = 0x000000ff;

	  // The original 4 bytes color encoding was the following:
	  // const r = (index & 0xff000000) >>> 24;
	  // const g = (index & 0x00ff0000) >>> 16;
	  // const b = (index & 0x0000ff00) >>> 8;
	  // const a = index & 0x000000ff;

	  var color = rgbaToFloat(r, g, b, a);
	  FLOAT_INDEX_CACHE[index] = color;
	  return color;
	}
	function colorToIndex(r, g, b, _a) {
	  // As for the function indexToColor, because of #1397 and the "alpha is always
	  // 1.0" strategy, we need to fix this function as well:
	  return b + (g << 8) + (r << 16);

	  // The original 4 bytes color decoding is the following:
	  // return a + (b << 8) + (g << 16) + (r << 24);
	}
	function getPixelColor(gl, frameBuffer, x, y, pixelRatio, downSizingRatio) {
	  var bufferX = Math.floor(x / downSizingRatio * pixelRatio);
	  var bufferY = Math.floor(gl.drawingBufferHeight / downSizingRatio - y / downSizingRatio * pixelRatio);
	  var pixel = new Uint8Array(4);
	  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	  gl.readPixels(bufferX, bufferY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
	  var _pixel = _slicedToArray(pixel, 4),
	    r = _pixel[0],
	    g = _pixel[1],
	    b = _pixel[2],
	    a = _pixel[3];
	  return [r, g, b, a];
	}

	function _defineProperty(obj, key, value) {
	  key = toPropertyKey(key);
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

	function ownKeys(e, r) {
	  var t = Object.keys(e);
	  if (Object.getOwnPropertySymbols) {
	    var o = Object.getOwnPropertySymbols(e);
	    r && (o = o.filter(function (r) {
	      return Object.getOwnPropertyDescriptor(e, r).enumerable;
	    })), t.push.apply(t, o);
	  }
	  return t;
	}
	function _objectSpread2(e) {
	  for (var r = 1; r < arguments.length; r++) {
	    var t = null != arguments[r] ? arguments[r] : {};
	    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
	      _defineProperty(e, r, t[r]);
	    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
	      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
	    });
	  }
	  return e;
	}

	function _superPropBase(object, property) {
	  while (!Object.prototype.hasOwnProperty.call(object, property)) {
	    object = _getPrototypeOf(object);
	    if (object === null) break;
	  }
	  return object;
	}

	function _get() {
	  if (typeof Reflect !== "undefined" && Reflect.get) {
	    _get = Reflect.get.bind();
	  } else {
	    _get = function _get(target, property, receiver) {
	      var base = _superPropBase(target, property);
	      if (!base) return;
	      var desc = Object.getOwnPropertyDescriptor(base, property);
	      if (desc.get) {
	        return desc.get.call(arguments.length < 3 ? target : receiver);
	      }
	      return desc.value;
	    };
	  }
	  return _get.apply(this, arguments);
	}

	function getAttributeItemsCount(attr) {
	  return attr.normalized ? 1 : attr.size;
	}
	function getAttributesItemsCount(attrs) {
	  var res = 0;
	  attrs.forEach(function (attr) {
	    return res += getAttributeItemsCount(attr);
	  });
	  return res;
	}
	function loadShader(type, gl, source) {
	  var glType = type === "VERTEX" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER;

	  // Creating the shader
	  var shader = gl.createShader(glType);
	  if (shader === null) {
	    throw new Error("loadShader: error while creating the shader");
	  }

	  // Loading source
	  gl.shaderSource(shader, source);

	  // Compiling the shader
	  gl.compileShader(shader);

	  // Retrieving compilation status
	  var successfullyCompiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

	  // Throwing if something went awry
	  if (!successfullyCompiled) {
	    var infoLog = gl.getShaderInfoLog(shader);
	    gl.deleteShader(shader);
	    throw new Error("loadShader: error while compiling the shader:\n".concat(infoLog, "\n").concat(source));
	  }
	  return shader;
	}
	function loadVertexShader(gl, source) {
	  return loadShader("VERTEX", gl, source);
	}
	function loadFragmentShader(gl, source) {
	  return loadShader("FRAGMENT", gl, source);
	}

	/**
	 * Function used to load a program.
	 */
	function loadProgram(gl, shaders) {
	  var program = gl.createProgram();
	  if (program === null) {
	    throw new Error("loadProgram: error while creating the program.");
	  }
	  var i, l;

	  // Attaching the shaders
	  for (i = 0, l = shaders.length; i < l; i++) gl.attachShader(program, shaders[i]);
	  gl.linkProgram(program);

	  // Checking status
	  var successfullyLinked = gl.getProgramParameter(program, gl.LINK_STATUS);
	  if (!successfullyLinked) {
	    gl.deleteProgram(program);
	    throw new Error("loadProgram: error while linking the program.");
	  }
	  return program;
	}
	function killProgram(_ref) {
	  var gl = _ref.gl,
	    buffer = _ref.buffer,
	    program = _ref.program,
	    vertexShader = _ref.vertexShader,
	    fragmentShader = _ref.fragmentShader;
	  gl.deleteShader(vertexShader);
	  gl.deleteShader(fragmentShader);
	  gl.deleteProgram(program);
	  gl.deleteBuffer(buffer);
	}

	var PICKING_PREFIX = "#define PICKING_MODE\n";
	var SIZE_FACTOR_PER_ATTRIBUTE_TYPE = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, WebGL2RenderingContext.BOOL, 1), WebGL2RenderingContext.BYTE, 1), WebGL2RenderingContext.UNSIGNED_BYTE, 1), WebGL2RenderingContext.SHORT, 2), WebGL2RenderingContext.UNSIGNED_SHORT, 2), WebGL2RenderingContext.INT, 4), WebGL2RenderingContext.UNSIGNED_INT, 4), WebGL2RenderingContext.FLOAT, 4);
	var Program = /*#__PURE__*/function () {
	  function Program(gl, pickingBuffer, renderer) {
	    _classCallCheck(this, Program);
	    // GLenum
	    _defineProperty(this, "array", new Float32Array());
	    _defineProperty(this, "constantArray", new Float32Array());
	    _defineProperty(this, "capacity", 0);
	    _defineProperty(this, "verticesCount", 0);
	    // Reading and caching program definition
	    var def = this.getDefinition();
	    this.VERTICES = def.VERTICES;
	    this.VERTEX_SHADER_SOURCE = def.VERTEX_SHADER_SOURCE;
	    this.FRAGMENT_SHADER_SOURCE = def.FRAGMENT_SHADER_SOURCE;
	    this.UNIFORMS = def.UNIFORMS;
	    this.ATTRIBUTES = def.ATTRIBUTES;
	    this.METHOD = def.METHOD;
	    this.CONSTANT_ATTRIBUTES = "CONSTANT_ATTRIBUTES" in def ? def.CONSTANT_ATTRIBUTES : [];
	    this.CONSTANT_DATA = "CONSTANT_DATA" in def ? def.CONSTANT_DATA : [];
	    this.isInstanced = "CONSTANT_ATTRIBUTES" in def;

	    // Computing stride
	    this.ATTRIBUTES_ITEMS_COUNT = getAttributesItemsCount(this.ATTRIBUTES);
	    this.STRIDE = this.VERTICES * this.ATTRIBUTES_ITEMS_COUNT;

	    // Members
	    this.renderer = renderer;
	    this.normalProgram = this.getProgramInfo("normal", gl, def.VERTEX_SHADER_SOURCE, def.FRAGMENT_SHADER_SOURCE, null);
	    this.pickProgram = pickingBuffer ? this.getProgramInfo("pick", gl, PICKING_PREFIX + def.VERTEX_SHADER_SOURCE, PICKING_PREFIX + def.FRAGMENT_SHADER_SOURCE, pickingBuffer) : null;

	    // For instanced programs:
	    if (this.isInstanced) {
	      var constantAttributesItemsCount = getAttributesItemsCount(this.CONSTANT_ATTRIBUTES);
	      if (this.CONSTANT_DATA.length !== this.VERTICES) throw new Error("Program: error while getting constant data (expected ".concat(this.VERTICES, " items, received ").concat(this.CONSTANT_DATA.length, " instead)"));
	      this.constantArray = new Float32Array(this.CONSTANT_DATA.length * constantAttributesItemsCount);
	      for (var i = 0; i < this.CONSTANT_DATA.length; i++) {
	        var vector = this.CONSTANT_DATA[i];
	        if (vector.length !== constantAttributesItemsCount) throw new Error("Program: error while getting constant data (one vector has ".concat(vector.length, " items instead of ").concat(constantAttributesItemsCount, ")"));
	        for (var j = 0; j < vector.length; j++) this.constantArray[i * constantAttributesItemsCount + j] = vector[j];
	      }
	      this.STRIDE = this.ATTRIBUTES_ITEMS_COUNT;
	    }
	  }
	  _createClass(Program, [{
	    key: "kill",
	    value: function kill() {
	      killProgram(this.normalProgram);
	      if (this.pickProgram) {
	        killProgram(this.pickProgram);
	        this.pickProgram = null;
	      }
	    }
	  }, {
	    key: "getProgramInfo",
	    value: function getProgramInfo(name, gl, vertexShaderSource, fragmentShaderSource, frameBuffer) {
	      var def = this.getDefinition();

	      // WebGL buffers
	      var buffer = gl.createBuffer();
	      if (buffer === null) throw new Error("Program: error while creating the WebGL buffer.");

	      // Shaders and program
	      var vertexShader = loadVertexShader(gl, vertexShaderSource);
	      var fragmentShader = loadFragmentShader(gl, fragmentShaderSource);
	      var program = loadProgram(gl, [vertexShader, fragmentShader]);

	      // Initializing locations
	      var uniformLocations = {};
	      def.UNIFORMS.forEach(function (uniformName) {
	        var location = gl.getUniformLocation(program, uniformName);
	        if (location) uniformLocations[uniformName] = location;
	      });
	      var attributeLocations = {};
	      def.ATTRIBUTES.forEach(function (attr) {
	        attributeLocations[attr.name] = gl.getAttribLocation(program, attr.name);
	      });

	      // For instanced programs:
	      var constantBuffer;
	      if ("CONSTANT_ATTRIBUTES" in def) {
	        def.CONSTANT_ATTRIBUTES.forEach(function (attr) {
	          attributeLocations[attr.name] = gl.getAttribLocation(program, attr.name);
	        });
	        constantBuffer = gl.createBuffer();
	        if (constantBuffer === null) throw new Error("Program: error while creating the WebGL constant buffer.");
	      }
	      return {
	        name: name,
	        program: program,
	        gl: gl,
	        frameBuffer: frameBuffer,
	        buffer: buffer,
	        constantBuffer: constantBuffer || {},
	        uniformLocations: uniformLocations,
	        attributeLocations: attributeLocations,
	        isPicking: name === "pick",
	        vertexShader: vertexShader,
	        fragmentShader: fragmentShader
	      };
	    }
	  }, {
	    key: "bindProgram",
	    value: function bindProgram(program) {
	      var _this = this;
	      var offset = 0;
	      var gl = program.gl,
	        buffer = program.buffer;
	      if (!this.isInstanced) {
	        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	        offset = 0;
	        this.ATTRIBUTES.forEach(function (attr) {
	          return offset += _this.bindAttribute(attr, program, offset);
	        });
	        gl.bufferData(gl.ARRAY_BUFFER, this.array, gl.DYNAMIC_DRAW);
	      } else {
	        // Handle constant data (things that remain unchanged for all items):
	        gl.bindBuffer(gl.ARRAY_BUFFER, program.constantBuffer);
	        offset = 0;
	        this.CONSTANT_ATTRIBUTES.forEach(function (attr) {
	          return offset += _this.bindAttribute(attr, program, offset, false);
	        });
	        gl.bufferData(gl.ARRAY_BUFFER, this.constantArray, gl.STATIC_DRAW);

	        // Handle "instance specific" data (things that vary for each item):
	        gl.bindBuffer(gl.ARRAY_BUFFER, program.buffer);
	        offset = 0;
	        this.ATTRIBUTES.forEach(function (attr) {
	          return offset += _this.bindAttribute(attr, program, offset, true);
	        });
	        gl.bufferData(gl.ARRAY_BUFFER, this.array, gl.DYNAMIC_DRAW);
	      }
	      gl.bindBuffer(gl.ARRAY_BUFFER, null);
	    }
	  }, {
	    key: "unbindProgram",
	    value: function unbindProgram(program) {
	      var _this2 = this;
	      if (!this.isInstanced) {
	        this.ATTRIBUTES.forEach(function (attr) {
	          return _this2.unbindAttribute(attr, program);
	        });
	      } else {
	        this.CONSTANT_ATTRIBUTES.forEach(function (attr) {
	          return _this2.unbindAttribute(attr, program, false);
	        });
	        this.ATTRIBUTES.forEach(function (attr) {
	          return _this2.unbindAttribute(attr, program, true);
	        });
	      }
	    }
	  }, {
	    key: "bindAttribute",
	    value: function bindAttribute(attr, program, offset, setDivisor) {
	      var sizeFactor = SIZE_FACTOR_PER_ATTRIBUTE_TYPE[attr.type];
	      if (typeof sizeFactor !== "number") throw new Error("Program.bind: yet unsupported attribute type \"".concat(attr.type, "\""));
	      var location = program.attributeLocations[attr.name];
	      var gl = program.gl;
	      if (location !== -1) {
	        gl.enableVertexAttribArray(location);
	        var stride = !this.isInstanced ? this.ATTRIBUTES_ITEMS_COUNT * Float32Array.BYTES_PER_ELEMENT : (setDivisor ? this.ATTRIBUTES_ITEMS_COUNT : getAttributesItemsCount(this.CONSTANT_ATTRIBUTES)) * Float32Array.BYTES_PER_ELEMENT;
	        gl.vertexAttribPointer(location, attr.size, attr.type, attr.normalized || false, stride, offset);
	        if (this.isInstanced && setDivisor) {
	          if (gl instanceof WebGL2RenderingContext) {
	            gl.vertexAttribDivisor(location, 1);
	          } else {
	            var ext = gl.getExtension("ANGLE_instanced_arrays");
	            if (ext) ext.vertexAttribDivisorANGLE(location, 1);
	          }
	        }
	      }
	      return attr.size * sizeFactor;
	    }
	  }, {
	    key: "unbindAttribute",
	    value: function unbindAttribute(attr, program, unsetDivisor) {
	      var location = program.attributeLocations[attr.name];
	      var gl = program.gl;
	      if (location !== -1) {
	        gl.disableVertexAttribArray(location);
	        if (this.isInstanced && unsetDivisor) {
	          if (gl instanceof WebGL2RenderingContext) {
	            gl.vertexAttribDivisor(location, 0);
	          } else {
	            var ext = gl.getExtension("ANGLE_instanced_arrays");
	            if (ext) ext.vertexAttribDivisorANGLE(location, 0);
	          }
	        }
	      }
	    }
	  }, {
	    key: "reallocate",
	    value: function reallocate(capacity) {
	      // If desired capacity has not changed we do nothing
	      // NOTE: it's possible here to implement more subtle reallocation schemes
	      // when the number of rendered items increase or decrease
	      if (capacity === this.capacity) return;
	      this.capacity = capacity;
	      this.verticesCount = this.VERTICES * capacity;
	      this.array = new Float32Array(!this.isInstanced ? this.verticesCount * this.ATTRIBUTES_ITEMS_COUNT : this.capacity * this.ATTRIBUTES_ITEMS_COUNT);
	    }
	  }, {
	    key: "hasNothingToRender",
	    value: function hasNothingToRender() {
	      return this.verticesCount === 0;
	    }
	  }, {
	    key: "renderProgram",
	    value: function renderProgram(params, programInfo) {
	      var gl = programInfo.gl,
	        program = programInfo.program;

	      // With the current fix for #1397, the alpha blending is enabled for the
	      // picking layer:
	      gl.enable(gl.BLEND);

	      // Original code:
	      // if (!isPicking) gl.enable(gl.BLEND);
	      // else gl.disable(gl.BLEND);

	      gl.useProgram(program);
	      this.setUniforms(params, programInfo);
	      this.drawWebGL(this.METHOD, programInfo);
	    }
	  }, {
	    key: "render",
	    value: function render(params) {
	      if (this.hasNothingToRender()) return;
	      if (this.pickProgram) {
	        this.pickProgram.gl.viewport(0, 0, params.width * params.pixelRatio / params.downSizingRatio, params.height * params.pixelRatio / params.downSizingRatio);
	        this.bindProgram(this.pickProgram);
	        this.renderProgram(_objectSpread2(_objectSpread2({}, params), {}, {
	          pixelRatio: params.pixelRatio / params.downSizingRatio
	        }), this.pickProgram);
	        this.unbindProgram(this.pickProgram);
	      }
	      this.normalProgram.gl.viewport(0, 0, params.width * params.pixelRatio, params.height * params.pixelRatio);
	      this.bindProgram(this.normalProgram);
	      this.renderProgram(params, this.normalProgram);
	      this.unbindProgram(this.normalProgram);
	    }
	  }, {
	    key: "drawWebGL",
	    value: function drawWebGL(method, _ref) {
	      var gl = _ref.gl,
	        frameBuffer = _ref.frameBuffer;
	      gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	      if (!this.isInstanced) {
	        gl.drawArrays(method, 0, this.verticesCount);
	      } else {
	        if (gl instanceof WebGL2RenderingContext) {
	          gl.drawArraysInstanced(method, 0, this.VERTICES, this.capacity);
	        } else {
	          var ext = gl.getExtension("ANGLE_instanced_arrays");
	          if (ext) ext.drawArraysInstancedANGLE(method, 0, this.VERTICES, this.capacity);
	        }
	      }
	    }
	  }]);
	  return Program;
	}();
	var NodeProgram = /*#__PURE__*/function (_ref) {
	  _inherits(NodeProgram, _ref);
	  function NodeProgram() {
	    _classCallCheck(this, NodeProgram);
	    return _callSuper(this, NodeProgram, arguments);
	  }
	  _createClass(NodeProgram, [{
	    key: "kill",
	    value: function kill() {
	      _get(_getPrototypeOf(NodeProgram.prototype), "kill", this).call(this);
	    }
	  }, {
	    key: "process",
	    value: function process(nodeIndex, offset, data) {
	      var i = offset * this.STRIDE;
	      // NOTE: dealing with hidden items automatically
	      if (data.hidden) {
	        for (var l = i + this.STRIDE; i < l; i++) {
	          this.array[i] = 0;
	        }
	        return;
	      }
	      return this.processVisibleItem(indexToColor(nodeIndex), i, data);
	    }
	  }]);
	  return NodeProgram;
	}(Program);
	var EdgeProgram = /*#__PURE__*/function (_ref) {
	  _inherits(EdgeProgram, _ref);
	  function EdgeProgram() {
	    var _this;
	    _classCallCheck(this, EdgeProgram);
	    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	    _this = _callSuper(this, EdgeProgram, [].concat(args));
	    _defineProperty(_assertThisInitialized(_this), "drawLabel", undefined);
	    return _this;
	  }
	  _createClass(EdgeProgram, [{
	    key: "kill",
	    value: function kill() {
	      _get(_getPrototypeOf(EdgeProgram.prototype), "kill", this).call(this);
	    }
	  }, {
	    key: "process",
	    value: function process(edgeIndex, offset, sourceData, targetData, data) {
	      var i = offset * this.STRIDE;
	      // NOTE: dealing with hidden items automatically
	      if (data.hidden || sourceData.hidden || targetData.hidden) {
	        for (var l = i + this.STRIDE; i < l; i++) {
	          this.array[i] = 0;
	        }
	        return;
	      }
	      return this.processVisibleItem(indexToColor(edgeIndex), i, sourceData, targetData, data);
	    }
	  }]);
	  return EdgeProgram;
	}(Program);
	/**
	 * Helper function combining two or more programs into a single compound one.
	 * Note that this is more a quick & easy way to combine program than a really
	 * performant option. More performant programs can be written entirely.
	 *
	 * @param  {array}    programClasses - Program classes to combine.
	 * @param  {function} drawLabel - An optional edge "draw label" function.
	 * @return {function}
	 */
	function createEdgeCompoundProgram(programClasses, drawLabel) {
	  return /*#__PURE__*/function () {
	    function EdgeCompoundProgram(gl, pickingBuffer, renderer) {
	      _classCallCheck(this, EdgeCompoundProgram);
	      _defineProperty(this, "drawLabel", drawLabel);
	      this.programs = programClasses.map(function (Program) {
	        return new Program(gl, pickingBuffer, renderer);
	      });
	    }
	    _createClass(EdgeCompoundProgram, [{
	      key: "reallocate",
	      value: function reallocate(capacity) {
	        this.programs.forEach(function (program) {
	          return program.reallocate(capacity);
	        });
	      }
	    }, {
	      key: "process",
	      value: function process(edgeIndex, offset, sourceData, targetData, data) {
	        this.programs.forEach(function (program) {
	          return program.process(edgeIndex, offset, sourceData, targetData, data);
	        });
	      }
	    }, {
	      key: "render",
	      value: function render(params) {
	        this.programs.forEach(function (program) {
	          return program.render(params);
	        });
	      }
	    }, {
	      key: "kill",
	      value: function kill() {
	        this.programs.forEach(function (program) {
	          return program.kill();
	        });
	      }
	    }]);
	    return EdgeCompoundProgram;
	  }();
	}

	function drawStraightEdgeLabel(context, edgeData, sourceData, targetData, settings) {
	  var size = settings.edgeLabelSize,
	    font = settings.edgeLabelFont,
	    weight = settings.edgeLabelWeight,
	    color = settings.edgeLabelColor.attribute ? edgeData[settings.edgeLabelColor.attribute] || settings.edgeLabelColor.color || "#000" : settings.edgeLabelColor.color;
	  var label = edgeData.label;
	  if (!label) return;
	  context.fillStyle = color;
	  context.font = "".concat(weight, " ").concat(size, "px ").concat(font);

	  // Computing positions without considering nodes sizes:
	  var sSize = sourceData.size;
	  var tSize = targetData.size;
	  var sx = sourceData.x;
	  var sy = sourceData.y;
	  var tx = targetData.x;
	  var ty = targetData.y;
	  var cx = (sx + tx) / 2;
	  var cy = (sy + ty) / 2;
	  var dx = tx - sx;
	  var dy = ty - sy;
	  var d = Math.sqrt(dx * dx + dy * dy);
	  if (d < sSize + tSize) return;

	  // Adding nodes sizes:
	  sx += dx * sSize / d;
	  sy += dy * sSize / d;
	  tx -= dx * tSize / d;
	  ty -= dy * tSize / d;
	  cx = (sx + tx) / 2;
	  cy = (sy + ty) / 2;
	  dx = tx - sx;
	  dy = ty - sy;
	  d = Math.sqrt(dx * dx + dy * dy);

	  // Handling ellipsis
	  var textLength = context.measureText(label).width;
	  if (textLength > d) {
	    var ellipsis = "…";
	    label = label + ellipsis;
	    textLength = context.measureText(label).width;
	    while (textLength > d && label.length > 1) {
	      label = label.slice(0, -2) + ellipsis;
	      textLength = context.measureText(label).width;
	    }
	    if (label.length < 4) return;
	  }
	  var angle;
	  if (dx > 0) {
	    if (dy > 0) angle = Math.acos(dx / d);else angle = Math.asin(dy / d);
	  } else {
	    if (dy > 0) angle = Math.acos(dx / d) + Math.PI;else angle = Math.asin(dx / d) + Math.PI / 2;
	  }
	  context.save();
	  context.translate(cx, cy);
	  context.rotate(angle);
	  context.fillText(label, -textLength / 2, edgeData.size / 2 + size);
	  context.restore();
	}

	function drawDiscNodeLabel(context, data, settings) {
	  if (!data.label) return;
	  var size = settings.labelSize,
	    font = settings.labelFont,
	    weight = settings.labelWeight,
	    color = settings.labelColor.attribute ? data[settings.labelColor.attribute] || settings.labelColor.color || "#000" : settings.labelColor.color;
	  context.fillStyle = color;
	  context.font = "".concat(weight, " ").concat(size, "px ").concat(font);
	  context.fillText(data.label, data.x + data.size + 3, data.y + size / 3);
	}

	/**
	 * Draw an hovered node.
	 * - if there is no label => display a shadow on the node
	 * - if the label box is bigger than node size => display a label box that contains the node with a shadow
	 * - else node with shadow and the label box
	 */
	function drawDiscNodeHover(context, data, settings) {
	  var size = settings.labelSize,
	    font = settings.labelFont,
	    weight = settings.labelWeight;
	  context.font = "".concat(weight, " ").concat(size, "px ").concat(font);

	  // Then we draw the label background
	  context.fillStyle = "#FFF";
	  context.shadowOffsetX = 0;
	  context.shadowOffsetY = 0;
	  context.shadowBlur = 8;
	  context.shadowColor = "#000";
	  var PADDING = 2;
	  if (typeof data.label === "string") {
	    var textWidth = context.measureText(data.label).width,
	      boxWidth = Math.round(textWidth + 5),
	      boxHeight = Math.round(size + 2 * PADDING),
	      radius = Math.max(data.size, size / 2) + PADDING;
	    var angleRadian = Math.asin(boxHeight / 2 / radius);
	    var xDeltaCoord = Math.sqrt(Math.abs(Math.pow(radius, 2) - Math.pow(boxHeight / 2, 2)));
	    context.beginPath();
	    context.moveTo(data.x + xDeltaCoord, data.y + boxHeight / 2);
	    context.lineTo(data.x + radius + boxWidth, data.y + boxHeight / 2);
	    context.lineTo(data.x + radius + boxWidth, data.y - boxHeight / 2);
	    context.lineTo(data.x + xDeltaCoord, data.y - boxHeight / 2);
	    context.arc(data.x, data.y, radius, angleRadian, -angleRadian);
	    context.closePath();
	    context.fill();
	  } else {
	    context.beginPath();
	    context.arc(data.x, data.y, data.size + PADDING, 0, Math.PI * 2);
	    context.closePath();
	    context.fill();
	  }
	  context.shadowOffsetX = 0;
	  context.shadowOffsetY = 0;
	  context.shadowBlur = 0;

	  // And finally we draw the label
	  drawDiscNodeLabel(context, data, settings);
	}

	// language=GLSL
	var SHADER_SOURCE$6 = /*glsl*/"\nprecision highp float;\n\nvarying vec4 v_color;\nvarying vec2 v_diffVector;\nvarying float v_radius;\n\nuniform float u_correctionRatio;\n\nconst vec4 transparent = vec4(0.0, 0.0, 0.0, 0.0);\n\nvoid main(void) {\n  float border = u_correctionRatio * 2.0;\n  float dist = length(v_diffVector) - v_radius + border;\n\n  // No antialiasing for picking mode:\n  #ifdef PICKING_MODE\n  if (dist > border)\n    gl_FragColor = transparent;\n  else\n    gl_FragColor = v_color;\n\n  #else\n  float t = 0.0;\n  if (dist > border)\n    t = 1.0;\n  else if (dist > 0.0)\n    t = dist / border;\n\n  gl_FragColor = mix(v_color, transparent, t);\n  #endif\n}\n";
	var FRAGMENT_SHADER_SOURCE$2 = SHADER_SOURCE$6;

	// language=GLSL
	var SHADER_SOURCE$5 = /*glsl*/"\nattribute vec4 a_id;\nattribute vec4 a_color;\nattribute vec2 a_position;\nattribute float a_size;\nattribute float a_angle;\n\nuniform mat3 u_matrix;\nuniform float u_sizeRatio;\nuniform float u_correctionRatio;\n\nvarying vec4 v_color;\nvarying vec2 v_diffVector;\nvarying float v_radius;\nvarying float v_border;\n\nconst float bias = 255.0 / 254.0;\n\nvoid main() {\n  float size = a_size * u_correctionRatio / u_sizeRatio * 4.0;\n  vec2 diffVector = size * vec2(cos(a_angle), sin(a_angle));\n  vec2 position = a_position + diffVector;\n  gl_Position = vec4(\n    (u_matrix * vec3(position, 1)).xy,\n    0,\n    1\n  );\n\n  v_diffVector = diffVector;\n  v_radius = size / 2.0;\n\n  #ifdef PICKING_MODE\n  // For picking mode, we use the ID as the color:\n  v_color = a_id;\n  #else\n  // For normal mode, we use the color:\n  v_color = a_color;\n  #endif\n\n  v_color.a *= bias;\n}\n";
	var VERTEX_SHADER_SOURCE$3 = SHADER_SOURCE$5;

	var _WebGLRenderingContex$3 = WebGLRenderingContext,
	  UNSIGNED_BYTE$3 = _WebGLRenderingContex$3.UNSIGNED_BYTE,
	  FLOAT$3 = _WebGLRenderingContex$3.FLOAT;
	var UNIFORMS$3 = ["u_sizeRatio", "u_correctionRatio", "u_matrix"];
	var NodeCircleProgram = /*#__PURE__*/function (_NodeProgram) {
	  _inherits(NodeCircleProgram, _NodeProgram);
	  function NodeCircleProgram() {
	    _classCallCheck(this, NodeCircleProgram);
	    return _callSuper(this, NodeCircleProgram, arguments);
	  }
	  _createClass(NodeCircleProgram, [{
	    key: "getDefinition",
	    value: function getDefinition() {
	      return {
	        VERTICES: 3,
	        VERTEX_SHADER_SOURCE: VERTEX_SHADER_SOURCE$3,
	        FRAGMENT_SHADER_SOURCE: FRAGMENT_SHADER_SOURCE$2,
	        METHOD: WebGLRenderingContext.TRIANGLES,
	        UNIFORMS: UNIFORMS$3,
	        ATTRIBUTES: [{
	          name: "a_position",
	          size: 2,
	          type: FLOAT$3
	        }, {
	          name: "a_size",
	          size: 1,
	          type: FLOAT$3
	        }, {
	          name: "a_color",
	          size: 4,
	          type: UNSIGNED_BYTE$3,
	          normalized: true
	        }, {
	          name: "a_id",
	          size: 4,
	          type: UNSIGNED_BYTE$3,
	          normalized: true
	        }],
	        CONSTANT_ATTRIBUTES: [{
	          name: "a_angle",
	          size: 1,
	          type: FLOAT$3
	        }],
	        CONSTANT_DATA: [[NodeCircleProgram.ANGLE_1], [NodeCircleProgram.ANGLE_2], [NodeCircleProgram.ANGLE_3]]
	      };
	    }
	  }, {
	    key: "processVisibleItem",
	    value: function processVisibleItem(nodeIndex, startIndex, data) {
	      var array = this.array;
	      var color = floatColor(data.color);
	      array[startIndex++] = data.x;
	      array[startIndex++] = data.y;
	      array[startIndex++] = data.size;
	      array[startIndex++] = color;
	      array[startIndex++] = nodeIndex;
	    }
	  }, {
	    key: "setUniforms",
	    value: function setUniforms(params, _ref) {
	      var gl = _ref.gl,
	        uniformLocations = _ref.uniformLocations;
	      var u_sizeRatio = uniformLocations.u_sizeRatio,
	        u_correctionRatio = uniformLocations.u_correctionRatio,
	        u_matrix = uniformLocations.u_matrix;
	      gl.uniform1f(u_correctionRatio, params.correctionRatio);
	      gl.uniform1f(u_sizeRatio, params.sizeRatio);
	      gl.uniformMatrix3fv(u_matrix, false, params.matrix);
	    }
	  }]);
	  return NodeCircleProgram;
	}(NodeProgram);
	_defineProperty(NodeCircleProgram, "ANGLE_1", 0);
	_defineProperty(NodeCircleProgram, "ANGLE_2", 2 * Math.PI / 3);
	_defineProperty(NodeCircleProgram, "ANGLE_3", 4 * Math.PI / 3);

	// language=GLSL
	var SHADER_SOURCE$4 = /*glsl*/"\nprecision mediump float;\n\nvarying vec4 v_color;\n\nvoid main(void) {\n  gl_FragColor = v_color;\n}\n";
	var FRAGMENT_SHADER_SOURCE$1 = SHADER_SOURCE$4;

	// language=GLSL
	var SHADER_SOURCE$3 = /*glsl*/"\nattribute vec2 a_position;\nattribute vec2 a_normal;\nattribute float a_radius;\nattribute vec3 a_barycentric;\n\n#ifdef PICKING_MODE\nattribute vec4 a_id;\n#else\nattribute vec4 a_color;\n#endif\n\nuniform mat3 u_matrix;\nuniform float u_sizeRatio;\nuniform float u_correctionRatio;\nuniform float u_minEdgeThickness;\nuniform float u_lengthToThicknessRatio;\nuniform float u_widenessToThicknessRatio;\n\nvarying vec4 v_color;\n\nconst float bias = 255.0 / 254.0;\n\nvoid main() {\n  float minThickness = u_minEdgeThickness;\n\n  float normalLength = length(a_normal);\n  vec2 unitNormal = a_normal / normalLength;\n\n  // These first computations are taken from edge.vert.glsl and\n  // edge.clamped.vert.glsl. Please read it to get better comments on what's\n  // happening:\n  float pixelsThickness = max(normalLength / u_sizeRatio, minThickness);\n  float webGLThickness = pixelsThickness * u_correctionRatio;\n  float webGLNodeRadius = a_radius * 2.0 * u_correctionRatio / u_sizeRatio;\n  float webGLArrowHeadLength = webGLThickness * u_lengthToThicknessRatio * 2.0;\n  float webGLArrowHeadThickness = webGLThickness * u_widenessToThicknessRatio;\n\n  float da = a_barycentric.x;\n  float db = a_barycentric.y;\n  float dc = a_barycentric.z;\n\n  vec2 delta = vec2(\n      da * (webGLNodeRadius * unitNormal.y)\n    + db * ((webGLNodeRadius + webGLArrowHeadLength) * unitNormal.y + webGLArrowHeadThickness * unitNormal.x)\n    + dc * ((webGLNodeRadius + webGLArrowHeadLength) * unitNormal.y - webGLArrowHeadThickness * unitNormal.x),\n\n      da * (-webGLNodeRadius * unitNormal.x)\n    + db * (-(webGLNodeRadius + webGLArrowHeadLength) * unitNormal.x + webGLArrowHeadThickness * unitNormal.y)\n    + dc * (-(webGLNodeRadius + webGLArrowHeadLength) * unitNormal.x - webGLArrowHeadThickness * unitNormal.y)\n  );\n\n  vec2 position = (u_matrix * vec3(a_position + delta, 1)).xy;\n\n  gl_Position = vec4(position, 0, 1);\n\n  #ifdef PICKING_MODE\n  // For picking mode, we use the ID as the color:\n  v_color = a_id;\n  #else\n  // For normal mode, we use the color:\n  v_color = a_color;\n  #endif\n\n  v_color.a *= bias;\n}\n";
	var VERTEX_SHADER_SOURCE$2 = SHADER_SOURCE$3;

	var _WebGLRenderingContex$2 = WebGLRenderingContext,
	  UNSIGNED_BYTE$2 = _WebGLRenderingContex$2.UNSIGNED_BYTE,
	  FLOAT$2 = _WebGLRenderingContex$2.FLOAT;
	var UNIFORMS$2 = ["u_matrix", "u_sizeRatio", "u_correctionRatio", "u_minEdgeThickness", "u_lengthToThicknessRatio", "u_widenessToThicknessRatio"];
	var DEFAULT_EDGE_ARROW_HEAD_PROGRAM_OPTIONS = {
	  lengthToThicknessRatio: 2.5,
	  widenessToThicknessRatio: 2
	};
	function createEdgeArrowHeadProgram(inputOptions) {
	  var options = _objectSpread2(_objectSpread2({}, DEFAULT_EDGE_ARROW_HEAD_PROGRAM_OPTIONS), {});
	  return /*#__PURE__*/function (_EdgeProgram) {
	    _inherits(EdgeArrowHeadProgram, _EdgeProgram);
	    function EdgeArrowHeadProgram() {
	      _classCallCheck(this, EdgeArrowHeadProgram);
	      return _callSuper(this, EdgeArrowHeadProgram, arguments);
	    }
	    _createClass(EdgeArrowHeadProgram, [{
	      key: "getDefinition",
	      value: function getDefinition() {
	        return {
	          VERTICES: 3,
	          VERTEX_SHADER_SOURCE: VERTEX_SHADER_SOURCE$2,
	          FRAGMENT_SHADER_SOURCE: FRAGMENT_SHADER_SOURCE$1,
	          METHOD: WebGLRenderingContext.TRIANGLES,
	          UNIFORMS: UNIFORMS$2,
	          ATTRIBUTES: [{
	            name: "a_position",
	            size: 2,
	            type: FLOAT$2
	          }, {
	            name: "a_normal",
	            size: 2,
	            type: FLOAT$2
	          }, {
	            name: "a_radius",
	            size: 1,
	            type: FLOAT$2
	          }, {
	            name: "a_color",
	            size: 4,
	            type: UNSIGNED_BYTE$2,
	            normalized: true
	          }, {
	            name: "a_id",
	            size: 4,
	            type: UNSIGNED_BYTE$2,
	            normalized: true
	          }],
	          CONSTANT_ATTRIBUTES: [{
	            name: "a_barycentric",
	            size: 3,
	            type: FLOAT$2
	          }],
	          CONSTANT_DATA: [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
	        };
	      }
	    }, {
	      key: "processVisibleItem",
	      value: function processVisibleItem(edgeIndex, startIndex, sourceData, targetData, data) {
	        var thickness = data.size || 1;
	        var radius = targetData.size || 1;
	        var x1 = sourceData.x;
	        var y1 = sourceData.y;
	        var x2 = targetData.x;
	        var y2 = targetData.y;
	        var color = floatColor(data.color);

	        // Computing normals
	        var dx = x2 - x1;
	        var dy = y2 - y1;
	        var len = dx * dx + dy * dy;
	        var n1 = 0;
	        var n2 = 0;
	        if (len) {
	          len = 1 / Math.sqrt(len);
	          n1 = -dy * len * thickness;
	          n2 = dx * len * thickness;
	        }
	        var array = this.array;
	        array[startIndex++] = x2;
	        array[startIndex++] = y2;
	        array[startIndex++] = -n1;
	        array[startIndex++] = -n2;
	        array[startIndex++] = radius;
	        array[startIndex++] = color;
	        array[startIndex++] = edgeIndex;
	      }
	    }, {
	      key: "setUniforms",
	      value: function setUniforms(params, _ref) {
	        var gl = _ref.gl,
	          uniformLocations = _ref.uniformLocations;
	        var u_matrix = uniformLocations.u_matrix,
	          u_sizeRatio = uniformLocations.u_sizeRatio,
	          u_correctionRatio = uniformLocations.u_correctionRatio,
	          u_minEdgeThickness = uniformLocations.u_minEdgeThickness,
	          u_lengthToThicknessRatio = uniformLocations.u_lengthToThicknessRatio,
	          u_widenessToThicknessRatio = uniformLocations.u_widenessToThicknessRatio;
	        gl.uniformMatrix3fv(u_matrix, false, params.matrix);
	        gl.uniform1f(u_sizeRatio, params.sizeRatio);
	        gl.uniform1f(u_correctionRatio, params.correctionRatio);
	        gl.uniform1f(u_minEdgeThickness, params.minEdgeThickness);
	        gl.uniform1f(u_lengthToThicknessRatio, options.lengthToThicknessRatio);
	        gl.uniform1f(u_widenessToThicknessRatio, options.widenessToThicknessRatio);
	      }
	    }]);
	    return EdgeArrowHeadProgram;
	  }(EdgeProgram);
	}
	createEdgeArrowHeadProgram();

	// language=GLSL
	var SHADER_SOURCE$2 = /*glsl*/"\nprecision mediump float;\n\nvarying vec4 v_color;\nvarying vec2 v_normal;\nvarying float v_thickness;\nvarying float v_feather;\n\nconst vec4 transparent = vec4(0.0, 0.0, 0.0, 0.0);\n\nvoid main(void) {\n  // We only handle antialiasing for normal mode:\n  #ifdef PICKING_MODE\n  gl_FragColor = v_color;\n  #else\n  float dist = length(v_normal) * v_thickness;\n\n  float t = smoothstep(\n    v_thickness - v_feather,\n    v_thickness,\n    dist\n  );\n\n  gl_FragColor = mix(v_color, transparent, t);\n  #endif\n}\n";
	var FRAGMENT_SHADER_SOURCE = SHADER_SOURCE$2;

	// language=GLSL
	var SHADER_SOURCE$1 = /*glsl*/"\nattribute vec4 a_id;\nattribute vec4 a_color;\nattribute vec2 a_normal;\nattribute float a_normalCoef;\nattribute vec2 a_positionStart;\nattribute vec2 a_positionEnd;\nattribute float a_positionCoef;\nattribute float a_radius;\nattribute float a_radiusCoef;\n\nuniform mat3 u_matrix;\nuniform float u_zoomRatio;\nuniform float u_sizeRatio;\nuniform float u_pixelRatio;\nuniform float u_correctionRatio;\nuniform float u_minEdgeThickness;\nuniform float u_lengthToThicknessRatio;\nuniform float u_feather;\n\nvarying vec4 v_color;\nvarying vec2 v_normal;\nvarying float v_thickness;\nvarying float v_feather;\n\nconst float bias = 255.0 / 254.0;\n\nvoid main() {\n  float minThickness = u_minEdgeThickness;\n\n  float radius = a_radius * a_radiusCoef;\n  vec2 normal = a_normal * a_normalCoef;\n  vec2 position = a_positionStart * (1.0 - a_positionCoef) + a_positionEnd * a_positionCoef;\n\n  float normalLength = length(normal);\n  vec2 unitNormal = normal / normalLength;\n\n  // These first computations are taken from edge.vert.glsl. Please read it to\n  // get better comments on what's happening:\n  float pixelsThickness = max(normalLength, minThickness * u_sizeRatio);\n  float webGLThickness = pixelsThickness * u_correctionRatio / u_sizeRatio;\n\n  // Here, we move the point to leave space for the arrow head:\n  float direction = sign(radius);\n  float webGLNodeRadius = direction * radius * 2.0 * u_correctionRatio / u_sizeRatio;\n  float webGLArrowHeadLength = webGLThickness * u_lengthToThicknessRatio * 2.0;\n\n  vec2 compensationVector = vec2(-direction * unitNormal.y, direction * unitNormal.x) * (webGLNodeRadius + webGLArrowHeadLength);\n\n  // Here is the proper position of the vertex\n  gl_Position = vec4((u_matrix * vec3(position + unitNormal * webGLThickness + compensationVector, 1)).xy, 0, 1);\n\n  v_thickness = webGLThickness / u_zoomRatio;\n\n  v_normal = unitNormal;\n\n  v_feather = u_feather * u_correctionRatio / u_zoomRatio / u_pixelRatio * 2.0;\n\n  #ifdef PICKING_MODE\n  // For picking mode, we use the ID as the color:\n  v_color = a_id;\n  #else\n  // For normal mode, we use the color:\n  v_color = a_color;\n  #endif\n\n  v_color.a *= bias;\n}\n";
	var VERTEX_SHADER_SOURCE$1 = SHADER_SOURCE$1;

	var _WebGLRenderingContex$1 = WebGLRenderingContext,
	  UNSIGNED_BYTE$1 = _WebGLRenderingContex$1.UNSIGNED_BYTE,
	  FLOAT$1 = _WebGLRenderingContex$1.FLOAT;
	var UNIFORMS$1 = ["u_matrix", "u_zoomRatio", "u_sizeRatio", "u_correctionRatio", "u_pixelRatio", "u_feather", "u_minEdgeThickness", "u_lengthToThicknessRatio"];
	var DEFAULT_EDGE_CLAMPED_PROGRAM_OPTIONS = {
	  lengthToThicknessRatio: DEFAULT_EDGE_ARROW_HEAD_PROGRAM_OPTIONS.lengthToThicknessRatio
	};
	function createEdgeClampedProgram(inputOptions) {
	  var options = _objectSpread2(_objectSpread2({}, DEFAULT_EDGE_CLAMPED_PROGRAM_OPTIONS), {});
	  return /*#__PURE__*/function (_EdgeProgram) {
	    _inherits(EdgeClampedProgram, _EdgeProgram);
	    function EdgeClampedProgram() {
	      _classCallCheck(this, EdgeClampedProgram);
	      return _callSuper(this, EdgeClampedProgram, arguments);
	    }
	    _createClass(EdgeClampedProgram, [{
	      key: "getDefinition",
	      value: function getDefinition() {
	        return {
	          VERTICES: 6,
	          VERTEX_SHADER_SOURCE: VERTEX_SHADER_SOURCE$1,
	          FRAGMENT_SHADER_SOURCE: FRAGMENT_SHADER_SOURCE,
	          METHOD: WebGLRenderingContext.TRIANGLES,
	          UNIFORMS: UNIFORMS$1,
	          ATTRIBUTES: [{
	            name: "a_positionStart",
	            size: 2,
	            type: FLOAT$1
	          }, {
	            name: "a_positionEnd",
	            size: 2,
	            type: FLOAT$1
	          }, {
	            name: "a_normal",
	            size: 2,
	            type: FLOAT$1
	          }, {
	            name: "a_color",
	            size: 4,
	            type: UNSIGNED_BYTE$1,
	            normalized: true
	          }, {
	            name: "a_id",
	            size: 4,
	            type: UNSIGNED_BYTE$1,
	            normalized: true
	          }, {
	            name: "a_radius",
	            size: 1,
	            type: FLOAT$1
	          }],
	          CONSTANT_ATTRIBUTES: [
	          // If 0, then position will be a_positionStart
	          // If 1, then position will be a_positionEnd
	          {
	            name: "a_positionCoef",
	            size: 1,
	            type: FLOAT$1
	          }, {
	            name: "a_normalCoef",
	            size: 1,
	            type: FLOAT$1
	          }, {
	            name: "a_radiusCoef",
	            size: 1,
	            type: FLOAT$1
	          }],
	          CONSTANT_DATA: [[0, 1, 0], [0, -1, 0], [1, 1, 1], [1, 1, 1], [0, -1, 0], [1, -1, -1]]
	        };
	      }
	    }, {
	      key: "processVisibleItem",
	      value: function processVisibleItem(edgeIndex, startIndex, sourceData, targetData, data) {
	        var thickness = data.size || 1;
	        var x1 = sourceData.x;
	        var y1 = sourceData.y;
	        var x2 = targetData.x;
	        var y2 = targetData.y;
	        var color = floatColor(data.color);

	        // Computing normals
	        var dx = x2 - x1;
	        var dy = y2 - y1;
	        var radius = targetData.size || 1;
	        var len = dx * dx + dy * dy;
	        var n1 = 0;
	        var n2 = 0;
	        if (len) {
	          len = 1 / Math.sqrt(len);
	          n1 = -dy * len * thickness;
	          n2 = dx * len * thickness;
	        }
	        var array = this.array;
	        array[startIndex++] = x1;
	        array[startIndex++] = y1;
	        array[startIndex++] = x2;
	        array[startIndex++] = y2;
	        array[startIndex++] = n1;
	        array[startIndex++] = n2;
	        array[startIndex++] = color;
	        array[startIndex++] = edgeIndex;
	        array[startIndex++] = radius;
	      }
	    }, {
	      key: "setUniforms",
	      value: function setUniforms(params, _ref) {
	        var gl = _ref.gl,
	          uniformLocations = _ref.uniformLocations;
	        var u_matrix = uniformLocations.u_matrix,
	          u_zoomRatio = uniformLocations.u_zoomRatio,
	          u_feather = uniformLocations.u_feather,
	          u_pixelRatio = uniformLocations.u_pixelRatio,
	          u_correctionRatio = uniformLocations.u_correctionRatio,
	          u_sizeRatio = uniformLocations.u_sizeRatio,
	          u_minEdgeThickness = uniformLocations.u_minEdgeThickness,
	          u_lengthToThicknessRatio = uniformLocations.u_lengthToThicknessRatio;
	        gl.uniformMatrix3fv(u_matrix, false, params.matrix);
	        gl.uniform1f(u_zoomRatio, params.zoomRatio);
	        gl.uniform1f(u_sizeRatio, params.sizeRatio);
	        gl.uniform1f(u_correctionRatio, params.correctionRatio);
	        gl.uniform1f(u_pixelRatio, params.pixelRatio);
	        gl.uniform1f(u_feather, params.antiAliasingFeather);
	        gl.uniform1f(u_minEdgeThickness, params.minEdgeThickness);
	        gl.uniform1f(u_lengthToThicknessRatio, options.lengthToThicknessRatio);
	      }
	    }]);
	    return EdgeClampedProgram;
	  }(EdgeProgram);
	}
	createEdgeClampedProgram();

	function createEdgeArrowProgram(inputOptions) {
	  return createEdgeCompoundProgram([createEdgeClampedProgram(), createEdgeArrowHeadProgram()]);
	}
	var EdgeArrowProgram = createEdgeArrowProgram();
	var EdgeArrowProgram$1 = EdgeArrowProgram;

	// language=GLSL
	var SHADER_SOURCE = /*glsl*/"\nattribute vec4 a_id;\nattribute vec4 a_color;\nattribute vec2 a_normal;\nattribute float a_normalCoef;\nattribute vec2 a_positionStart;\nattribute vec2 a_positionEnd;\nattribute float a_positionCoef;\n\nuniform mat3 u_matrix;\nuniform float u_sizeRatio;\nuniform float u_zoomRatio;\nuniform float u_pixelRatio;\nuniform float u_correctionRatio;\nuniform float u_minEdgeThickness;\nuniform float u_feather;\n\nvarying vec4 v_color;\nvarying vec2 v_normal;\nvarying float v_thickness;\nvarying float v_feather;\n\nconst float bias = 255.0 / 254.0;\n\nvoid main() {\n  float minThickness = u_minEdgeThickness;\n\n  vec2 normal = a_normal * a_normalCoef;\n  vec2 position = a_positionStart * (1.0 - a_positionCoef) + a_positionEnd * a_positionCoef;\n\n  float normalLength = length(normal);\n  vec2 unitNormal = normal / normalLength;\n\n  // We require edges to be at least \"minThickness\" pixels thick *on screen*\n  // (so we need to compensate the size ratio):\n  float pixelsThickness = max(normalLength, minThickness * u_sizeRatio);\n\n  // Then, we need to retrieve the normalized thickness of the edge in the WebGL\n  // referential (in a ([0, 1], [0, 1]) space), using our \"magic\" correction\n  // ratio:\n  float webGLThickness = pixelsThickness * u_correctionRatio / u_sizeRatio;\n\n  // Here is the proper position of the vertex\n  gl_Position = vec4((u_matrix * vec3(position + unitNormal * webGLThickness, 1)).xy, 0, 1);\n\n  // For the fragment shader though, we need a thickness that takes the \"magic\"\n  // correction ratio into account (as in webGLThickness), but so that the\n  // antialiasing effect does not depend on the zoom level. So here's yet\n  // another thickness version:\n  v_thickness = webGLThickness / u_zoomRatio;\n\n  v_normal = unitNormal;\n\n  v_feather = u_feather * u_correctionRatio / u_zoomRatio / u_pixelRatio * 2.0;\n\n  #ifdef PICKING_MODE\n  // For picking mode, we use the ID as the color:\n  v_color = a_id;\n  #else\n  // For normal mode, we use the color:\n  v_color = a_color;\n  #endif\n\n  v_color.a *= bias;\n}\n";
	var VERTEX_SHADER_SOURCE = SHADER_SOURCE;

	var _WebGLRenderingContex = WebGLRenderingContext,
	  UNSIGNED_BYTE = _WebGLRenderingContex.UNSIGNED_BYTE,
	  FLOAT = _WebGLRenderingContex.FLOAT;
	var UNIFORMS = ["u_matrix", "u_zoomRatio", "u_sizeRatio", "u_correctionRatio", "u_pixelRatio", "u_feather", "u_minEdgeThickness"];
	var EdgeRectangleProgram = /*#__PURE__*/function (_EdgeProgram) {
	  _inherits(EdgeRectangleProgram, _EdgeProgram);
	  function EdgeRectangleProgram() {
	    _classCallCheck(this, EdgeRectangleProgram);
	    return _callSuper(this, EdgeRectangleProgram, arguments);
	  }
	  _createClass(EdgeRectangleProgram, [{
	    key: "getDefinition",
	    value: function getDefinition() {
	      return {
	        VERTICES: 6,
	        VERTEX_SHADER_SOURCE: VERTEX_SHADER_SOURCE,
	        FRAGMENT_SHADER_SOURCE: FRAGMENT_SHADER_SOURCE,
	        METHOD: WebGLRenderingContext.TRIANGLES,
	        UNIFORMS: UNIFORMS,
	        ATTRIBUTES: [{
	          name: "a_positionStart",
	          size: 2,
	          type: FLOAT
	        }, {
	          name: "a_positionEnd",
	          size: 2,
	          type: FLOAT
	        }, {
	          name: "a_normal",
	          size: 2,
	          type: FLOAT
	        }, {
	          name: "a_color",
	          size: 4,
	          type: UNSIGNED_BYTE,
	          normalized: true
	        }, {
	          name: "a_id",
	          size: 4,
	          type: UNSIGNED_BYTE,
	          normalized: true
	        }],
	        CONSTANT_ATTRIBUTES: [
	        // If 0, then position will be a_positionStart
	        // If 2, then position will be a_positionEnd
	        {
	          name: "a_positionCoef",
	          size: 1,
	          type: FLOAT
	        }, {
	          name: "a_normalCoef",
	          size: 1,
	          type: FLOAT
	        }],
	        CONSTANT_DATA: [[0, 1], [0, -1], [1, 1], [1, 1], [0, -1], [1, -1]]
	      };
	    }
	  }, {
	    key: "processVisibleItem",
	    value: function processVisibleItem(edgeIndex, startIndex, sourceData, targetData, data) {
	      var thickness = data.size || 1;
	      var x1 = sourceData.x;
	      var y1 = sourceData.y;
	      var x2 = targetData.x;
	      var y2 = targetData.y;
	      var color = floatColor(data.color);

	      // Computing normals
	      var dx = x2 - x1;
	      var dy = y2 - y1;
	      var len = dx * dx + dy * dy;
	      var n1 = 0;
	      var n2 = 0;
	      if (len) {
	        len = 1 / Math.sqrt(len);
	        n1 = -dy * len * thickness;
	        n2 = dx * len * thickness;
	      }
	      var array = this.array;
	      array[startIndex++] = x1;
	      array[startIndex++] = y1;
	      array[startIndex++] = x2;
	      array[startIndex++] = y2;
	      array[startIndex++] = n1;
	      array[startIndex++] = n2;
	      array[startIndex++] = color;
	      array[startIndex++] = edgeIndex;
	    }
	  }, {
	    key: "setUniforms",
	    value: function setUniforms(params, _ref) {
	      var gl = _ref.gl,
	        uniformLocations = _ref.uniformLocations;
	      var u_matrix = uniformLocations.u_matrix,
	        u_zoomRatio = uniformLocations.u_zoomRatio,
	        u_feather = uniformLocations.u_feather,
	        u_pixelRatio = uniformLocations.u_pixelRatio,
	        u_correctionRatio = uniformLocations.u_correctionRatio,
	        u_sizeRatio = uniformLocations.u_sizeRatio,
	        u_minEdgeThickness = uniformLocations.u_minEdgeThickness;
	      gl.uniformMatrix3fv(u_matrix, false, params.matrix);
	      gl.uniform1f(u_zoomRatio, params.zoomRatio);
	      gl.uniform1f(u_sizeRatio, params.sizeRatio);
	      gl.uniform1f(u_correctionRatio, params.correctionRatio);
	      gl.uniform1f(u_pixelRatio, params.pixelRatio);
	      gl.uniform1f(u_feather, params.antiAliasingFeather);
	      gl.uniform1f(u_minEdgeThickness, params.minEdgeThickness);
	    }
	  }]);
	  return EdgeRectangleProgram;
	}(EdgeProgram);

	/**
	 * Util type to represent maps of typed elements, but implemented with
	 * JavaScript objects.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any

	/**
	 * Returns a type similar to T, but with the K set of properties of the type
	 * T *required*, and the rest optional.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any

	/**
	 * Custom event emitter types.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any

	var TypedEventEmitter = /*#__PURE__*/function (_ref) {
	  _inherits(TypedEventEmitter, _ref);
	  function TypedEventEmitter() {
	    var _this;
	    _classCallCheck(this, TypedEventEmitter);
	    _this = _callSuper(this, TypedEventEmitter);
	    _this.rawEmitter = _assertThisInitialized(_this);
	    return _this;
	  }
	  return _createClass(TypedEventEmitter);
	}(events.EventEmitter);

	var linear = function linear(k) {
	  return k;
	};
	var quadraticIn = function quadraticIn(k) {
	  return k * k;
	};
	var quadraticOut = function quadraticOut(k) {
	  return k * (2 - k);
	};
	var quadraticInOut = function quadraticInOut(k) {
	  if ((k *= 2) < 1) return 0.5 * k * k;
	  return -0.5 * (--k * (k - 2) - 1);
	};
	var cubicIn = function cubicIn(k) {
	  return k * k * k;
	};
	var cubicOut = function cubicOut(k) {
	  return --k * k * k + 1;
	};
	var cubicInOut = function cubicInOut(k) {
	  if ((k *= 2) < 1) return 0.5 * k * k * k;
	  return 0.5 * ((k -= 2) * k * k + 2);
	};
	var easings = {
	  linear: linear,
	  quadraticIn: quadraticIn,
	  quadraticOut: quadraticOut,
	  quadraticInOut: quadraticInOut,
	  cubicIn: cubicIn,
	  cubicOut: cubicOut,
	  cubicInOut: cubicInOut
	};

	/**
	 * Defaults.
	 */

	var ANIMATE_DEFAULTS = {
	  easing: "quadraticInOut",
	  duration: 150
	};

	function identity() {
	  return Float32Array.of(1, 0, 0, 0, 1, 0, 0, 0, 1);
	}

	// TODO: optimize
	function scale(m, x, y) {
	  m[0] = x;
	  m[4] = typeof y === "number" ? y : x;
	  return m;
	}
	function rotate(m, r) {
	  var s = Math.sin(r),
	    c = Math.cos(r);
	  m[0] = c;
	  m[1] = s;
	  m[3] = -s;
	  m[4] = c;
	  return m;
	}
	function translate(m, x, y) {
	  m[6] = x;
	  m[7] = y;
	  return m;
	}
	function multiply(a, b) {
	  var a00 = a[0],
	    a01 = a[1],
	    a02 = a[2];
	  var a10 = a[3],
	    a11 = a[4],
	    a12 = a[5];
	  var a20 = a[6],
	    a21 = a[7],
	    a22 = a[8];
	  var b00 = b[0],
	    b01 = b[1],
	    b02 = b[2];
	  var b10 = b[3],
	    b11 = b[4],
	    b12 = b[5];
	  var b20 = b[6],
	    b21 = b[7],
	    b22 = b[8];
	  a[0] = b00 * a00 + b01 * a10 + b02 * a20;
	  a[1] = b00 * a01 + b01 * a11 + b02 * a21;
	  a[2] = b00 * a02 + b01 * a12 + b02 * a22;
	  a[3] = b10 * a00 + b11 * a10 + b12 * a20;
	  a[4] = b10 * a01 + b11 * a11 + b12 * a21;
	  a[5] = b10 * a02 + b11 * a12 + b12 * a22;
	  a[6] = b20 * a00 + b21 * a10 + b22 * a20;
	  a[7] = b20 * a01 + b21 * a11 + b22 * a21;
	  a[8] = b20 * a02 + b21 * a12 + b22 * a22;
	  return a;
	}
	function multiplyVec2(a, b) {
	  var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
	  var a00 = a[0];
	  var a01 = a[1];
	  var a10 = a[3];
	  var a11 = a[4];
	  var a20 = a[6];
	  var a21 = a[7];
	  var b0 = b.x;
	  var b1 = b.y;
	  return {
	    x: b0 * a00 + b1 * a10 + a20 * z,
	    y: b0 * a01 + b1 * a11 + a21 * z
	  };
	}

	/**
	 * In sigma, the graph is normalized into a [0, 1], [0, 1] square, before being given to the various renderers. This
	 * helps to deal with quadtree in particular.
	 * But at some point, we need to rescale it so that it takes the best place in the screen, i.e. we always want to see two
	 * nodes "touching" opposite sides of the graph, with the camera being at its default state.
	 *
	 * This function determines this ratio.
	 */
	function getCorrectionRatio(viewportDimensions, graphDimensions) {
	  var viewportRatio = viewportDimensions.height / viewportDimensions.width;
	  var graphRatio = graphDimensions.height / graphDimensions.width;

	  // If the stage and the graphs are in different directions (such as the graph being wider that tall while the stage
	  // is taller than wide), we can stop here to have indeed nodes touching opposite sides:
	  if (viewportRatio < 1 && graphRatio > 1 || viewportRatio > 1 && graphRatio < 1) {
	    return 1;
	  }

	  // Else, we need to fit the graph inside the stage:
	  // 1. If the graph is "squarer" (i.e. with a ratio closer to 1), we need to make the largest sides touch;
	  // 2. If the stage is "squarer", we need to make the smallest sides touch.
	  return Math.min(Math.max(graphRatio, 1 / graphRatio), Math.max(1 / viewportRatio, viewportRatio));
	}

	/**
	 * Function returning a matrix from the current state of the camera.
	 */
	function matrixFromCamera(state, viewportDimensions, graphDimensions, padding, inverse) {
	  // TODO: it's possible to optimize this drastically!
	  var angle = state.angle,
	    ratio = state.ratio,
	    x = state.x,
	    y = state.y;
	  var width = viewportDimensions.width,
	    height = viewportDimensions.height;
	  var matrix = identity();
	  var smallestDimension = Math.min(width, height) - 2 * padding;
	  var correctionRatio = getCorrectionRatio(viewportDimensions, graphDimensions);
	  if (!inverse) {
	    multiply(matrix, scale(identity(), 2 * (smallestDimension / width) * correctionRatio, 2 * (smallestDimension / height) * correctionRatio));
	    multiply(matrix, rotate(identity(), -angle));
	    multiply(matrix, scale(identity(), 1 / ratio));
	    multiply(matrix, translate(identity(), -x, -y));
	  } else {
	    multiply(matrix, translate(identity(), x, y));
	    multiply(matrix, scale(identity(), ratio));
	    multiply(matrix, rotate(identity(), angle));
	    multiply(matrix, scale(identity(), width / smallestDimension / 2 / correctionRatio, height / smallestDimension / 2 / correctionRatio));
	  }
	  return matrix;
	}

	/**
	 * All these transformations we apply on the matrix to get it rescale the graph
	 * as we want make it very hard to get pixel-perfect distances in WebGL. This
	 * function returns a factor that properly cancels the matrix effect on lengths.
	 *
	 * [jacomyal]
	 * To be fully honest, I can't really explain happens here... I notice that the
	 * following ratio works (i.e. it correctly compensates the matrix impact on all
	 * camera states I could try):
	 * > `R = size(V) / size(M * V) / W`
	 * as long as `M * V` is in the direction of W (ie. parallel to (Ox)). It works
	 * as well with H and a vector that transforms into something parallel to (Oy).
	 *
	 * Also, note that we use `angle` and not `-angle` (that would seem logical,
	 * since we want to anticipate the rotation), because the image is vertically
	 * swapped in WebGL.
	 */
	function getMatrixImpact(matrix, cameraState, viewportDimensions) {
	  var _multiplyVec = multiplyVec2(matrix, {
	      x: Math.cos(cameraState.angle),
	      y: Math.sin(cameraState.angle)
	    }, 0),
	    x = _multiplyVec.x,
	    y = _multiplyVec.y;
	  return 1 / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) / viewportDimensions.width;
	}

	/**
	 * Function returning the graph's node extent in x & y.
	 */
	function graphExtent(graph) {
	  if (!graph.order) return {
	    x: [0, 1],
	    y: [0, 1]
	  };
	  var xMin = Infinity;
	  var xMax = -Infinity;
	  var yMin = Infinity;
	  var yMax = -Infinity;
	  graph.forEachNode(function (_, attr) {
	    var x = attr.x,
	      y = attr.y;
	    if (x < xMin) xMin = x;
	    if (x > xMax) xMax = x;
	    if (y < yMin) yMin = y;
	    if (y > yMax) yMax = y;
	  });
	  return {
	    x: [xMin, xMax],
	    y: [yMin, yMax]
	  };
	}

	/**
	 * Check if the graph variable is a valid graph, and if sigma can render it.
	 */
	function validateGraph(graph) {
	  // check if it's a valid graphology instance
	  if (!isGraph$2(graph)) throw new Error("Sigma: invalid graph instance.");

	  // check if nodes have x/y attributes
	  graph.forEachNode(function (key, attributes) {
	    if (!Number.isFinite(attributes.x) || !Number.isFinite(attributes.y)) {
	      throw new Error("Sigma: Coordinates of node ".concat(key, " are invalid. A node must have a numeric 'x' and 'y' attribute."));
	    }
	  });
	}

	/**
	 * Function used to create DOM elements easily.
	 */
	function createElement(tag, style, attributes) {
	  var element = document.createElement(tag);
	  if (style) {
	    for (var k in style) {
	      element.style[k] = style[k];
	    }
	  }
	  if (attributes) {
	    for (var _k in attributes) {
	      element.setAttribute(_k, attributes[_k]);
	    }
	  }
	  return element;
	}

	/**
	 * Function returning the browser's pixel ratio.
	 */
	function getPixelRatio() {
	  if (typeof window.devicePixelRatio !== "undefined") return window.devicePixelRatio;
	  return 1;
	}

	/**
	 * Function ordering the given elements in reverse z-order so they drawn
	 * the correct way.
	 */
	function zIndexOrdering(_extent, getter, elements) {
	  // If k is > n, we'll use a standard sort
	  return elements.sort(function (a, b) {
	    var zA = getter(a) || 0,
	      zB = getter(b) || 0;
	    if (zA < zB) return -1;
	    if (zA > zB) return 1;
	    return 0;
	  });

	  // TODO: counting sort optimization
	}

	/**
	 * Factory returning a function normalizing the given node's position & size.
	 */

	function createNormalizationFunction(extent) {
	  var _extent$x = _slicedToArray(extent.x, 2),
	    minX = _extent$x[0],
	    maxX = _extent$x[1],
	    _extent$y = _slicedToArray(extent.y, 2),
	    minY = _extent$y[0],
	    maxY = _extent$y[1];
	  var ratio = Math.max(maxX - minX, maxY - minY),
	    dX = (maxX + minX) / 2,
	    dY = (maxY + minY) / 2;
	  if (ratio === 0 || Math.abs(ratio) === Infinity || isNaN(ratio)) ratio = 1;
	  if (isNaN(dX)) dX = 0;
	  if (isNaN(dY)) dY = 0;
	  var fn = function fn(data) {
	    return {
	      x: 0.5 + (data.x - dX) / ratio,
	      y: 0.5 + (data.y - dY) / ratio
	    };
	  };

	  // TODO: possibility to apply this in batch over array of indices
	  fn.applyTo = function (data) {
	    data.x = 0.5 + (data.x - dX) / ratio;
	    data.y = 0.5 + (data.y - dY) / ratio;
	  };
	  fn.inverse = function (data) {
	    return {
	      x: dX + ratio * (data.x - 0.5),
	      y: dY + ratio * (data.y - 0.5)
	    };
	  };
	  fn.ratio = ratio;
	  return fn;
	}

	/**
	 * Extends the target array with the given values.
	 */
	function extend(array, values) {
	  var l2 = values.size;
	  if (l2 === 0) return;
	  var l1 = array.length;
	  array.length += l2;
	  var i = 0;
	  values.forEach(function (value) {
	    array[l1 + i] = value;
	    i++;
	  });
	}

	/**
	 * Helper to use `Object.assign` with more than two objects.
	 */
	function assign(target) {
	  target = target || {};
	  for (var i = 0, l = arguments.length <= 1 ? 0 : arguments.length - 1; i < l; i++) {
	    var o = i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1];
	    if (!o) continue;
	    Object.assign(target, o);
	  }
	  return target;
	}

	/**
	 * Sigma.js Settings
	 * =================================
	 *
	 * The list of settings and some handy functions.
	 * @module
	 */

	/**
	 * Sigma.js settings
	 * =================================
	 */

	var DEFAULT_SETTINGS = {
	  // Performance
	  hideEdgesOnMove: false,
	  hideLabelsOnMove: false,
	  renderLabels: true,
	  renderEdgeLabels: false,
	  enableEdgeEvents: false,
	  // Component rendering
	  defaultNodeColor: "#999",
	  defaultNodeType: "circle",
	  defaultEdgeColor: "#ccc",
	  defaultEdgeType: "line",
	  labelFont: "Arial",
	  labelSize: 14,
	  labelWeight: "normal",
	  labelColor: {
	    color: "#000"
	  },
	  edgeLabelFont: "Arial",
	  edgeLabelSize: 14,
	  edgeLabelWeight: "normal",
	  edgeLabelColor: {
	    attribute: "color"
	  },
	  stagePadding: 30,
	  zoomToSizeRatioFunction: Math.sqrt,
	  itemSizesReference: "screen",
	  defaultDrawEdgeLabel: drawStraightEdgeLabel,
	  defaultDrawNodeLabel: drawDiscNodeLabel,
	  defaultDrawNodeHover: drawDiscNodeHover,
	  minEdgeThickness: 1.7,
	  antiAliasingFeather: 1,
	  // Labels
	  labelDensity: 1,
	  labelGridCellSize: 100,
	  labelRenderedSizeThreshold: 6,
	  // Reducers
	  nodeReducer: null,
	  edgeReducer: null,
	  // Features
	  zIndex: false,
	  minCameraRatio: null,
	  maxCameraRatio: null,
	  enableCameraRotation: true,
	  // Lifecycle
	  allowInvalidContainer: false,
	  // Program classes
	  nodeProgramClasses: {},
	  nodeHoverProgramClasses: {},
	  edgeProgramClasses: {}
	};
	var DEFAULT_NODE_PROGRAM_CLASSES = {
	  circle: NodeCircleProgram
	};
	var DEFAULT_EDGE_PROGRAM_CLASSES = {
	  arrow: EdgeArrowProgram$1,
	  line: EdgeRectangleProgram
	};
	function validateSettings(settings) {
	  if (typeof settings.labelDensity !== "number" || settings.labelDensity < 0) {
	    throw new Error("Settings: invalid `labelDensity`. Expecting a positive number.");
	  }
	  var minCameraRatio = settings.minCameraRatio,
	    maxCameraRatio = settings.maxCameraRatio;
	  if (typeof minCameraRatio === "number" && typeof maxCameraRatio === "number" && maxCameraRatio < minCameraRatio) {
	    throw new Error("Settings: invalid camera ratio boundaries. Expecting `maxCameraRatio` to be greater than `minCameraRatio`.");
	  }
	}
	function resolveSettings(settings) {
	  var resolvedSettings = assign({}, DEFAULT_SETTINGS, settings);
	  resolvedSettings.nodeProgramClasses = assign({}, DEFAULT_NODE_PROGRAM_CLASSES, resolvedSettings.nodeProgramClasses);
	  resolvedSettings.edgeProgramClasses = assign({}, DEFAULT_EDGE_PROGRAM_CLASSES, resolvedSettings.edgeProgramClasses);
	  return resolvedSettings;
	}

	/**
	 * Defaults.
	 */
	var DEFAULT_ZOOMING_RATIO = 1.5;

	/**
	 * Event types.
	 */
	/**
	 * Camera class
	 *
	 * @constructor
	 */
	var Camera = /*#__PURE__*/function (_TypedEventEmitter) {
	  _inherits(Camera, _TypedEventEmitter);
	  function Camera() {
	    var _this;
	    _classCallCheck(this, Camera);
	    _this = _callSuper(this, Camera);

	    // State
	    _defineProperty(_assertThisInitialized(_this), "x", 0.5);
	    _defineProperty(_assertThisInitialized(_this), "y", 0.5);
	    _defineProperty(_assertThisInitialized(_this), "angle", 0);
	    _defineProperty(_assertThisInitialized(_this), "ratio", 1);
	    _defineProperty(_assertThisInitialized(_this), "minRatio", null);
	    _defineProperty(_assertThisInitialized(_this), "maxRatio", null);
	    _defineProperty(_assertThisInitialized(_this), "enabledRotation", true);
	    _defineProperty(_assertThisInitialized(_this), "nextFrame", null);
	    _defineProperty(_assertThisInitialized(_this), "previousState", null);
	    _defineProperty(_assertThisInitialized(_this), "enabled", true);
	    _this.previousState = _this.getState();
	    return _this;
	  }

	  /**
	   * Static method used to create a Camera object with a given state.
	   *
	   * @param state
	   * @return {Camera}
	   */
	  _createClass(Camera, [{
	    key: "enable",
	    value:
	    /**
	     * Method used to enable the camera.
	     *
	     * @return {Camera}
	     */
	    function enable() {
	      this.enabled = true;
	      return this;
	    }

	    /**
	     * Method used to disable the camera.
	     *
	     * @return {Camera}
	     */
	  }, {
	    key: "disable",
	    value: function disable() {
	      this.enabled = false;
	      return this;
	    }

	    /**
	     * Method used to retrieve the camera's current state.
	     *
	     * @return {object}
	     */
	  }, {
	    key: "getState",
	    value: function getState() {
	      return {
	        x: this.x,
	        y: this.y,
	        angle: this.angle,
	        ratio: this.ratio
	      };
	    }

	    /**
	     * Method used to check whether the camera has the given state.
	     *
	     * @return {object}
	     */
	  }, {
	    key: "hasState",
	    value: function hasState(state) {
	      return this.x === state.x && this.y === state.y && this.ratio === state.ratio && this.angle === state.angle;
	    }

	    /**
	     * Method used to retrieve the camera's previous state.
	     *
	     * @return {object}
	     */
	  }, {
	    key: "getPreviousState",
	    value: function getPreviousState() {
	      var state = this.previousState;
	      if (!state) return null;
	      return {
	        x: state.x,
	        y: state.y,
	        angle: state.angle,
	        ratio: state.ratio
	      };
	    }

	    /**
	     * Method used to check minRatio and maxRatio values.
	     *
	     * @param ratio
	     * @return {number}
	     */
	  }, {
	    key: "getBoundedRatio",
	    value: function getBoundedRatio(ratio) {
	      var r = ratio;
	      if (typeof this.minRatio === "number") r = Math.max(r, this.minRatio);
	      if (typeof this.maxRatio === "number") r = Math.min(r, this.maxRatio);
	      return r;
	    }

	    /**
	     * Method used to check various things to return a legit state candidate.
	     *
	     * @param state
	     * @return {object}
	     */
	  }, {
	    key: "validateState",
	    value: function validateState(state) {
	      var validatedState = {};
	      if (typeof state.x === "number") validatedState.x = state.x;
	      if (typeof state.y === "number") validatedState.y = state.y;
	      if (this.enabledRotation && typeof state.angle === "number") validatedState.angle = state.angle;
	      if (typeof state.ratio === "number") validatedState.ratio = this.getBoundedRatio(state.ratio);
	      return validatedState;
	    }

	    /**
	     * Method used to check whether the camera is currently being animated.
	     *
	     * @return {boolean}
	     */
	  }, {
	    key: "isAnimated",
	    value: function isAnimated() {
	      return !!this.nextFrame;
	    }

	    /**
	     * Method used to set the camera's state.
	     *
	     * @param  {object} state - New state.
	     * @return {Camera}
	     */
	  }, {
	    key: "setState",
	    value: function setState(state) {
	      if (!this.enabled) return this;

	      // TODO: update by function

	      // Keeping track of last state
	      this.previousState = this.getState();
	      var validState = this.validateState(state);
	      if (typeof validState.x === "number") this.x = validState.x;
	      if (typeof validState.y === "number") this.y = validState.y;
	      if (this.enabledRotation && typeof validState.angle === "number") this.angle = validState.angle;
	      if (typeof validState.ratio === "number") this.ratio = validState.ratio;

	      // Emitting
	      if (!this.hasState(this.previousState)) this.emit("updated", this.getState());
	      return this;
	    }

	    /**
	     * Method used to update the camera's state using a function.
	     *
	     * @param  {function} updater - Updated function taking current state and
	     *                              returning next state.
	     * @return {Camera}
	     */
	  }, {
	    key: "updateState",
	    value: function updateState(updater) {
	      this.setState(updater(this.getState()));
	      return this;
	    }

	    /**
	     * Method used to animate the camera.
	     *
	     * @param  {object}                    state      - State to reach eventually.
	     * @param  {object}                    opts       - Options:
	     * @param  {number}                      duration - Duration of the animation.
	     * @param  {string | number => number}   easing   - Easing function or name of an existing one
	     * @param  {function}                  callback   - Callback
	     */
	  }, {
	    key: "animate",
	    value: function animate(state, opts, callback) {
	      var _this2 = this;
	      if (!this.enabled) return;
	      var options = Object.assign({}, ANIMATE_DEFAULTS, opts);
	      var validState = this.validateState(state);
	      var easing = typeof options.easing === "function" ? options.easing : easings[options.easing];

	      // State
	      var start = Date.now(),
	        initialState = this.getState();

	      // Function performing the animation
	      var fn = function fn() {
	        var t = (Date.now() - start) / options.duration;

	        // The animation is over:
	        if (t >= 1) {
	          _this2.nextFrame = null;
	          _this2.setState(validState);
	          if (_this2.animationCallback) {
	            _this2.animationCallback.call(null);
	            _this2.animationCallback = undefined;
	          }
	          return;
	        }
	        var coefficient = easing(t);
	        var newState = {};
	        if (typeof validState.x === "number") newState.x = initialState.x + (validState.x - initialState.x) * coefficient;
	        if (typeof validState.y === "number") newState.y = initialState.y + (validState.y - initialState.y) * coefficient;
	        if (_this2.enabledRotation && typeof validState.angle === "number") newState.angle = initialState.angle + (validState.angle - initialState.angle) * coefficient;
	        if (typeof validState.ratio === "number") newState.ratio = initialState.ratio + (validState.ratio - initialState.ratio) * coefficient;
	        _this2.setState(newState);
	        _this2.nextFrame = requestAnimationFrame(fn);
	      };
	      if (this.nextFrame) {
	        cancelAnimationFrame(this.nextFrame);
	        if (this.animationCallback) this.animationCallback.call(null);
	        this.nextFrame = requestAnimationFrame(fn);
	      } else {
	        fn();
	      }
	      this.animationCallback = callback;
	    }

	    /**
	     * Method used to zoom the camera.
	     *
	     * @param  {number|object} factorOrOptions - Factor or options.
	     * @return {function}
	     */
	  }, {
	    key: "animatedZoom",
	    value: function animatedZoom(factorOrOptions) {
	      if (!factorOrOptions) {
	        this.animate({
	          ratio: this.ratio / DEFAULT_ZOOMING_RATIO
	        });
	      } else {
	        if (typeof factorOrOptions === "number") return this.animate({
	          ratio: this.ratio / factorOrOptions
	        });else this.animate({
	          ratio: this.ratio / (factorOrOptions.factor || DEFAULT_ZOOMING_RATIO)
	        }, factorOrOptions);
	      }
	    }

	    /**
	     * Method used to unzoom the camera.
	     *
	     * @param  {number|object} factorOrOptions - Factor or options.
	     */
	  }, {
	    key: "animatedUnzoom",
	    value: function animatedUnzoom(factorOrOptions) {
	      if (!factorOrOptions) {
	        this.animate({
	          ratio: this.ratio * DEFAULT_ZOOMING_RATIO
	        });
	      } else {
	        if (typeof factorOrOptions === "number") return this.animate({
	          ratio: this.ratio * factorOrOptions
	        });else this.animate({
	          ratio: this.ratio * (factorOrOptions.factor || DEFAULT_ZOOMING_RATIO)
	        }, factorOrOptions);
	      }
	    }

	    /**
	     * Method used to reset the camera.
	     *
	     * @param  {object} options - Options.
	     */
	  }, {
	    key: "animatedReset",
	    value: function animatedReset(options) {
	      this.animate({
	        x: 0.5,
	        y: 0.5,
	        ratio: 1,
	        angle: 0
	      }, options);
	    }

	    /**
	     * Returns a new Camera instance, with the same state as the current camera.
	     *
	     * @return {Camera}
	     */
	  }, {
	    key: "copy",
	    value: function copy() {
	      return Camera.from(this.getState());
	    }
	  }], [{
	    key: "from",
	    value: function from(state) {
	      var camera = new Camera();
	      return camera.setState(state);
	    }
	  }]);
	  return Camera;
	}(TypedEventEmitter);

	/**
	 * Captor utils functions
	 * ======================
	 */

	/**
	 * Extract the local X and Y coordinates from a mouse event or touch object. If
	 * a DOM element is given, it uses this element's offset to compute the position
	 * (this allows using events that are not bound to the container itself and
	 * still have a proper position).
	 *
	 * @param  {event}       e - A mouse event or touch object.
	 * @param  {HTMLElement} dom - A DOM element to compute offset relatively to.
	 * @return {number}      The local Y value of the mouse.
	 */
	function getPosition(e, dom) {
	  var bbox = dom.getBoundingClientRect();
	  return {
	    x: e.clientX - bbox.left,
	    y: e.clientY - bbox.top
	  };
	}

	/**
	 * Convert mouse coords to sigma coords.
	 *
	 * @param  {event}       e   - A mouse event or touch object.
	 * @param  {HTMLElement} dom - A DOM element to compute offset relatively to.
	 * @return {object}
	 */
	function getMouseCoords(e, dom) {
	  var res = _objectSpread2(_objectSpread2({}, getPosition(e, dom)), {}, {
	    sigmaDefaultPrevented: false,
	    preventSigmaDefault: function preventSigmaDefault() {
	      res.sigmaDefaultPrevented = true;
	    },
	    original: e
	  });
	  return res;
	}

	/**
	 * Convert mouse wheel event coords to sigma coords.
	 *
	 * @param  {event}       e   - A wheel mouse event.
	 * @param  {HTMLElement} dom - A DOM element to compute offset relatively to.
	 * @return {object}
	 */
	function getWheelCoords(e, dom) {
	  return _objectSpread2(_objectSpread2({}, getMouseCoords(e, dom)), {}, {
	    delta: getWheelDelta(e)
	  });
	}
	var MAX_TOUCHES = 2;
	function getTouchesArray(touches) {
	  var arr = [];
	  for (var i = 0, l = Math.min(touches.length, MAX_TOUCHES); i < l; i++) arr.push(touches[i]);
	  return arr;
	}

	/**
	 * Convert touch coords to sigma coords.
	 *
	 * @param  {event}       e   - A touch event.
	 * @param  {HTMLElement} dom - A DOM element to compute offset relatively to.
	 * @return {object}
	 */
	function getTouchCoords(e, dom) {
	  return {
	    touches: getTouchesArray(e.touches).map(function (touch) {
	      return getPosition(touch, dom);
	    }),
	    original: e
	  };
	}

	/**
	 * Extract the wheel delta from a mouse event or touch object.
	 *
	 * @param  {event}  e - A mouse event or touch object.
	 * @return {number}     The wheel delta of the mouse.
	 */
	function getWheelDelta(e) {
	  // TODO: check those ratios again to ensure a clean Chrome/Firefox compat
	  if (typeof e.deltaY !== "undefined") return e.deltaY * -3 / 360;
	  if (typeof e.detail !== "undefined") return e.detail / -9;
	  throw new Error("Captor: could not extract delta from event.");
	}

	/**
	 * Abstract class representing a captor like the user's mouse or touch controls.
	 */
	var Captor = /*#__PURE__*/function (_TypedEventEmitter) {
	  _inherits(Captor, _TypedEventEmitter);
	  function Captor(container, renderer) {
	    var _this;
	    _classCallCheck(this, Captor);
	    _this = _callSuper(this, Captor);
	    // Properties
	    _this.container = container;
	    _this.renderer = renderer;
	    return _this;
	  }
	  return _createClass(Captor);
	}(TypedEventEmitter);

	/**
	 * Constants.
	 */
	var DRAG_TIMEOUT$1 = 100;
	var DRAGGED_EVENTS_TOLERANCE = 3;
	var MOUSE_INERTIA_DURATION = 200;
	var MOUSE_INERTIA_RATIO = 3;
	var MOUSE_ZOOM_DURATION = 250;
	var ZOOMING_RATIO = 1.7;
	var DOUBLE_CLICK_TIMEOUT = 300;
	var DOUBLE_CLICK_ZOOMING_RATIO = 2.2;
	var DOUBLE_CLICK_ZOOMING_DURATION = 200;

	/**
	 * Event types.
	 */
	/**
	 * Mouse captor class.
	 *
	 * @constructor
	 */
	var MouseCaptor = /*#__PURE__*/function (_Captor) {
	  _inherits(MouseCaptor, _Captor);
	  function MouseCaptor(container, renderer) {
	    var _this;
	    _classCallCheck(this, MouseCaptor);
	    _this = _callSuper(this, MouseCaptor, [container, renderer]);

	    // Binding methods
	    // State
	    _defineProperty(_assertThisInitialized(_this), "enabled", true);
	    _defineProperty(_assertThisInitialized(_this), "draggedEvents", 0);
	    _defineProperty(_assertThisInitialized(_this), "downStartTime", null);
	    _defineProperty(_assertThisInitialized(_this), "lastMouseX", null);
	    _defineProperty(_assertThisInitialized(_this), "lastMouseY", null);
	    _defineProperty(_assertThisInitialized(_this), "isMouseDown", false);
	    _defineProperty(_assertThisInitialized(_this), "isMoving", false);
	    _defineProperty(_assertThisInitialized(_this), "movingTimeout", null);
	    _defineProperty(_assertThisInitialized(_this), "startCameraState", null);
	    _defineProperty(_assertThisInitialized(_this), "clicks", 0);
	    _defineProperty(_assertThisInitialized(_this), "doubleClickTimeout", null);
	    _defineProperty(_assertThisInitialized(_this), "currentWheelDirection", 0);
	    _this.handleClick = _this.handleClick.bind(_assertThisInitialized(_this));
	    _this.handleRightClick = _this.handleRightClick.bind(_assertThisInitialized(_this));
	    _this.handleDown = _this.handleDown.bind(_assertThisInitialized(_this));
	    _this.handleUp = _this.handleUp.bind(_assertThisInitialized(_this));
	    _this.handleMove = _this.handleMove.bind(_assertThisInitialized(_this));
	    _this.handleWheel = _this.handleWheel.bind(_assertThisInitialized(_this));
	    _this.handleLeave = _this.handleLeave.bind(_assertThisInitialized(_this));
	    _this.handleEnter = _this.handleEnter.bind(_assertThisInitialized(_this));

	    // Binding events
	    container.addEventListener("click", _this.handleClick, false);
	    container.addEventListener("contextmenu", _this.handleRightClick, false);
	    container.addEventListener("mousedown", _this.handleDown, false);
	    container.addEventListener("wheel", _this.handleWheel, false);
	    container.addEventListener("mouseleave", _this.handleLeave, false);
	    container.addEventListener("mouseenter", _this.handleEnter, false);
	    document.addEventListener("mousemove", _this.handleMove, false);
	    document.addEventListener("mouseup", _this.handleUp, false);
	    return _this;
	  }
	  _createClass(MouseCaptor, [{
	    key: "kill",
	    value: function kill() {
	      var container = this.container;
	      container.removeEventListener("click", this.handleClick);
	      container.removeEventListener("contextmenu", this.handleRightClick);
	      container.removeEventListener("mousedown", this.handleDown);
	      container.removeEventListener("wheel", this.handleWheel);
	      container.removeEventListener("mouseleave", this.handleLeave);
	      container.removeEventListener("mouseenter", this.handleEnter);
	      document.removeEventListener("mousemove", this.handleMove);
	      document.removeEventListener("mouseup", this.handleUp);
	    }
	  }, {
	    key: "handleClick",
	    value: function handleClick(e) {
	      var _this2 = this;
	      if (!this.enabled) return;
	      this.clicks++;
	      if (this.clicks === 2) {
	        this.clicks = 0;
	        if (typeof this.doubleClickTimeout === "number") {
	          clearTimeout(this.doubleClickTimeout);
	          this.doubleClickTimeout = null;
	        }
	        return this.handleDoubleClick(e);
	      }
	      setTimeout(function () {
	        _this2.clicks = 0;
	        _this2.doubleClickTimeout = null;
	      }, DOUBLE_CLICK_TIMEOUT);

	      // NOTE: this is here to prevent click events on drag
	      if (this.draggedEvents < DRAGGED_EVENTS_TOLERANCE) this.emit("click", getMouseCoords(e, this.container));
	    }
	  }, {
	    key: "handleRightClick",
	    value: function handleRightClick(e) {
	      if (!this.enabled) return;
	      this.emit("rightClick", getMouseCoords(e, this.container));
	    }
	  }, {
	    key: "handleDoubleClick",
	    value: function handleDoubleClick(e) {
	      if (!this.enabled) return;
	      e.preventDefault();
	      e.stopPropagation();
	      var mouseCoords = getMouseCoords(e, this.container);
	      this.emit("doubleClick", mouseCoords);
	      if (mouseCoords.sigmaDefaultPrevented) return;

	      // default behavior
	      var camera = this.renderer.getCamera();
	      var newRatio = camera.getBoundedRatio(camera.getState().ratio / DOUBLE_CLICK_ZOOMING_RATIO);
	      camera.animate(this.renderer.getViewportZoomedState(getPosition(e, this.container), newRatio), {
	        easing: "quadraticInOut",
	        duration: DOUBLE_CLICK_ZOOMING_DURATION
	      });
	    }
	  }, {
	    key: "handleDown",
	    value: function handleDown(e) {
	      if (!this.enabled) return;

	      // We only start dragging on left button
	      if (e.button === 0) {
	        this.startCameraState = this.renderer.getCamera().getState();
	        var _getPosition = getPosition(e, this.container),
	          x = _getPosition.x,
	          y = _getPosition.y;
	        this.lastMouseX = x;
	        this.lastMouseY = y;
	        this.draggedEvents = 0;
	        this.downStartTime = Date.now();
	        this.isMouseDown = true;
	      }
	      this.emit("mousedown", getMouseCoords(e, this.container));
	    }
	  }, {
	    key: "handleUp",
	    value: function handleUp(e) {
	      var _this3 = this;
	      if (!this.enabled || !this.isMouseDown) return;
	      var camera = this.renderer.getCamera();
	      this.isMouseDown = false;
	      if (typeof this.movingTimeout === "number") {
	        clearTimeout(this.movingTimeout);
	        this.movingTimeout = null;
	      }
	      var _getPosition2 = getPosition(e, this.container),
	        x = _getPosition2.x,
	        y = _getPosition2.y;
	      var cameraState = camera.getState(),
	        previousCameraState = camera.getPreviousState() || {
	          x: 0,
	          y: 0
	        };
	      if (this.isMoving) {
	        camera.animate({
	          x: cameraState.x + MOUSE_INERTIA_RATIO * (cameraState.x - previousCameraState.x),
	          y: cameraState.y + MOUSE_INERTIA_RATIO * (cameraState.y - previousCameraState.y)
	        }, {
	          duration: MOUSE_INERTIA_DURATION,
	          easing: "quadraticOut"
	        });
	      } else if (this.lastMouseX !== x || this.lastMouseY !== y) {
	        camera.setState({
	          x: cameraState.x,
	          y: cameraState.y
	        });
	      }
	      this.isMoving = false;
	      setTimeout(function () {
	        var shouldRefresh = _this3.draggedEvents > 0;
	        _this3.draggedEvents = 0;

	        // NOTE: this refresh is here to make sure `hideEdgesOnMove` can work
	        // when someone releases camera pan drag after having stopped moving.
	        // See commit: https://github.com/jacomyal/sigma.js/commit/cfd9197f70319109db6b675dd7c82be493ca95a2
	        // See also issue: https://github.com/jacomyal/sigma.js/issues/1290
	        // It could be possible to render instead of scheduling a refresh but for
	        // now it seems good enough.
	        if (shouldRefresh) _this3.renderer.refresh();
	      }, 0);
	      this.emit("mouseup", getMouseCoords(e, this.container));
	    }
	  }, {
	    key: "handleMove",
	    value: function handleMove(e) {
	      var _this4 = this;
	      if (!this.enabled) return;
	      var mouseCoords = getMouseCoords(e, this.container);

	      // Always trigger a "mousemovebody" event, so that it is possible to develop
	      // a drag-and-drop effect that works even when the mouse is out of the
	      // container:
	      this.emit("mousemovebody", mouseCoords);

	      // Only trigger the "mousemove" event when the mouse is actually hovering
	      // the container, to avoid weirdly hovering nodes and/or edges when the
	      // mouse is not hover the container:
	      if (e.target === this.container || e.composedPath()[0] === this.container) {
	        this.emit("mousemove", mouseCoords);
	      }
	      if (mouseCoords.sigmaDefaultPrevented) return;

	      // Handle the case when "isMouseDown" all the time, to allow dragging the
	      // stage while the mouse is not hover the container:
	      if (this.isMouseDown) {
	        this.isMoving = true;
	        this.draggedEvents++;
	        if (typeof this.movingTimeout === "number") {
	          clearTimeout(this.movingTimeout);
	        }
	        this.movingTimeout = window.setTimeout(function () {
	          _this4.movingTimeout = null;
	          _this4.isMoving = false;
	        }, DRAG_TIMEOUT$1);
	        var camera = this.renderer.getCamera();
	        var _getPosition3 = getPosition(e, this.container),
	          eX = _getPosition3.x,
	          eY = _getPosition3.y;
	        var lastMouse = this.renderer.viewportToFramedGraph({
	          x: this.lastMouseX,
	          y: this.lastMouseY
	        });
	        var mouse = this.renderer.viewportToFramedGraph({
	          x: eX,
	          y: eY
	        });
	        var offsetX = lastMouse.x - mouse.x,
	          offsetY = lastMouse.y - mouse.y;
	        var cameraState = camera.getState();
	        var x = cameraState.x + offsetX,
	          y = cameraState.y + offsetY;
	        camera.setState({
	          x: x,
	          y: y
	        });
	        this.lastMouseX = eX;
	        this.lastMouseY = eY;
	        e.preventDefault();
	        e.stopPropagation();
	      }
	    }
	  }, {
	    key: "handleLeave",
	    value: function handleLeave(e) {
	      this.emit("mouseleave", getMouseCoords(e, this.container));
	    }
	  }, {
	    key: "handleEnter",
	    value: function handleEnter(e) {
	      this.emit("mouseenter", getMouseCoords(e, this.container));
	    }
	  }, {
	    key: "handleWheel",
	    value: function handleWheel(e) {
	      var _this5 = this;
	      if (!this.enabled) return;
	      e.preventDefault();
	      e.stopPropagation();
	      var delta = getWheelDelta(e);
	      if (!delta) return;
	      var wheelCoords = getWheelCoords(e, this.container);
	      this.emit("wheel", wheelCoords);
	      if (wheelCoords.sigmaDefaultPrevented) return;

	      // Default behavior
	      var ratioDiff = delta > 0 ? 1 / ZOOMING_RATIO : ZOOMING_RATIO;
	      var camera = this.renderer.getCamera();
	      var newRatio = camera.getBoundedRatio(camera.getState().ratio * ratioDiff);
	      var wheelDirection = delta > 0 ? 1 : -1;
	      var now = Date.now();

	      // Cancel events that are too close too each other and in the same direction:
	      if (this.currentWheelDirection === wheelDirection && this.lastWheelTriggerTime && now - this.lastWheelTriggerTime < MOUSE_ZOOM_DURATION / 5) {
	        return;
	      }
	      camera.animate(this.renderer.getViewportZoomedState(getPosition(e, this.container), newRatio), {
	        easing: "quadraticOut",
	        duration: MOUSE_ZOOM_DURATION
	      }, function () {
	        _this5.currentWheelDirection = 0;
	      });
	      this.currentWheelDirection = wheelDirection;
	      this.lastWheelTriggerTime = now;
	    }
	  }]);
	  return MouseCaptor;
	}(Captor);

	var DRAG_TIMEOUT = 200;
	var TOUCH_INERTIA_RATIO = 3;
	var TOUCH_INERTIA_DURATION = 200;

	/**
	 * Event types.
	 */
	/**
	 * Touch captor class.
	 *
	 * @constructor
	 */
	var TouchCaptor = /*#__PURE__*/function (_Captor) {
	  _inherits(TouchCaptor, _Captor);
	  function TouchCaptor(container, renderer) {
	    var _this;
	    _classCallCheck(this, TouchCaptor);
	    _this = _callSuper(this, TouchCaptor, [container, renderer]);

	    // Binding methods:
	    _defineProperty(_assertThisInitialized(_this), "enabled", true);
	    _defineProperty(_assertThisInitialized(_this), "isMoving", false);
	    _defineProperty(_assertThisInitialized(_this), "hasMoved", false);
	    _defineProperty(_assertThisInitialized(_this), "touchMode", 0);
	    _defineProperty(_assertThisInitialized(_this), "startTouchesPositions", []);
	    _this.handleStart = _this.handleStart.bind(_assertThisInitialized(_this));
	    _this.handleLeave = _this.handleLeave.bind(_assertThisInitialized(_this));
	    _this.handleMove = _this.handleMove.bind(_assertThisInitialized(_this));

	    // Binding events
	    container.addEventListener("touchstart", _this.handleStart, false);
	    container.addEventListener("touchend", _this.handleLeave, false);
	    container.addEventListener("touchcancel", _this.handleLeave, false);
	    container.addEventListener("touchmove", _this.handleMove, false);
	    return _this;
	  }
	  _createClass(TouchCaptor, [{
	    key: "kill",
	    value: function kill() {
	      var container = this.container;
	      container.removeEventListener("touchstart", this.handleStart);
	      container.removeEventListener("touchend", this.handleLeave);
	      container.removeEventListener("touchcancel", this.handleLeave);
	      container.removeEventListener("touchmove", this.handleMove);
	    }
	  }, {
	    key: "getDimensions",
	    value: function getDimensions() {
	      return {
	        width: this.container.offsetWidth,
	        height: this.container.offsetHeight
	      };
	    }
	  }, {
	    key: "dispatchRelatedMouseEvent",
	    value: function dispatchRelatedMouseEvent(type, e, touch, emitter) {
	      var mousePosition = touch || e.touches[0];
	      var mouseEvent = new MouseEvent(type, {
	        clientX: mousePosition.clientX,
	        clientY: mousePosition.clientY,
	        altKey: e.altKey,
	        ctrlKey: e.ctrlKey
	      });
	      mouseEvent.isFakeSigmaMouseEvent = true;
	      (emitter || this.container).dispatchEvent(mouseEvent);
	    }
	  }, {
	    key: "handleStart",
	    value: function handleStart(e) {
	      var _this2 = this;
	      if (!this.enabled) return;

	      // Prevent default to avoid default browser behaviors...
	      e.preventDefault();
	      // ...but simulate mouse behavior anyway, to get the MouseCaptor working as well:
	      if (e.touches.length === 1) this.dispatchRelatedMouseEvent("mousedown", e);
	      var touches = getTouchesArray(e.touches);
	      this.touchMode = touches.length;
	      this.startCameraState = this.renderer.getCamera().getState();
	      this.startTouchesPositions = touches.map(function (touch) {
	        return getPosition(touch, _this2.container);
	      });
	      this.lastTouches = touches;
	      this.lastTouchesPositions = this.startTouchesPositions;

	      // When there are two touches down, let's record distance and angle as well:
	      if (this.touchMode === 2) {
	        var _this$startTouchesPos = _slicedToArray(this.startTouchesPositions, 2),
	          _this$startTouchesPos2 = _this$startTouchesPos[0],
	          x0 = _this$startTouchesPos2.x,
	          y0 = _this$startTouchesPos2.y,
	          _this$startTouchesPos3 = _this$startTouchesPos[1],
	          x1 = _this$startTouchesPos3.x,
	          y1 = _this$startTouchesPos3.y;
	        this.startTouchesAngle = Math.atan2(y1 - y0, x1 - x0);
	        this.startTouchesDistance = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
	      }
	      this.emit("touchdown", getTouchCoords(e, this.container));
	    }
	  }, {
	    key: "handleLeave",
	    value: function handleLeave(e) {
	      if (!this.enabled) return;

	      // Prevent default to avoid default browser behaviors...
	      e.preventDefault();
	      // ...but simulate mouse behavior anyway, to get the MouseCaptor working as well:
	      if (e.touches.length === 0 && this.lastTouches && this.lastTouches.length) {
	        this.dispatchRelatedMouseEvent("mouseup", e, this.lastTouches[0], document);
	        // ... and only click if no move was made
	        if (!this.hasMoved) {
	          this.dispatchRelatedMouseEvent("click", e, this.lastTouches[0]);
	        }
	      }
	      if (this.movingTimeout) {
	        this.isMoving = false;
	        clearTimeout(this.movingTimeout);
	      }
	      switch (this.touchMode) {
	        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
	        // @ts-ignore
	        case 2:
	          if (e.touches.length === 1) {
	            this.handleStart(e);
	            e.preventDefault();
	            break;
	          }
	        /* falls through */
	        case 1:
	          // TODO
	          // Dispatch event

	          if (this.isMoving) {
	            var camera = this.renderer.getCamera();
	            var cameraState = camera.getState(),
	              previousCameraState = camera.getPreviousState() || {
	                x: 0,
	                y: 0
	              };
	            camera.animate({
	              x: cameraState.x + TOUCH_INERTIA_RATIO * (cameraState.x - previousCameraState.x),
	              y: cameraState.y + TOUCH_INERTIA_RATIO * (cameraState.y - previousCameraState.y)
	            }, {
	              duration: TOUCH_INERTIA_DURATION,
	              easing: "quadraticOut"
	            });
	          }
	          this.hasMoved = false;
	          this.isMoving = false;
	          this.touchMode = 0;
	          break;
	      }
	      this.emit("touchup", getTouchCoords(e, this.container));
	    }
	  }, {
	    key: "handleMove",
	    value: function handleMove(e) {
	      var _this3 = this;
	      if (!this.enabled) return;

	      // Prevent default to avoid default browser behaviors...
	      e.preventDefault();
	      // ...but simulate mouse behavior anyway, to get the MouseCaptor working as well:
	      if (e.touches.length === 1) this.dispatchRelatedMouseEvent("mousemove", e);
	      var touches = getTouchesArray(e.touches);
	      var touchesPositions = touches.map(function (touch) {
	        return getPosition(touch, _this3.container);
	      });
	      this.lastTouches = touches;
	      this.lastTouchesPositions = touchesPositions;

	      // If a move was initiated at some point and we get back to startpoint,
	      // we should still consider that we did move (which also happens after a
	      // multiple touch when only one touch remains in which case handleStart
	      // is recalled within handleLeave).
	      // Now, some mobile browsers report zero-distance moves so we also check that
	      // one of the touches did actually move from the origin position.
	      this.hasMoved || (this.hasMoved = touchesPositions.some(function (position, idx) {
	        var startPosition = _this3.startTouchesPositions[idx];
	        return position.x !== startPosition.x || position.y !== startPosition.y;
	      }));

	      // If there was no move, do not trigger touch moves behavior
	      if (!this.hasMoved) {
	        return;
	      }
	      this.isMoving = true;
	      if (this.movingTimeout) clearTimeout(this.movingTimeout);
	      this.movingTimeout = window.setTimeout(function () {
	        _this3.isMoving = false;
	      }, DRAG_TIMEOUT);
	      var camera = this.renderer.getCamera();
	      var startCameraState = this.startCameraState;
	      switch (this.touchMode) {
	        case 1:
	          {
	            var _this$renderer$viewpo = this.renderer.viewportToFramedGraph((this.startTouchesPositions || [])[0]),
	              xStart = _this$renderer$viewpo.x,
	              yStart = _this$renderer$viewpo.y;
	            var _this$renderer$viewpo2 = this.renderer.viewportToFramedGraph(touchesPositions[0]),
	              x = _this$renderer$viewpo2.x,
	              y = _this$renderer$viewpo2.y;
	            camera.setState({
	              x: startCameraState.x + xStart - x,
	              y: startCameraState.y + yStart - y
	            });
	            break;
	          }
	        case 2:
	          {
	            /**
	             * Here is the thinking here:
	             *
	             * 1. We can find the new angle and ratio, by comparing the vector from "touch one" to "touch two" at the start
	             *    of the d'n'd and now
	             *
	             * 2. We can use `Camera#viewportToGraph` inside formula to retrieve the new camera position, using the graph
	             *    position of a touch at the beginning of the d'n'd (using `startCamera.viewportToGraph`) and the viewport
	             *    position of this same touch now
	             */
	            var newCameraState = {};
	            var _touchesPositions$ = touchesPositions[0],
	              x0 = _touchesPositions$.x,
	              y0 = _touchesPositions$.y;
	            var _touchesPositions$2 = touchesPositions[1],
	              x1 = _touchesPositions$2.x,
	              y1 = _touchesPositions$2.y;
	            var angleDiff = Math.atan2(y1 - y0, x1 - x0) - this.startTouchesAngle;
	            var ratioDiff = Math.hypot(y1 - y0, x1 - x0) / this.startTouchesDistance;

	            // 1.
	            var newRatio = camera.getBoundedRatio(startCameraState.ratio / ratioDiff);
	            newCameraState.ratio = newRatio;
	            newCameraState.angle = startCameraState.angle + angleDiff;

	            // 2.
	            var dimensions = this.getDimensions();
	            var touchGraphPosition = this.renderer.viewportToFramedGraph((this.startTouchesPositions || [])[0], {
	              cameraState: startCameraState
	            });
	            var smallestDimension = Math.min(dimensions.width, dimensions.height);
	            var dx = smallestDimension / dimensions.width;
	            var dy = smallestDimension / dimensions.height;
	            var ratio = newRatio / smallestDimension;

	            // Align with center of the graph:
	            var _x = x0 - smallestDimension / 2 / dx;
	            var _y = y0 - smallestDimension / 2 / dy;

	            // Rotate:
	            var _ref = [_x * Math.cos(-newCameraState.angle) - _y * Math.sin(-newCameraState.angle), _y * Math.cos(-newCameraState.angle) + _x * Math.sin(-newCameraState.angle)];
	            _x = _ref[0];
	            _y = _ref[1];
	            newCameraState.x = touchGraphPosition.x - _x * ratio;
	            newCameraState.y = touchGraphPosition.y + _y * ratio;
	            camera.setState(newCameraState);
	            break;
	          }
	      }
	      this.emit("touchmove", getTouchCoords(e, this.container));
	    }
	  }]);
	  return TouchCaptor;
	}(Captor);

	function _arrayWithoutHoles(arr) {
	  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
	}

	function _iterableToArray(iter) {
	  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
	}

	function _nonIterableSpread() {
	  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	function _toConsumableArray(arr) {
	  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
	}

	function _objectWithoutPropertiesLoose(source, excluded) {
	  if (source == null) return {};
	  var target = {};
	  var sourceKeys = Object.keys(source);
	  var key, i;
	  for (i = 0; i < sourceKeys.length; i++) {
	    key = sourceKeys[i];
	    if (excluded.indexOf(key) >= 0) continue;
	    target[key] = source[key];
	  }
	  return target;
	}

	function _objectWithoutProperties(source, excluded) {
	  if (source == null) return {};
	  var target = _objectWithoutPropertiesLoose(source, excluded);
	  var key, i;
	  if (Object.getOwnPropertySymbols) {
	    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
	    for (i = 0; i < sourceSymbolKeys.length; i++) {
	      key = sourceSymbolKeys[i];
	      if (excluded.indexOf(key) >= 0) continue;
	      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
	      target[key] = source[key];
	    }
	  }
	  return target;
	}

	/**
	 * Sigma.js Labels Heuristics
	 * ===========================
	 *
	 * Miscellaneous heuristics related to label display.
	 * @module
	 */
	/**
	 * Class representing a single candidate for the label grid selection.
	 *
	 * It also describes a deterministic way to compare two candidates to assess
	 * which one is better.
	 */
	var LabelCandidate = /*#__PURE__*/function () {
	  function LabelCandidate(key, size) {
	    _classCallCheck(this, LabelCandidate);
	    this.key = key;
	    this.size = size;
	  }
	  _createClass(LabelCandidate, null, [{
	    key: "compare",
	    value: function compare(first, second) {
	      // First we compare by size
	      if (first.size > second.size) return -1;
	      if (first.size < second.size) return 1;

	      // Then since no two nodes can have the same key, we use it to
	      // deterministically tie-break by key
	      if (first.key > second.key) return 1;

	      // NOTE: this comparator cannot return 0
	      return -1;
	    }
	  }]);
	  return LabelCandidate;
	}();
	/**
	 * Class representing a 2D spatial grid divided into constant-size cells.
	 */
	var LabelGrid = /*#__PURE__*/function () {
	  function LabelGrid() {
	    _classCallCheck(this, LabelGrid);
	    _defineProperty(this, "width", 0);
	    _defineProperty(this, "height", 0);
	    _defineProperty(this, "cellSize", 0);
	    _defineProperty(this, "columns", 0);
	    _defineProperty(this, "rows", 0);
	    _defineProperty(this, "cells", {});
	  }
	  _createClass(LabelGrid, [{
	    key: "resizeAndClear",
	    value: function resizeAndClear(dimensions, cellSize) {
	      this.width = dimensions.width;
	      this.height = dimensions.height;
	      this.cellSize = cellSize;
	      this.columns = Math.ceil(dimensions.width / cellSize);
	      this.rows = Math.ceil(dimensions.height / cellSize);
	      this.cells = {};
	    }
	  }, {
	    key: "getIndex",
	    value: function getIndex(pos) {
	      var xIndex = Math.floor(pos.x / this.cellSize);
	      var yIndex = Math.floor(pos.y / this.cellSize);
	      return yIndex * this.columns + xIndex;
	    }
	  }, {
	    key: "add",
	    value: function add(key, size, pos) {
	      var candidate = new LabelCandidate(key, size);
	      var index = this.getIndex(pos);
	      var cell = this.cells[index];
	      if (!cell) {
	        cell = [];
	        this.cells[index] = cell;
	      }
	      cell.push(candidate);
	    }
	  }, {
	    key: "organize",
	    value: function organize() {
	      for (var k in this.cells) {
	        var cell = this.cells[k];
	        cell.sort(LabelCandidate.compare);
	      }
	    }
	  }, {
	    key: "getLabelsToDisplay",
	    value: function getLabelsToDisplay(ratio, density) {
	      // TODO: work on visible nodes to optimize? ^ -> threshold outside so that memoization works?
	      // TODO: adjust threshold lower, but increase cells a bit?
	      // TODO: hunt for geom issue in disguise
	      // TODO: memoize while ratio does not move. method to force recompute
	      var cellArea = this.cellSize * this.cellSize;
	      var scaledCellArea = cellArea / ratio / ratio;
	      var scaledDensity = scaledCellArea * density / cellArea;
	      var labelsToDisplayPerCell = Math.ceil(scaledDensity);
	      var labels = [];
	      for (var k in this.cells) {
	        var cell = this.cells[k];
	        for (var i = 0; i < Math.min(labelsToDisplayPerCell, cell.length); i++) {
	          labels.push(cell[i].key);
	        }
	      }
	      return labels;
	    }
	  }]);
	  return LabelGrid;
	}();

	/**
	 * Label heuristic selecting edge labels to display, based on displayed node
	 * labels
	 *
	 * @param  {object} params                 - Parameters:
	 * @param  {Set}      displayedNodeLabels  - Currently displayed node labels.
	 * @param  {Set}      highlightedNodes     - Highlighted nodes.
	 * @param  {Graph}    graph                - The rendered graph.
	 * @param  {string}   hoveredNode          - Hovered node (optional)
	 * @return {Array}                         - The selected labels.
	 */
	function edgeLabelsToDisplayFromNodes(params) {
	  var graph = params.graph,
	    hoveredNode = params.hoveredNode,
	    highlightedNodes = params.highlightedNodes,
	    displayedNodeLabels = params.displayedNodeLabels;
	  var worthyEdges = [];

	  // TODO: the code below can be optimized using #.forEach and batching the code per adj

	  // We should display an edge's label if:
	  //   - Any of its extremities is highlighted or hovered
	  //   - Both of its extremities has its label shown
	  graph.forEachEdge(function (edge, _, source, target) {
	    if (source === hoveredNode || target === hoveredNode || highlightedNodes.has(source) || highlightedNodes.has(target) || displayedNodeLabels.has(source) && displayedNodeLabels.has(target)) {
	      worthyEdges.push(edge);
	    }
	  });
	  return worthyEdges;
	}

	/**
	 * Constants.
	 */
	var X_LABEL_MARGIN = 150;
	var Y_LABEL_MARGIN = 50;
	var hasOwnProperty = Object.prototype.hasOwnProperty;

	/**
	 * Important functions.
	 */
	function applyNodeDefaults(settings, key, data) {
	  if (!hasOwnProperty.call(data, "x") || !hasOwnProperty.call(data, "y")) throw new Error("Sigma: could not find a valid position (x, y) for node \"".concat(key, "\". All your nodes must have a number \"x\" and \"y\". Maybe your forgot to apply a layout or your \"nodeReducer\" is not returning the correct data?"));
	  if (!data.color) data.color = settings.defaultNodeColor;
	  if (!data.label && data.label !== "") data.label = null;
	  if (data.label !== undefined && data.label !== null) data.label = "" + data.label;else data.label = null;
	  if (!data.size) data.size = 2;
	  if (!hasOwnProperty.call(data, "hidden")) data.hidden = false;
	  if (!hasOwnProperty.call(data, "highlighted")) data.highlighted = false;
	  if (!hasOwnProperty.call(data, "forceLabel")) data.forceLabel = false;
	  if (!data.type || data.type === "") data.type = settings.defaultNodeType;
	  if (!data.zIndex) data.zIndex = 0;
	  return data;
	}
	function applyEdgeDefaults(settings, _key, data) {
	  if (!data.color) data.color = settings.defaultEdgeColor;
	  if (!data.label) data.label = "";
	  if (!data.size) data.size = 0.5;
	  if (!hasOwnProperty.call(data, "hidden")) data.hidden = false;
	  if (!hasOwnProperty.call(data, "forceLabel")) data.forceLabel = false;
	  if (!data.type || data.type === "") data.type = settings.defaultEdgeType;
	  if (!data.zIndex) data.zIndex = 0;
	  return data;
	}

	/**
	 * Main class.
	 *
	 * @constructor
	 * @param {Graph}       graph     - Graph to render.
	 * @param {HTMLElement} container - DOM container in which to render.
	 * @param {object}      settings  - Optional settings.
	 */
	var Sigma$1 = /*#__PURE__*/function (_TypedEventEmitter) {
	  _inherits(Sigma, _TypedEventEmitter);
	  function Sigma(graph, container) {
	    var _this;
	    var settings = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	    _classCallCheck(this, Sigma);
	    _this = _callSuper(this, Sigma);

	    // Resolving settings
	    _defineProperty(_assertThisInitialized(_this), "elements", {});
	    _defineProperty(_assertThisInitialized(_this), "canvasContexts", {});
	    _defineProperty(_assertThisInitialized(_this), "webGLContexts", {});
	    _defineProperty(_assertThisInitialized(_this), "pickingLayers", new Set());
	    _defineProperty(_assertThisInitialized(_this), "textures", {});
	    _defineProperty(_assertThisInitialized(_this), "frameBuffers", {});
	    _defineProperty(_assertThisInitialized(_this), "activeListeners", {});
	    _defineProperty(_assertThisInitialized(_this), "labelGrid", new LabelGrid());
	    _defineProperty(_assertThisInitialized(_this), "nodeDataCache", {});
	    _defineProperty(_assertThisInitialized(_this), "edgeDataCache", {});
	    // Indices to keep track of the index of the item inside programs
	    _defineProperty(_assertThisInitialized(_this), "nodeProgramIndex", {});
	    _defineProperty(_assertThisInitialized(_this), "edgeProgramIndex", {});
	    _defineProperty(_assertThisInitialized(_this), "nodesWithForcedLabels", new Set());
	    _defineProperty(_assertThisInitialized(_this), "edgesWithForcedLabels", new Set());
	    _defineProperty(_assertThisInitialized(_this), "nodeExtent", {
	      x: [0, 1],
	      y: [0, 1]
	    });
	    _defineProperty(_assertThisInitialized(_this), "nodeZExtent", [Infinity, -Infinity]);
	    _defineProperty(_assertThisInitialized(_this), "edgeZExtent", [Infinity, -Infinity]);
	    _defineProperty(_assertThisInitialized(_this), "matrix", identity());
	    _defineProperty(_assertThisInitialized(_this), "invMatrix", identity());
	    _defineProperty(_assertThisInitialized(_this), "correctionRatio", 1);
	    _defineProperty(_assertThisInitialized(_this), "customBBox", null);
	    _defineProperty(_assertThisInitialized(_this), "normalizationFunction", createNormalizationFunction({
	      x: [0, 1],
	      y: [0, 1]
	    }));
	    // Cache:
	    _defineProperty(_assertThisInitialized(_this), "graphToViewportRatio", 1);
	    _defineProperty(_assertThisInitialized(_this), "itemIDsIndex", {});
	    _defineProperty(_assertThisInitialized(_this), "nodeIndices", {});
	    _defineProperty(_assertThisInitialized(_this), "edgeIndices", {});
	    // Starting dimensions and pixel ratio
	    _defineProperty(_assertThisInitialized(_this), "width", 0);
	    _defineProperty(_assertThisInitialized(_this), "height", 0);
	    _defineProperty(_assertThisInitialized(_this), "pixelRatio", getPixelRatio());
	    _defineProperty(_assertThisInitialized(_this), "pickingDownSizingRatio", 2 * _this.pixelRatio);
	    // Graph State
	    _defineProperty(_assertThisInitialized(_this), "displayedNodeLabels", new Set());
	    _defineProperty(_assertThisInitialized(_this), "displayedEdgeLabels", new Set());
	    _defineProperty(_assertThisInitialized(_this), "highlightedNodes", new Set());
	    _defineProperty(_assertThisInitialized(_this), "hoveredNode", null);
	    _defineProperty(_assertThisInitialized(_this), "hoveredEdge", null);
	    // Internal states
	    _defineProperty(_assertThisInitialized(_this), "renderFrame", null);
	    _defineProperty(_assertThisInitialized(_this), "renderHighlightedNodesFrame", null);
	    _defineProperty(_assertThisInitialized(_this), "needToProcess", false);
	    _defineProperty(_assertThisInitialized(_this), "checkEdgesEventsFrame", null);
	    // Programs
	    _defineProperty(_assertThisInitialized(_this), "nodePrograms", {});
	    _defineProperty(_assertThisInitialized(_this), "nodeHoverPrograms", {});
	    _defineProperty(_assertThisInitialized(_this), "edgePrograms", {});
	    _this.settings = resolveSettings(settings);

	    // Validating
	    validateSettings(_this.settings);
	    validateGraph(graph);
	    if (!(container instanceof HTMLElement)) throw new Error("Sigma: container should be an html element.");

	    // Properties
	    _this.graph = graph;
	    _this.container = container;

	    // Initializing contexts
	    _this.createWebGLContext("edges", {
	      picking: settings.enableEdgeEvents
	    });
	    _this.createCanvasContext("edgeLabels");
	    _this.createWebGLContext("nodes", {
	      picking: true
	    });
	    _this.createCanvasContext("labels");
	    _this.createCanvasContext("hovers");
	    _this.createWebGLContext("hoverNodes");
	    _this.createCanvasContext("mouse");

	    // Initial resize
	    _this.resize();

	    // Loading programs
	    for (var type in _this.settings.nodeProgramClasses) {
	      _this.registerNodeProgram(type, _this.settings.nodeProgramClasses[type], _this.settings.nodeHoverProgramClasses[type]);
	    }
	    for (var _type in _this.settings.edgeProgramClasses) {
	      _this.registerEdgeProgram(_type, _this.settings.edgeProgramClasses[_type]);
	    }

	    // Initializing the camera
	    _this.camera = new Camera();

	    // Binding camera events
	    _this.bindCameraHandlers();

	    // Initializing captors
	    _this.mouseCaptor = new MouseCaptor(_this.elements.mouse, _assertThisInitialized(_this));
	    _this.touchCaptor = new TouchCaptor(_this.elements.mouse, _assertThisInitialized(_this));

	    // Binding event handlers
	    _this.bindEventHandlers();

	    // Binding graph handlers
	    _this.bindGraphHandlers();

	    // Trigger eventual settings-related things
	    _this.handleSettingsUpdate();

	    // Processing data for the first time & render
	    _this.refresh();
	    return _this;
	  }

	  /**---------------------------------------------------------------------------
	   * Internal methods.
	   **---------------------------------------------------------------------------
	   */

	  /**
	   * Internal function used to register a node program
	   *
	   * @param  {string}           key              - The program's key, matching the related nodes "type" values.
	   * @param  {NodeProgramType}  NodeProgramClass - A nodes program class.
	   * @param  {NodeProgramType?} NodeHoverProgram - A nodes program class to render hovered nodes (optional).
	   * @return {Sigma}
	   */
	  _createClass(Sigma, [{
	    key: "registerNodeProgram",
	    value: function registerNodeProgram(key, NodeProgramClass, NodeHoverProgram) {
	      if (this.nodePrograms[key]) this.nodePrograms[key].kill();
	      if (this.nodeHoverPrograms[key]) this.nodeHoverPrograms[key].kill();
	      this.nodePrograms[key] = new NodeProgramClass(this.webGLContexts.nodes, this.frameBuffers.nodes, this);
	      this.nodeHoverPrograms[key] = new (NodeHoverProgram || NodeProgramClass)(this.webGLContexts.hoverNodes, null, this);
	      return this;
	    }

	    /**
	     * Internal function used to register an edge program
	     *
	     * @param  {string}          key              - The program's key, matching the related edges "type" values.
	     * @param  {EdgeProgramType} EdgeProgramClass - An edges program class.
	     * @return {Sigma}
	     */
	  }, {
	    key: "registerEdgeProgram",
	    value: function registerEdgeProgram(key, EdgeProgramClass) {
	      if (this.edgePrograms[key]) this.edgePrograms[key].kill();
	      this.edgePrograms[key] = new EdgeProgramClass(this.webGLContexts.edges, this.frameBuffers.edges, this);
	      return this;
	    }

	    /**
	     * Internal function used to unregister a node program
	     *
	     * @param  {string} key - The program's key, matching the related nodes "type" values.
	     * @return {Sigma}
	     */
	  }, {
	    key: "unregisterNodeProgram",
	    value: function unregisterNodeProgram(key) {
	      if (this.nodePrograms[key]) {
	        var _this$nodePrograms = this.nodePrograms,
	          program = _this$nodePrograms[key],
	          programs = _objectWithoutProperties(_this$nodePrograms, [key].map(toPropertyKey));
	        program.kill();
	        this.nodePrograms = programs;
	      }
	      if (this.nodeHoverPrograms[key]) {
	        var _this$nodeHoverProgra = this.nodeHoverPrograms,
	          _program = _this$nodeHoverProgra[key],
	          _programs = _objectWithoutProperties(_this$nodeHoverProgra, [key].map(toPropertyKey));
	        _program.kill();
	        this.nodePrograms = _programs;
	      }
	      return this;
	    }

	    /**
	     * Internal function used to unregister an edge program
	     *
	     * @param  {string} key - The program's key, matching the related edges "type" values.
	     * @return {Sigma}
	     */
	  }, {
	    key: "unregisterEdgeProgram",
	    value: function unregisterEdgeProgram(key) {
	      if (this.edgePrograms[key]) {
	        var _this$edgePrograms = this.edgePrograms,
	          program = _this$edgePrograms[key],
	          programs = _objectWithoutProperties(_this$edgePrograms, [key].map(toPropertyKey));
	        program.kill();
	        this.edgePrograms = programs;
	      }
	      return this;
	    }

	    /**
	     * Method (re)binding WebGL texture (for picking).
	     *
	     * @return {Sigma}
	     */
	  }, {
	    key: "resetWebGLTexture",
	    value: function resetWebGLTexture(id) {
	      var gl = this.webGLContexts[id];
	      var frameBuffer = this.frameBuffers[id];
	      var currentTexture = this.textures[id];
	      if (currentTexture) gl.deleteTexture(currentTexture);
	      var pickingTexture = gl.createTexture();
	      gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	      gl.bindTexture(gl.TEXTURE_2D, pickingTexture);
	      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickingTexture, 0);
	      this.textures[id] = pickingTexture;
	      return this;
	    }

	    /**
	     * Method binding camera handlers.
	     *
	     * @return {Sigma}
	     */
	  }, {
	    key: "bindCameraHandlers",
	    value: function bindCameraHandlers() {
	      var _this2 = this;
	      this.activeListeners.camera = function () {
	        _this2.scheduleRender();
	      };
	      this.camera.on("updated", this.activeListeners.camera);
	      return this;
	    }

	    /**
	     * Method unbinding camera handlers.
	     *
	     * @return {Sigma}
	     */
	  }, {
	    key: "unbindCameraHandlers",
	    value: function unbindCameraHandlers() {
	      this.camera.removeListener("updated", this.activeListeners.camera);
	      return this;
	    }

	    /**
	     * Method that returns the closest node to a given position.
	     */
	  }, {
	    key: "getNodeAtPosition",
	    value: function getNodeAtPosition(position) {
	      var x = position.x,
	        y = position.y;
	      var color = getPixelColor(this.webGLContexts.nodes, this.frameBuffers.nodes, x, y, this.pixelRatio, this.pickingDownSizingRatio);
	      var index = colorToIndex.apply(void 0, _toConsumableArray(color));
	      var itemAt = this.itemIDsIndex[index];
	      return itemAt && itemAt.type === "node" ? itemAt.id : null;
	    }

	    /**
	     * Method binding event handlers.
	     *
	     * @return {Sigma}
	     */
	  }, {
	    key: "bindEventHandlers",
	    value: function bindEventHandlers() {
	      var _this3 = this;
	      // Handling window resize
	      this.activeListeners.handleResize = function () {
	        // need to call a refresh to rebuild the labelgrid
	        _this3.scheduleRefresh();
	      };
	      window.addEventListener("resize", this.activeListeners.handleResize);

	      // Handling mouse move
	      this.activeListeners.handleMove = function (e) {
	        var baseEvent = {
	          event: e,
	          preventSigmaDefault: function preventSigmaDefault() {
	            e.preventSigmaDefault();
	          }
	        };
	        var nodeToHover = _this3.getNodeAtPosition(e);
	        if (nodeToHover && _this3.hoveredNode !== nodeToHover && !_this3.nodeDataCache[nodeToHover].hidden) {
	          // Handling passing from one node to the other directly
	          if (_this3.hoveredNode) _this3.emit("leaveNode", _objectSpread2(_objectSpread2({}, baseEvent), {}, {
	            node: _this3.hoveredNode
	          }));
	          _this3.hoveredNode = nodeToHover;
	          _this3.emit("enterNode", _objectSpread2(_objectSpread2({}, baseEvent), {}, {
	            node: nodeToHover
	          }));
	          _this3.scheduleHighlightedNodesRender();
	          return;
	        }

	        // Checking if the hovered node is still hovered
	        if (_this3.hoveredNode) {
	          if (_this3.getNodeAtPosition(e) !== _this3.hoveredNode) {
	            var node = _this3.hoveredNode;
	            _this3.hoveredNode = null;
	            _this3.emit("leaveNode", _objectSpread2(_objectSpread2({}, baseEvent), {}, {
	              node: node
	            }));
	            _this3.scheduleHighlightedNodesRender();
	            return;
	          }
	        }
	        if (_this3.settings.enableEdgeEvents) {
	          var edgeToHover = _this3.hoveredNode ? null : _this3.getEdgeAtPoint(baseEvent.event.x, baseEvent.event.y);
	          if (edgeToHover !== _this3.hoveredEdge) {
	            if (_this3.hoveredEdge) _this3.emit("leaveEdge", _objectSpread2(_objectSpread2({}, baseEvent), {}, {
	              edge: _this3.hoveredEdge
	            }));
	            if (edgeToHover) _this3.emit("enterEdge", _objectSpread2(_objectSpread2({}, baseEvent), {}, {
	              edge: edgeToHover
	            }));
	            _this3.hoveredEdge = edgeToHover;
	          }
	        }
	      };

	      // Handling mouse leave stage:
	      this.activeListeners.handleLeave = function (e) {
	        var baseEvent = {
	          event: e,
	          preventSigmaDefault: function preventSigmaDefault() {
	            e.preventSigmaDefault();
	          }
	        };
	        if (_this3.hoveredNode) {
	          _this3.emit("leaveNode", _objectSpread2(_objectSpread2({}, baseEvent), {}, {
	            node: _this3.hoveredNode
	          }));
	          _this3.scheduleHighlightedNodesRender();
	        }
	        if (_this3.settings.enableEdgeEvents && _this3.hoveredEdge) {
	          _this3.emit("leaveEdge", _objectSpread2(_objectSpread2({}, baseEvent), {}, {
	            edge: _this3.hoveredEdge
	          }));
	          _this3.scheduleHighlightedNodesRender();
	        }
	        _this3.emit("leaveStage", _objectSpread2({}, baseEvent));
	      };

	      // Handling mouse enter stage:
	      this.activeListeners.handleEnter = function (e) {
	        var baseEvent = {
	          event: e,
	          preventSigmaDefault: function preventSigmaDefault() {
	            e.preventSigmaDefault();
	          }
	        };
	        _this3.emit("enterStage", _objectSpread2({}, baseEvent));
	      };

	      // Handling click
	      var createMouseListener = function createMouseListener(eventType) {
	        return function (e) {
	          var baseEvent = {
	            event: e,
	            preventSigmaDefault: function preventSigmaDefault() {
	              e.preventSigmaDefault();
	            }
	          };
	          var isFakeSigmaMouseEvent = e.original.isFakeSigmaMouseEvent;
	          var nodeAtPosition = isFakeSigmaMouseEvent ? _this3.getNodeAtPosition(e) : _this3.hoveredNode;
	          if (nodeAtPosition) return _this3.emit("".concat(eventType, "Node"), _objectSpread2(_objectSpread2({}, baseEvent), {}, {
	            node: nodeAtPosition
	          }));
	          if (_this3.settings.enableEdgeEvents) {
	            var edge = _this3.getEdgeAtPoint(e.x, e.y);
	            if (edge) return _this3.emit("".concat(eventType, "Edge"), _objectSpread2(_objectSpread2({}, baseEvent), {}, {
	              edge: edge
	            }));
	          }
	          return _this3.emit("".concat(eventType, "Stage"), baseEvent);
	        };
	      };
	      this.activeListeners.handleClick = createMouseListener("click");
	      this.activeListeners.handleRightClick = createMouseListener("rightClick");
	      this.activeListeners.handleDoubleClick = createMouseListener("doubleClick");
	      this.activeListeners.handleWheel = createMouseListener("wheel");
	      this.activeListeners.handleDown = createMouseListener("down");
	      this.activeListeners.handleUp = createMouseListener("up");
	      this.mouseCaptor.on("mousemove", this.activeListeners.handleMove);
	      this.mouseCaptor.on("click", this.activeListeners.handleClick);
	      this.mouseCaptor.on("rightClick", this.activeListeners.handleRightClick);
	      this.mouseCaptor.on("doubleClick", this.activeListeners.handleDoubleClick);
	      this.mouseCaptor.on("wheel", this.activeListeners.handleWheel);
	      this.mouseCaptor.on("mousedown", this.activeListeners.handleDown);
	      this.mouseCaptor.on("mouseup", this.activeListeners.handleUp);
	      this.mouseCaptor.on("mouseleave", this.activeListeners.handleLeave);
	      this.mouseCaptor.on("mouseenter", this.activeListeners.handleEnter);

	      // TODO
	      // Deal with Touch captor events

	      return this;
	    }

	    /**
	     * Method binding graph handlers
	     *
	     * @return {Sigma}
	     */
	  }, {
	    key: "bindGraphHandlers",
	    value: function bindGraphHandlers() {
	      var _this4 = this;
	      var graph = this.graph;
	      var LAYOUT_IMPACTING_FIELDS = new Set(["x", "y", "zIndex", "type"]);
	      this.activeListeners.eachNodeAttributesUpdatedGraphUpdate = function (e) {
	        var _e$hints;
	        var updatedFields = (_e$hints = e.hints) === null || _e$hints === void 0 ? void 0 : _e$hints.attributes;
	        // we process all nodes
	        _this4.graph.forEachNode(function (node) {
	          return _this4.updateNode(node);
	        });

	        // if coord, type or zIndex have changed, we need to schedule a render
	        // (zIndex for the programIndex)
	        var layoutChanged = !updatedFields || updatedFields.some(function (f) {
	          return LAYOUT_IMPACTING_FIELDS.has(f);
	        });
	        _this4.refresh({
	          partialGraph: {
	            nodes: graph.nodes()
	          },
	          skipIndexation: !layoutChanged,
	          schedule: true
	        });
	      };
	      this.activeListeners.eachEdgeAttributesUpdatedGraphUpdate = function (e) {
	        var _e$hints2;
	        var updatedFields = (_e$hints2 = e.hints) === null || _e$hints2 === void 0 ? void 0 : _e$hints2.attributes;
	        // we process all edges
	        _this4.graph.forEachEdge(function (edge) {
	          return _this4.updateEdge(edge);
	        });
	        var layoutChanged = updatedFields && ["zIndex", "type"].some(function (f) {
	          return updatedFields === null || updatedFields === void 0 ? void 0 : updatedFields.includes(f);
	        });
	        _this4.refresh({
	          partialGraph: {
	            edges: graph.edges()
	          },
	          skipIndexation: !layoutChanged,
	          schedule: true
	        });
	      };

	      // On add node, we add the node in indices and then call for a render
	      this.activeListeners.addNodeGraphUpdate = function (payload) {
	        var node = payload.key;
	        // we process the node
	        _this4.addNode(node);
	        // schedule a render for the node
	        _this4.refresh({
	          partialGraph: {
	            nodes: [node]
	          },
	          skipIndexation: false,
	          schedule: true
	        });
	      };

	      // On update node, we update indices and then call for a render
	      this.activeListeners.updateNodeGraphUpdate = function (payload) {
	        var node = payload.key;
	        // schedule a render for the node
	        _this4.refresh({
	          partialGraph: {
	            nodes: [node]
	          },
	          skipIndexation: false,
	          schedule: true
	        });
	      };

	      // On drop node, we remove the node from indices and then call for a refresh
	      this.activeListeners.dropNodeGraphUpdate = function (payload) {
	        var node = payload.key;
	        // we process the node
	        _this4.removeNode(node);
	        // schedule a render for everything
	        _this4.refresh({
	          schedule: true
	        });
	      };

	      // On add edge, we remove the edge from indices and then call for a refresh
	      this.activeListeners.addEdgeGraphUpdate = function (payload) {
	        var edge = payload.key;
	        // we process the edge
	        _this4.addEdge(edge);
	        // schedule a render for the edge
	        _this4.refresh({
	          partialGraph: {
	            edges: [edge]
	          },
	          schedule: true
	        });
	      };

	      // On update edge, we update indices and then call for a refresh
	      this.activeListeners.updateEdgeGraphUpdate = function (payload) {
	        var edge = payload.key;
	        // schedule a repaint for the edge
	        _this4.refresh({
	          partialGraph: {
	            edges: [edge]
	          },
	          skipIndexation: false,
	          schedule: true
	        });
	      };

	      // On drop edge, we remove the edge from indices and then call for a refresh
	      this.activeListeners.dropEdgeGraphUpdate = function (payload) {
	        var edge = payload.key;
	        // we process the edge
	        _this4.removeEdge(edge);
	        // schedule a render for all edges
	        _this4.refresh({
	          schedule: true
	        });
	      };

	      // On clear edges, we clear the edge indices and then call for a refresh
	      this.activeListeners.clearEdgesGraphUpdate = function () {
	        // we clear the edge data structures
	        _this4.clearEdgeState();
	        _this4.clearEdgeIndices();
	        // schedule a render for all edges
	        _this4.refresh({
	          schedule: true
	        });
	      };

	      // On graph clear, we clear indices and then call for a refresh
	      this.activeListeners.clearGraphUpdate = function () {
	        // clear graph state
	        _this4.clearEdgeState();
	        _this4.clearNodeState();

	        // clear graph indices
	        _this4.clearEdgeIndices();
	        _this4.clearNodeIndices();

	        // schedule a render for all
	        _this4.refresh({
	          schedule: true
	        });
	      };
	      graph.on("nodeAdded", this.activeListeners.addNodeGraphUpdate);
	      graph.on("nodeDropped", this.activeListeners.dropNodeGraphUpdate);
	      graph.on("nodeAttributesUpdated", this.activeListeners.updateNodeGraphUpdate);
	      graph.on("eachNodeAttributesUpdated", this.activeListeners.eachNodeAttributesUpdatedGraphUpdate);
	      graph.on("edgeAdded", this.activeListeners.addEdgeGraphUpdate);
	      graph.on("edgeDropped", this.activeListeners.dropEdgeGraphUpdate);
	      graph.on("edgeAttributesUpdated", this.activeListeners.updateEdgeGraphUpdate);
	      graph.on("eachEdgeAttributesUpdated", this.activeListeners.eachEdgeAttributesUpdatedGraphUpdate);
	      graph.on("edgesCleared", this.activeListeners.clearEdgesGraphUpdate);
	      graph.on("cleared", this.activeListeners.clearGraphUpdate);
	      return this;
	    }

	    /**
	     * Method used to unbind handlers from the graph.
	     *
	     * @return {undefined}
	     */
	  }, {
	    key: "unbindGraphHandlers",
	    value: function unbindGraphHandlers() {
	      var graph = this.graph;
	      graph.removeListener("nodeAdded", this.activeListeners.addNodeGraphUpdate);
	      graph.removeListener("nodeDropped", this.activeListeners.dropNodeGraphUpdate);
	      graph.removeListener("nodeAttributesUpdated", this.activeListeners.updateNodeGraphUpdate);
	      graph.removeListener("eachNodeAttributesUpdated", this.activeListeners.eachNodeAttributesUpdatedGraphUpdate);
	      graph.removeListener("edgeAdded", this.activeListeners.addEdgeGraphUpdate);
	      graph.removeListener("edgeDropped", this.activeListeners.dropEdgeGraphUpdate);
	      graph.removeListener("edgeAttributesUpdated", this.activeListeners.updateEdgeGraphUpdate);
	      graph.removeListener("eachEdgeAttributesUpdated", this.activeListeners.eachEdgeAttributesUpdatedGraphUpdate);
	      graph.removeListener("edgesCleared", this.activeListeners.clearEdgesGraphUpdate);
	      graph.removeListener("cleared", this.activeListeners.clearGraphUpdate);
	    }

	    /**
	     * Method looking for an edge colliding with a given point at (x, y). Returns
	     * the key of the edge if any, or null else.
	     */
	  }, {
	    key: "getEdgeAtPoint",
	    value: function getEdgeAtPoint(x, y) {
	      var color = getPixelColor(this.webGLContexts.edges, this.frameBuffers.edges, x, y, this.pixelRatio, this.pickingDownSizingRatio);
	      var index = colorToIndex.apply(void 0, _toConsumableArray(color));
	      var itemAt = this.itemIDsIndex[index];
	      return itemAt && itemAt.type === "edge" ? itemAt.id : null;
	    }

	    /**
	     * Method used to process the whole graph's data.
	     *  - extent
	     *  - normalizationFunction
	     *  - compute node's coordinate
	     *  - labelgrid
	     *  - program data allocation
	     * @return {Sigma}
	     */
	  }, {
	    key: "process",
	    value: function process() {
	      var _this5 = this;
	      this.emit("beforeProcess");
	      var graph = this.graph;
	      var settings = this.settings;
	      var dimensions = this.getDimensions();

	      //
	      // NODES
	      //
	      this.nodeExtent = graphExtent(this.graph);
	      this.normalizationFunction = createNormalizationFunction(this.customBBox || this.nodeExtent);

	      // NOTE: it is important to compute this matrix after computing the node's extent
	      // because #.getGraphDimensions relies on it
	      var nullCamera = new Camera();
	      var nullCameraMatrix = matrixFromCamera(nullCamera.getState(), dimensions, this.getGraphDimensions(), this.getSetting("stagePadding") || 0);
	      // Resetting the label grid
	      // TODO: it's probably better to do this explicitly or on resizes for layout and anims
	      this.labelGrid.resizeAndClear(dimensions, settings.labelGridCellSize);
	      var nodesPerPrograms = {};
	      var nodeIndices = {};
	      var edgeIndices = {};
	      var itemIDsIndex = {};
	      var incrID = 1;
	      var nodes = graph.nodes();

	      // Do some indexation on the whole graph
	      for (var i = 0, l = nodes.length; i < l; i++) {
	        var node = nodes[i];
	        var data = this.nodeDataCache[node];

	        // Get initial coordinates
	        var attrs = graph.getNodeAttributes(node);
	        data.x = attrs.x;
	        data.y = attrs.y;
	        this.normalizationFunction.applyTo(data);

	        // labelgrid
	        if (typeof data.label === "string" && !data.hidden) this.labelGrid.add(node, data.size, this.framedGraphToViewport(data, {
	          matrix: nullCameraMatrix
	        }));

	        // update count per program
	        nodesPerPrograms[data.type] = (nodesPerPrograms[data.type] || 0) + 1;
	      }
	      this.labelGrid.organize();

	      // Allocate memory to programs
	      for (var type in this.nodePrograms) {
	        if (!hasOwnProperty.call(this.nodePrograms, type)) {
	          throw new Error("Sigma: could not find a suitable program for node type \"".concat(type, "\"!"));
	        }
	        this.nodePrograms[type].reallocate(nodesPerPrograms[type] || 0);
	        // We reset that count here, so that we can reuse it while calling the Program#process methods:
	        nodesPerPrograms[type] = 0;
	      }

	      // Order nodes by zIndex before to add them to program
	      if (this.settings.zIndex && this.nodeZExtent[0] !== this.nodeZExtent[1]) nodes = zIndexOrdering(this.nodeZExtent, function (node) {
	        return _this5.nodeDataCache[node].zIndex;
	      }, nodes);

	      // Add data to programs
	      for (var _i = 0, _l = nodes.length; _i < _l; _i++) {
	        var _node = nodes[_i];
	        nodeIndices[_node] = incrID;
	        itemIDsIndex[nodeIndices[_node]] = {
	          type: "node",
	          id: _node
	        };
	        incrID++;
	        var _data = this.nodeDataCache[_node];
	        this.addNodeToProgram(_node, nodeIndices[_node], nodesPerPrograms[_data.type]++);
	      }

	      //
	      // EDGES
	      //

	      var edgesPerPrograms = {};
	      var edges = graph.edges();

	      // Allocate memory to programs
	      for (var _i2 = 0, _l2 = edges.length; _i2 < _l2; _i2++) {
	        var edge = edges[_i2];
	        var _data2 = this.edgeDataCache[edge];
	        edgesPerPrograms[_data2.type] = (edgesPerPrograms[_data2.type] || 0) + 1;
	      }

	      // Order edges by zIndex before to add them to program
	      if (this.settings.zIndex && this.edgeZExtent[0] !== this.edgeZExtent[1]) edges = zIndexOrdering(this.edgeZExtent, function (edge) {
	        return _this5.edgeDataCache[edge].zIndex;
	      }, edges);
	      for (var _type2 in this.edgePrograms) {
	        if (!hasOwnProperty.call(this.edgePrograms, _type2)) {
	          throw new Error("Sigma: could not find a suitable program for edge type \"".concat(_type2, "\"!"));
	        }
	        this.edgePrograms[_type2].reallocate(edgesPerPrograms[_type2] || 0);
	        // We reset that count here, so that we can reuse it while calling the Program#process methods:
	        edgesPerPrograms[_type2] = 0;
	      }

	      // Add data to programs
	      for (var _i3 = 0, _l3 = edges.length; _i3 < _l3; _i3++) {
	        var _edge = edges[_i3];
	        edgeIndices[_edge] = incrID;
	        itemIDsIndex[edgeIndices[_edge]] = {
	          type: "edge",
	          id: _edge
	        };
	        incrID++;
	        var _data3 = this.edgeDataCache[_edge];
	        this.addEdgeToProgram(_edge, edgeIndices[_edge], edgesPerPrograms[_data3.type]++);
	      }
	      this.itemIDsIndex = itemIDsIndex;
	      this.nodeIndices = nodeIndices;
	      this.edgeIndices = edgeIndices;
	      this.emit("afterProcess");
	      return this;
	    }

	    /**
	     * Method that backports potential settings updates where it's needed.
	     * @private
	     */
	  }, {
	    key: "handleSettingsUpdate",
	    value: function handleSettingsUpdate(oldSettings) {
	      var settings = this.settings;
	      this.camera.minRatio = settings.minCameraRatio;
	      this.camera.maxRatio = settings.maxCameraRatio;
	      this.camera.enabledRotation = settings.enableCameraRotation;
	      this.camera.setState(this.camera.validateState(this.camera.getState()));
	      if (oldSettings) {
	        // Check edge programs:
	        if (oldSettings.edgeProgramClasses !== settings.edgeProgramClasses) {
	          for (var type in settings.edgeProgramClasses) {
	            if (settings.edgeProgramClasses[type] !== oldSettings.edgeProgramClasses[type]) {
	              this.registerEdgeProgram(type, settings.edgeProgramClasses[type]);
	            }
	          }
	          for (var _type3 in oldSettings.edgeProgramClasses) {
	            if (!settings.edgeProgramClasses[_type3]) this.unregisterEdgeProgram(_type3);
	          }
	        }

	        // Check node programs:
	        if (oldSettings.nodeProgramClasses !== settings.nodeProgramClasses || oldSettings.nodeHoverProgramClasses !== settings.nodeHoverProgramClasses) {
	          for (var _type4 in settings.nodeProgramClasses) {
	            if (settings.nodeProgramClasses[_type4] !== oldSettings.nodeProgramClasses[_type4] || settings.nodeHoverProgramClasses[_type4] !== oldSettings.nodeHoverProgramClasses[_type4]) {
	              this.registerNodeProgram(_type4, settings.nodeProgramClasses[_type4], settings.nodeHoverProgramClasses[_type4]);
	            }
	          }
	          for (var _type5 in oldSettings.nodeProgramClasses) {
	            if (!settings.nodeProgramClasses[_type5]) this.unregisterNodeProgram(_type5);
	          }
	        }
	      }
	      return this;
	    }

	    /**
	     * Method used to render labels.
	     *
	     * @return {Sigma}
	     */
	  }, {
	    key: "renderLabels",
	    value: function renderLabels() {
	      if (!this.settings.renderLabels) return this;
	      var cameraState = this.camera.getState();

	      // Selecting labels to draw
	      var labelsToDisplay = this.labelGrid.getLabelsToDisplay(cameraState.ratio, this.settings.labelDensity);
	      extend(labelsToDisplay, this.nodesWithForcedLabels);
	      this.displayedNodeLabels = new Set();

	      // Drawing labels
	      var context = this.canvasContexts.labels;
	      for (var i = 0, l = labelsToDisplay.length; i < l; i++) {
	        var node = labelsToDisplay[i];
	        var data = this.nodeDataCache[node];

	        // If the node was already drawn (like if it is eligible AND has
	        // `forceLabel`), we don't want to draw it again
	        // NOTE: we can do better probably
	        if (this.displayedNodeLabels.has(node)) continue;

	        // If the node is hidden, we don't need to display its label obviously
	        if (data.hidden) continue;
	        var _this$framedGraphToVi = this.framedGraphToViewport(data),
	          x = _this$framedGraphToVi.x,
	          y = _this$framedGraphToVi.y;

	        // NOTE: we can cache the labels we need to render until the camera's ratio changes
	        var size = this.scaleSize(data.size);

	        // Is node big enough?
	        if (!data.forceLabel && size < this.settings.labelRenderedSizeThreshold) continue;

	        // Is node actually on screen (with some margin)
	        // NOTE: we used to rely on the quadtree for this, but the coordinates
	        // conversion make it unreliable and at that point we already converted
	        // to viewport coordinates and since the label grid already culls the
	        // number of potential labels to display this looks like a good
	        // performance compromise.
	        // NOTE: labelGrid.getLabelsToDisplay could probably optimize by not
	        // considering cells obviously outside of the range of the current
	        // view rectangle.
	        if (x < -X_LABEL_MARGIN || x > this.width + X_LABEL_MARGIN || y < -Y_LABEL_MARGIN || y > this.height + Y_LABEL_MARGIN) continue;

	        // Because displayed edge labels depend directly on actually rendered node
	        // labels, we need to only add to this.displayedNodeLabels nodes whose label
	        // is rendered.
	        // This makes this.displayedNodeLabels depend on viewport, which might become
	        // an issue once we start memoizing getLabelsToDisplay.
	        this.displayedNodeLabels.add(node);
	        var defaultDrawNodeLabel = this.settings.defaultDrawNodeLabel;
	        var nodeProgram = this.nodePrograms[data.type];
	        var drawLabel = (nodeProgram === null || nodeProgram === void 0 ? void 0 : nodeProgram.drawLabel) || defaultDrawNodeLabel;
	        drawLabel(context, _objectSpread2(_objectSpread2({
	          key: node
	        }, data), {}, {
	          size: size,
	          x: x,
	          y: y
	        }), this.settings);
	      }
	      return this;
	    }

	    /**
	     * Method used to render edge labels, based on which node labels were
	     * rendered.
	     *
	     * @return {Sigma}
	     */
	  }, {
	    key: "renderEdgeLabels",
	    value: function renderEdgeLabels() {
	      if (!this.settings.renderEdgeLabels) return this;
	      var context = this.canvasContexts.edgeLabels;

	      // Clearing
	      context.clearRect(0, 0, this.width, this.height);
	      var edgeLabelsToDisplay = edgeLabelsToDisplayFromNodes({
	        graph: this.graph,
	        hoveredNode: this.hoveredNode,
	        displayedNodeLabels: this.displayedNodeLabels,
	        highlightedNodes: this.highlightedNodes
	      });
	      extend(edgeLabelsToDisplay, this.edgesWithForcedLabels);
	      var displayedLabels = new Set();
	      for (var i = 0, l = edgeLabelsToDisplay.length; i < l; i++) {
	        var edge = edgeLabelsToDisplay[i],
	          extremities = this.graph.extremities(edge),
	          sourceData = this.nodeDataCache[extremities[0]],
	          targetData = this.nodeDataCache[extremities[1]],
	          edgeData = this.edgeDataCache[edge];

	        // If the edge was already drawn (like if it is eligible AND has
	        // `forceLabel`), we don't want to draw it again
	        if (displayedLabels.has(edge)) continue;

	        // If the edge is hidden we don't need to display its label
	        // NOTE: the test on sourceData & targetData is probably paranoid at this point?
	        if (edgeData.hidden || sourceData.hidden || targetData.hidden) {
	          continue;
	        }
	        var defaultDrawEdgeLabel = this.settings.defaultDrawEdgeLabel;
	        var edgeProgram = this.edgePrograms[edgeData.type];
	        var drawLabel = (edgeProgram === null || edgeProgram === void 0 ? void 0 : edgeProgram.drawLabel) || defaultDrawEdgeLabel;
	        drawLabel(context, _objectSpread2(_objectSpread2({
	          key: edge
	        }, edgeData), {}, {
	          size: this.scaleSize(edgeData.size)
	        }), _objectSpread2(_objectSpread2(_objectSpread2({
	          key: extremities[0]
	        }, sourceData), this.framedGraphToViewport(sourceData)), {}, {
	          size: this.scaleSize(sourceData.size)
	        }), _objectSpread2(_objectSpread2(_objectSpread2({
	          key: extremities[1]
	        }, targetData), this.framedGraphToViewport(targetData)), {}, {
	          size: this.scaleSize(targetData.size)
	        }), this.settings);
	        displayedLabels.add(edge);
	      }
	      this.displayedEdgeLabels = displayedLabels;
	      return this;
	    }

	    /**
	     * Method used to render the highlighted nodes.
	     *
	     * @return {Sigma}
	     */
	  }, {
	    key: "renderHighlightedNodes",
	    value: function renderHighlightedNodes() {
	      var _this6 = this;
	      var context = this.canvasContexts.hovers;

	      // Clearing
	      context.clearRect(0, 0, this.width, this.height);

	      // Rendering
	      var render = function render(node) {
	        var data = _this6.nodeDataCache[node];
	        var _this6$framedGraphToV = _this6.framedGraphToViewport(data),
	          x = _this6$framedGraphToV.x,
	          y = _this6$framedGraphToV.y;
	        var size = _this6.scaleSize(data.size);
	        var defaultDrawNodeHover = _this6.settings.defaultDrawNodeHover;
	        var nodeProgram = _this6.nodePrograms[data.type];
	        var drawHover = (nodeProgram === null || nodeProgram === void 0 ? void 0 : nodeProgram.drawHover) || defaultDrawNodeHover;
	        drawHover(context, _objectSpread2(_objectSpread2({
	          key: node
	        }, data), {}, {
	          size: size,
	          x: x,
	          y: y
	        }), _this6.settings);
	      };
	      var nodesToRender = [];
	      if (this.hoveredNode && !this.nodeDataCache[this.hoveredNode].hidden) {
	        nodesToRender.push(this.hoveredNode);
	      }
	      this.highlightedNodes.forEach(function (node) {
	        // The hovered node has already been highlighted
	        if (node !== _this6.hoveredNode) nodesToRender.push(node);
	      });

	      // Draw labels:
	      nodesToRender.forEach(function (node) {
	        return render(node);
	      });

	      // Draw WebGL nodes on top of the labels:
	      var nodesPerPrograms = {};

	      // 1. Count nodes per type:
	      nodesToRender.forEach(function (node) {
	        var type = _this6.nodeDataCache[node].type;
	        nodesPerPrograms[type] = (nodesPerPrograms[type] || 0) + 1;
	      });
	      // 2. Allocate for each type for the proper number of nodes
	      for (var type in this.nodeHoverPrograms) {
	        this.nodeHoverPrograms[type].reallocate(nodesPerPrograms[type] || 0);
	        // Also reset count, to use when rendering:
	        nodesPerPrograms[type] = 0;
	      }
	      // 3. Process all nodes to render:
	      nodesToRender.forEach(function (node) {
	        var data = _this6.nodeDataCache[node];
	        _this6.nodeHoverPrograms[data.type].process(0, nodesPerPrograms[data.type]++, data);
	      });
	      // 4. Clear hovered nodes layer:
	      this.webGLContexts.hoverNodes.clear(this.webGLContexts.hoverNodes.COLOR_BUFFER_BIT);
	      // 5. Render:
	      var renderParams = this.getRenderParams();
	      for (var _type6 in this.nodeHoverPrograms) {
	        var program = this.nodeHoverPrograms[_type6];
	        program.render(renderParams);
	      }
	    }

	    /**
	     * Method used to schedule a hover render.
	     *
	     */
	  }, {
	    key: "scheduleHighlightedNodesRender",
	    value: function scheduleHighlightedNodesRender() {
	      var _this7 = this;
	      if (this.renderHighlightedNodesFrame || this.renderFrame) return;
	      this.renderHighlightedNodesFrame = requestAnimationFrame(function () {
	        // Resetting state
	        _this7.renderHighlightedNodesFrame = null;

	        // Rendering
	        _this7.renderHighlightedNodes();
	        _this7.renderEdgeLabels();
	      });
	    }

	    /**
	     * Method used to render.
	     *
	     * @return {Sigma}
	     */
	  }, {
	    key: "render",
	    value: function render() {
	      var _this8 = this;
	      this.emit("beforeRender");
	      var exitRender = function exitRender() {
	        _this8.emit("afterRender");
	        return _this8;
	      };

	      // If a render was scheduled, we cancel it
	      if (this.renderFrame) {
	        cancelAnimationFrame(this.renderFrame);
	        this.renderFrame = null;
	      }

	      // First we need to resize
	      this.resize();

	      // Do we need to reprocess data?
	      if (this.needToProcess) this.process();
	      this.needToProcess = false;

	      // Clearing the canvases
	      this.clear();

	      // Prepare the textures
	      this.pickingLayers.forEach(function (layer) {
	        return _this8.resetWebGLTexture(layer);
	      });

	      // If we have no nodes we can stop right there
	      if (!this.graph.order) return exitRender();

	      // TODO: improve this heuristic or move to the captor itself?
	      // TODO: deal with the touch captor here as well
	      var mouseCaptor = this.mouseCaptor;
	      var moving = this.camera.isAnimated() || mouseCaptor.isMoving || mouseCaptor.draggedEvents || mouseCaptor.currentWheelDirection;

	      // Then we need to extract a matrix from the camera
	      var cameraState = this.camera.getState();
	      var viewportDimensions = this.getDimensions();
	      var graphDimensions = this.getGraphDimensions();
	      var padding = this.getSetting("stagePadding") || 0;
	      this.matrix = matrixFromCamera(cameraState, viewportDimensions, graphDimensions, padding);
	      this.invMatrix = matrixFromCamera(cameraState, viewportDimensions, graphDimensions, padding, true);
	      this.correctionRatio = getMatrixImpact(this.matrix, cameraState, viewportDimensions);
	      this.graphToViewportRatio = this.getGraphToViewportRatio();

	      // [jacomyal]
	      // This comment is related to the one above the `getMatrixImpact` definition:
	      // - `this.correctionRatio` is somehow not completely explained
	      // - `this.graphToViewportRatio` is the ratio of a distance in the viewport divided by the same distance in the
	      //   graph
	      // - `this.normalizationFunction.ratio` is basically `Math.max(graphDX, graphDY)`
	      // And now, I observe that if I multiply these three ratios, I have something constant, which value remains 2, even
	      // when I change the graph, the viewport or the camera. It might be useful later, so I prefer to let this comment:
	      // console.log(this.graphToViewportRatio * this.correctionRatio * this.normalizationFunction.ratio * 2);

	      var params = this.getRenderParams();

	      // Drawing nodes
	      for (var type in this.nodePrograms) {
	        var program = this.nodePrograms[type];
	        program.render(params);
	      }

	      // Drawing edges
	      if (!this.settings.hideEdgesOnMove || !moving) {
	        for (var _type7 in this.edgePrograms) {
	          var _program2 = this.edgePrograms[_type7];
	          _program2.render(params);
	        }
	      }

	      // Do not display labels on move per setting
	      if (this.settings.hideLabelsOnMove && moving) return exitRender();
	      this.renderLabels();
	      this.renderEdgeLabels();
	      this.renderHighlightedNodes();
	      return exitRender();
	    }

	    /**
	     * Add a node in the internal data structures.
	     * @private
	     * @param key The node's graphology ID
	     */
	  }, {
	    key: "addNode",
	    value: function addNode(key) {
	      // Node display data resolution:
	      //  1. First we get the node's attributes
	      //  2. We optionally reduce them using the function provided by the user
	      //     Note that this function must return a total object and won't be merged
	      //  3. We apply our defaults, while running some vital checks
	      //  4. We apply the normalization function
	      // We shallow copy node data to avoid dangerous behaviors from reducers
	      var attr = Object.assign({}, this.graph.getNodeAttributes(key));
	      if (this.settings.nodeReducer) attr = this.settings.nodeReducer(key, attr);
	      var data = applyNodeDefaults(this.settings, key, attr);
	      this.nodeDataCache[key] = data;

	      // Label:
	      // We delete and add if needed because this function is also used from
	      // update
	      this.nodesWithForcedLabels["delete"](key);
	      if (data.forceLabel && !data.hidden) this.nodesWithForcedLabels.add(key);

	      // Highlighted:
	      // We remove and re add if needed because this function is also used from
	      // update
	      this.highlightedNodes["delete"](key);
	      if (data.highlighted && !data.hidden) this.highlightedNodes.add(key);

	      // zIndex
	      if (this.settings.zIndex) {
	        if (data.zIndex < this.nodeZExtent[0]) this.nodeZExtent[0] = data.zIndex;
	        if (data.zIndex > this.nodeZExtent[1]) this.nodeZExtent[1] = data.zIndex;
	      }
	    }

	    /**
	     * Update a node the internal data structures.
	     * @private
	     * @param key The node's graphology ID
	     */
	  }, {
	    key: "updateNode",
	    value: function updateNode(key) {
	      this.addNode(key);

	      // Re-apply normalization on the node
	      var data = this.nodeDataCache[key];
	      this.normalizationFunction.applyTo(data);
	    }

	    /**
	     * Remove a node from the internal data structures.
	     * @private
	     * @param key The node's graphology ID
	     */
	  }, {
	    key: "removeNode",
	    value: function removeNode(key) {
	      // Remove from node cache
	      delete this.nodeDataCache[key];
	      // Remove from node program index
	      delete this.nodeProgramIndex[key];
	      // Remove from higlighted nodes
	      this.highlightedNodes["delete"](key);
	      // Remove from hovered
	      if (this.hoveredNode === key) this.hoveredNode = null;
	      // Remove from forced label
	      this.nodesWithForcedLabels["delete"](key);
	    }

	    /**
	     * Add an edge into the internal data structures.
	     * @private
	     * @param key The edge's graphology ID
	     */
	  }, {
	    key: "addEdge",
	    value: function addEdge(key) {
	      // Edge display data resolution:
	      //  1. First we get the edge's attributes
	      //  2. We optionally reduce them using the function provided by the user
	      //  3. Note that this function must return a total object and won't be merged
	      //  4. We apply our defaults, while running some vital checks
	      // We shallow copy edge data to avoid dangerous behaviors from reducers
	      var attr = Object.assign({}, this.graph.getEdgeAttributes(key));
	      if (this.settings.edgeReducer) attr = this.settings.edgeReducer(key, attr);
	      var data = applyEdgeDefaults(this.settings, key, attr);
	      this.edgeDataCache[key] = data;

	      // Forced label
	      // we filter and re push if needed because this function is also used from
	      // update
	      this.edgesWithForcedLabels["delete"](key);
	      if (data.forceLabel && !data.hidden) this.edgesWithForcedLabels.add(key);

	      // Check zIndex
	      if (this.settings.zIndex) {
	        if (data.zIndex < this.edgeZExtent[0]) this.edgeZExtent[0] = data.zIndex;
	        if (data.zIndex > this.edgeZExtent[1]) this.edgeZExtent[1] = data.zIndex;
	      }
	    }

	    /**
	     * Update an edge in the internal data structures.
	     * @private
	     * @param key The edge's graphology ID
	     */
	  }, {
	    key: "updateEdge",
	    value: function updateEdge(key) {
	      this.addEdge(key);
	    }

	    /**
	     * Remove an edge from the internal data structures.
	     * @private
	     * @param key The edge's graphology ID
	     */
	  }, {
	    key: "removeEdge",
	    value: function removeEdge(key) {
	      // Remove from edge cache
	      delete this.edgeDataCache[key];
	      // Remove from programId index
	      delete this.edgeProgramIndex[key];
	      // Remove from hovered
	      if (this.hoveredEdge === key) this.hoveredEdge = null;
	      // Remove from forced label
	      this.edgesWithForcedLabels["delete"](key);
	    }

	    /**
	     * Clear all indices related to nodes.
	     * @private
	     */
	  }, {
	    key: "clearNodeIndices",
	    value: function clearNodeIndices() {
	      // LabelGrid & nodeExtent are only manage/populated in the process function
	      this.labelGrid = new LabelGrid();
	      this.nodeExtent = {
	        x: [0, 1],
	        y: [0, 1]
	      };
	      this.nodeDataCache = {};
	      this.edgeProgramIndex = {};
	      this.nodesWithForcedLabels = new Set();
	      this.nodeZExtent = [Infinity, -Infinity];
	    }

	    /**
	     * Clear all indices related to edges.
	     * @private
	     */
	  }, {
	    key: "clearEdgeIndices",
	    value: function clearEdgeIndices() {
	      this.edgeDataCache = {};
	      this.edgeProgramIndex = {};
	      this.edgesWithForcedLabels = new Set();
	      this.edgeZExtent = [Infinity, -Infinity];
	    }

	    /**
	     * Clear all indices.
	     * @private
	     */
	  }, {
	    key: "clearIndices",
	    value: function clearIndices() {
	      this.clearEdgeIndices();
	      this.clearNodeIndices();
	    }

	    /**
	     * Clear all graph state related to nodes.
	     * @private
	     */
	  }, {
	    key: "clearNodeState",
	    value: function clearNodeState() {
	      this.displayedNodeLabels = new Set();
	      this.highlightedNodes = new Set();
	      this.hoveredNode = null;
	    }

	    /**
	     * Clear all graph state related to edges.
	     * @private
	     */
	  }, {
	    key: "clearEdgeState",
	    value: function clearEdgeState() {
	      this.displayedEdgeLabels = new Set();
	      this.highlightedNodes = new Set();
	      this.hoveredEdge = null;
	    }

	    /**
	     * Clear all graph state.
	     * @private
	     */
	  }, {
	    key: "clearState",
	    value: function clearState() {
	      this.clearEdgeState();
	      this.clearNodeState();
	    }

	    /**
	     * Add the node data to its program.
	     * @private
	     * @param node The node's graphology ID
	     * @param fingerprint A fingerprint used to identity the node with picking
	     * @param position The index where to place the node in the program
	     */
	  }, {
	    key: "addNodeToProgram",
	    value: function addNodeToProgram(node, fingerprint, position) {
	      var data = this.nodeDataCache[node];
	      var nodeProgram = this.nodePrograms[data.type];
	      if (!nodeProgram) throw new Error("Sigma: could not find a suitable program for node type \"".concat(data.type, "\"!"));
	      nodeProgram.process(fingerprint, position, data);
	      // Saving program index
	      this.nodeProgramIndex[node] = position;
	    }

	    /**
	     * Add the edge data to its program.
	     * @private
	     * @param edge The edge's graphology ID
	     * @param fingerprint A fingerprint used to identity the edge with picking
	     * @param position The index where to place the edge in the program
	     */
	  }, {
	    key: "addEdgeToProgram",
	    value: function addEdgeToProgram(edge, fingerprint, position) {
	      var data = this.edgeDataCache[edge];
	      var edgeProgram = this.edgePrograms[data.type];
	      if (!edgeProgram) throw new Error("Sigma: could not find a suitable program for edge type \"".concat(data.type, "\"!"));
	      var extremities = this.graph.extremities(edge),
	        sourceData = this.nodeDataCache[extremities[0]],
	        targetData = this.nodeDataCache[extremities[1]];
	      edgeProgram.process(fingerprint, position, sourceData, targetData, data);
	      // Saving program index
	      this.edgeProgramIndex[edge] = position;
	    }

	    /**---------------------------------------------------------------------------
	     * Public API.
	     **---------------------------------------------------------------------------
	     */

	    /**
	     * Function used to get the render params.
	     *
	     * @return {RenderParams}
	     */
	  }, {
	    key: "getRenderParams",
	    value: function getRenderParams() {
	      return {
	        matrix: this.matrix,
	        invMatrix: this.invMatrix,
	        width: this.width,
	        height: this.height,
	        pixelRatio: this.pixelRatio,
	        zoomRatio: this.camera.ratio,
	        cameraAngle: this.camera.angle,
	        sizeRatio: 1 / this.scaleSize(),
	        correctionRatio: this.correctionRatio,
	        downSizingRatio: this.pickingDownSizingRatio,
	        minEdgeThickness: this.settings.minEdgeThickness,
	        antiAliasingFeather: this.settings.antiAliasingFeather
	      };
	    }

	    /**
	     * Function used to create a canvas element.
	     *
	     * @param  {string} id - Context's id.
	     * @return {Sigma}
	     */
	  }, {
	    key: "createCanvas",
	    value: function createCanvas(id) {
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      if (this.elements[id]) throw new Error("Sigma: a layer named \"".concat(id, "\" already exists"));
	      var canvas = createElement("canvas", {
	        position: "absolute"
	      }, {
	        "class": "sigma-".concat(id)
	      });
	      this.elements[id] = canvas;
	      if ("beforeLayer" in options && options.beforeLayer) {
	        this.elements[options.beforeLayer].before(canvas);
	      } else if ("afterLayer" in options && options.afterLayer) {
	        this.elements[options.afterLayer].after(canvas);
	      } else {
	        this.container.appendChild(canvas);
	      }
	      return canvas;
	    }

	    /**
	     * Function used to create a canvas context and add the relevant DOM elements.
	     *
	     * @param  {string} id - Context's id.
	     * @return {Sigma}
	     */
	  }, {
	    key: "createCanvasContext",
	    value: function createCanvasContext(id) {
	      var canvas = this.createCanvas(id);
	      var contextOptions = {
	        preserveDrawingBuffer: false,
	        antialias: false
	      };
	      this.canvasContexts[id] = canvas.getContext("2d", contextOptions);
	      return this;
	    }

	    /**
	     * Function used to create a WebGL context and add the relevant DOM
	     * elements.
	     *
	     * @param  {string}  id      - Context's id.
	     * @param  {object?} options - #getContext params to override (optional)
	     * @return {WebGLRenderingContext}
	     */
	  }, {
	    key: "createWebGLContext",
	    value: function createWebGLContext(id, options) {
	      var canvas = (options === null || options === void 0 ? void 0 : options.canvas) || this.createCanvas(id);
	      if (options !== null && options !== void 0 && options.hidden) canvas.remove();
	      var contextOptions = _objectSpread2({
	        preserveDrawingBuffer: false,
	        antialias: false
	      }, options || {});
	      var context;

	      // First we try webgl2 for an easy performance boost
	      context = canvas.getContext("webgl2", contextOptions);

	      // Else we fall back to webgl
	      if (!context) context = canvas.getContext("webgl", contextOptions);

	      // Edge, I am looking right at you...
	      if (!context) context = canvas.getContext("experimental-webgl", contextOptions);
	      var gl = context;
	      this.webGLContexts[id] = gl;

	      // Blending:
	      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

	      // Prepare frame buffer for picking layers:
	      if (options !== null && options !== void 0 && options.picking) {
	        this.pickingLayers.add(id);
	        var newFrameBuffer = gl.createFramebuffer();
	        if (!newFrameBuffer) throw new Error("Sigma: cannot create a new frame buffer for layer ".concat(id));
	        this.frameBuffers[id] = newFrameBuffer;
	      }
	      return gl;
	    }

	    /**
	     * Function used to properly kill a canvas layer.
	     *
	     * @param  {string} id - Layer id.
	     * @return {Sigma}
	     */
	  }, {
	    key: "killLayer",
	    value: function killLayer(id) {
	      var canvas = this.elements[id];
	      if (!canvas) throw new Error("Sigma: cannot kill layer ".concat(id, ", which does not exist"));
	      if (this.webGLContexts[id]) {
	        var _gl$getExtension;
	        var gl = this.webGLContexts[id];
	        (_gl$getExtension = gl.getExtension("WEBGL_lose_context")) === null || _gl$getExtension === void 0 || _gl$getExtension.loseContext();
	        delete this.webGLContexts[id];
	      } else {
	        delete this.canvasContexts[id];
	      }

	      // Delete canvas:
	      canvas.remove();
	      delete this.elements[id];
	      return this;
	    }

	    /**
	     * Method returning the renderer's camera.
	     *
	     * @return {Camera}
	     */
	  }, {
	    key: "getCamera",
	    value: function getCamera() {
	      return this.camera;
	    }

	    /**
	     * Method setting the renderer's camera.
	     *
	     * @param  {Camera} camera - New camera.
	     * @return {Sigma}
	     */
	  }, {
	    key: "setCamera",
	    value: function setCamera(camera) {
	      this.unbindCameraHandlers();
	      this.camera = camera;
	      this.bindCameraHandlers();
	    }

	    /**
	     * Method returning the container DOM element.
	     *
	     * @return {HTMLElement}
	     */
	  }, {
	    key: "getContainer",
	    value: function getContainer() {
	      return this.container;
	    }

	    /**
	     * Method returning the renderer's graph.
	     *
	     * @return {Graph}
	     */
	  }, {
	    key: "getGraph",
	    value: function getGraph() {
	      return this.graph;
	    }

	    /**
	     * Method used to set the renderer's graph.
	     *
	     * @return {Graph}
	     */
	  }, {
	    key: "setGraph",
	    value: function setGraph(graph) {
	      if (graph === this.graph) return;

	      // Unbinding handlers on the current graph
	      this.unbindGraphHandlers();
	      if (this.checkEdgesEventsFrame !== null) {
	        cancelAnimationFrame(this.checkEdgesEventsFrame);
	        this.checkEdgesEventsFrame = null;
	      }

	      // Installing new graph
	      this.graph = graph;

	      // Binding new handlers
	      this.bindGraphHandlers();

	      // Re-rendering now to avoid discrepancies from now to next frame
	      this.refresh();
	    }

	    /**
	     * Method returning the mouse captor.
	     *
	     * @return {MouseCaptor}
	     */
	  }, {
	    key: "getMouseCaptor",
	    value: function getMouseCaptor() {
	      return this.mouseCaptor;
	    }

	    /**
	     * Method returning the touch captor.
	     *
	     * @return {TouchCaptor}
	     */
	  }, {
	    key: "getTouchCaptor",
	    value: function getTouchCaptor() {
	      return this.touchCaptor;
	    }

	    /**
	     * Method returning the current renderer's dimensions.
	     *
	     * @return {Dimensions}
	     */
	  }, {
	    key: "getDimensions",
	    value: function getDimensions() {
	      return {
	        width: this.width,
	        height: this.height
	      };
	    }

	    /**
	     * Method returning the current graph's dimensions.
	     *
	     * @return {Dimensions}
	     */
	  }, {
	    key: "getGraphDimensions",
	    value: function getGraphDimensions() {
	      var extent = this.customBBox || this.nodeExtent;
	      return {
	        width: extent.x[1] - extent.x[0] || 1,
	        height: extent.y[1] - extent.y[0] || 1
	      };
	    }

	    /**
	     * Method used to get all the sigma node attributes.
	     * It's usefull for example to get the position of a node
	     * and to get values that are set by the nodeReducer
	     *
	     * @param  {string} key - The node's key.
	     * @return {NodeDisplayData | undefined} A copy of the desired node's attribute or undefined if not found
	     */
	  }, {
	    key: "getNodeDisplayData",
	    value: function getNodeDisplayData(key) {
	      var node = this.nodeDataCache[key];
	      return node ? Object.assign({}, node) : undefined;
	    }

	    /**
	     * Method used to get all the sigma edge attributes.
	     * It's useful for example to get values that are set by the edgeReducer.
	     *
	     * @param  {string} key - The edge's key.
	     * @return {EdgeDisplayData | undefined} A copy of the desired edge's attribute or undefined if not found
	     */
	  }, {
	    key: "getEdgeDisplayData",
	    value: function getEdgeDisplayData(key) {
	      var edge = this.edgeDataCache[key];
	      return edge ? Object.assign({}, edge) : undefined;
	    }

	    /**
	     * Method used to get the set of currently displayed node labels.
	     *
	     * @return {Set<string>} A set of node keys whose label is displayed.
	     */
	  }, {
	    key: "getNodeDisplayedLabels",
	    value: function getNodeDisplayedLabels() {
	      return new Set(this.displayedNodeLabels);
	    }

	    /**
	     * Method used to get the set of currently displayed edge labels.
	     *
	     * @return {Set<string>} A set of edge keys whose label is displayed.
	     */
	  }, {
	    key: "getEdgeDisplayedLabels",
	    value: function getEdgeDisplayedLabels() {
	      return new Set(this.displayedEdgeLabels);
	    }

	    /**
	     * Method returning a copy of the settings collection.
	     *
	     * @return {Settings} A copy of the settings collection.
	     */
	  }, {
	    key: "getSettings",
	    value: function getSettings() {
	      return _objectSpread2({}, this.settings);
	    }

	    /**
	     * Method returning the current value for a given setting key.
	     *
	     * @param  {string} key - The setting key to get.
	     * @return {any} The value attached to this setting key or undefined if not found
	     */
	  }, {
	    key: "getSetting",
	    value: function getSetting(key) {
	      return this.settings[key];
	    }

	    /**
	     * Method setting the value of a given setting key. Note that this will schedule
	     * a new render next frame.
	     *
	     * @param  {string} key - The setting key to set.
	     * @param  {any}    value - The value to set.
	     * @return {Sigma}
	     */
	  }, {
	    key: "setSetting",
	    value: function setSetting(key, value) {
	      var oldValues = _objectSpread2({}, this.settings);
	      this.settings[key] = value;
	      validateSettings(this.settings);
	      this.handleSettingsUpdate(oldValues);
	      this.scheduleRefresh();
	      return this;
	    }

	    /**
	     * Method updating the value of a given setting key using the provided function.
	     * Note that this will schedule a new render next frame.
	     *
	     * @param  {string}   key     - The setting key to set.
	     * @param  {function} updater - The update function.
	     * @return {Sigma}
	     */
	  }, {
	    key: "updateSetting",
	    value: function updateSetting(key, updater) {
	      this.setSetting(key, updater(this.settings[key]));
	      return this;
	    }

	    /**
	     * Method used to resize the renderer.
	     *
	     * @param  {boolean} force - If true, then resize is processed even if size is unchanged (optional).
	     * @return {Sigma}
	     */
	  }, {
	    key: "resize",
	    value: function resize(force) {
	      var previousWidth = this.width,
	        previousHeight = this.height;
	      this.width = this.container.offsetWidth;
	      this.height = this.container.offsetHeight;
	      this.pixelRatio = getPixelRatio();
	      if (this.width === 0) {
	        if (this.settings.allowInvalidContainer) this.width = 1;else throw new Error("Sigma: Container has no width. You can set the allowInvalidContainer setting to true to stop seeing this error.");
	      }
	      if (this.height === 0) {
	        if (this.settings.allowInvalidContainer) this.height = 1;else throw new Error("Sigma: Container has no height. You can set the allowInvalidContainer setting to true to stop seeing this error.");
	      }

	      // If nothing has changed, we can stop right here
	      if (!force && previousWidth === this.width && previousHeight === this.height) return this;
	      this.emit("resize");

	      // Sizing dom elements
	      for (var id in this.elements) {
	        var element = this.elements[id];
	        element.style.width = this.width + "px";
	        element.style.height = this.height + "px";
	      }

	      // Sizing canvas contexts
	      for (var _id in this.canvasContexts) {
	        this.elements[_id].setAttribute("width", this.width * this.pixelRatio + "px");
	        this.elements[_id].setAttribute("height", this.height * this.pixelRatio + "px");
	        if (this.pixelRatio !== 1) this.canvasContexts[_id].scale(this.pixelRatio, this.pixelRatio);
	      }

	      // Sizing WebGL contexts
	      for (var _id2 in this.webGLContexts) {
	        this.elements[_id2].setAttribute("width", this.width * this.pixelRatio + "px");
	        this.elements[_id2].setAttribute("height", this.height * this.pixelRatio + "px");
	        var gl = this.webGLContexts[_id2];
	        gl.viewport(0, 0, this.width * this.pixelRatio, this.height * this.pixelRatio);

	        // Clear picking texture if needed
	        if (this.pickingLayers.has(_id2)) {
	          var currentTexture = this.textures[_id2];
	          if (currentTexture) gl.deleteTexture(currentTexture);
	        }
	      }
	      return this;
	    }

	    /**
	     * Method used to clear all the canvases.
	     *
	     * @return {Sigma}
	     */
	  }, {
	    key: "clear",
	    value: function clear() {
	      this.emit("beforeClear");
	      this.webGLContexts.nodes.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
	      this.webGLContexts.nodes.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);
	      this.webGLContexts.edges.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
	      this.webGLContexts.edges.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);
	      this.webGLContexts.hoverNodes.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);
	      this.canvasContexts.labels.clearRect(0, 0, this.width, this.height);
	      this.canvasContexts.hovers.clearRect(0, 0, this.width, this.height);
	      this.canvasContexts.edgeLabels.clearRect(0, 0, this.width, this.height);
	      this.emit("afterClear");
	      return this;
	    }

	    /**
	     * Method used to refresh, i.e. force the renderer to reprocess graph
	     * data and render, but keep the state.
	     * - if a partialGraph is provided, we only reprocess those nodes & edges.
	     * - if schedule is TRUE, we schedule a render instead of sync render
	     * - if skipIndexation is TRUE, then labelGrid & program indexation are skipped (can be used if you haven't modify x, y, zIndex & size)
	     *
	     * @return {Sigma}
	     */
	  }, {
	    key: "refresh",
	    value: function refresh(opts) {
	      var _this9 = this;
	      var skipIndexation = (opts === null || opts === void 0 ? void 0 : opts.skipIndexation) !== undefined ? opts === null || opts === void 0 ? void 0 : opts.skipIndexation : false;
	      var schedule = (opts === null || opts === void 0 ? void 0 : opts.schedule) !== undefined ? opts.schedule : false;
	      var fullRefresh = !opts || !opts.partialGraph;
	      if (fullRefresh) {
	        // Re-index graph data
	        this.clearEdgeIndices();
	        this.clearNodeIndices();
	        this.graph.forEachNode(function (node) {
	          return _this9.addNode(node);
	        });
	        this.graph.forEachEdge(function (edge) {
	          return _this9.addEdge(edge);
	        });
	      } else {
	        var _opts$partialGraph, _opts$partialGraph2;
	        var nodes = ((_opts$partialGraph = opts.partialGraph) === null || _opts$partialGraph === void 0 ? void 0 : _opts$partialGraph.nodes) || [];
	        for (var i = 0, l = (nodes === null || nodes === void 0 ? void 0 : nodes.length) || 0; i < l; i++) {
	          var node = nodes[i];
	          // Recompute node's data (ie. apply reducer)
	          this.updateNode(node);
	          // Add node to the program if layout is unchanged.
	          // otherwise it will be done in the process function
	          if (skipIndexation) {
	            var programIndex = this.nodeProgramIndex[node];
	            if (programIndex === undefined) throw new Error("Sigma: node \"".concat(node, "\" can't be repaint"));
	            this.addNodeToProgram(node, this.nodeIndices[node], programIndex);
	          }
	        }
	        var edges = (opts === null || opts === void 0 || (_opts$partialGraph2 = opts.partialGraph) === null || _opts$partialGraph2 === void 0 ? void 0 : _opts$partialGraph2.edges) || [];
	        for (var _i4 = 0, _l4 = edges.length; _i4 < _l4; _i4++) {
	          var edge = edges[_i4];
	          // Recompute edge's data (ie. apply reducer)
	          this.updateEdge(edge);
	          // Add edge to the program
	          // otherwise it will be done in the process function
	          if (skipIndexation) {
	            var _programIndex = this.edgeProgramIndex[edge];
	            if (_programIndex === undefined) throw new Error("Sigma: edge \"".concat(edge, "\" can't be repaint"));
	            this.addEdgeToProgram(edge, this.edgeIndices[edge], _programIndex);
	          }
	        }
	      }

	      // Do we need to call the process function ?
	      if (fullRefresh || !skipIndexation) this.needToProcess = true;
	      if (schedule) this.scheduleRender();else this.render();
	      return this;
	    }

	    /**
	     * Method used to schedule a render at the next available frame.
	     * This method can be safely called on a same frame because it basically
	     * debounces refresh to the next frame.
	     *
	     * @return {Sigma}
	     */
	  }, {
	    key: "scheduleRender",
	    value: function scheduleRender() {
	      var _this10 = this;
	      if (!this.renderFrame) {
	        this.renderFrame = requestAnimationFrame(function () {
	          _this10.render();
	        });
	      }
	      return this;
	    }

	    /**
	     * Method used to schedule a refresh (i.e. fully reprocess graph data and render)
	     * at the next available frame.
	     * This method can be safely called on a same frame because it basically
	     * debounces refresh to the next frame.
	     *
	     * @return {Sigma}
	     */
	  }, {
	    key: "scheduleRefresh",
	    value: function scheduleRefresh(opts) {
	      return this.refresh(_objectSpread2(_objectSpread2({}, opts), {}, {
	        schedule: true
	      }));
	    }

	    /**
	     * Method used to (un)zoom, while preserving the position of a viewport point.
	     * Used for instance to zoom "on the mouse cursor".
	     *
	     * @param viewportTarget
	     * @param newRatio
	     * @return {CameraState}
	     */
	  }, {
	    key: "getViewportZoomedState",
	    value: function getViewportZoomedState(viewportTarget, newRatio) {
	      var _this$camera$getState = this.camera.getState(),
	        ratio = _this$camera$getState.ratio,
	        angle = _this$camera$getState.angle,
	        x = _this$camera$getState.x,
	        y = _this$camera$getState.y;

	      // TODO: handle max zoom
	      var ratioDiff = newRatio / ratio;
	      var center = {
	        x: this.width / 2,
	        y: this.height / 2
	      };
	      var graphMousePosition = this.viewportToFramedGraph(viewportTarget);
	      var graphCenterPosition = this.viewportToFramedGraph(center);
	      return {
	        angle: angle,
	        x: (graphMousePosition.x - graphCenterPosition.x) * (1 - ratioDiff) + x,
	        y: (graphMousePosition.y - graphCenterPosition.y) * (1 - ratioDiff) + y,
	        ratio: newRatio
	      };
	    }

	    /**
	     * Method returning the abstract rectangle containing the graph according
	     * to the camera's state.
	     *
	     * @return {object} - The view's rectangle.
	     */
	  }, {
	    key: "viewRectangle",
	    value: function viewRectangle() {
	      // TODO: reduce relative margin?
	      var marginX = 0 * this.width / 8,
	        marginY = 0 * this.height / 8;
	      var p1 = this.viewportToFramedGraph({
	          x: 0 - marginX,
	          y: 0 - marginY
	        }),
	        p2 = this.viewportToFramedGraph({
	          x: this.width + marginX,
	          y: 0 - marginY
	        }),
	        h = this.viewportToFramedGraph({
	          x: 0,
	          y: this.height + marginY
	        });
	      return {
	        x1: p1.x,
	        y1: p1.y,
	        x2: p2.x,
	        y2: p2.y,
	        height: p2.y - h.y
	      };
	    }

	    /**
	     * Method returning the coordinates of a point from the framed graph system to the viewport system. It allows
	     * overriding anything that is used to get the translation matrix, or even the matrix itself.
	     *
	     * Be careful if overriding dimensions, padding or cameraState, as the computation of the matrix is not the lightest
	     * of computations.
	     */
	  }, {
	    key: "framedGraphToViewport",
	    value: function framedGraphToViewport(coordinates) {
	      var override = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      var recomputeMatrix = !!override.cameraState || !!override.viewportDimensions || !!override.graphDimensions;
	      var matrix = override.matrix ? override.matrix : recomputeMatrix ? matrixFromCamera(override.cameraState || this.camera.getState(), override.viewportDimensions || this.getDimensions(), override.graphDimensions || this.getGraphDimensions(), override.padding || this.getSetting("stagePadding") || 0) : this.matrix;
	      var viewportPos = multiplyVec2(matrix, coordinates);
	      return {
	        x: (1 + viewportPos.x) * this.width / 2,
	        y: (1 - viewportPos.y) * this.height / 2
	      };
	    }

	    /**
	     * Method returning the coordinates of a point from the viewport system to the framed graph system. It allows
	     * overriding anything that is used to get the translation matrix, or even the matrix itself.
	     *
	     * Be careful if overriding dimensions, padding or cameraState, as the computation of the matrix is not the lightest
	     * of computations.
	     */
	  }, {
	    key: "viewportToFramedGraph",
	    value: function viewportToFramedGraph(coordinates) {
	      var override = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      var recomputeMatrix = !!override.cameraState || !!override.viewportDimensions || !override.graphDimensions;
	      var invMatrix = override.matrix ? override.matrix : recomputeMatrix ? matrixFromCamera(override.cameraState || this.camera.getState(), override.viewportDimensions || this.getDimensions(), override.graphDimensions || this.getGraphDimensions(), override.padding || this.getSetting("stagePadding") || 0, true) : this.invMatrix;
	      var res = multiplyVec2(invMatrix, {
	        x: coordinates.x / this.width * 2 - 1,
	        y: 1 - coordinates.y / this.height * 2
	      });
	      if (isNaN(res.x)) res.x = 0;
	      if (isNaN(res.y)) res.y = 0;
	      return res;
	    }

	    /**
	     * Method used to translate a point's coordinates from the viewport system (pixel distance from the top-left of the
	     * stage) to the graph system (the reference system of data as they are in the given graph instance).
	     *
	     * This method accepts an optional camera which can be useful if you need to translate coordinates
	     * based on a different view than the one being currently being displayed on screen.
	     *
	     * @param {Coordinates}                  viewportPoint
	     * @param {CoordinateConversionOverride} override
	     */
	  }, {
	    key: "viewportToGraph",
	    value: function viewportToGraph(viewportPoint) {
	      var override = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      return this.normalizationFunction.inverse(this.viewportToFramedGraph(viewportPoint, override));
	    }

	    /**
	     * Method used to translate a point's coordinates from the graph system (the reference system of data as they are in
	     * the given graph instance) to the viewport system (pixel distance from the top-left of the stage).
	     *
	     * This method accepts an optional camera which can be useful if you need to translate coordinates
	     * based on a different view than the one being currently being displayed on screen.
	     *
	     * @param {Coordinates}                  graphPoint
	     * @param {CoordinateConversionOverride} override
	     */
	  }, {
	    key: "graphToViewport",
	    value: function graphToViewport(graphPoint) {
	      var override = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      return this.framedGraphToViewport(this.normalizationFunction(graphPoint), override);
	    }

	    /**
	     * Method returning the distance multiplier between the graph system and the
	     * viewport system.
	     */
	  }, {
	    key: "getGraphToViewportRatio",
	    value: function getGraphToViewportRatio() {
	      var graphP1 = {
	        x: 0,
	        y: 0
	      };
	      var graphP2 = {
	        x: 1,
	        y: 1
	      };
	      var graphD = Math.sqrt(Math.pow(graphP1.x - graphP2.x, 2) + Math.pow(graphP1.y - graphP2.y, 2));
	      var viewportP1 = this.graphToViewport(graphP1);
	      var viewportP2 = this.graphToViewport(graphP2);
	      var viewportD = Math.sqrt(Math.pow(viewportP1.x - viewportP2.x, 2) + Math.pow(viewportP1.y - viewportP2.y, 2));
	      return viewportD / graphD;
	    }

	    /**
	     * Method returning the graph's bounding box.
	     *
	     * @return {{ x: Extent, y: Extent }}
	     */
	  }, {
	    key: "getBBox",
	    value: function getBBox() {
	      return this.nodeExtent;
	    }

	    /**
	     * Method returning the graph's custom bounding box, if any.
	     *
	     * @return {{ x: Extent, y: Extent } | null}
	     */
	  }, {
	    key: "getCustomBBox",
	    value: function getCustomBBox() {
	      return this.customBBox;
	    }

	    /**
	     * Method used to override the graph's bounding box with a custom one. Give `null` as the argument to stop overriding.
	     *
	     * @return {Sigma}
	     */
	  }, {
	    key: "setCustomBBox",
	    value: function setCustomBBox(customBBox) {
	      this.customBBox = customBBox;
	      this.scheduleRender();
	      return this;
	    }

	    /**
	     * Method used to shut the container & release event listeners.
	     *
	     * @return {undefined}
	     */
	  }, {
	    key: "kill",
	    value: function kill() {
	      // Emitting "kill" events so that plugins and such can cleanup
	      this.emit("kill");

	      // Releasing events
	      this.removeAllListeners();

	      // Releasing camera handlers
	      this.unbindCameraHandlers();

	      // Releasing DOM events & captors
	      window.removeEventListener("resize", this.activeListeners.handleResize);
	      this.mouseCaptor.kill();
	      this.touchCaptor.kill();

	      // Releasing graph handlers
	      this.unbindGraphHandlers();

	      // Releasing cache & state
	      this.clearIndices();
	      this.clearState();
	      this.nodeDataCache = {};
	      this.edgeDataCache = {};
	      this.highlightedNodes.clear();

	      // Clearing frames
	      if (this.renderFrame) {
	        cancelAnimationFrame(this.renderFrame);
	        this.renderFrame = null;
	      }
	      if (this.renderHighlightedNodesFrame) {
	        cancelAnimationFrame(this.renderHighlightedNodesFrame);
	        this.renderHighlightedNodesFrame = null;
	      }

	      // Destroying canvases
	      var container = this.container;
	      while (container.firstChild) container.removeChild(container.firstChild);

	      // Destroying remaining collections
	      this.canvasContexts = {};
	      this.webGLContexts = {};
	      this.elements = {};

	      // Kill programs:
	      for (var type in this.nodePrograms) {
	        this.nodePrograms[type].kill();
	      }
	      for (var _type8 in this.nodeHoverPrograms) {
	        this.nodeHoverPrograms[_type8].kill();
	      }
	      for (var _type9 in this.edgePrograms) {
	        this.edgePrograms[_type9].kill();
	      }
	      this.nodePrograms = {};
	      this.nodeHoverPrograms = {};
	      this.edgePrograms = {};

	      // Kill all canvas/WebGL contexts
	      for (var id in this.elements) {
	        this.killLayer(id);
	      }
	    }

	    /**
	     * Method used to scale the given size according to the camera's ratio, i.e.
	     * zooming state.
	     *
	     * @param  {number?} size -        The size to scale (node size, edge thickness etc.).
	     * @param  {number?} cameraRatio - A camera ratio (defaults to the actual camera ratio).
	     * @return {number}              - The scaled size.
	     */
	  }, {
	    key: "scaleSize",
	    value: function scaleSize() {
	      var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
	      var cameraRatio = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.camera.ratio;
	      return size / this.settings.zoomToSizeRatioFunction(cameraRatio) * (this.getSetting("itemSizesReference") === "positions" ? cameraRatio * this.graphToViewportRatio : 1);
	    }

	    /**
	     * Method that returns the collection of all used canvases.
	     * At the moment, the instantiated canvases are the following, and in the
	     * following order in the DOM:
	     * - `edges`
	     * - `nodes`
	     * - `edgeLabels`
	     * - `labels`
	     * - `hovers`
	     * - `hoverNodes`
	     * - `mouse`
	     *
	     * @return {PlainObject<HTMLCanvasElement>} - The collection of canvases.
	     */
	  }, {
	    key: "getCanvases",
	    value: function getCanvases() {
	      return _objectSpread2({}, this.elements);
	    }
	  }]);
	  return Sigma;
	}(TypedEventEmitter);

	/**
	 * Sigma.js Library Endpoint
	 * =========================
	 *
	 * The library endpoint.
	 * @module
	 */
	var Sigma = Sigma$1;

	function responseJson(response) {
	  if (!response.ok) throw new Error(response.status + " " + response.statusText);
	  if (response.status === 204 || response.status === 205) return;
	  return response.json();
	}

	function json(input, init) {
	  return fetch(input, init).then(responseJson);
	}

	let graph = new Graph();

	async function initGraph() {
	  const data = await json('/api/get-network?sim-start=2024082712&time-offset=0');
	  const links = data.links.map(d => ({...d}));
	  const nodes = data.nodes.map(d => ({...d}));

	  nodes.forEach(n => {
	    graph.addNode(n.id, {size: 5, label: n.id});
	  });

	  links.forEach(l => {
	    graph.addEdge(l.source, l.target, { type: "line", label: l.dist_sqrd, size: 5});
	  });

	  // Apply ForceAtlas2 layout
	  const settings = {
	    iterations: 100,
	    linLogMode: false,
	    adjustSizes: false,
	    gravity: 1,
	    slowDown: 1
	  };

	  forceAtlas2.assign(graph, settings);

	  // Instantiate sigma.js and render the graph
	  const container = document.getElementById('graph');
	  new Sigma(graph, container);
	}

	// Expose the initGraph function to the global scope
	window.initGraph = initGraph;

})(events);
