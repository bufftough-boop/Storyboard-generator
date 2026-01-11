export interface Shot {
    id: string;
    number: number;
    duration: number; // in seconds
    title: string;
    cameraAngle?: string;
    imageUrl?: string;
    isGenerating?: boolean;
    lastGeneratedPrompt?: string;
}

export interface Storyboard {
    id: string;
    name: string;
    shots: Shot[];
}

export interface Project {
    id: string;
    name: string;
    storyboards: Storyboard[];
    activeStoryboardId: string;
    aspectRatio: "16:9" | "9:16" | "4:3" | "3:4" | "1:1";
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
}