import { writable } from "svelte/store";
import type { Task, StateList } from "./schema";
import { onMount } from "svelte";
import { persisted } from "svelte-persisted-store";

export interface LocalTeam {
    name: string;
    id: string;
    projects: LocalProject[],
}

export interface LocalProject {
    name: string;
    id: string;
}

export interface WithId<T> {
    id: string;
    name: T;
}

// place files you want to import through the `$lib` alias in this folder.
export interface DatabaseState {
    project: WithId<string>,
    team: WithId<string>,
    lists: StateList[],
    teams: LocalTeam[],
}

export interface LocalState {
    project: WithId<string>,
    team: WithId<string>,
}

export interface AppState {
    isDraggingTask: boolean;
    draggingTask: Task | null;
    draggingTaskHeight: number;
    lastMouseDown: number;
    draggingTimeout: number;
    editingTask: string | null;
}

export let appState = writable<AppState>({
    isDraggingTask: false,
    draggingTask: null,
    draggingTaskHeight: 36,
    lastMouseDown: 0,
    draggingTimeout: 0,
    editingTask: null,
});

export let databaseState = writable<DatabaseState>();

// localState is set initially in +page.svelte
// @ts-ignore
export let localState = persisted<LocalState>('state', {});
export let syncing = writable<boolean>(false);

export let colors = ["#F24822", "#FFA500", "#FFC700", "#11DF25", "#258DEC", "#871DF0", "#D448D4", "#4F2C18", "#D8D8D8", "#4A4A4A"];

export function clickOutside(node: HTMLElement, handler: (e: MouseEvent) => void): { destroy: () => void } {
    const onClick = (event: MouseEvent) =>
        node 
        && !node.contains(event.target as HTMLElement) 
        && !event.defaultPrevented 
        && handler(event);
  
    document.addEventListener('click', onClick, true);
    document.addEventListener('contextmenu', onClick, true);
  
    return {
        destroy() {
            document.removeEventListener('click', onClick, true);
            document.removeEventListener('contextmenu', onClick, true);
        },
    };
};

export function blurInDownwards(node: Node, props: { duration: number }) {
    return {
        duration: props.duration,
        css: (t: number) => {
            return `
                transform: translateY(-${10-(t*10)}px);
                scale: ${0.99 + (0.01 * t)};
                filter: blur(${3-(t*3)}px);
            `;
        }
    };
};

export function blurInUpwards(node: Node, props: { duration: number }) {
    return {
        duration: props.duration,
        css: (t: number) => {
            return `
                transform: translateY(${10-(t*10)}px);
                scale: ${0.99 + (0.01 * t)};
                filter: blur(${3-(t*3)}px);
            `;
        }
    };
};

export function sortTasks(tasks: Task[]): Task[] {
    const n: number = tasks.length;

    let swapped: boolean;
    let temp: Task;
    
    for (let i = 0; i < n - 1; i++) {
        swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            if (tasks[j].index > tasks[j + 1].index) {
                temp = tasks[j];
                tasks[j] = tasks[j + 1];
                tasks[j + 1] = temp;
                swapped = true;
            }
        }
    
        if (!swapped) {
            break;
        }
    }
    
    return tasks;
}