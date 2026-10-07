/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PHOTO_HOST = "https://r2.yencheng.dev";
const DURATION_MS = 450;
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
/** Size assumed for a photo that failed to load, so the box still opens. */
const FALLBACK_SIZE = { width: 1200, height: 1600 };

export type Size = { width: number; height: number };
type Rect = Size & { left: number; top: number };

export type LightboxImage = {
    paths: string[];
    description?: string;
    date?: string;
};

function photoUrl(path: string) {
    return PHOTO_HOST + path;
}

function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The largest box with the photo's aspect that fits 90% of the viewport. */
function fitRect(photo: Size, viewport: Size): Rect {
    const scale = Math.min(
        (viewport.width * 0.9) / photo.width,
        (viewport.height * 0.9) / photo.height,
        1,
    );
    const width = photo.width * scale;
    const height = photo.height * scale;
    return {
        width,
        height,
        left: (viewport.width - width) / 2,
        top: (viewport.height - height) / 2,
    };
}

/**
 * Transform and clip that make the fitted box look exactly like `origin`:
 * the whole photo scaled to cover it (as object-cover crops it), then
 * clipped back to its frame. Clip insets are in the box's unscaled units.
 */
function originFrame(origin: HTMLElement, box: Rect): Keyframe {
    const from = origin.getBoundingClientRect();
    const scale = Math.max(from.width / box.width, from.height / box.height);
    const dx = from.left + from.width / 2 - (box.left + box.width / 2);
    const dy = from.top + from.height / 2 - (box.top + box.height / 2);
    const insetX = (box.width - from.width / scale) / 2;
    const insetY = (box.height - from.height / scale) / 2;
    // Clamp, since rounded-full reports an effectively infinite radius
    // that would keep the clip an ellipse for nearly the whole flight.
    const radius =
        Math.min(
            parseFloat(getComputedStyle(origin).borderTopLeftRadius) || 0,
            Math.min(from.width, from.height) / 2,
        ) / scale;
    return {
        transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
        clipPath: `inset(${insetY}px ${insetX}px round ${radius}px)`,
    };
}

const SETTLED: Keyframe = {
    transform: "none",
    clipPath: "inset(0px 0px round 0px)",
};

function loadSize(path: string): Promise<Size> {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () =>
            resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => resolve(FALLBACK_SIZE);
        image.src = photoUrl(path);
    });
}

type Phase = "opening" | "open" | "closing";

interface PhotoLightboxProps {
    image: LightboxImage;
    startIndex: number;
    /** Element the photo zooms out of, and back into on close. */
    origin: HTMLElement | null;
    /** Natural size of the starting photo, when it is already on screen. */
    startSize?: Size;
    /** Called as the lightbox closes, so the origin can show the same photo. */
    onIndexChange?: (index: number) => void;
    onClosed: () => void;
}

/**
 * Shared-element fullscreen photo. The box is laid out at its final,
 * fitted position and flies in from the origin with a transform and a
 * clip, so the cropped thumbnail grows into the whole photo.
 */
