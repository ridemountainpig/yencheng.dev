"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import type { LiveShowEvent } from "@/components/live-data";

export default function LiveShowImageDialog({
    event,
    onClose,
}: {
    event: LiveShowEvent;
    onClose: () => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        if (!dialogRef.current?.open) dialogRef.current?.showModal();
    }, []);

    return createPortal(
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onClose={onClose}
            onClick={(clickEvent) => {
                if (clickEvent.target === clickEvent.currentTarget) {
                    dialogRef.current?.close();
                }
            }}
            className="border-white-brown-600 bg-white-brown-100 text-white-brown-950 fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[min(44rem,calc(100vw-2rem))] max-w-none overflow-auto rounded-2xl border p-0 shadow-2xl backdrop:bg-black/55 backdrop:backdrop-blur-sm"
        >
            <div>
                <div className="flex items-center justify-between gap-3 py-2 pr-2 pl-4">
                    <h3 id={titleId} className="font-nunito text-sm font-bold">
                        {event.show.artist}
                    </h3>
                    <button
                        type="button"
                        autoFocus
                        aria-label="Close image"
                        onClick={() => dialogRef.current?.close()}
                        className="hover:bg-white-brown-400 focus-visible:outline-white-brown-800 flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2"
                    >
                        <X className="size-5" aria-hidden="true" />
                    </button>
                </div>
                {event.show.image && (
                    <Image
                        src={event.show.image}
                        alt={`${event.show.artist} ${event.show.title} — ${event.venue.name}, ${event.show.date}`}
                        width={1448}
                        height={1086}
                        sizes="(max-width: 736px) calc(100vw - 32px), 704px"
                        className="max-h-[calc(100dvh-10rem)] w-full object-contain"
                        loading="eager"
                    />
                )}
                <div className="font-nunito px-4 py-3">
                    <p className="text-sm font-bold">{event.show.title}</p>
                    <p className="text-white-brown-800 mt-1 text-xs">
                        {event.show.date} · {event.venue.name}
                    </p>
                </div>
            </div>
        </dialog>,
        document.body,
    );
}
