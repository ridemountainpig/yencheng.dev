// Mac screen types
export interface DockItem {
    src: string;
    alt: string;
    className: string;
    label: string;
    url: string;
    showInfo: boolean;
    link: boolean;
    info?: {
        title?: string;
        description?: string;
        tech?: string;
        picture?: Array<{ src: string; description: string }>;
        style?: InfoStyle;
    };
}

export interface InfoStyle {
    border: string;
    bg: string;
    secondBg: string;
    icon: string;
    text: string;
}

// Raycast Extension types
export interface Extension {
    store_url: string;
    title: string;
    description: string;
    icons: {
        light: string | null;
    };
}
