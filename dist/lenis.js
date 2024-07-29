(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Lenis = factory());
})(this, (function () { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */


    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }

    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (kind === "m") throw new TypeError("Private method is not writable");
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var version = "1.1.8";

    function clamp(min, input, max) {
        return Math.max(min, Math.min(input, max));
    }
    function lerp(x, y, t) {
        return (1 - t) * x + t * y;
    }
    function damp(x, y, lambda, deltaTime) {
        return lerp(x, y, 1 - Math.exp(-lambda * deltaTime));
    }
    function modulo(n, d) {
        return ((n % d) + d) % d;
    }

    class Animate {
        constructor() {
            this.isRunning = false;
            this.value = 0;
            this.from = 0;
            this.to = 0;
            this.currentTime = 0;
        }
        advance(deltaTime) {
            var _a;
            if (!this.isRunning)
                return;
            let completed = false;
            if (this.duration && this.easing) {
                this.currentTime += deltaTime;
                const linearProgress = clamp(0, this.currentTime / this.duration, 1);
                completed = linearProgress >= 1;
                const easedProgress = completed ? 1 : this.easing(linearProgress);
                this.value = this.from + (this.to - this.from) * easedProgress;
            }
            else if (this.lerp) {
                this.value = damp(this.value, this.to, this.lerp * 60, deltaTime);
                if (Math.round(this.value) === this.to) {
                    this.value = this.to;
                    completed = true;
                }
            }
            else {
                this.value = this.to;
                completed = true;
            }
            if (completed) {
                this.stop();
            }
            (_a = this.onUpdate) === null || _a === void 0 ? void 0 : _a.call(this, this.value, completed);
        }
        stop() {
            this.isRunning = false;
        }
        fromTo(from, to, { lerp = 0.1, duration = 1, easing = (t) => t, onStart, onUpdate, }) {
            this.from = this.value = from;
            this.to = to;
            this.lerp = lerp;
            this.duration = duration;
            this.easing = easing;
            this.currentTime = 0;
            this.isRunning = true;
            onStart === null || onStart === void 0 ? void 0 : onStart();
            this.onUpdate = onUpdate;
        }
    }

    function debounce(callback, delay) {
        let timer;
        return function (...args) {
            let context = this;
            clearTimeout(timer);
            timer = setTimeout(() => {
                timer = undefined;
                callback.apply(context, args);
            }, delay);
        };
    }

    class Dimensions {
        constructor(wrapper, content, { autoResize = true, debounce: debounceValue = 250 } = {}) {
            this.wrapper = wrapper;
            this.content = content;
            this.width = 0;
            this.height = 0;
            this.scrollHeight = 0;
            this.scrollWidth = 0;
            this.resize = () => {
                this.onWrapperResize();
                this.onContentResize();
            };
            this.onWrapperResize = () => {
                if (this.wrapper instanceof Window) {
                    this.width = window.innerWidth;
                    this.height = window.innerHeight;
                }
                else {
                    this.width = this.wrapper.clientWidth;
                    this.height = this.wrapper.clientHeight;
                }
            };
            this.onContentResize = () => {
                if (this.wrapper instanceof Window) {
                    this.scrollHeight = this.content.scrollHeight;
                    this.scrollWidth = this.content.scrollWidth;
                }
                else {
                    this.scrollHeight = this.wrapper.scrollHeight;
                    this.scrollWidth = this.wrapper.scrollWidth;
                }
            };
            if (autoResize) {
                this.debouncedResize = debounce(this.resize, debounceValue);
                if (this.wrapper instanceof Window) {
                    window.addEventListener('resize', this.debouncedResize, false);
                }
                else {
                    this.wrapperResizeObserver = new ResizeObserver(this.debouncedResize);
                    this.wrapperResizeObserver.observe(this.wrapper);
                }
                this.contentResizeObserver = new ResizeObserver(this.debouncedResize);
                this.contentResizeObserver.observe(this.content);
            }
            this.resize();
        }
        destroy() {
            var _a, _b;
            (_a = this.wrapperResizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
            (_b = this.contentResizeObserver) === null || _b === void 0 ? void 0 : _b.disconnect();
            if (this.wrapper === window && this.debouncedResize) {
                window.removeEventListener('resize', this.debouncedResize, false);
            }
        }
        get limit() {
            return {
                x: this.scrollWidth - this.width,
                y: this.scrollHeight - this.height,
            };
        }
    }

    class Emitter {
        constructor() {
            this.events = {};
        }
        emit(event, ...args) {
            var _a;
            let callbacks = this.events[event] || [];
            for (let i = 0, length = callbacks.length; i < length; i++) {
                (_a = callbacks[i]) === null || _a === void 0 ? void 0 : _a.call(callbacks, ...args);
            }
        }
        on(event, cb) {
            var _a;
            ((_a = this.events[event]) === null || _a === void 0 ? void 0 : _a.push(cb)) || (this.events[event] = [cb]);
            return () => {
                var _a;
                this.events[event] = (_a = this.events[event]) === null || _a === void 0 ? void 0 : _a.filter((i) => cb !== i);
            };
        }
        off(event, callback) {
            var _a;
            this.events[event] = (_a = this.events[event]) === null || _a === void 0 ? void 0 : _a.filter((i) => callback !== i);
        }
        destroy() {
            this.events = {};
        }
    }

    const LINE_HEIGHT = 100 / 6;
    const listenerOptions = { passive: false };
    class VirtualScroll {
        constructor(element, options = { wheelMultiplier: 1, touchMultiplier: 1 }) {
            this.element = element;
            this.options = options;
            this.touchStart = {
                x: 0,
                y: 0,
            };
            this.lastDelta = {
                x: 0,
                y: 0,
            };
            this.window = {
                width: 0,
                height: 0,
            };
            this.emitter = new Emitter();
            this.onTouchStart = (event) => {
                const { clientX, clientY } = event.targetTouches
                    ? event.targetTouches[0]
                    : event;
                this.touchStart.x = clientX;
                this.touchStart.y = clientY;
                this.lastDelta = {
                    x: 0,
                    y: 0,
                };
                this.emitter.emit('scroll', {
                    deltaX: 0,
                    deltaY: 0,
                    event,
                });
            };
            this.onTouchMove = (event) => {
                const { clientX, clientY } = event.targetTouches
                    ? event.targetTouches[0]
                    : event;
                const deltaX = -(clientX - this.touchStart.x) * this.options.touchMultiplier;
                const deltaY = -(clientY - this.touchStart.y) * this.options.touchMultiplier;
                this.touchStart.x = clientX;
                this.touchStart.y = clientY;
                this.lastDelta = {
                    x: deltaX,
                    y: deltaY,
                };
                this.emitter.emit('scroll', {
                    deltaX,
                    deltaY,
                    event,
                });
            };
            this.onTouchEnd = (event) => {
                this.emitter.emit('scroll', {
                    deltaX: this.lastDelta.x,
                    deltaY: this.lastDelta.y,
                    event,
                });
            };
            this.onWheel = (event) => {
                let { deltaX, deltaY, deltaMode } = event;
                const multiplierX = deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.window.width : 1;
                const multiplierY = deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.window.height : 1;
                deltaX *= multiplierX;
                deltaY *= multiplierY;
                deltaX *= this.options.wheelMultiplier;
                deltaY *= this.options.wheelMultiplier;
                this.emitter.emit('scroll', { deltaX, deltaY, event });
            };
            this.onWindowResize = () => {
                this.window = {
                    width: window.innerWidth,
                    height: window.innerHeight,
                };
            };
            window.addEventListener('resize', this.onWindowResize, false);
            this.onWindowResize();
            this.element.addEventListener('wheel', this.onWheel, listenerOptions);
            this.element.addEventListener('touchstart', this.onTouchStart, listenerOptions);
            this.element.addEventListener('touchmove', this.onTouchMove, listenerOptions);
            this.element.addEventListener('touchend', this.onTouchEnd, listenerOptions);
        }
        on(event, callback) {
            return this.emitter.on(event, callback);
        }
        destroy() {
            this.emitter.destroy();
            window.removeEventListener('resize', this.onWindowResize, false);
            this.element.removeEventListener('wheel', this.onWheel, listenerOptions);
            this.element.removeEventListener('touchstart', this.onTouchStart, listenerOptions);
            this.element.removeEventListener('touchmove', this.onTouchMove, listenerOptions);
            this.element.removeEventListener('touchend', this.onTouchEnd, listenerOptions);
        }
    }

    var _Lenis_isScrolling, _Lenis_isStopped, _Lenis_isLocked, _Lenis_preventNextNativeScrollEvent, _Lenis_resetVelocityTimeout;
    class Lenis {
        constructor({ wrapper = window, content = document.documentElement, eventsTarget = wrapper, smoothWheel = true, syncTouch = false, syncTouchLerp = 0.075, touchInertiaMultiplier = 35, duration, easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), lerp = 0.1, infinite = false, orientation = 'vertical', gestureOrientation = 'vertical', touchMultiplier = 1, wheelMultiplier = 1, autoResize = true, prevent, virtualScroll, __experimental__naiveDimensions = false, } = {}) {
            _Lenis_isScrolling.set(this, false);
            _Lenis_isStopped.set(this, false);
            _Lenis_isLocked.set(this, false);
            _Lenis_preventNextNativeScrollEvent.set(this, false);
            _Lenis_resetVelocityTimeout.set(this, null);
            this.time = 0;
            this.userData = {};
            this.lastVelocity = 0;
            this.velocity = 0;
            this.direction = 0;
            this.animate = new Animate();
            this.emitter = new Emitter();
            this.onPointerDown = (event) => {
                if (event.button === 1) {
                    this.reset();
                }
            };
            this.onVirtualScroll = (data) => {
                if (typeof this.options.virtualScroll === 'function' &&
                    this.options.virtualScroll(data) === false)
                    return;
                const { deltaX, deltaY, event } = data;
                this.emitter.emit('virtual-scroll', { deltaX, deltaY, event });
                if (event.ctrlKey)
                    return;
                const isTouch = event.type.includes('touch');
                const isWheel = event.type.includes('wheel');
                this.isTouching = event.type === 'touchstart' || event.type === 'touchmove';
                const isTapToStop = this.options.syncTouch &&
                    isTouch &&
                    event.type === 'touchstart' &&
                    !this.isStopped &&
                    !this.isLocked;
                if (isTapToStop) {
                    this.reset();
                    return;
                }
                const isClick = deltaX === 0 && deltaY === 0;
                const isUnknownGesture = (this.options.gestureOrientation === 'vertical' && deltaY === 0) ||
                    (this.options.gestureOrientation === 'horizontal' && deltaX === 0);
                if (isClick || isUnknownGesture) {
                    return;
                }
                let composedPath = event.composedPath();
                composedPath = composedPath.slice(0, composedPath.indexOf(this.rootElement));
                const prevent = this.options.prevent;
                if (!!composedPath.find((node) => {
                    var _a, _b, _c, _d, _e;
                    return node instanceof HTMLElement &&
                        ((typeof prevent === 'function' && (prevent === null || prevent === void 0 ? void 0 : prevent(node))) ||
                            ((_a = node.hasAttribute) === null || _a === void 0 ? void 0 : _a.call(node, 'data-lenis-prevent')) ||
                            (isTouch && ((_b = node.hasAttribute) === null || _b === void 0 ? void 0 : _b.call(node, 'data-lenis-prevent-touch'))) ||
                            (isWheel && ((_c = node.hasAttribute) === null || _c === void 0 ? void 0 : _c.call(node, 'data-lenis-prevent-wheel'))) ||
                            (((_d = node.classList) === null || _d === void 0 ? void 0 : _d.contains('lenis')) &&
                                !((_e = node.classList) === null || _e === void 0 ? void 0 : _e.contains('lenis-stopped'))));
                }))
                    return;
                if (this.isStopped || this.isLocked) {
                    event.preventDefault();
                    return;
                }
                const isSmooth = (this.options.syncTouch && isTouch) ||
                    (this.options.smoothWheel && isWheel);
                if (!isSmooth) {
                    this.isScrolling = 'native';
                    this.animate.stop();
                    return;
                }
                event.preventDefault();
                let delta = deltaY;
                if (this.options.gestureOrientation === 'both') {
                    delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
                }
                else if (this.options.gestureOrientation === 'horizontal') {
                    delta = deltaX;
                }
                const syncTouch = isTouch && this.options.syncTouch;
                const isTouchEnd = isTouch && event.type === 'touchend';
                const hasTouchInertia = isTouchEnd && Math.abs(delta) > 5;
                if (hasTouchInertia) {
                    delta = this.velocity * this.options.touchInertiaMultiplier;
                }
                this.scrollTo(this.targetScroll + delta, Object.assign({ programmatic: false }, (syncTouch
                    ? {
                        lerp: hasTouchInertia ? this.options.syncTouchLerp : 1,
                    }
                    : {
                        lerp: this.options.lerp,
                        duration: this.options.duration,
                        easing: this.options.easing,
                    })));
            };
            this.onNativeScroll = () => {
                if (__classPrivateFieldGet(this, _Lenis_resetVelocityTimeout, "f") !== null) {
                    clearTimeout(__classPrivateFieldGet(this, _Lenis_resetVelocityTimeout, "f"));
                    __classPrivateFieldSet(this, _Lenis_resetVelocityTimeout, null, "f");
                }
                if (__classPrivateFieldGet(this, _Lenis_preventNextNativeScrollEvent, "f")) {
                    __classPrivateFieldSet(this, _Lenis_preventNextNativeScrollEvent, false, "f");
                    return;
                }
                if (this.isScrolling === false || this.isScrolling === 'native') {
                    const lastScroll = this.animatedScroll;
                    this.animatedScroll = this.targetScroll = this.actualScroll;
                    this.lastVelocity = this.velocity;
                    this.velocity = this.animatedScroll - lastScroll;
                    this.direction = Math.sign(this.animatedScroll - lastScroll);
                    this.isScrolling = 'native';
                    this.emit();
                    if (this.velocity !== 0) {
                        __classPrivateFieldSet(this, _Lenis_resetVelocityTimeout, setTimeout(() => {
                            this.lastVelocity = this.velocity;
                            this.velocity = 0;
                            this.isScrolling = false;
                            this.emit();
                        }, 400), "f");
                    }
                }
            };
            window.lenisVersion = version;
            if (!wrapper ||
                wrapper === document.documentElement ||
                wrapper === document.body) {
                wrapper = window;
            }
            this.options = {
                wrapper,
                content,
                eventsTarget,
                smoothWheel,
                syncTouch,
                syncTouchLerp,
                touchInertiaMultiplier,
                duration,
                easing,
                lerp,
                infinite,
                gestureOrientation,
                orientation,
                touchMultiplier,
                wheelMultiplier,
                autoResize,
                prevent,
                virtualScroll,
                __experimental__naiveDimensions,
            };
            this.dimensions = new Dimensions(wrapper, content, { autoResize });
            this.updateClassName();
            this.targetScroll = this.animatedScroll = this.actualScroll;
            this.options.wrapper.addEventListener('scroll', this.onNativeScroll, false);
            this.options.wrapper.addEventListener('pointerdown', this.onPointerDown, false);
            this.virtualScroll = new VirtualScroll(eventsTarget, {
                touchMultiplier,
                wheelMultiplier,
            });
            this.virtualScroll.on('scroll', this.onVirtualScroll);
        }
        destroy() {
            this.emitter.destroy();
            this.options.wrapper.removeEventListener('scroll', this.onNativeScroll, false);
            this.options.wrapper.removeEventListener('pointerdown', this.onPointerDown, false);
            this.virtualScroll.destroy();
            this.dimensions.destroy();
            this.cleanUpClassName();
        }
        on(event, callback) {
            return this.emitter.on(event, callback);
        }
        off(event, callback) {
            return this.emitter.off(event, callback);
        }
        setScroll(scroll) {
            if (this.isHorizontal) {
                this.rootElement.scrollLeft = scroll;
            }
            else {
                this.rootElement.scrollTop = scroll;
            }
        }
        resize() {
            this.dimensions.resize();
        }
        emit() {
            this.emitter.emit('scroll', this);
        }
        reset() {
            this.isLocked = false;
            this.isScrolling = false;
            this.animatedScroll = this.targetScroll = this.actualScroll;
            this.lastVelocity = this.velocity = 0;
            this.animate.stop();
        }
        start() {
            if (!this.isStopped)
                return;
            this.isStopped = false;
            this.reset();
        }
        stop() {
            if (this.isStopped)
                return;
            this.isStopped = true;
            this.animate.stop();
            this.reset();
        }
        raf(time) {
            const deltaTime = time - (this.time || time);
            this.time = time;
            this.animate.advance(deltaTime * 0.001);
        }
        scrollTo(target, { offset = 0, immediate = false, lock = false, duration = this.options.duration, easing = this.options.easing, lerp = this.options.lerp, onStart, onComplete, force = false, programmatic = true, userData, } = {}) {
            if ((this.isStopped || this.isLocked) && !force)
                return;
            if (typeof target === 'string' &&
                ['top', 'left', 'start'].includes(target)) {
                target = 0;
            }
            else if (typeof target === 'string' &&
                ['bottom', 'right', 'end'].includes(target)) {
                target = this.limit;
            }
            else {
                let node;
                if (typeof target === 'string') {
                    node = document.querySelector(target);
                }
                else if (target instanceof HTMLElement && (target === null || target === void 0 ? void 0 : target.nodeType)) {
                    node = target;
                }
                if (node) {
                    if (this.options.wrapper !== window) {
                        const wrapperRect = this.rootElement.getBoundingClientRect();
                        offset -= this.isHorizontal ? wrapperRect.left : wrapperRect.top;
                    }
                    const rect = node.getBoundingClientRect();
                    target =
                        (this.isHorizontal ? rect.left : rect.top) + this.animatedScroll;
                }
            }
            if (typeof target !== 'number')
                return;
            target += offset;
            target = Math.round(target);
            if (this.options.infinite) {
                if (programmatic) {
                    this.targetScroll = this.animatedScroll = this.scroll;
                }
            }
            else {
                target = clamp(0, target, this.limit);
            }
            if (target === this.targetScroll)
                return;
            this.userData = userData !== null && userData !== void 0 ? userData : {};
            if (immediate) {
                this.animatedScroll = this.targetScroll = target;
                this.setScroll(this.scroll);
                this.reset();
                this.preventNextNativeScrollEvent();
                this.emit();
                onComplete === null || onComplete === void 0 ? void 0 : onComplete(this);
                this.userData = {};
                return;
            }
            if (!programmatic) {
                this.targetScroll = target;
            }
            this.animate.fromTo(this.animatedScroll, target, {
                duration,
                easing,
                lerp,
                onStart: () => {
                    if (lock)
                        this.isLocked = true;
                    this.isScrolling = 'smooth';
                    onStart === null || onStart === void 0 ? void 0 : onStart(this);
                },
                onUpdate: (value, completed) => {
                    this.isScrolling = 'smooth';
                    this.lastVelocity = this.velocity;
                    this.velocity = value - this.animatedScroll;
                    this.direction = Math.sign(this.velocity);
                    this.animatedScroll = value;
                    this.setScroll(this.scroll);
                    if (programmatic) {
                        this.targetScroll = value;
                    }
                    if (!completed)
                        this.emit();
                    if (completed) {
                        this.reset();
                        this.emit();
                        onComplete === null || onComplete === void 0 ? void 0 : onComplete(this);
                        this.userData = {};
                        this.preventNextNativeScrollEvent();
                    }
                },
            });
        }
        preventNextNativeScrollEvent() {
            __classPrivateFieldSet(this, _Lenis_preventNextNativeScrollEvent, true, "f");
            requestAnimationFrame(() => {
                __classPrivateFieldSet(this, _Lenis_preventNextNativeScrollEvent, false, "f");
            });
        }
        get rootElement() {
            return (this.options.wrapper === window
                ? document.documentElement
                : this.options.wrapper);
        }
        get limit() {
            if (this.options.__experimental__naiveDimensions) {
                if (this.isHorizontal) {
                    return this.rootElement.scrollWidth - this.rootElement.clientWidth;
                }
                else {
                    return this.rootElement.scrollHeight - this.rootElement.clientHeight;
                }
            }
            else {
                return this.dimensions.limit[this.isHorizontal ? 'x' : 'y'];
            }
        }
        get isHorizontal() {
            return this.options.orientation === 'horizontal';
        }
        get actualScroll() {
            return this.isHorizontal
                ? this.rootElement.scrollLeft
                : this.rootElement.scrollTop;
        }
        get scroll() {
            return this.options.infinite
                ? modulo(this.animatedScroll, this.limit)
                : this.animatedScroll;
        }
        get progress() {
            return this.limit === 0 ? 1 : this.scroll / this.limit;
        }
        get isScrolling() {
            return __classPrivateFieldGet(this, _Lenis_isScrolling, "f");
        }
        set isScrolling(value) {
            if (__classPrivateFieldGet(this, _Lenis_isScrolling, "f") !== value) {
                __classPrivateFieldSet(this, _Lenis_isScrolling, value, "f");
                this.updateClassName();
            }
        }
        get isStopped() {
            return __classPrivateFieldGet(this, _Lenis_isStopped, "f");
        }
        set isStopped(value) {
            if (__classPrivateFieldGet(this, _Lenis_isStopped, "f") !== value) {
                __classPrivateFieldSet(this, _Lenis_isStopped, value, "f");
                this.updateClassName();
            }
        }
        get isLocked() {
            return __classPrivateFieldGet(this, _Lenis_isLocked, "f");
        }
        set isLocked(value) {
            if (__classPrivateFieldGet(this, _Lenis_isLocked, "f") !== value) {
                __classPrivateFieldSet(this, _Lenis_isLocked, value, "f");
                this.updateClassName();
            }
        }
        get isSmooth() {
            return this.isScrolling === 'smooth';
        }
        get className() {
            let className = 'lenis';
            if (this.isStopped)
                className += ' lenis-stopped';
            if (this.isLocked)
                className += ' lenis-locked';
            if (this.isScrolling)
                className += ' lenis-scrolling';
            if (this.isScrolling === 'smooth')
                className += ' lenis-smooth';
            return className;
        }
        updateClassName() {
            this.cleanUpClassName();
            this.rootElement.className =
                `${this.rootElement.className} ${this.className}`.trim();
        }
        cleanUpClassName() {
            this.rootElement.className = this.rootElement.className
                .replace(/lenis(-\w+)?/g, '')
                .trim();
        }
    }
    _Lenis_isScrolling = new WeakMap(), _Lenis_isStopped = new WeakMap(), _Lenis_isLocked = new WeakMap(), _Lenis_preventNextNativeScrollEvent = new WeakMap(), _Lenis_resetVelocityTimeout = new WeakMap();

    return Lenis;

}));
//# sourceMappingURL=lenis.js.map