export default function PhotoLightbox({
    image,
    startIndex,
    origin,
    startSize,
    onIndexChange,
    onClosed,
}: PhotoLightboxProps) {
    const dialogRef = React.useRef<HTMLDivElement>(null);
    const boxRef = React.useRef<HTMLDivElement>(null);
    const backdropRef = React.useRef<HTMLDivElement>(null);
    const closeRef = React.useRef<HTMLButtonElement>(null);
    const flightRef = React.useRef<Animation | null>(null);
    const fadeRef = React.useRef<Animation | null>(null);
    const closingRef = React.useRef(false);
    const navRequestRef = React.useRef(0);
    const onClosedRef = React.useRef(onClosed);
    // Whatever had focus before opening gets it back on close.
    const [opener] = React.useState(
        () => document.activeElement as HTMLElement | null,
    );

    const [phase, setPhase] = React.useState<Phase>("opening");
    const [index, setIndex] = React.useState(startIndex);
    const [sizes, setSizes] = React.useState<Record<string, Size>>(() =>
        startSize ? { [image.paths[startIndex]]: startSize } : {},
    );
    const [viewport, setViewport] = React.useState<Size>(() => ({
        width: window.innerWidth,
        height: window.innerHeight,
    }));

    const path = image.paths[index];
    const size = sizes[path];
    const box = React.useMemo(
        () => (size ? fitRect(size, viewport) : null),
        [size, viewport],
    );
    const hasMany = image.paths.length > 1;

    const rememberSize = React.useCallback(async (photo: string) => {
        const loaded = await loadSize(photo);
        setSizes((prev) => ({ ...prev, [photo]: loaded }));
    }, []);

    React.useEffect(() => {
        const onResize = () =>
            setViewport({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Know every size ahead of time: the current photo if the origin could
    // not tell, and its neighbours so stepping through them never waits.
    React.useEffect(() => {
        const count = image.paths.length;
        const wanted = [index, index + 1, index - 1].map(
            (i) => image.paths[(i + count) % count],
        );
        for (const photo of new Set(wanted)) {
            if (!sizes[photo]) void rememberSize(photo);
        }
    }, [image.paths, index, sizes, rememberSize]);

    React.useEffect(() => {
        onClosedRef.current = onClosed;
    });

    // Fly in once the first photo's box is known.
    React.useLayoutEffect(() => {
        const boxEl = boxRef.current;
        const backdrop = backdropRef.current;
        if (!box || !boxEl || !backdrop || flightRef.current) return;

        const reduced = prefersReducedMotion();
        // Holding both ends means a reversed flight stays on the origin
        // until the lightbox unmounts, instead of flashing back open.
        const timing: KeyframeAnimationOptions = {
            duration: reduced ? 200 : DURATION_MS,
            easing: EASE,
            fill: "both",
        };
        fadeRef.current = backdrop.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            timing,
        );
        flightRef.current =
            origin && !reduced
                ? boxEl.animate([originFrame(origin, box), SETTLED], timing)
                : boxEl.animate([{ opacity: 0 }, { opacity: 1 }], timing);
        flightRef.current.finished
            .then(() =>
                setPhase((current) =>
                    current === "opening" ? "open" : current,
                ),
            )
            .catch(() => {});
        closeRef.current?.focus({ preventScroll: true });
    }, [box, origin]);

    // Fly back into the origin. Closing mid-flight just plays it backwards.
    React.useLayoutEffect(() => {
        if (phase !== "closing" || closingRef.current) return;
        closingRef.current = true;
        const finishClosing = () => onClosedRef.current();
        const boxEl = boxRef.current;
        const backdrop = backdropRef.current;
        const flight = flightRef.current;
        if (!box || !boxEl || !backdrop || !flight) {
            finishClosing();
            return;
        }

        if (flight.playState === "running") {
            fadeRef.current?.reverse();
            flight.reverse();
            flight.finished.then(finishClosing).catch(() => {});
            return;
        }

        const reduced = prefersReducedMotion();
        const timing: KeyframeAnimationOptions = {
            duration: reduced ? 200 : DURATION_MS,
            easing: EASE,
            fill: "forwards",
        };
        backdrop.animate([{ opacity: 1 }, { opacity: 0 }], timing);
        const back =
            origin && !reduced
                ? boxEl.animate([SETTLED, originFrame(origin, box)], timing)
                : boxEl.animate([{ opacity: 1 }, { opacity: 0 }], timing);
        back.finished.then(finishClosing).catch(() => {});
    }, [phase, box, origin]);

    const close = React.useCallback(() => {
        if (phase === "closing") return;
        onIndexChange?.(index);
        setPhase("closing");
    }, [phase, index, onIndexChange]);

    const step = React.useCallback(
        (direction: 1 | -1) => {
            if (phase !== "open" || !hasMany) return;
            const count = image.paths.length;
            const next = (index + direction + count) % count;
            const request = ++navRequestRef.current;
            const nextPath = image.paths[next];
            if (sizes[nextPath]) {
                setIndex(next);
                return;
            }
            // Keep the current photo up until the next one can be sized.
            void rememberSize(nextPath).then(() => {
                if (navRequestRef.current === request) setIndex(next);
            });
        },
        [phase, hasMany, image.paths, index, sizes, rememberSize],
    );

    React.useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                close();
            } else if (event.key === "ArrowLeft") {
                step(-1);
            } else if (event.key === "ArrowRight") {
                step(1);
            } else if (event.key === "Tab") {
                // Keep focus on the lightbox controls while it is open.
                const buttons = [
                    ...(dialogRef.current?.querySelectorAll<HTMLElement>(
                        "button",
                    ) ?? []),
                ];
                if (buttons.length === 0) return;
                event.preventDefault();
                const current = buttons.indexOf(
                    document.activeElement as HTMLElement,
                );
                const offset = event.shiftKey ? -1 : 1;
                buttons[
                    (current + offset + buttons.length) % buttons.length
                ].focus();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [close, step]);

    React.useEffect(() => {
        return () => opener?.focus({ preventScroll: true });
    }, [opener]);

    const controlsClassName = cn(
        "transition-opacity duration-200",
        phase === "open" ? "opacity-100" : "pointer-events-none opacity-0",
    );
    const buttonClassName =
        "absolute z-10 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20";

    return (
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={image.description || "Photo"}
            className="fixed inset-0 z-50"
            onClick={close}
        >
            <div
                ref={backdropRef}
                className="absolute inset-0 bg-black/90"
                style={{ opacity: box ? 1 : 0 }}
            />

            {box && (
                <div
                    ref={boxRef}
                    className="fixed overflow-hidden will-change-transform"
                    style={{
                        left: box.left,
                        top: box.top,
                        width: box.width,
                        height: box.height,
                    }}
                    onClick={(event) => event.stopPropagation()}
                >
                    <img
                        src={photoUrl(path)}
                        alt={image.description || ""}
                        draggable={false}
                        className="size-full object-cover select-none"
                    />
                    <div
                        className={cn(
                            "absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-4 text-white",
                            controlsClassName,
                        )}
                    >
                        <p className="font-medium">{image.description}</p>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-white/70 tabular-nums">
                                {image.date}
                            </p>
                            {hasMany && (
                                <p className="text-sm text-white/70 tabular-nums">
                                    {index + 1} / {image.paths.length}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <button
                ref={closeRef}
                type="button"
                onClick={close}
                className={cn(
                    buttonClassName,
                    "top-4 right-4",
                    controlsClassName,
                )}
                aria-label="Close fullscreen"
            >
                <X className="size-6" />
            </button>

            {hasMany && (
                <>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            step(-1);
                        }}
                        className={cn(
                            buttonClassName,
                            "top-1/2 left-4 -translate-y-1/2",
                            controlsClassName,
                        )}
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="size-6" />
                    </button>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            step(1);
                        }}
                        className={cn(
                            buttonClassName,
                            "top-1/2 right-4 -translate-y-1/2",
                            controlsClassName,
                        )}
                        aria-label="Next image"
                    >
                        <ChevronRight className="size-6" />
                    </button>
                </>
            )}
        </div>
    );
}
