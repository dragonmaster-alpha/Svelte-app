
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.26.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    function hostMatches(anchor) {
      const host = location.host;
      return (
        anchor.host == host ||
        // svelte seems to kill anchor.host value in ie11, so fall back to checking href
        anchor.href.indexOf(`https://${host}`) === 0 ||
        anchor.href.indexOf(`http://${host}`) === 0
      )
    }

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.26.0 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(10, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(9, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(8, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 256) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 1536) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [routes, location, base, basepath, url, $$scope, slots];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.26.0 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 2,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[1],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 530) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[1],
    		/*routeProps*/ ctx[2]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 22)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 2 && get_spread_object(/*routeParams*/ ctx[1]),
    					dirty & /*routeProps*/ 4 && get_spread_object(/*routeProps*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(3, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(1, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(2, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 8) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(1, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(2, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * A link action that can be added to <a href=""> tags rather
     * than using the <Link> component.
     *
     * Example:
     * ```html
     * <a href="/post/{postId}" use:link>{post.title}</a>
     * ```
     */
    function link(node) {
      function onClick(event) {
        const anchor = event.currentTarget;

        if (
          anchor.target === "" &&
          hostMatches(anchor) &&
          shouldNavigate(event)
        ) {
          event.preventDefault();
          navigate(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
        }
      }

      node.addEventListener("click", onClick);

      return {
        destroy() {
          node.removeEventListener("click", onClick);
        }
      };
    }

    /* src/components/Sidebar/Sidebar.svelte generated by Svelte v3.26.0 */
    const file = "src/components/Sidebar/Sidebar.svelte";

    function create_fragment$2(ctx) {
    	let nav;
    	let div1;
    	let div0;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let sup;
    	let span;
    	let t3;
    	let a2;
    	let img2;
    	let img2_src_value;
    	let t4;
    	let a3;
    	let img3;
    	let img3_src_value;
    	let t5;
    	let a4;
    	let img4;
    	let img4_src_value;
    	let t6;
    	let a5;
    	let img5;
    	let img5_src_value;
    	let t7;
    	let a6;
    	let img6;
    	let img6_src_value;
    	let t8;
    	let a7;
    	let img7;
    	let img7_src_value;
    	let t9;
    	let div2;
    	let a8;
    	let img8;
    	let img8_src_value;
    	let t10;
    	let a9;
    	let img9;
    	let img9_src_value;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			sup = element("sup");
    			span = element("span");
    			span.textContent = "3";
    			t3 = space();
    			a2 = element("a");
    			img2 = element("img");
    			t4 = space();
    			a3 = element("a");
    			img3 = element("img");
    			t5 = space();
    			a4 = element("a");
    			img4 = element("img");
    			t6 = space();
    			a5 = element("a");
    			img5 = element("img");
    			t7 = space();
    			a6 = element("a");
    			img6 = element("img");
    			t8 = space();
    			a7 = element("a");
    			img7 = element("img");
    			t9 = space();
    			div2 = element("div");
    			a8 = element("a");
    			img8 = element("img");
    			t10 = space();
    			a9 = element("a");
    			img9 = element("img");
    			if (img0.src !== (img0_src_value = "../assets/img/logo.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "no image");
    			add_location(img0, file, 60, 8, 2157);
    			attr_dev(a0, "class", "w-10 py-4 flex justify-center");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 59, 6, 2098);
    			if (img1.src !== (img1_src_value = "../assets/img/notification.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "no image");
    			add_location(img1, file, 63, 8, 2297);
    			attr_dev(span, "class", "super-text svelte-1r3jep3");
    			add_location(span, file, 64, 13, 2370);
    			add_location(sup, file, 64, 8, 2365);
    			attr_dev(a1, "class", "w-10 py-4 flex justify-center");
    			attr_dev(a1, "href", "/notification");
    			add_location(a1, file, 62, 6, 2226);
    			if (img2.src !== (img2_src_value = "../assets/img/games.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "no image");
    			add_location(img2, file, 67, 8, 2492);
    			attr_dev(a2, "class", "w-10 py-4 flex justify-center");
    			attr_dev(a2, "href", "/games");
    			add_location(a2, file, 66, 6, 2427);
    			if (img3.src !== (img3_src_value = "../assets/img/dashboard.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "no image");
    			add_location(img3, file, 70, 8, 2628);
    			attr_dev(a3, "class", "w-10 py-4 flex justify-center");
    			attr_dev(a3, "href", "/");
    			a3.hidden = true;
    			add_location(a3, file, 69, 6, 2562);
    			if (img4.src !== (img4_src_value = "../assets/img/sessions.svg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "no image");
    			add_location(img4, file, 73, 8, 2768);
    			attr_dev(a4, "class", "w-10 py-4 flex justify-center");
    			attr_dev(a4, "href", "/");
    			a4.hidden = true;
    			add_location(a4, file, 72, 6, 2702);
    			if (img5.src !== (img5_src_value = "../assets/img/wallet.svg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "no image");
    			add_location(img5, file, 76, 8, 2907);
    			attr_dev(a5, "class", "w-10 py-4 flex justify-center");
    			attr_dev(a5, "href", "/");
    			a5.hidden = true;
    			add_location(a5, file, 75, 6, 2841);
    			if (img6.src !== (img6_src_value = "../assets/img/settings.svg")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "no image");
    			add_location(img6, file, 79, 8, 3044);
    			attr_dev(a6, "class", "w-10 py-4 flex justify-center");
    			attr_dev(a6, "href", "/");
    			a6.hidden = true;
    			add_location(a6, file, 78, 6, 2978);
    			if (img7.src !== (img7_src_value = "../assets/img/feedback.svg")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "no image");
    			add_location(img7, file, 82, 8, 3183);
    			attr_dev(a7, "class", "w-10 py-4 flex justify-center");
    			attr_dev(a7, "href", "/");
    			a7.hidden = true;
    			add_location(a7, file, 81, 6, 3117);
    			attr_dev(div0, "class", "system divide-y divide-gray-700 flex flex-col items-center");
    			add_location(div0, file, 58, 4, 2019);
    			attr_dev(div1, "class", "w-full");
    			add_location(div1, file, 57, 2, 1994);
    			if (img8.src !== (img8_src_value = "../assets/img/expand.svg")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "no image");
    			add_location(img8, file, 88, 6, 3344);
    			add_location(a8, file, 87, 4, 3334);
    			if (img9.src !== (img9_src_value = "../assets/img/user-avatar.svg")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "class", "rounded-lg");
    			attr_dev(img9, "alt", "no image");
    			add_location(img9, file, 91, 6, 3485);
    			attr_dev(a9, "class", "flex w-full h-16 avatar-bkg items-center justify-center svelte-1r3jep3");
    			add_location(a9, file, 90, 4, 3411);
    			attr_dev(div2, "class", "w-full flex flex-col items-center space-y-4");
    			add_location(div2, file, 86, 2, 3272);
    			attr_dev(nav, "class", "bg-gray-custom-1 text-white w-16 h-screen sticky top-0 flex flex-col justify-between items-center");
    			add_location(nav, file, 54, 0, 1876);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, img1);
    			append_dev(a1, t1);
    			append_dev(a1, sup);
    			append_dev(sup, span);
    			append_dev(div0, t3);
    			append_dev(div0, a2);
    			append_dev(a2, img2);
    			append_dev(div0, t4);
    			append_dev(div0, a3);
    			append_dev(a3, img3);
    			append_dev(div0, t5);
    			append_dev(div0, a4);
    			append_dev(a4, img4);
    			append_dev(div0, t6);
    			append_dev(div0, a5);
    			append_dev(a5, img5);
    			append_dev(div0, t7);
    			append_dev(div0, a6);
    			append_dev(a6, img6);
    			append_dev(div0, t8);
    			append_dev(div0, a7);
    			append_dev(a7, img7);
    			append_dev(nav, t9);
    			append_dev(nav, div2);
    			append_dev(div2, a8);
    			append_dev(a8, img8);
    			append_dev(div2, t10);
    			append_dev(div2, a9);
    			append_dev(a9, img9);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Sidebar", slots, []);
    	let collapseShow = "hidden";

    	function toggleCollapseShow(classes) {
    		collapseShow = classes;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sidebar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link, collapseShow, toggleCollapseShow });

    	$$self.$inject_state = $$props => {
    		if ("collapseShow" in $$props) collapseShow = $$props.collapseShow;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Sidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidebar",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/ConfirmPart/InformationPart.svelte generated by Svelte v3.26.0 */

    const file$1 = "src/components/ConfirmPart/InformationPart.svelte";

    function create_fragment$3(ctx) {
    	let div9;
    	let div8;
    	let div2;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div7;
    	let div3;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let div4;
    	let p0;
    	let t5;
    	let p1;
    	let t7;
    	let div6;
    	let div5;
    	let img2;
    	let img2_src_value;
    	let t8;
    	let img3;
    	let img3_src_value;
    	let t9;
    	let img4;
    	let img4_src_value;
    	let t10;
    	let img5;
    	let img5_src_value;
    	let t11;
    	let p2;

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div8 = element("div");
    			div2 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			div7 = element("div");
    			div3 = element("div");
    			img1 = element("img");
    			t3 = space();
    			div4 = element("div");
    			p0 = element("p");
    			p0.textContent = "Mew2King";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Super Smash Bros, (Series) Coach";
    			t7 = space();
    			div6 = element("div");
    			div5 = element("div");
    			img2 = element("img");
    			t8 = space();
    			img3 = element("img");
    			t9 = space();
    			img4 = element("img");
    			t10 = space();
    			img5 = element("img");
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "4 games";
    			attr_dev(img0, "class", "w-48 h-32 object-cover rounded-lg");
    			if (img0.src !== (img0_src_value = "../assets/img/game-intro.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "no image");
    			add_location(img0, file$1, 21, 12, 618);
    			attr_dev(div0, "class", "absolute w-full h-full inset-0 z-1 bg-gradient-to-t set-gradient to-transparent svelte-14bzd81");
    			add_location(div0, file$1, 22, 12, 731);
    			attr_dev(div1, "class", "absolute w-full h-full inset-0 z-1 bg-gradient-to-r set-gradient to-transparent svelte-14bzd81");
    			add_location(div1, file$1, 23, 12, 844);
    			attr_dev(div2, "class", "right-0 top-0 z-1 absolute");
    			add_location(div2, file$1, 20, 8, 564);
    			attr_dev(img1, "class", "w-14 h-14 rounded-lg");
    			if (img1.src !== (img1_src_value = "../assets/img/confirm-user-avatar.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "no image");
    			add_location(img1, file$1, 27, 16, 1096);
    			attr_dev(div3, "class", "user-photo");
    			add_location(div3, file$1, 26, 12, 1054);
    			attr_dev(p0, "class", "nickname");
    			add_location(p0, file$1, 30, 16, 1261);
    			attr_dev(p1, "class", "text-gray-500 text-sm my-2");
    			add_location(p1, file$1, 33, 16, 1351);
    			attr_dev(div4, "class", "desc");
    			add_location(div4, file$1, 29, 12, 1225);
    			attr_dev(img2, "class", "w-7 h-7 rounded-lg bg-gray-100 border-2 border-black");
    			if (img2.src !== (img2_src_value = "../assets/img/game-thum1.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "no image");
    			add_location(img2, file$1, 37, 20, 1642);
    			attr_dev(img3, "class", "w-7 h-7 rounded-lg bg-gray-100 border-2 border-black");
    			if (img3.src !== (img3_src_value = "../assets/img/game-thum2.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "no image");
    			add_location(img3, file$1, 38, 20, 1782);
    			attr_dev(img4, "class", "w-7 h-7 rounded-lg bg-gray-100 border-2 border-black");
    			if (img4.src !== (img4_src_value = "../assets/img/game-thum3.svg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "no image");
    			add_location(img4, file$1, 39, 20, 1922);
    			attr_dev(img5, "class", "w-7 h-7 rounded-lg bg-gray-100 border-2 border-black");
    			if (img5.src !== (img5_src_value = "../assets/img/game-thum4.svg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "no image");
    			add_location(img5, file$1, 40, 20, 2062);
    			attr_dev(div5, "class", "flex justify-end sm:justify-start lg:justify-end xl:justify-start -space-x-2");
    			add_location(div5, file$1, 36, 16, 1530);
    			attr_dev(p2, "class", "text-xs");
    			add_location(p2, file$1, 42, 16, 2222);
    			attr_dev(div6, "class", "game-thumbs space-x-2 flex items-center");
    			add_location(div6, file$1, 35, 12, 1459);
    			attr_dev(div7, "class", "user-content relative z-2 p-4 space-y-4 bg-gradient-to-tr");
    			add_location(div7, file$1, 25, 8, 969);
    			attr_dev(div8, "class", "intro relative rounded-lg bg-gray-custom-1");
    			add_location(div8, file$1, 19, 4, 498);
    			attr_dev(div9, "class", "inform-part");
    			add_location(div9, file$1, 18, 0, 467);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div8);
    			append_dev(div8, div2);
    			append_dev(div2, img0);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div8, t2);
    			append_dev(div8, div7);
    			append_dev(div7, div3);
    			append_dev(div3, img1);
    			append_dev(div7, t3);
    			append_dev(div7, div4);
    			append_dev(div4, p0);
    			append_dev(div4, t5);
    			append_dev(div4, p1);
    			append_dev(div7, t7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, img2);
    			append_dev(div5, t8);
    			append_dev(div5, img3);
    			append_dev(div5, t9);
    			append_dev(div5, img4);
    			append_dev(div5, t10);
    			append_dev(div5, img5);
    			append_dev(div6, t11);
    			append_dev(div6, p2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InformationPart", slots, []);
    	let { location } = $$props;
    	const writable_props = ["location"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InformationPart> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    	};

    	$$self.$capture_state = () => ({ location });

    	$$self.$inject_state = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [location];
    }

    class InformationPart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { location: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InformationPart",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*location*/ ctx[0] === undefined && !("location" in props)) {
    			console.warn("<InformationPart> was created without expected prop 'location'");
    		}
    	}

    	get location() {
    		throw new Error("<InformationPart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<InformationPart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ConfirmPart/ConfirmStep.svelte generated by Svelte v3.26.0 */

    const file$2 = "src/components/ConfirmPart/ConfirmStep.svelte";

    function create_fragment$4(ctx) {
    	let div4;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let p0;
    	let t2;
    	let span0;
    	let hr0;
    	let t3;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t4;
    	let p1;
    	let t6;
    	let span1;
    	let hr1;
    	let t7;
    	let div2;
    	let img2;
    	let img2_src_value;
    	let t8;
    	let p2;
    	let t10;
    	let span2;
    	let hr2;
    	let t11;
    	let div3;
    	let img3;
    	let img3_src_value;
    	let t12;
    	let p3;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "Choose Game";
    			t2 = space();
    			span0 = element("span");
    			hr0 = element("hr");
    			t3 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "Session details";
    			t6 = space();
    			span1 = element("span");
    			hr1 = element("hr");
    			t7 = space();
    			div2 = element("div");
    			img2 = element("img");
    			t8 = space();
    			p2 = element("p");
    			p2.textContent = "Payment";
    			t10 = space();
    			span2 = element("span");
    			hr2 = element("hr");
    			t11 = space();
    			div3 = element("div");
    			img3 = element("img");
    			t12 = space();
    			p3 = element("p");
    			p3.textContent = "Confirmation";
    			if (img0.src !== (img0_src_value = "../assets/img/step1.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "no image");
    			add_location(img0, file$2, 11, 8, 295);
    			attr_dev(p0, "class", "text-lg text-blue-200");
    			add_location(p0, file$2, 12, 8, 357);
    			attr_dev(div0, "class", "each-step flex items-center space-x-4");
    			add_location(div0, file$2, 10, 4, 234);
    			attr_dev(hr0, "width", "2");
    			attr_dev(hr0, "class", "line svelte-11m1931");
    			add_location(hr0, file$2, 15, 8, 452);
    			attr_dev(span0, "class", "ml-4");
    			add_location(span0, file$2, 14, 4, 423);
    			if (img1.src !== (img1_src_value = "../assets/img/step2.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "no image");
    			add_location(img1, file$2, 18, 8, 559);
    			attr_dev(p1, "class", "text-lg text-gray-700");
    			add_location(p1, file$2, 19, 8, 621);
    			attr_dev(div1, "class", "each-step flex items-center space-x-4");
    			add_location(div1, file$2, 17, 4, 498);
    			attr_dev(hr1, "width", "2");
    			attr_dev(hr1, "class", "line svelte-11m1931");
    			add_location(hr1, file$2, 22, 8, 720);
    			attr_dev(span1, "class", "ml-4");
    			add_location(span1, file$2, 21, 4, 691);
    			if (img2.src !== (img2_src_value = "../assets/img/step3.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "no image");
    			add_location(img2, file$2, 25, 8, 827);
    			attr_dev(p2, "class", "text-lg text-gray-700");
    			add_location(p2, file$2, 26, 8, 889);
    			attr_dev(div2, "class", "each-step flex items-center space-x-4");
    			add_location(div2, file$2, 24, 4, 766);
    			attr_dev(hr2, "width", "2");
    			attr_dev(hr2, "class", "line svelte-11m1931");
    			add_location(hr2, file$2, 29, 8, 980);
    			attr_dev(span2, "class", "ml-4");
    			add_location(span2, file$2, 28, 4, 951);
    			if (img3.src !== (img3_src_value = "../assets/img/step4.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "no image");
    			add_location(img3, file$2, 32, 8, 1087);
    			attr_dev(p3, "class", "text-lg text-gray-700");
    			add_location(p3, file$2, 33, 8, 1149);
    			attr_dev(div3, "class", "each-step flex items-center space-x-4");
    			add_location(div3, file$2, 31, 4, 1026);
    			attr_dev(div4, "class", "confirm-step mt-12 ml-4 flex flex-col space-y-3");
    			add_location(div4, file$2, 9, 0, 167);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, p0);
    			append_dev(div4, t2);
    			append_dev(div4, span0);
    			append_dev(span0, hr0);
    			append_dev(div4, t3);
    			append_dev(div4, div1);
    			append_dev(div1, img1);
    			append_dev(div1, t4);
    			append_dev(div1, p1);
    			append_dev(div4, t6);
    			append_dev(div4, span1);
    			append_dev(span1, hr1);
    			append_dev(div4, t7);
    			append_dev(div4, div2);
    			append_dev(div2, img2);
    			append_dev(div2, t8);
    			append_dev(div2, p2);
    			append_dev(div4, t10);
    			append_dev(div4, span2);
    			append_dev(span2, hr2);
    			append_dev(div4, t11);
    			append_dev(div4, div3);
    			append_dev(div3, img3);
    			append_dev(div3, t12);
    			append_dev(div3, p3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ConfirmStep", slots, []);
    	let { location } = $$props;
    	const writable_props = ["location"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ConfirmStep> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    	};

    	$$self.$capture_state = () => ({ location });

    	$$self.$inject_state = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [location];
    }

    class ConfirmStep extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { location: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConfirmStep",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*location*/ ctx[0] === undefined && !("location" in props)) {
    			console.warn("<ConfirmStep> was created without expected prop 'location'");
    		}
    	}

    	get location() {
    		throw new Error("<ConfirmStep>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<ConfirmStep>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Sidebar/Sidebar-Next.svelte generated by Svelte v3.26.0 */
    const file$3 = "src/components/Sidebar/Sidebar-Next.svelte";

    function create_fragment$5(ctx) {
    	let nav;
    	let div0;
    	let informpart;
    	let t0;
    	let confirmstep;
    	let t1;
    	let div2;
    	let input;
    	let t2;
    	let div1;
    	let span0;
    	let t4;
    	let span1;
    	let current;
    	informpart = new InformationPart({ $$inline: true });
    	confirmstep = new ConfirmStep({ $$inline: true });

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div0 = element("div");
    			create_component(informpart.$$.fragment);
    			t0 = space();
    			create_component(confirmstep.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			input = element("input");
    			t2 = space();
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "Having troubles?";
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = "Get Help";
    			attr_dev(div0, "class", "sub-menu-top");
    			add_location(div0, file$3, 83, 4, 2417);
    			attr_dev(input, "type", "checkbox");
    			input.checked = /*checked*/ ctx[0];
    			attr_dev(input, "class", "svelte-3y0a0a");
    			add_location(input, file$3, 89, 8, 2604);
    			attr_dev(span0, "class", "help-set-font text-sm text-gray-600 svelte-3y0a0a");
    			add_location(span0, file$3, 91, 12, 2718);
    			attr_dev(span1, "class", "help-set-font text-xs text-white font-medium svelte-3y0a0a");
    			add_location(span1, file$3, 92, 12, 2805);
    			attr_dev(div1, "class", "flex flex-col space-between help-desc svelte-3y0a0a");
    			add_location(div1, file$3, 90, 8, 2653);
    			attr_dev(div2, "class", "checkbox bg-gray-custom-1 rounded-lg p-4 flex items-center space-x-4 svelte-3y0a0a");
    			add_location(div2, file$3, 88, 4, 2512);
    			attr_dev(nav, "class", "bg-gray-custom-2 text-white w-pixel-340 h-screen px-6 py-4 sticky top-0 flex flex-col justify-between svelte-3y0a0a");
    			attr_dev(nav, "id", "confirmation");
    			add_location(nav, file$3, 80, 0, 2272);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div0);
    			mount_component(informpart, div0, null);
    			append_dev(div0, t0);
    			mount_component(confirmstep, div0, null);
    			append_dev(nav, t1);
    			append_dev(nav, div2);
    			append_dev(div2, input);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, span0);
    			append_dev(div1, t4);
    			append_dev(div1, span1);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(informpart.$$.fragment, local);
    			transition_in(confirmstep.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(informpart.$$.fragment, local);
    			transition_out(confirmstep.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_component(informpart);
    			destroy_component(confirmstep);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Sidebar_Next", slots, []);
    	let collapseShow = "hidden";
    	let checked = false;

    	function toggleCollapseShow(classes) {
    		collapseShow = classes;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sidebar_Next> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		link,
    		InformPart: InformationPart,
    		ConfirmStep,
    		collapseShow,
    		checked,
    		toggleCollapseShow
    	});

    	$$self.$inject_state = $$props => {
    		if ("collapseShow" in $$props) collapseShow = $$props.collapseShow;
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checked];
    }

    class Sidebar_Next extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidebar_Next",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/Main/GameComponent.svelte generated by Svelte v3.26.0 */

    const file$4 = "src/components/Main/GameComponent.svelte";

    function create_fragment$6(ctx) {
    	let div14;
    	let div13;
    	let div5;
    	let div4;
    	let div3;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div1;
    	let p0;
    	let t1;
    	let t2;
    	let p1;
    	let t3;
    	let t4;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let t5;
    	let div12;
    	let div8;
    	let div6;
    	let span0;
    	let img2;
    	let img2_src_value;
    	let t6;
    	let p2;
    	let t8;
    	let div7;
    	let button0;
    	let t9;
    	let span1;
    	let t10;
    	let t11;
    	let t12;
    	let button1;
    	let img3;
    	let img3_src_value;
    	let t13;
    	let div11;
    	let div9;
    	let span2;
    	let img4;
    	let img4_src_value;
    	let t14;
    	let p3;
    	let t16;
    	let div10;
    	let button2;
    	let t17;
    	let span3;
    	let t18;
    	let t19;
    	let t20;
    	let button3;
    	let img5;
    	let img5_src_value;

    	const block = {
    		c: function create() {
    			div14 = element("div");
    			div13 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			p0 = element("p");
    			t1 = text(/*gametitle*/ ctx[2]);
    			t2 = space();
    			p1 = element("p");
    			t3 = text(/*description*/ ctx[3]);
    			t4 = space();
    			div2 = element("div");
    			img1 = element("img");
    			t5 = space();
    			div12 = element("div");
    			div8 = element("div");
    			div6 = element("div");
    			span0 = element("span");
    			img2 = element("img");
    			t6 = space();
    			p2 = element("p");
    			p2.textContent = "Live 1:1 Session";
    			t8 = space();
    			div7 = element("div");
    			button0 = element("button");
    			t9 = text("$");
    			span1 = element("span");
    			t10 = text(/*price1*/ ctx[0]);
    			t11 = text(" / hour");
    			t12 = space();
    			button1 = element("button");
    			img3 = element("img");
    			t13 = space();
    			div11 = element("div");
    			div9 = element("div");
    			span2 = element("span");
    			img4 = element("img");
    			t14 = space();
    			p3 = element("p");
    			p3.textContent = "Replay Reviews";
    			t16 = space();
    			div10 = element("div");
    			button2 = element("button");
    			t17 = text("$");
    			span3 = element("span");
    			t18 = text(/*price2*/ ctx[1]);
    			t19 = text(" / hour");
    			t20 = space();
    			button3 = element("button");
    			img5 = element("img");
    			attr_dev(img0, "class", "w-full h-full");
    			if (img0.src !== (img0_src_value = "../assets/img/game-user-avatar" + /*ind*/ ctx[4] + ".svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "no image");
    			add_location(img0, file$4, 20, 20, 791);
    			attr_dev(div0, "class", "w-16 h-16 bg-gray-custom-4 rounded-lg");
    			add_location(div0, file$4, 19, 16, 718);
    			attr_dev(p0, "class", "uppercase text-sm text-gray-500");
    			add_location(p0, file$4, 23, 20, 970);
    			attr_dev(p1, "class", "text-xl font-medium text-white");
    			add_location(p1, file$4, 24, 20, 1052);
    			attr_dev(div1, "class", "description");
    			add_location(div1, file$4, 22, 16, 923);
    			attr_dev(img1, "class", "h-28");
    			if (img1.src !== (img1_src_value = "../assets/img/game" + /*ind*/ ctx[4] + ".svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "no image");
    			add_location(img1, file$4, 27, 20, 1213);
    			attr_dev(div2, "class", "absolute top-0 right-0");
    			add_location(div2, file$4, 26, 16, 1155);
    			attr_dev(div3, "class", "user-name flex items-center space-x-4");
    			add_location(div3, file$4, 18, 12, 649);
    			attr_dev(div4, "class", "user-intro flex justify-between items-center");
    			add_location(div4, file$4, 17, 8, 577);
    			attr_dev(div5, "class", "relative h-28 overflow-hidden flex items-center");
    			add_location(div5, file$4, 16, 4, 506);
    			if (img2.src !== (img2_src_value = "../assets/img/calendar.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "no image");
    			add_location(img2, file$4, 36, 20, 1595);
    			add_location(span0, file$4, 35, 16, 1567);
    			add_location(p2, file$4, 38, 16, 1693);
    			attr_dev(div6, "class", "text-lg flex items-center space-x-4");
    			add_location(div6, file$4, 34, 12, 1500);
    			attr_dev(span1, "class", "font-semibold text-white");
    			add_location(span1, file$4, 42, 21, 1908);
    			attr_dev(button0, "class", "text-lg rounded px-4 py-2 bg-opacity-30 text-gray-400 hourly-btn svelte-fp9efz");
    			add_location(button0, file$4, 41, 16, 1804);
    			if (img3.src !== (img3_src_value = "../assets/img/drop.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "no image");
    			add_location(img3, file$4, 45, 20, 2096);
    			attr_dev(button1, "class", "drop-btn flex items-center justify-center svelte-fp9efz");
    			add_location(button1, file$4, 44, 16, 2016);
    			attr_dev(div7, "class", "right flex space-x-4");
    			add_location(div7, file$4, 40, 12, 1752);
    			attr_dev(div8, "class", "bg-gray-custom-1 rounded-lg p-2 flex items-center justify-between");
    			add_location(div8, file$4, 33, 8, 1407);
    			if (img4.src !== (img4_src_value = "../assets/img/note.svg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "no image");
    			add_location(img4, file$4, 52, 20, 2408);
    			add_location(span2, file$4, 51, 16, 2380);
    			add_location(p3, file$4, 54, 16, 2502);
    			attr_dev(div9, "class", "text-lg flex items-center space-x-4");
    			add_location(div9, file$4, 50, 12, 2313);
    			attr_dev(span3, "class", "font-semibold text-white");
    			add_location(span3, file$4, 58, 21, 2715);
    			attr_dev(button2, "class", "text-lg rounded px-4 py-2 bg-opacity-30 text-gray-400 hourly-btn svelte-fp9efz");
    			add_location(button2, file$4, 57, 16, 2611);
    			if (img5.src !== (img5_src_value = "../assets/img/drop.svg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "no image");
    			add_location(img5, file$4, 61, 20, 2903);
    			attr_dev(button3, "class", "drop-btn flex items-center justify-center svelte-fp9efz");
    			add_location(button3, file$4, 60, 16, 2823);
    			attr_dev(div10, "class", "right flex space-x-4");
    			add_location(div10, file$4, 56, 12, 2559);
    			attr_dev(div11, "class", "bg-gray-custom-1 rounded-lg p-2 flex items-center justify-between");
    			add_location(div11, file$4, 49, 8, 2220);
    			attr_dev(div12, "class", "flex flex-col space-y-3");
    			add_location(div12, file$4, 32, 4, 1360);
    			attr_dev(div13, "class", "game-item bg-gray-custom-1-opacity bg-opacity-50 rounded-xl p-4 cursor-pointer");
    			add_location(div13, file$4, 15, 0, 408);
    			attr_dev(div14, "class", "convolve-item opacity-50 hover:opacity-100");
    			add_location(div14, file$4, 14, 0, 350);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div14, anchor);
    			append_dev(div14, div13);
    			append_dev(div13, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, img0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, p0);
    			append_dev(p0, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p1);
    			append_dev(p1, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, img1);
    			append_dev(div13, t5);
    			append_dev(div13, div12);
    			append_dev(div12, div8);
    			append_dev(div8, div6);
    			append_dev(div6, span0);
    			append_dev(span0, img2);
    			append_dev(div6, t6);
    			append_dev(div6, p2);
    			append_dev(div8, t8);
    			append_dev(div8, div7);
    			append_dev(div7, button0);
    			append_dev(button0, t9);
    			append_dev(button0, span1);
    			append_dev(span1, t10);
    			append_dev(button0, t11);
    			append_dev(div7, t12);
    			append_dev(div7, button1);
    			append_dev(button1, img3);
    			append_dev(div12, t13);
    			append_dev(div12, div11);
    			append_dev(div11, div9);
    			append_dev(div9, span2);
    			append_dev(span2, img4);
    			append_dev(div9, t14);
    			append_dev(div9, p3);
    			append_dev(div11, t16);
    			append_dev(div11, div10);
    			append_dev(div10, button2);
    			append_dev(button2, t17);
    			append_dev(button2, span3);
    			append_dev(span3, t18);
    			append_dev(button2, t19);
    			append_dev(div10, t20);
    			append_dev(div10, button3);
    			append_dev(button3, img5);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*ind*/ 16 && img0.src !== (img0_src_value = "../assets/img/game-user-avatar" + /*ind*/ ctx[4] + ".svg")) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*gametitle*/ 4) set_data_dev(t1, /*gametitle*/ ctx[2]);
    			if (dirty & /*description*/ 8) set_data_dev(t3, /*description*/ ctx[3]);

    			if (dirty & /*ind*/ 16 && img1.src !== (img1_src_value = "../assets/img/game" + /*ind*/ ctx[4] + ".svg")) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (dirty & /*price1*/ 1) set_data_dev(t10, /*price1*/ ctx[0]);
    			if (dirty & /*price2*/ 2) set_data_dev(t18, /*price2*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div14);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GameComponent", slots, []);

    	let { price1 } = $$props,
    		{ price2 } = $$props,
    		{ gametitle } = $$props,
    		{ description } = $$props,
    		{ ind } = $$props;

    	const writable_props = ["price1", "price2", "gametitle", "description", "ind"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GameComponent> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("price1" in $$props) $$invalidate(0, price1 = $$props.price1);
    		if ("price2" in $$props) $$invalidate(1, price2 = $$props.price2);
    		if ("gametitle" in $$props) $$invalidate(2, gametitle = $$props.gametitle);
    		if ("description" in $$props) $$invalidate(3, description = $$props.description);
    		if ("ind" in $$props) $$invalidate(4, ind = $$props.ind);
    	};

    	$$self.$capture_state = () => ({
    		price1,
    		price2,
    		gametitle,
    		description,
    		ind
    	});

    	$$self.$inject_state = $$props => {
    		if ("price1" in $$props) $$invalidate(0, price1 = $$props.price1);
    		if ("price2" in $$props) $$invalidate(1, price2 = $$props.price2);
    		if ("gametitle" in $$props) $$invalidate(2, gametitle = $$props.gametitle);
    		if ("description" in $$props) $$invalidate(3, description = $$props.description);
    		if ("ind" in $$props) $$invalidate(4, ind = $$props.ind);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [price1, price2, gametitle, description, ind];
    }

    class GameComponent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			price1: 0,
    			price2: 1,
    			gametitle: 2,
    			description: 3,
    			ind: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GameComponent",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*price1*/ ctx[0] === undefined && !("price1" in props)) {
    			console.warn("<GameComponent> was created without expected prop 'price1'");
    		}

    		if (/*price2*/ ctx[1] === undefined && !("price2" in props)) {
    			console.warn("<GameComponent> was created without expected prop 'price2'");
    		}

    		if (/*gametitle*/ ctx[2] === undefined && !("gametitle" in props)) {
    			console.warn("<GameComponent> was created without expected prop 'gametitle'");
    		}

    		if (/*description*/ ctx[3] === undefined && !("description" in props)) {
    			console.warn("<GameComponent> was created without expected prop 'description'");
    		}

    		if (/*ind*/ ctx[4] === undefined && !("ind" in props)) {
    			console.warn("<GameComponent> was created without expected prop 'ind'");
    		}
    	}

    	get price1() {
    		throw new Error("<GameComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set price1(value) {
    		throw new Error("<GameComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get price2() {
    		throw new Error("<GameComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set price2(value) {
    		throw new Error("<GameComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gametitle() {
    		throw new Error("<GameComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gametitle(value) {
    		throw new Error("<GameComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<GameComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<GameComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ind() {
    		throw new Error("<GameComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ind(value) {
    		throw new Error("<GameComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Main/Panel.svelte generated by Svelte v3.26.0 */
    const file$5 = "src/components/Main/Panel.svelte";

    function create_fragment$7(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let gameitem0;
    	let t4;
    	let gameitem1;
    	let t5;
    	let gameitem2;
    	let current;

    	gameitem0 = new GameComponent({
    			props: {
    				gametitle: "Fighting game",
    				description: "Super Smash Bros. Ultimate",
    				price1: "80",
    				price2: "25",
    				ind: "1"
    			},
    			$$inline: true
    		});

    	gameitem1 = new GameComponent({
    			props: {
    				gametitle: "Crossover",
    				description: "Super Smash Bros. Brawl",
    				price1: "80",
    				price2: "30",
    				ind: "2"
    			},
    			$$inline: true
    		});

    	gameitem2 = new GameComponent({
    			props: {
    				gametitle: "Fighting game",
    				description: "Project M",
    				price1: "80",
    				price2: "30",
    				ind: "3"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Choose your game";
    			t1 = space();
    			p = element("p");
    			p.textContent = "To continue, pick your game and the coaching service you need.";
    			t3 = space();
    			div1 = element("div");
    			create_component(gameitem0.$$.fragment);
    			t4 = space();
    			create_component(gameitem1.$$.fragment);
    			t5 = space();
    			create_component(gameitem2.$$.fragment);
    			attr_dev(h1, "class", "text-3xl font-semibold");
    			add_location(h1, file$5, 11, 12, 297);
    			attr_dev(p, "class", "mt-2 text-gray-500");
    			add_location(p, file$5, 12, 12, 369);
    			attr_dev(div0, "class", "Title mb-8");
    			add_location(div0, file$5, 10, 8, 259);
    			attr_dev(div1, "class", "gamelist flex flex-col space-y-6");
    			add_location(div1, file$5, 15, 8, 495);
    			attr_dev(div2, "class", "max-w-screen-md mx-auto");
    			add_location(div2, file$5, 9, 4, 212);
    			attr_dev(div3, "class", "main-panel px-8 py-16 bg-gray-custom-3 flex-auto text-white");
    			add_location(div3, file$5, 8, 0, 133);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			mount_component(gameitem0, div1, null);
    			append_dev(div1, t4);
    			mount_component(gameitem1, div1, null);
    			append_dev(div1, t5);
    			mount_component(gameitem2, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gameitem0.$$.fragment, local);
    			transition_in(gameitem1.$$.fragment, local);
    			transition_in(gameitem2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gameitem0.$$.fragment, local);
    			transition_out(gameitem1.$$.fragment, local);
    			transition_out(gameitem2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(gameitem0);
    			destroy_component(gameitem1);
    			destroy_component(gameitem2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Panel", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Panel> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ GameItem: GameComponent });
    	return [];
    }

    class Panel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Panel",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\layouts\Client.svelte generated by Svelte v3.26.0 */
    const file$6 = "src\\layouts\\Client.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let sidebar;
    	let t0;
    	let sidebarnext;
    	let t1;
    	let gamepanel;
    	let current;

    	sidebar = new Sidebar({
    			props: { location: /*location*/ ctx[0] },
    			$$inline: true
    		});

    	sidebarnext = new Sidebar_Next({
    			props: { location: /*location*/ ctx[0] },
    			$$inline: true
    		});

    	gamepanel = new Panel({
    			props: { location: /*location*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(sidebar.$$.fragment);
    			t0 = space();
    			create_component(sidebarnext.$$.fragment);
    			t1 = space();
    			create_component(gamepanel.$$.fragment);
    			attr_dev(div, "class", "flex min-h-screen w-full");
    			add_location(div, file$6, 12, 0, 336);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(sidebar, div, null);
    			append_dev(div, t0);
    			mount_component(sidebarnext, div, null);
    			append_dev(div, t1);
    			mount_component(gamepanel, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sidebar_changes = {};
    			if (dirty & /*location*/ 1) sidebar_changes.location = /*location*/ ctx[0];
    			sidebar.$set(sidebar_changes);
    			const sidebarnext_changes = {};
    			if (dirty & /*location*/ 1) sidebarnext_changes.location = /*location*/ ctx[0];
    			sidebarnext.$set(sidebarnext_changes);
    			const gamepanel_changes = {};
    			if (dirty & /*location*/ 1) gamepanel_changes.location = /*location*/ ctx[0];
    			gamepanel.$set(gamepanel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar.$$.fragment, local);
    			transition_in(sidebarnext.$$.fragment, local);
    			transition_in(gamepanel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebar.$$.fragment, local);
    			transition_out(sidebarnext.$$.fragment, local);
    			transition_out(gamepanel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(sidebar);
    			destroy_component(sidebarnext);
    			destroy_component(gamepanel);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Client", slots, []);
    	let { location } = $$props;
    	let { client = "" } = $$props;
    	const writable_props = ["location", "client"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Client> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    		if ("client" in $$props) $$invalidate(1, client = $$props.client);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Route,
    		Sidebar,
    		SidebarNext: Sidebar_Next,
    		GamePanel: Panel,
    		location,
    		client
    	});

    	$$self.$inject_state = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    		if ("client" in $$props) $$invalidate(1, client = $$props.client);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [location, client];
    }

    class Client extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { location: 0, client: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Client",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*location*/ ctx[0] === undefined && !("location" in props)) {
    			console.warn("<Client> was created without expected prop 'location'");
    		}
    	}

    	get location() {
    		throw new Error("<Client>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Client>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get client() {
    		throw new Error("<Client>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set client(value) {
    		throw new Error("<Client>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Navbars/AuthNavbar.svelte generated by Svelte v3.26.0 */
    const file$7 = "src/components/Navbars/AuthNavbar.svelte";

    function create_fragment$9(ctx) {
    	let nav;
    	let div2;
    	let div0;
    	let a0;
    	let link_action;
    	let t1;
    	let button0;
    	let i0;
    	let t2;
    	let div1;
    	let ul0;
    	let li0;
    	let a1;
    	let i1;
    	let t3;
    	let t4;
    	let ul1;
    	let li1;
    	let a2;
    	let i2;
    	let t5;
    	let span0;
    	let t7;
    	let li2;
    	let a3;
    	let i3;
    	let t8;
    	let span1;
    	let t10;
    	let li3;
    	let a4;
    	let i4;
    	let t11;
    	let span2;
    	let t13;
    	let li4;
    	let button1;
    	let i5;
    	let t14;
    	let div1_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div2 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "Svelte";
    			t1 = space();
    			button0 = element("button");
    			i0 = element("i");
    			t2 = space();
    			div1 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			i1 = element("i");
    			t3 = text("\n            Docs");
    			t4 = space();
    			ul1 = element("ul");
    			li1 = element("li");
    			a2 = element("a");
    			i2 = element("i");
    			t5 = space();
    			span0 = element("span");
    			span0.textContent = "Share";
    			t7 = space();
    			li2 = element("li");
    			a3 = element("a");
    			i3 = element("i");
    			t8 = space();
    			span1 = element("span");
    			span1.textContent = "Tweet";
    			t10 = space();
    			li3 = element("li");
    			a4 = element("a");
    			i4 = element("i");
    			t11 = space();
    			span2 = element("span");
    			span2.textContent = "Star";
    			t13 = space();
    			li4 = element("li");
    			button1 = element("button");
    			i5 = element("i");
    			t14 = text(" Download");
    			attr_dev(a0, "class", "text-white text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-no-wrap uppercase");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$7, 19, 6, 475);
    			attr_dev(i0, "class", "text-white fas fa-bars");
    			add_location(i0, file$7, 31, 8, 918);
    			attr_dev(button0, "class", "cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none");
    			attr_dev(button0, "type", "button");
    			add_location(button0, file$7, 26, 6, 665);
    			attr_dev(div0, "class", "w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start");
    			add_location(div0, file$7, 16, 4, 361);
    			attr_dev(i1, "class", "lg:text-gray-300 text-gray-500 far fa-file-alt text-lg leading-lg mr-2");
    			add_location(i1, file$7, 44, 12, 1555);
    			attr_dev(a1, "class", "lg:text-white lg:hover:text-gray-300 text-gray-800 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold");
    			attr_dev(a1, "href", "https://www.creative-tim.com/learning-lab/tailwind/svelte/overview/notus?ref=ns-auth-navbar");
    			add_location(a1, file$7, 40, 10, 1282);
    			attr_dev(li0, "class", "flex items-center");
    			add_location(li0, file$7, 39, 8, 1241);
    			attr_dev(ul0, "class", "flex flex-col lg:flex-row list-none mr-auto");
    			add_location(ul0, file$7, 38, 6, 1176);
    			attr_dev(i2, "class", "lg:text-gray-300 text-gray-500 fab fa-facebook text-lg leading-lg");
    			add_location(i2, file$7, 58, 12, 2154);
    			attr_dev(span0, "class", "lg:hidden inline-block ml-2");
    			add_location(span0, file$7, 61, 12, 2272);
    			attr_dev(a2, "class", "lg:text-white lg:hover:text-gray-300 text-gray-800 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold");
    			attr_dev(a2, "href", "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdemos.creative-tim.com%2Fnotus-svelte%2F%23%2F");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$7, 53, 10, 1839);
    			attr_dev(li1, "class", "flex items-center");
    			add_location(li1, file$7, 52, 8, 1798);
    			attr_dev(i3, "class", "lg:text-gray-300 text-gray-500 fab fa-twitter text-lg leading-lg");
    			add_location(i3, file$7, 71, 12, 2966);
    			attr_dev(span1, "class", "lg:hidden inline-block ml-2");
    			add_location(span1, file$7, 74, 12, 3083);
    			attr_dev(a3, "class", "lg:text-white lg:hover:text-gray-300 text-gray-800 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold");
    			attr_dev(a3, "href", "https://twitter.com/intent/tweet?url=https%3A%2F%2Fdemos.creative-tim.com%2Fnotus-svelte%2F&text=Start%20your%20development%20with%20a%20Free%20Tailwind%20CSS%20and%20Svelte%20UI%20Kit%20and%20Admin.%20Let%20Notus%20Svelte%20amaze%20you%20with%20its%20cool%20features%20and%20build%20tools%20and%20get%20your%20project%20to%20a%20whole%20new%20level.");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$7, 66, 10, 2406);
    			attr_dev(li2, "class", "flex items-center");
    			add_location(li2, file$7, 65, 8, 2365);
    			attr_dev(i4, "class", "lg:text-gray-300 text-gray-500 fab fa-github text-lg leading-lg");
    			add_location(i4, file$7, 84, 12, 3497);
    			attr_dev(span2, "class", "lg:hidden inline-block ml-2");
    			add_location(span2, file$7, 87, 12, 3613);
    			attr_dev(a4, "class", "lg:text-white lg:hover:text-gray-300 text-gray-800 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold");
    			attr_dev(a4, "href", "https://github.com/creativetimofficial/notus-svelte?ref=ns-auth-navbar");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$7, 79, 10, 3217);
    			attr_dev(li3, "class", "flex items-center");
    			add_location(li3, file$7, 78, 8, 3176);
    			attr_dev(i5, "class", "fas fa-arrow-alt-circle-down");
    			add_location(i5, file$7, 96, 12, 4033);
    			attr_dev(button1, "class", "bg-white text-gray-800 active:bg-gray-100 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150");
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$7, 92, 10, 3746);
    			attr_dev(li4, "class", "flex items-center");
    			add_location(li4, file$7, 91, 8, 3705);
    			attr_dev(ul1, "class", "flex flex-col lg:flex-row list-none lg:ml-auto");
    			add_location(ul1, file$7, 51, 6, 1730);
    			attr_dev(div1, "class", div1_class_value = "lg:flex flex-grow items-center bg-white lg:bg-transparent lg:shadow-none rounded shadow-lg " + (/*navbarOpen*/ ctx[0] ? "block" : "hidden"));
    			attr_dev(div1, "id", "example-navbar-warning");
    			add_location(div1, file$7, 34, 4, 988);
    			attr_dev(div2, "class", "container px-4 mx-auto flex flex-wrap items-center justify-between");
    			add_location(div2, file$7, 13, 2, 269);
    			attr_dev(nav, "class", "top-0 absolute z-50 w-full flex flex-wrap items-center justify-between px-2 py-3 navbar-expand-lg");
    			add_location(nav, file$7, 10, 0, 152);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div2);
    			append_dev(div2, div0);
    			append_dev(div0, a0);
    			append_dev(div0, t1);
    			append_dev(div0, button0);
    			append_dev(button0, i0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a1);
    			append_dev(a1, i1);
    			append_dev(a1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, ul1);
    			append_dev(ul1, li1);
    			append_dev(li1, a2);
    			append_dev(a2, i2);
    			append_dev(a2, t5);
    			append_dev(a2, span0);
    			append_dev(ul1, t7);
    			append_dev(ul1, li2);
    			append_dev(li2, a3);
    			append_dev(a3, i3);
    			append_dev(a3, t8);
    			append_dev(a3, span1);
    			append_dev(ul1, t10);
    			append_dev(ul1, li3);
    			append_dev(li3, a4);
    			append_dev(a4, i4);
    			append_dev(a4, t11);
    			append_dev(a4, span2);
    			append_dev(ul1, t13);
    			append_dev(ul1, li4);
    			append_dev(li4, button1);
    			append_dev(button1, i5);
    			append_dev(button1, t14);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link_action = link.call(null, a0)),
    					listen_dev(button0, "click", /*setNavbarOpen*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*navbarOpen*/ 1 && div1_class_value !== (div1_class_value = "lg:flex flex-grow items-center bg-white lg:bg-transparent lg:shadow-none rounded shadow-lg " + (/*navbarOpen*/ ctx[0] ? "block" : "hidden"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AuthNavbar", slots, []);
    	let navbarOpen = false;

    	function setNavbarOpen() {
    		$$invalidate(0, navbarOpen = !navbarOpen);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AuthNavbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link, navbarOpen, setNavbarOpen });

    	$$self.$inject_state = $$props => {
    		if ("navbarOpen" in $$props) $$invalidate(0, navbarOpen = $$props.navbarOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [navbarOpen, setNavbarOpen];
    }

    class AuthNavbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AuthNavbar",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/views/auth/Login.svelte generated by Svelte v3.26.0 */
    const file$8 = "src/views/auth/Login.svelte";

    function create_fragment$a(ctx) {
    	let div15;
    	let div14;
    	let div13;
    	let div9;
    	let div2;
    	let div0;
    	let h6;
    	let t1;
    	let div1;
    	let button0;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let t3;
    	let button1;
    	let img1;
    	let img1_src_value;
    	let t4;
    	let t5;
    	let hr;
    	let t6;
    	let div8;
    	let div3;
    	let small0;
    	let t8;
    	let form;
    	let div4;
    	let label0;
    	let t10;
    	let input0;
    	let t11;
    	let div5;
    	let label1;
    	let t13;
    	let input1;
    	let t14;
    	let div6;
    	let label2;
    	let input2;
    	let t15;
    	let span;
    	let t17;
    	let div7;
    	let button2;
    	let t19;
    	let div12;
    	let div10;
    	let a0;
    	let small1;
    	let t21;
    	let div11;
    	let a1;
    	let small2;
    	let link_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div15 = element("div");
    			div14 = element("div");
    			div13 = element("div");
    			div9 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h6 = element("h6");
    			h6.textContent = "Sign in with";
    			t1 = space();
    			div1 = element("div");
    			button0 = element("button");
    			img0 = element("img");
    			t2 = text("\n              Github");
    			t3 = space();
    			button1 = element("button");
    			img1 = element("img");
    			t4 = text("\n              Google");
    			t5 = space();
    			hr = element("hr");
    			t6 = space();
    			div8 = element("div");
    			div3 = element("div");
    			small0 = element("small");
    			small0.textContent = "Or sign in with credentials";
    			t8 = space();
    			form = element("form");
    			div4 = element("div");
    			label0 = element("label");
    			label0.textContent = "Email";
    			t10 = space();
    			input0 = element("input");
    			t11 = space();
    			div5 = element("div");
    			label1 = element("label");
    			label1.textContent = "Password";
    			t13 = space();
    			input1 = element("input");
    			t14 = space();
    			div6 = element("div");
    			label2 = element("label");
    			input2 = element("input");
    			t15 = space();
    			span = element("span");
    			span.textContent = "Remember me";
    			t17 = space();
    			div7 = element("div");
    			button2 = element("button");
    			button2.textContent = "Sign In";
    			t19 = space();
    			div12 = element("div");
    			div10 = element("div");
    			a0 = element("a");
    			small1 = element("small");
    			small1.textContent = "Forgot password?";
    			t21 = space();
    			div11 = element("div");
    			a1 = element("a");
    			small2 = element("small");
    			small2.textContent = "Create new account";
    			attr_dev(h6, "class", "text-gray-600 text-sm font-bold");
    			add_location(h6, file$8, 16, 12, 560);
    			attr_dev(div0, "class", "text-center mb-3");
    			add_location(div0, file$8, 15, 10, 517);
    			attr_dev(img0, "alt", "...");
    			attr_dev(img0, "class", "w-5 mr-1");
    			if (img0.src !== (img0_src_value = github)) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$8, 25, 14, 1043);
    			attr_dev(button0, "class", "bg-white active:bg-gray-100 text-gray-800 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-2 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150");
    			attr_dev(button0, "type", "button");
    			add_location(button0, file$8, 21, 12, 727);
    			attr_dev(img1, "alt", "...");
    			attr_dev(img1, "class", "w-5 mr-1");
    			if (img1.src !== (img1_src_value = google)) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$8, 32, 14, 1464);
    			attr_dev(button1, "class", "bg-white active:bg-gray-100 text-gray-800 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150");
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$8, 28, 12, 1148);
    			attr_dev(div1, "class", "btn-wrapper text-center");
    			add_location(div1, file$8, 20, 10, 677);
    			attr_dev(hr, "class", "mt-6 border-b-1 border-gray-400");
    			add_location(hr, file$8, 36, 10, 1584);
    			attr_dev(div2, "class", "rounded-t mb-0 px-6 py-6");
    			add_location(div2, file$8, 14, 8, 468);
    			add_location(small0, file$8, 40, 12, 1780);
    			attr_dev(div3, "class", "text-gray-500 text-center mb-3 font-bold");
    			add_location(div3, file$8, 39, 10, 1713);
    			attr_dev(label0, "class", "block uppercase text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label0, "for", "grid-email");
    			add_location(label0, file$8, 44, 14, 1918);
    			attr_dev(input0, "id", "grid-email");
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "class", "px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full ease-linear transition-all duration-150");
    			attr_dev(input0, "placeholder", "Email");
    			add_location(input0, file$8, 50, 14, 2110);
    			attr_dev(div4, "class", "relative w-full mb-3");
    			add_location(div4, file$8, 43, 12, 1869);
    			attr_dev(label1, "class", "block uppercase text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label1, "for", "grid-password");
    			add_location(label1, file$8, 59, 14, 2500);
    			attr_dev(input1, "id", "grid-password");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "class", "px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full ease-linear transition-all duration-150");
    			attr_dev(input1, "placeholder", "Password");
    			add_location(input1, file$8, 65, 14, 2698);
    			attr_dev(div5, "class", "relative w-full mb-3");
    			add_location(div5, file$8, 58, 12, 2451);
    			attr_dev(input2, "id", "customCheckLogin");
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "class", "form-checkbox text-gray-800 ml-1 w-5 h-5 ease-linear transition-all duration-150");
    			add_location(input2, file$8, 74, 16, 3139);
    			attr_dev(span, "class", "ml-2 text-sm font-semibold text-gray-700");
    			add_location(span, file$8, 79, 16, 3362);
    			attr_dev(label2, "class", "inline-flex items-center cursor-pointer");
    			add_location(label2, file$8, 73, 14, 3067);
    			add_location(div6, file$8, 72, 12, 3047);
    			attr_dev(button2, "class", "bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150");
    			attr_dev(button2, "type", "button");
    			add_location(button2, file$8, 86, 14, 3572);
    			attr_dev(div7, "class", "text-center mt-6");
    			add_location(div7, file$8, 85, 12, 3527);
    			add_location(form, file$8, 42, 10, 1850);
    			attr_dev(div8, "class", "flex-auto px-4 lg:px-10 py-10 pt-0");
    			add_location(div8, file$8, 38, 8, 1654);
    			attr_dev(div9, "class", "relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-300 border-0");
    			add_location(div9, file$8, 11, 6, 334);
    			add_location(small1, file$8, 99, 12, 4139);
    			attr_dev(a0, "href", "#pablo");
    			attr_dev(a0, "class", "text-gray-300");
    			add_location(a0, file$8, 98, 10, 4050);
    			attr_dev(div10, "class", "w-1/2");
    			add_location(div10, file$8, 97, 8, 4020);
    			add_location(small2, file$8, 104, 12, 4319);
    			attr_dev(a1, "href", "/auth/register");
    			attr_dev(a1, "class", "text-gray-300");
    			add_location(a1, file$8, 103, 10, 4250);
    			attr_dev(div11, "class", "w-1/2 text-right");
    			add_location(div11, file$8, 102, 8, 4209);
    			attr_dev(div12, "class", "flex flex-wrap mt-6 relative");
    			add_location(div12, file$8, 96, 6, 3969);
    			attr_dev(div13, "class", "w-full lg:w-4/12 px-4");
    			add_location(div13, file$8, 10, 4, 292);
    			attr_dev(div14, "class", "flex content-center items-center justify-center h-full");
    			add_location(div14, file$8, 9, 2, 219);
    			attr_dev(div15, "class", "container mx-auto px-4 h-full");
    			add_location(div15, file$8, 8, 0, 173);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div15, anchor);
    			append_dev(div15, div14);
    			append_dev(div14, div13);
    			append_dev(div13, div9);
    			append_dev(div9, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h6);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(button0, img0);
    			append_dev(button0, t2);
    			append_dev(div1, t3);
    			append_dev(div1, button1);
    			append_dev(button1, img1);
    			append_dev(button1, t4);
    			append_dev(div2, t5);
    			append_dev(div2, hr);
    			append_dev(div9, t6);
    			append_dev(div9, div8);
    			append_dev(div8, div3);
    			append_dev(div3, small0);
    			append_dev(div8, t8);
    			append_dev(div8, form);
    			append_dev(form, div4);
    			append_dev(div4, label0);
    			append_dev(div4, t10);
    			append_dev(div4, input0);
    			append_dev(form, t11);
    			append_dev(form, div5);
    			append_dev(div5, label1);
    			append_dev(div5, t13);
    			append_dev(div5, input1);
    			append_dev(form, t14);
    			append_dev(form, div6);
    			append_dev(div6, label2);
    			append_dev(label2, input2);
    			append_dev(label2, t15);
    			append_dev(label2, span);
    			append_dev(form, t17);
    			append_dev(form, div7);
    			append_dev(div7, button2);
    			append_dev(div13, t19);
    			append_dev(div13, div12);
    			append_dev(div12, div10);
    			append_dev(div10, a0);
    			append_dev(a0, small1);
    			append_dev(div12, t21);
    			append_dev(div12, div11);
    			append_dev(div11, a1);
    			append_dev(a1, small2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", click_handler, false, false, false),
    					action_destroyer(link_action = link.call(null, a1))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div15);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const github = "../assets/img/github.svg";
    const google = "../assets/img/google.svg";
    const click_handler = e => e.preventDefault();

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Login", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link, github, google });
    	return [];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/views/auth/Register.svelte generated by Svelte v3.26.0 */

    const file$9 = "src/views/auth/Register.svelte";

    function create_fragment$b(ctx) {
    	let div13;
    	let div12;
    	let div11;
    	let div10;
    	let div2;
    	let div0;
    	let h6;
    	let t1;
    	let div1;
    	let button0;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let t3;
    	let button1;
    	let img1;
    	let img1_src_value;
    	let t4;
    	let t5;
    	let hr;
    	let t6;
    	let div9;
    	let div3;
    	let small;
    	let t8;
    	let form;
    	let div4;
    	let label0;
    	let t10;
    	let input0;
    	let t11;
    	let div5;
    	let label1;
    	let t13;
    	let input1;
    	let t14;
    	let div6;
    	let label2;
    	let t16;
    	let input2;
    	let t17;
    	let div7;
    	let label3;
    	let input3;
    	let t18;
    	let span;
    	let t19;
    	let a;
    	let t21;
    	let div8;
    	let button2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div13 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			div10 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h6 = element("h6");
    			h6.textContent = "Sign up with";
    			t1 = space();
    			div1 = element("div");
    			button0 = element("button");
    			img0 = element("img");
    			t2 = text("\n              Github");
    			t3 = space();
    			button1 = element("button");
    			img1 = element("img");
    			t4 = text("\n              Google");
    			t5 = space();
    			hr = element("hr");
    			t6 = space();
    			div9 = element("div");
    			div3 = element("div");
    			small = element("small");
    			small.textContent = "Or sign up with credentials";
    			t8 = space();
    			form = element("form");
    			div4 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name";
    			t10 = space();
    			input0 = element("input");
    			t11 = space();
    			div5 = element("div");
    			label1 = element("label");
    			label1.textContent = "Email";
    			t13 = space();
    			input1 = element("input");
    			t14 = space();
    			div6 = element("div");
    			label2 = element("label");
    			label2.textContent = "Password";
    			t16 = space();
    			input2 = element("input");
    			t17 = space();
    			div7 = element("div");
    			label3 = element("label");
    			input3 = element("input");
    			t18 = space();
    			span = element("span");
    			t19 = text("I agree with the\n                  ");
    			a = element("a");
    			a.textContent = "Privacy Policy";
    			t21 = space();
    			div8 = element("div");
    			button2 = element("button");
    			button2.textContent = "Create Account";
    			attr_dev(h6, "class", "text-gray-600 text-sm font-bold");
    			add_location(h6, file$9, 14, 12, 518);
    			attr_dev(div0, "class", "text-center mb-3");
    			add_location(div0, file$9, 13, 10, 475);
    			attr_dev(img0, "alt", "...");
    			attr_dev(img0, "class", "w-5 mr-1");
    			if (img0.src !== (img0_src_value = github$1)) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$9, 23, 14, 1001);
    			attr_dev(button0, "class", "bg-white active:bg-gray-100 text-gray-800 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-2 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150");
    			attr_dev(button0, "type", "button");
    			add_location(button0, file$9, 19, 12, 685);
    			attr_dev(img1, "alt", "...");
    			attr_dev(img1, "class", "w-5 mr-1");
    			if (img1.src !== (img1_src_value = google$1)) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$9, 30, 14, 1422);
    			attr_dev(button1, "class", "bg-white active:bg-gray-100 text-gray-800 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150");
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$9, 26, 12, 1106);
    			attr_dev(div1, "class", "btn-wrapper text-center");
    			add_location(div1, file$9, 18, 10, 635);
    			attr_dev(hr, "class", "mt-6 border-b-1 border-gray-400");
    			add_location(hr, file$9, 34, 10, 1542);
    			attr_dev(div2, "class", "rounded-t mb-0 px-6 py-6");
    			add_location(div2, file$9, 12, 8, 426);
    			add_location(small, file$9, 38, 12, 1738);
    			attr_dev(div3, "class", "text-gray-500 text-center mb-3 font-bold");
    			add_location(div3, file$9, 37, 10, 1671);
    			attr_dev(label0, "class", "block uppercase text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label0, "for", "grid-name");
    			add_location(label0, file$9, 42, 14, 1876);
    			attr_dev(input0, "id", "grid-name");
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "class", "px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full ease-linear transition-all duration-150");
    			attr_dev(input0, "placeholder", "Name");
    			add_location(input0, file$9, 48, 14, 2066);
    			attr_dev(div4, "class", "relative w-full mb-3");
    			add_location(div4, file$9, 41, 12, 1827);
    			attr_dev(label1, "class", "block uppercase text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label1, "for", "grid-email");
    			add_location(label1, file$9, 57, 14, 2454);
    			attr_dev(input1, "id", "grid-email");
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "class", "px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full ease-linear transition-all duration-150");
    			attr_dev(input1, "placeholder", "Email");
    			add_location(input1, file$9, 63, 14, 2646);
    			attr_dev(div5, "class", "relative w-full mb-3");
    			add_location(div5, file$9, 56, 12, 2405);
    			attr_dev(label2, "class", "block uppercase text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label2, "for", "grid-password");
    			add_location(label2, file$9, 72, 14, 3036);
    			attr_dev(input2, "id", "grid-password");
    			attr_dev(input2, "type", "password");
    			attr_dev(input2, "class", "px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full ease-linear transition-all duration-150");
    			attr_dev(input2, "placeholder", "Password");
    			add_location(input2, file$9, 78, 14, 3234);
    			attr_dev(div6, "class", "relative w-full mb-3");
    			add_location(div6, file$9, 71, 12, 2987);
    			attr_dev(input3, "id", "customCheckLogin");
    			attr_dev(input3, "type", "checkbox");
    			attr_dev(input3, "class", "form-checkbox text-gray-800 ml-1 w-5 h-5 ease-linear transition-all duration-150");
    			add_location(input3, file$9, 88, 16, 3676);
    			attr_dev(a, "href", "#pablo");
    			attr_dev(a, "class", "text-red-500");
    			add_location(a, file$9, 95, 18, 4008);
    			attr_dev(span, "class", "ml-2 text-sm font-semibold text-gray-700");
    			add_location(span, file$9, 93, 16, 3899);
    			attr_dev(label3, "class", "inline-flex items-center cursor-pointer");
    			add_location(label3, file$9, 87, 14, 3604);
    			add_location(div7, file$9, 86, 12, 3584);
    			attr_dev(button2, "class", "bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150");
    			attr_dev(button2, "type", "button");
    			add_location(button2, file$9, 103, 14, 4266);
    			attr_dev(div8, "class", "text-center mt-6");
    			add_location(div8, file$9, 102, 12, 4221);
    			add_location(form, file$9, 40, 10, 1808);
    			attr_dev(div9, "class", "flex-auto px-4 lg:px-10 py-10 pt-0");
    			add_location(div9, file$9, 36, 8, 1612);
    			attr_dev(div10, "class", "relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-300 border-0");
    			add_location(div10, file$9, 9, 6, 292);
    			attr_dev(div11, "class", "w-full lg:w-6/12 px-4");
    			add_location(div11, file$9, 8, 4, 250);
    			attr_dev(div12, "class", "flex content-center items-center justify-center h-full");
    			add_location(div12, file$9, 7, 2, 177);
    			attr_dev(div13, "class", "container mx-auto px-4 h-full");
    			add_location(div13, file$9, 6, 0, 131);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div13, anchor);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h6);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(button0, img0);
    			append_dev(button0, t2);
    			append_dev(div1, t3);
    			append_dev(div1, button1);
    			append_dev(button1, img1);
    			append_dev(button1, t4);
    			append_dev(div2, t5);
    			append_dev(div2, hr);
    			append_dev(div10, t6);
    			append_dev(div10, div9);
    			append_dev(div9, div3);
    			append_dev(div3, small);
    			append_dev(div9, t8);
    			append_dev(div9, form);
    			append_dev(form, div4);
    			append_dev(div4, label0);
    			append_dev(div4, t10);
    			append_dev(div4, input0);
    			append_dev(form, t11);
    			append_dev(form, div5);
    			append_dev(div5, label1);
    			append_dev(div5, t13);
    			append_dev(div5, input1);
    			append_dev(form, t14);
    			append_dev(form, div6);
    			append_dev(div6, label2);
    			append_dev(div6, t16);
    			append_dev(div6, input2);
    			append_dev(form, t17);
    			append_dev(form, div7);
    			append_dev(div7, label3);
    			append_dev(label3, input3);
    			append_dev(label3, t18);
    			append_dev(label3, span);
    			append_dev(span, t19);
    			append_dev(span, a);
    			append_dev(form, t21);
    			append_dev(form, div8);
    			append_dev(div8, button2);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", click_handler$1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div13);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const github$1 = "../assets/img/github.svg";
    const google$1 = "../assets/img/google.svg";
    const click_handler$1 = e => e.preventDefault();

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Register", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Register> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ github: github$1, google: google$1 });
    	return [];
    }

    class Register extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Register",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\layouts\Auth.svelte generated by Svelte v3.26.0 */
    const file$a = "src\\layouts\\Auth.svelte";

    // (24:6) <Router url="auth">
    function create_default_slot(ctx) {
    	let route0;
    	let t;
    	let route1;
    	let current;

    	route0 = new Route({
    			props: { path: "login", component: Login },
    			$$inline: true
    		});

    	route1 = new Route({
    			props: { path: "register", component: Register },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t = space();
    			create_component(route1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(route1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(route1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(24:6) <Router url=\\\"auth\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div1;
    	let authnavbar;
    	let t0;
    	let main;
    	let section;
    	let div0;
    	let t1;
    	let router;
    	let current;
    	authnavbar = new AuthNavbar({ $$inline: true });

    	router = new Router({
    			props: {
    				url: "auth",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(authnavbar.$$.fragment);
    			t0 = space();
    			main = element("main");
    			section = element("section");
    			div0 = element("div");
    			t1 = space();
    			create_component(router.$$.fragment);
    			attr_dev(div0, "class", "absolute top-0 w-full h-full bg-gray-900 bg-no-repeat bg-full");
    			set_style(div0, "background-image", "url(" + registerBg2 + ")");
    			add_location(div0, file$a, 19, 6, 503);
    			attr_dev(section, "class", "relative w-full h-full py-40 min-h-screen");
    			add_location(section, file$a, 18, 4, 437);
    			add_location(main, file$a, 17, 2, 426);
    			add_location(div1, file$a, 15, 0, 401);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(authnavbar, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, main);
    			append_dev(main, section);
    			append_dev(section, div0);
    			append_dev(section, t1);
    			mount_component(router, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(authnavbar.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(authnavbar.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(authnavbar);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const registerBg2 = "../assets/img/register_bg_2.png";

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Auth", slots, []);
    	let { location } = $$props;
    	let { auth = "" } = $$props;
    	const writable_props = ["location", "auth"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Auth> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    		if ("auth" in $$props) $$invalidate(1, auth = $$props.auth);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Route,
    		AuthNavbar,
    		Login,
    		Register,
    		registerBg2,
    		location,
    		auth
    	});

    	$$self.$inject_state = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    		if ("auth" in $$props) $$invalidate(1, auth = $$props.auth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [location, auth];
    }

    class Auth extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { location: 0, auth: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Auth",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*location*/ ctx[0] === undefined && !("location" in props)) {
    			console.warn("<Auth> was created without expected prop 'location'");
    		}
    	}

    	get location() {
    		throw new Error("<Auth>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Auth>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get auth() {
    		throw new Error("<Auth>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set auth(value) {
    		throw new Error("<Auth>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.26.0 */

    // (13:0) <Router url="{url}">
    function create_default_slot$1(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let current;

    	route0 = new Route({
    			props: { path: "/*client", component: Client },
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "client/*client",
    				component: Client
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: { path: "auth/*auth", component: Auth },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(13:0) <Router url=\\\"{url}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 2) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { url = "" } = $$props;
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({ Router, Route, Client, Auth, url });

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.getElementById("app")
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
