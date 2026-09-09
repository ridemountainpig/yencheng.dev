"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { LiveShowEvent } from "@/components/live-data";
import styles from "@/components/live-show-preview.module.css";

export function useLiveShowPreview(events: LiveShowEvent[]) {
    const previewId = useId();
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [exiting, setExiting] = useState(false);
    const [instant, setInstant] = useState(false);
    const [activeEvent, setActiveEvent] = useState<LiveShowEvent | null>(null);
    const [loadedImage, setLoadedImage] = useState<string | null>(null);
    const pointer = useRef<{ x: number; y: number } | null>(null);
    const scrollFrame = useRef<number | null>(null);
    const show = activeEvent?.show;
    const [position, setPosition] = useState<{
        left: number;
        top: number;
        width: number;
    } | null>(null);

    function keepOpen() {
        if (closeTimer.current !== null) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    }

    function close() {
        keepOpen();
        setExiting(true);
    }

    function scheduleClose() {
        keepOpen();
        closeTimer.current = setTimeout(close, 120);
    }

    function open(
        event: LiveShowEvent,
        trigger: HTMLButtonElement,
        keyboard = false,
    ) {
        if (!event.show.image) {
            close();
            return;
        }
        setActiveEvent(event);
        keepOpen();
        setExiting(false);
        setInstant(keyboard);

        const rect = trigger.getBoundingClientRect();
        const margin = 16;
        const gap = 12;
        const width = Math.min(
            400,
            window.innerWidth - margin * 2,
            ((window.innerHeight - margin * 2) * 4) / 3,
        );
        const height = (width * 3) / 4;
        let left = rect.left - width - gap;
        let top = rect.top + (rect.height - height) / 2;

        if (left < margin) {
            left = rect.right + gap;
            if (left + width > window.innerWidth - margin) {
                left = Math.max(margin, (window.innerWidth - width) / 2);
                top = rect.top - height - gap;
                if (top < margin) top = rect.bottom + gap;
            }
        }

        setPosition({
            left,
            top: Math.max(
                margin,
                Math.min(top, window.innerHeight - height - margin),
            ),
            width,
        });
    }

    const isOpen = position !== null && !exiting;
    useEffect(() => {
        if (!exiting) return;

        // Keep the image mounted until its blur/fade transition finishes. This also
        // cleans up if transitionend is skipped in a background tab.
        const timer = setTimeout(() => setPosition(null), instant ? 0 : 480);
        return () => clearTimeout(timer);
    }, [exiting, instant]);

    useEffect(() => {
        if (!isOpen) return;

        const dismiss = () => setExiting(true);
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setInstant(true);
                dismiss();
            }
        };
        window.addEventListener("resize", dismiss);
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("resize", dismiss);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen]);

    useEffect(
        () => () => {
            if (closeTimer.current !== null) clearTimeout(closeTimer.current);
            if (scrollFrame.current !== null)
                cancelAnimationFrame(scrollFrame.current);
        },
        [],
    );

    function syncHoveredShow() {
        scrollFrame.current = null;
        if (!pointer.current) return;
        const { x, y } = pointer.current;
        const trigger = document
            .elementFromPoint(x, y)
            ?.closest<HTMLButtonElement>("button[data-live-show]");
        const event = events.find(
            (event) => event.key === trigger?.dataset.liveShow,
        );
        if (trigger && event) {
            open(event, trigger);
        } else {
            close();
        }
    }

    return {
        timelineProps: {
            onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
                if (event.pointerType !== "mouse") {
                    pointer.current = null;
                    close();
                }
            },
            onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
                if (event.pointerType === "mouse") {
                    pointer.current = { x: event.clientX, y: event.clientY };
                }
            },
            onPointerLeave: () => {
                pointer.current = null;
                scheduleClose();
            },
            onScroll: () => {
                // Scrolling can move a different row under a stationary cursor
                // without firing pointerenter. Resolve the row after layout.
                if (scrollFrame.current === null) {
                    scrollFrame.current =
                        requestAnimationFrame(syncHoveredShow);
                }
            },
        },
        getTriggerProps: (event: LiveShowEvent) => ({
            "data-live-show": event.key,
            "aria-describedby":
                isOpen && activeEvent?.key === event.key
                    ? previewId
                    : undefined,
            onPointerEnter: (
                pointerEvent: React.PointerEvent<HTMLButtonElement>,
            ) => {
                if (
                    pointerEvent.pointerType === "mouse" &&
                    window.matchMedia("(hover: hover) and (pointer: fine)")
                        .matches
                ) {
                    pointer.current = {
                        x: pointerEvent.clientX,
                        y: pointerEvent.clientY,
                    };
                    open(event, pointerEvent.currentTarget);
                }
            },
            onPointerLeave: scheduleClose,
            onFocus: (focusEvent: React.FocusEvent<HTMLButtonElement>) => {
                if (focusEvent.currentTarget.matches(":focus-visible")) {
                    pointer.current = null;
                    open(event, focusEvent.currentTarget, true);
                }
            },
            onBlur: close,
        }),
        close,
        preview:
            position && show?.image
                ? createPortal(
                      <div
                          key={activeEvent?.key}
                          id={previewId}
                          role="tooltip"
                          aria-hidden={exiting || undefined}
                          data-state={exiting ? "closing" : "open"}
                          data-instant={instant || undefined}
                          data-ready={loadedImage === show.image}
                          className={styles.preview}
                          style={position}
                          onTransitionEnd={(event) => {
                              if (
                                  exiting &&
                                  event.target === event.currentTarget &&
                                  event.propertyName === "opacity"
                              ) {
                                  setPosition(null);
                              }
                          }}
                      >
                          <div className={styles.image}>
                              <Image
                                  src={show.image}
                                  alt={`${show.artist} ${show.title} — ${show.venue}, ${show.date}`}
                                  width={1448}
                                  height={1086}
                                  sizes="(max-width: 432px) calc(100vw - 32px), 400px"
                                  className="block h-auto w-full"
                                  loading="eager"
                                  onLoad={() =>
                                      setLoadedImage(show.image ?? null)
                                  }
                                  onError={close}
                              />
                          </div>
                      </div>,
                      document.body,
                  )
                : null,
    };
}
