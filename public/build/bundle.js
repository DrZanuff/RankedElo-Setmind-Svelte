
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Header.svelte generated by Svelte v3.38.2 */
    const file$6 = "src/Header.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let nav;
    	let div0;
    	let ul;
    	let li0;
    	let button0;
    	let t1;
    	let li1;
    	let button1;
    	let t3;
    	let li2;
    	let button2;
    	let t5;
    	let li3;
    	let button3;
    	let t7;
    	let li4;
    	let button4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			nav = element("nav");
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			button0 = element("button");
    			button0.textContent = "Lobo";
    			t1 = space();
    			li1 = element("li");
    			button1 = element("button");
    			button1.textContent = "Águia";
    			t3 = space();
    			li2 = element("li");
    			button2 = element("button");
    			button2.textContent = "Urso";
    			t5 = space();
    			li3 = element("li");
    			button3 = element("button");
    			button3.textContent = "Leão";
    			t7 = space();
    			li4 = element("li");
    			button4 = element("button");
    			button4.textContent = "Dragão";
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "name", "button");
    			attr_dev(button0, "class", "btn btn-dark");
    			add_location(button0, file$6, 14, 16, 353);
    			attr_dev(li0, "class", "nav-item");
    			add_location(li0, file$6, 13, 12, 315);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "name", "button");
    			attr_dev(button1, "class", "btn btn-dark");
    			add_location(button1, file$6, 22, 16, 617);
    			attr_dev(li1, "class", "nav-item");
    			add_location(li1, file$6, 21, 12, 579);
    			attr_dev(button2, "type", "button");
    			attr_dev(button2, "name", "button");
    			attr_dev(button2, "class", "btn btn-dark");
    			add_location(button2, file$6, 30, 16, 883);
    			attr_dev(li2, "class", "nav-item");
    			add_location(li2, file$6, 29, 12, 845);
    			attr_dev(button3, "type", "button");
    			attr_dev(button3, "name", "button");
    			attr_dev(button3, "class", "btn btn-dark");
    			add_location(button3, file$6, 38, 16, 1147);
    			attr_dev(li3, "class", "nav-item");
    			add_location(li3, file$6, 37, 12, 1109);
    			attr_dev(button4, "type", "button");
    			attr_dev(button4, "name", "button");
    			attr_dev(button4, "class", "btn btn-dark");
    			add_location(button4, file$6, 47, 16, 1412);
    			attr_dev(li4, "class", "nav-item");
    			add_location(li4, file$6, 46, 12, 1374);
    			attr_dev(ul, "id", "bar");
    			attr_dev(ul, "class", "navbar-nav mr-auto");
    			add_location(ul, file$6, 11, 12, 261);
    			attr_dev(div0, "class", "mx-auto d-sm-flex d-block flex-sm-nowrap");
    			add_location(div0, file$6, 10, 8, 194);
    			attr_dev(nav, "class", "navbar navbar-expand-lg navbar-dark bg-dark");
    			add_location(nav, file$6, 8, 4, 127);
    			add_location(div1, file$6, 7, 0, 117);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, nav);
    			append_dev(nav, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, button0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, button1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, button2);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(li3, button3);
    			append_dev(ul, t7);
    			append_dev(ul, li4);
    			append_dev(li4, button4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[3], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[4], false, false, false),
    					listen_dev(button4, "click", /*click_handler_4*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("Header", slots, []);
    	const signal = createEventDispatcher();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => signal("message", { "text": "Wolf" });
    	const click_handler_1 = () => signal("message", { "text": "Eagle" });
    	const click_handler_2 = () => signal("message", { "text": "Bear" });
    	const click_handler_3 = () => signal("message", { "text": "Lion" });
    	const click_handler_4 = () => signal("message", { "text": "Dragon" });
    	$$self.$capture_state = () => ({ createEventDispatcher, signal });

    	return [
    		signal,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/Team.svelte generated by Svelte v3.38.2 */

    const file$5 = "src/Team.svelte";

    function create_fragment$5(ctx) {
    	let div2;
    	let div1;
    	let p0;
    	let t1;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let div0;
    	let p1;
    	let t4;
    	let p2;
    	let t6;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "1";
    			t1 = space();
    			img0 = element("img");
    			t2 = space();
    			div0 = element("div");
    			p1 = element("p");
    			p1.textContent = "Name";
    			t4 = space();
    			p2 = element("p");
    			p2.textContent = "Points";
    			t6 = space();
    			img1 = element("img");
    			attr_dev(p0, "class", "pos svelte-7c6yja");
    			add_location(p0, file$5, 3, 8, 58);
    			attr_dev(img0, "class", "logo svelte-7c6yja");
    			if (img0.src !== (img0_src_value = "build/img/badges/Wolf.png")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$5, 4, 8, 87);
    			attr_dev(p1, "class", "team-name svelte-7c6yja");
    			add_location(p1, file$5, 6, 12, 177);
    			attr_dev(p2, "class", "team-points svelte-7c6yja");
    			add_location(p2, file$5, 7, 12, 219);
    			attr_dev(div0, "class", "info svelte-7c6yja");
    			add_location(div0, file$5, 5, 8, 146);
    			attr_dev(div1, "class", "content svelte-7c6yja");
    			add_location(div1, file$5, 2, 4, 28);
    			attr_dev(img1, "class", "bg-line svelte-7c6yja");
    			if (img1.src !== (img1_src_value = "build/img/bg_line.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$5, 11, 4, 284);
    			attr_dev(div2, "class", "main svelte-7c6yja");
    			add_location(div2, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(div1, t1);
    			append_dev(div1, img0);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, p1);
    			append_dev(div0, t4);
    			append_dev(div0, p2);
    			append_dev(div2, t6);
    			append_dev(div2, img1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
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

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Team", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Team> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Team extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Team",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/SideMenu.svelte generated by Svelte v3.38.2 */
    const file$4 = "src/SideMenu.svelte";

    // (36:8) {#if settings.isOnSeason}
    function create_if_block$2(ctx) {
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let p;
    	let t2;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let div1;
    	let span;
    	let t4;
    	let team0;
    	let t5;
    	let team1;
    	let t6;
    	let team2;
    	let current;
    	team0 = new Team({ $$inline: true });
    	team1 = new Team({ $$inline: true });
    	team2 = new Team({ $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			p = element("p");
    			p.textContent = "DESAFIO DOS TRIOS";
    			t2 = space();
    			img1 = element("img");
    			t3 = space();
    			div1 = element("div");
    			span = element("span");
    			t4 = space();
    			create_component(team0.$$.fragment);
    			t5 = space();
    			create_component(team1.$$.fragment);
    			t6 = space();
    			create_component(team2.$$.fragment);
    			attr_dev(img0, "class", "h-line up svelte-1lviq7x");
    			if (img0.src !== (img0_src_value = "build/img/horizontal_line.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$4, 37, 12, 1337);
    			attr_dev(p, "class", "title-trio svelte-1lviq7x");
    			add_location(p, file$4, 38, 12, 1416);
    			attr_dev(img1, "class", "h-line down svelte-1lviq7x");
    			if (img1.src !== (img1_src_value = "build/img/horizontal_line.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$4, 39, 12, 1472);
    			attr_dev(div0, "class", "teams-title svelte-1lviq7x");
    			add_location(div0, file$4, 36, 8, 1299);
    			attr_dev(span, "class", "svelte-1lviq7x");
    			add_location(span, file$4, 42, 12, 1601);
    			attr_dev(div1, "class", "teams-list svelte-1lviq7x");
    			add_location(div1, file$4, 41, 8, 1564);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, p);
    			append_dev(div0, t2);
    			append_dev(div0, img1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);
    			append_dev(div1, t4);
    			mount_component(team0, div1, null);
    			append_dev(div1, t5);
    			mount_component(team1, div1, null);
    			append_dev(div1, t6);
    			mount_component(team2, div1, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(team0.$$.fragment, local);
    			transition_in(team1.$$.fragment, local);
    			transition_in(team2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(team0.$$.fragment, local);
    			transition_out(team1.$$.fragment, local);
    			transition_out(team2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			destroy_component(team0);
    			destroy_component(team1);
    			destroy_component(team2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(36:8) {#if settings.isOnSeason}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div3;
    	let div1;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let t2;
    	let div2;
    	let img2;
    	let img2_src_value;
    	let current;
    	let if_block = /*settings*/ ctx[1].isOnSeason && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			div2 = element("div");
    			img2 = element("img");
    			attr_dev(img0, "class", "bdg svelte-1lviq7x");
    			if (img0.src !== (img0_src_value = "build/img/badges/" + /*rank*/ ctx[0] + ".png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$4, 30, 12, 1108);
    			attr_dev(img1, "class", "title svelte-1lviq7x");
    			if (img1.src !== (img1_src_value = "build/img/titles/" + /*rank*/ ctx[0] + ".png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$4, 31, 12, 1179);
    			attr_dev(div0, "class", "image_elo svelte-1lviq7x");
    			add_location(div0, file$4, 29, 8, 1072);
    			attr_dev(div1, "class", "side_menu svelte-1lviq7x");
    			attr_dev(div1, "style", "--side-width : " + /*config*/ ctx[2].sideMenuSize + ";\n    --side-bdg : " + /*config*/ ctx[2].sideMenuBdgSize + ";\n    --side-dir : " + /*config*/ ctx[2].sideMenuFlexDir + ";\n    --side-title : " + /*config*/ ctx[2].sideMenuTitleSize + ";\n    --side-align : " + /*config*/ ctx[2].sideMenuFlexAlign + ";\n    --side-top-margin : " + /*config*/ ctx[2].sideMenuImgMarginTop + ";\n    --side-img-pct-h : " + /*config*/ ctx[2].sideMenuImgPctHeight + ";");
    			add_location(div1, file$4, 20, 4, 695);
    			attr_dev(img2, "class", "line svelte-1lviq7x");
    			if (img2.src !== (img2_src_value = "build/img/vertical_line.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$4, 51, 8, 1769);
    			attr_dev(div2, "class", "div_line svelte-1lviq7x");
    			add_location(div2, file$4, 50, 4, 1738);
    			attr_dev(div3, "class", "main-body svelte-1lviq7x");
    			add_location(div3, file$4, 19, 0, 667);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, img1);
    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, img2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*rank*/ 1 && img0.src !== (img0_src_value = "build/img/badges/" + /*rank*/ ctx[0] + ".png")) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (!current || dirty & /*rank*/ 1 && img1.src !== (img1_src_value = "build/img/titles/" + /*rank*/ ctx[0] + ".png")) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (/*settings*/ ctx[1].isOnSeason) {
    				if (if_block) {
    					if (dirty & /*settings*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
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
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
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
    	validate_slots("SideMenu", slots, []);
    	let { rank = "Wolf" } = $$props;
    	let { settings = { isOnSeason: false } } = $$props;

    	let config = {
    		sideMenuSize: settings.isOnSeason ? "388px" : "358px",
    		sideMenuBdgSize: settings.isOnSeason ? "140px" : "240px",
    		sideMenuTitleSize: settings.isOnSeason ? "81px" : "111px",
    		sideMenuFlexDir: settings.isOnSeason ? "row" : "column",
    		sideMenuFlexAlign: settings.isOnSeason ? "flex-start" : "center",
    		sideMenuImgMarginTop: settings.isOnSeason ? "28px" : "0px",
    		sideMenuImgPctHeight: settings.isOnSeason ? "25%" : "100%"
    	};

    	const writable_props = ["rank", "settings"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SideMenu> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("rank" in $$props) $$invalidate(0, rank = $$props.rank);
    		if ("settings" in $$props) $$invalidate(1, settings = $$props.settings);
    	};

    	$$self.$capture_state = () => ({ Team, rank, settings, config });

    	$$self.$inject_state = $$props => {
    		if ("rank" in $$props) $$invalidate(0, rank = $$props.rank);
    		if ("settings" in $$props) $$invalidate(1, settings = $$props.settings);
    		if ("config" in $$props) $$invalidate(2, config = $$props.config);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [rank, settings, config];
    }

    class SideMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { rank: 0, settings: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SideMenu",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get rank() {
    		throw new Error("<SideMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rank(value) {
    		throw new Error("<SideMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get settings() {
    		throw new Error("<SideMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set settings(value) {
    		throw new Error("<SideMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Entry.svelte generated by Svelte v3.38.2 */

    const file$3 = "src/Entry.svelte";

    // (81:4) {:else}
    function create_else_block$1(ctx) {
    	let div0;
    	let h10;
    	let t0_value = /*entry*/ ctx[0].pos + "";
    	let t0;
    	let h10_class_value;
    	let t1;
    	let div1;
    	let h11;
    	let t2_value = /*entry*/ ctx[0].name + "";
    	let t2;
    	let h11_class_value;
    	let t3;
    	let div2;
    	let h12;
    	let t4_value = /*entry*/ ctx[0].points + "";
    	let t4;
    	let h12_class_value;
    	let t5;
    	let div3;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h10 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			h11 = element("h1");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			h12 = element("h1");
    			t4 = text(t4_value);
    			t5 = space();
    			div3 = element("div");
    			img = element("img");
    			attr_dev(h10, "class", h10_class_value = "entry_pos " + (/*entry*/ ctx[0].style == 0 ? "primary" : "secondary") + " svelte-2g0jmd");
    			add_location(h10, file$3, 82, 12, 1504);
    			add_location(div0, file$3, 81, 8, 1485);
    			attr_dev(h11, "class", h11_class_value = "entry_name " + (/*entry*/ ctx[0].style == 0 ? "primary" : "secondary") + " svelte-2g0jmd");
    			add_location(h11, file$3, 86, 12, 1636);
    			add_location(div1, file$3, 85, 8, 1618);
    			attr_dev(h12, "class", h12_class_value = "entry_points " + (/*entry*/ ctx[0].style == 0 ? "primary" : "secondary") + " svelte-2g0jmd");
    			add_location(h12, file$3, 90, 12, 1776);
    			add_location(div2, file$3, 89, 8, 1758);
    			if (img.src !== (img_src_value = "build/img/bg_line.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-2g0jmd");
    			add_location(img, file$3, 94, 12, 1926);
    			attr_dev(div3, "class", "inner svelte-2g0jmd");
    			add_location(div3, file$3, 93, 8, 1894);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h10);
    			append_dev(h10, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h11);
    			append_dev(h11, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h12);
    			append_dev(h12, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*entry*/ 1 && t0_value !== (t0_value = /*entry*/ ctx[0].pos + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*entry*/ 1 && h10_class_value !== (h10_class_value = "entry_pos " + (/*entry*/ ctx[0].style == 0 ? "primary" : "secondary") + " svelte-2g0jmd")) {
    				attr_dev(h10, "class", h10_class_value);
    			}

    			if (dirty & /*entry*/ 1 && t2_value !== (t2_value = /*entry*/ ctx[0].name + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*entry*/ 1 && h11_class_value !== (h11_class_value = "entry_name " + (/*entry*/ ctx[0].style == 0 ? "primary" : "secondary") + " svelte-2g0jmd")) {
    				attr_dev(h11, "class", h11_class_value);
    			}

    			if (dirty & /*entry*/ 1 && t4_value !== (t4_value = /*entry*/ ctx[0].points + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*entry*/ 1 && h12_class_value !== (h12_class_value = "entry_points " + (/*entry*/ ctx[0].style == 0 ? "primary" : "secondary") + " svelte-2g0jmd")) {
    				attr_dev(h12, "class", h12_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(81:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (65:4) {#if entry.color != ""}
    function create_if_block$1(ctx) {
    	let div0;
    	let h10;
    	let t0_value = /*entry*/ ctx[0].pos + "";
    	let t0;
    	let t1;
    	let div1;
    	let h11;
    	let t2_value = /*entry*/ ctx[0].name + "";
    	let t2;
    	let t3;
    	let div2;
    	let h12;
    	let t4_value = /*entry*/ ctx[0].points + "";
    	let t4;
    	let t5;
    	let div3;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h10 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			h11 = element("h1");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			h12 = element("h1");
    			t4 = text(t4_value);
    			t5 = space();
    			div3 = element("div");
    			img = element("img");
    			attr_dev(h10, "class", "entry_pos svelte-2g0jmd");
    			set_style(h10, "color", /*entry*/ ctx[0].color);
    			add_location(h10, file$3, 66, 12, 1054);
    			add_location(div0, file$3, 65, 8, 1035);
    			attr_dev(h11, "class", "entry_name svelte-2g0jmd");
    			set_style(h11, "color", /*entry*/ ctx[0].color);
    			add_location(h11, file$3, 70, 12, 1165);
    			add_location(div1, file$3, 69, 8, 1147);
    			attr_dev(h12, "class", "entry_points svelte-2g0jmd");
    			set_style(h12, "color", /*entry*/ ctx[0].color);
    			add_location(h12, file$3, 74, 12, 1285);
    			add_location(div2, file$3, 73, 8, 1267);
    			if (img.src !== (img_src_value = "build/img/bg_line.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-2g0jmd");
    			add_location(img, file$3, 78, 12, 1415);
    			attr_dev(div3, "class", "inner svelte-2g0jmd");
    			add_location(div3, file$3, 77, 8, 1383);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h10);
    			append_dev(h10, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h11);
    			append_dev(h11, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h12);
    			append_dev(h12, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*entry*/ 1 && t0_value !== (t0_value = /*entry*/ ctx[0].pos + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*entry*/ 1) {
    				set_style(h10, "color", /*entry*/ ctx[0].color);
    			}

    			if (dirty & /*entry*/ 1 && t2_value !== (t2_value = /*entry*/ ctx[0].name + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*entry*/ 1) {
    				set_style(h11, "color", /*entry*/ ctx[0].color);
    			}

    			if (dirty & /*entry*/ 1 && t4_value !== (t4_value = /*entry*/ ctx[0].points + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*entry*/ 1) {
    				set_style(h12, "color", /*entry*/ ctx[0].color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(65:4) {#if entry.color != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*entry*/ ctx[0].color != "") return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "entry outer svelte-2g0jmd");
    			add_location(div, file$3, 63, 0, 973);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
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
    	validate_slots("Entry", slots, []);

    	let { entry = {
    		"pos": 0,
    		"name": "User Name",
    		"points": "0000",
    		"style": "primary",
    		"color": ""
    	} } = $$props;

    	const writable_props = ["entry"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Entry> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("entry" in $$props) $$invalidate(0, entry = $$props.entry);
    	};

    	$$self.$capture_state = () => ({ entry });

    	$$self.$inject_state = $$props => {
    		if ("entry" in $$props) $$invalidate(0, entry = $$props.entry);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [entry];
    }

    class Entry extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { entry: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Entry",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get entry() {
    		throw new Error("<Entry>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entry(value) {
    		throw new Error("<Entry>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/EntryHeader.svelte generated by Svelte v3.38.2 */

    const file$2 = "src/EntryHeader.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let h10;
    	let t1;
    	let h11;
    	let t3;
    	let h12;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h10 = element("h1");
    			h10.textContent = "#";
    			t1 = space();
    			h11 = element("h1");
    			h11.textContent = "Nome";
    			t3 = space();
    			h12 = element("h1");
    			h12.textContent = "Pontos";
    			attr_dev(h10, "class", "primary svelte-1r1uzpi");
    			add_location(h10, file$2, 37, 4, 589);
    			attr_dev(h11, "class", "primary entry_name svelte-1r1uzpi");
    			add_location(h11, file$2, 38, 4, 620);
    			attr_dev(h12, "class", "primary entry_points svelte-1r1uzpi");
    			add_location(h12, file$2, 39, 4, 665);
    			attr_dev(div, "class", "entry svelte-1r1uzpi");
    			add_location(div, file$2, 36, 0, 565);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h10);
    			append_dev(div, t1);
    			append_dev(div, h11);
    			append_dev(div, t3);
    			append_dev(div, h12);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("EntryHeader", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EntryHeader> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class EntryHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EntryHeader",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/ScoreTable.svelte generated by Svelte v3.38.2 */
    const file$1 = "src/ScoreTable.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (14:4) {#each rankData as entry , i }
    function create_each_block(ctx) {
    	let entry;
    	let current;

    	entry = new Entry({
    			props: {
    				entry: {
    					"pos": /*i*/ ctx[4] + 1,
    					"name": /*rankData*/ ctx[0][/*i*/ ctx[4]][0],
    					"points": /*rankData*/ ctx[0][/*i*/ ctx[4]][1],
    					"style": /*i*/ ctx[4] % 2,
    					"color": /*rankData*/ ctx[0][/*i*/ ctx[4]][2]
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(entry.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(entry, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const entry_changes = {};

    			if (dirty & /*rankData*/ 1) entry_changes.entry = {
    				"pos": /*i*/ ctx[4] + 1,
    				"name": /*rankData*/ ctx[0][/*i*/ ctx[4]][0],
    				"points": /*rankData*/ ctx[0][/*i*/ ctx[4]][1],
    				"style": /*i*/ ctx[4] % 2,
    				"color": /*rankData*/ ctx[0][/*i*/ ctx[4]][2]
    			};

    			entry.$set(entry_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(entry.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(entry.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(entry, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(14:4) {#each rankData as entry , i }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let entryheader;
    	let t1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let current;
    	entryheader = new EntryHeader({ $$inline: true });
    	let each_value = /*rankData*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			img0 = element("img");
    			t0 = space();
    			create_component(entryheader.$$.fragment);
    			t1 = space();
    			img1 = element("img");
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(img0, "class", "line up svelte-1jc2m3i");
    			if (img0.src !== (img0_src_value = "build/img/horizontal_line.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$1, 9, 4, 192);
    			attr_dev(img1, "class", "line down svelte-1jc2m3i");
    			if (img1.src !== (img1_src_value = "build/img/horizontal_line.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$1, 11, 4, 293);
    			attr_dev(div, "class", "score_table svelte-1jc2m3i");
    			add_location(div, file$1, 7, 0, 161);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img0);
    			append_dev(div, t0);
    			mount_component(entryheader, div, null);
    			append_dev(div, t1);
    			append_dev(div, img1);
    			append_dev(div, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*rankData*/ 1) {
    				each_value = /*rankData*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(entryheader.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(entryheader.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(entryheader);
    			destroy_each(each_blocks, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScoreTable", slots, []);
    	let { rankData = [] } = $$props;
    	let nameEntry;
    	const writable_props = ["rankData"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScoreTable> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("rankData" in $$props) $$invalidate(0, rankData = $$props.rankData);
    	};

    	$$self.$capture_state = () => ({ Entry, EntryHeader, rankData, nameEntry });

    	$$self.$inject_state = $$props => {
    		if ("rankData" in $$props) $$invalidate(0, rankData = $$props.rankData);
    		if ("nameEntry" in $$props) nameEntry = $$props.nameEntry;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [rankData];
    }

    class ScoreTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { rankData: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScoreTable",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get rankData() {
    		throw new Error("<ScoreTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rankData(value) {
    		throw new Error("<ScoreTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (63:0) {:else}
    function create_else_block(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "id", "spinLoad");
    			attr_dev(div0, "class", "spinner-grow text-light");
    			attr_dev(div0, "role", "status");
    			add_location(div0, file, 64, 2, 1721);
    			attr_dev(div1, "class", "d-flex justify-content-center");
    			add_location(div1, file, 63, 1, 1675);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(63:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (51:0) {#if isLoaded}
    function create_if_block(ctx) {
    	let body;
    	let header;
    	let t0;
    	let div;
    	let sidemenu;
    	let t1;
    	let scoretable;
    	let body_class_value;
    	let current;
    	header = new Header({ $$inline: true });
    	header.$on("message", /*handleClick*/ ctx[3]);

    	sidemenu = new SideMenu({
    			props: { rank: /*elo*/ ctx[0] },
    			$$inline: true
    		});

    	scoretable = new ScoreTable({
    			props: {
    				rankData: /*data*/ ctx[2][/*elo*/ ctx[0]]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			body = element("body");
    			create_component(header.$$.fragment);
    			t0 = space();
    			div = element("div");
    			create_component(sidemenu.$$.fragment);
    			t1 = space();
    			create_component(scoretable.$$.fragment);
    			attr_dev(div, "class", "main_body svelte-1j0k58e");
    			add_location(div, file, 55, 3, 1531);
    			attr_dev(body, "class", body_class_value = "" + (null_to_empty(/*elo*/ ctx[0]) + " svelte-1j0k58e"));
    			add_location(body, file, 51, 1, 1461);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			mount_component(header, body, null);
    			append_dev(body, t0);
    			append_dev(body, div);
    			mount_component(sidemenu, div, null);
    			append_dev(div, t1);
    			mount_component(scoretable, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sidemenu_changes = {};
    			if (dirty & /*elo*/ 1) sidemenu_changes.rank = /*elo*/ ctx[0];
    			sidemenu.$set(sidemenu_changes);
    			const scoretable_changes = {};
    			if (dirty & /*data, elo*/ 5) scoretable_changes.rankData = /*data*/ ctx[2][/*elo*/ ctx[0]];
    			scoretable.$set(scoretable_changes);

    			if (!current || dirty & /*elo*/ 1 && body_class_value !== (body_class_value = "" + (null_to_empty(/*elo*/ ctx[0]) + " svelte-1j0k58e"))) {
    				attr_dev(body, "class", body_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(sidemenu.$$.fragment, local);
    			transition_in(scoretable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(sidemenu.$$.fragment, local);
    			transition_out(scoretable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(header);
    			destroy_component(sidemenu);
    			destroy_component(scoretable);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(51:0) {#if isLoaded}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isLoaded*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
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
    				} else {
    					if_block.p(ctx, dirty);
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
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let elo = "Wolf";
    	let isLoaded = false;
    	let rankLoaded = false;

    	function handleClick(event) {
    		$$invalidate(0, elo = event.detail.text);
    	}

    	let data = {
    		"Wolf": [],
    		"Eagle": [],
    		"Bear": [],
    		"Lion": [],
    		"Dragon": []
    	};

    	onMount(async () => {
    		//const response = await fetch(`https://script.google.com/macros/s/AKfycbxhnpSr3ijJfYhWEuD9ZH-28KvW1KXx6hQHWVRmzi_UZDpumj2w7rTwgtYoTqQ6ZYjF/exec`);
    		const response = await fetch(`https://script.google.com/macros/s/AKfycbxds7Bb7flTZ81eB5hJyu1-jxKZwKO7Hy1LTJy4xur6SF_RyST4mA2uUMSh0fw9zyOI/exec`);

    		$$invalidate(2, data = await response.json());
    		loadImages();
    	});

    	function loadImages() {
    		const elements = [
    			"build/img/bg/Wolf.png",
    			"build/img/badges/Wolf.png",
    			"build/img/titles/Wolf.png",
    			"build/img/bg/Eagle.png",
    			"build/img/badges/Eagle.png",
    			"build/img/titles/Eagle.png",
    			"build/img/bg/Bear.png",
    			"build/img/badges/Bear.png",
    			"build/img/titles/Bear.png",
    			"build/img/bg/Lion.png",
    			"build/img/badges/Lion.png",
    			"build/img/titles/Lion.png",
    			"build/img/bg/Dragon.png",
    			"build/img/badges/Dragon.png",
    			"build/img/titles/Dragon.png"
    		];

    		for (var i = 0; i < elements.length; i++) {
    			var img = new Image();
    			img.src = elements[i];
    			console.log(img);
    		}

    		$$invalidate(1, isLoaded = true);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		Header,
    		SideMenu,
    		ScoreTable,
    		elo,
    		isLoaded,
    		rankLoaded,
    		handleClick,
    		data,
    		loadImages
    	});

    	$$self.$inject_state = $$props => {
    		if ("elo" in $$props) $$invalidate(0, elo = $$props.elo);
    		if ("isLoaded" in $$props) $$invalidate(1, isLoaded = $$props.isLoaded);
    		if ("rankLoaded" in $$props) rankLoaded = $$props.rankLoaded;
    		if ("data" in $$props) $$invalidate(2, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [elo, isLoaded, data, handleClick];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'worldx'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
