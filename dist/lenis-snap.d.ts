import Lenis, { UserData, EasingFunction } from 'lenis';

type SnapElementOptions = {
    align?: string[];
    ignoreSticky?: boolean;
    ignoreTransform?: boolean;
};
type Rect = {
    top: number;
    left: number;
    width: number;
    height: number;
    x: number;
    y: number;
    bottom: number;
    right: number;
    element: HTMLElement;
};
declare class SnapElement {
    element: HTMLElement;
    options: SnapElementOptions;
    align: string[];
    rect: Rect;
    wrapperResizeObserver: ResizeObserver;
    resizeObserver: ResizeObserver;
    constructor(element: HTMLElement, { align, ignoreSticky, ignoreTransform, }?: SnapElementOptions);
    destroy(): void;
    setRect({ top, left, width, height, element, }?: {
        top?: number;
        left?: number;
        width?: number;
        height?: number;
        element?: HTMLElement;
    }): void;
    onWrapperResize: () => void;
    onResize: ([entry]: ResizeObserverEntry[]) => void;
}

type SnapItem = {
    value: number;
    userData: UserData;
};
type OnSnapCallback = (item: SnapItem) => void;
type SnapOptions = {
    type?: 'mandatory' | 'proximity';
    lerp?: number;
    easing?: EasingFunction;
    duration?: number;
    velocityThreshold?: number;
    debounce?: number;
    onSnapStart?: OnSnapCallback;
    onSnapComplete?: OnSnapCallback;
};

type UID = number;

type RequiredPick<T, F extends keyof T> = Omit<T, F> & Required<Pick<T, F>>;
declare class Snap {
    private lenis;
    options: RequiredPick<SnapOptions, 'type' | 'velocityThreshold' | 'debounce'>;
    elements: Map<number, SnapElement>;
    snaps: Map<number, SnapItem>;
    viewport: {
        width: number;
        height: number;
    };
    isStopped: boolean;
    onSnapDebounced: () => void;
    constructor(lenis: Lenis, { type, lerp, easing, duration, velocityThreshold, debounce: debounceDelay, onSnapStart, onSnapComplete, }?: SnapOptions);
    destroy(): void;
    start(): void;
    stop(): void;
    add(value: number, userData?: UserData): () => void;
    remove(id: UID): void;
    addElement(element: HTMLElement, options?: SnapElementOptions): () => void;
    removeElement(id: UID): void;
    private onWindowResize;
    private onScroll;
    private onSnap;
}

export { type OnSnapCallback, type SnapItem, type SnapOptions, Snap as default };
