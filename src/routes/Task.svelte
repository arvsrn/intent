<script lang="ts">
    import { appState, clickOutside, databaseState } from "$lib";
    import type { Task } from "$lib/schema";
    import { ContextMenu } from "bits-ui";
    import { supabase } from "$lib/supabaseClient";
    import { syncing } from "$lib";

    export let task: Task;
    export let fill: boolean = false;
    export let draggable: boolean = false;
    
    let dragging: boolean = false;
    let position: [number, number] = [0, 0];
    let predrag: [number, number] = [0, 0];
    let rotation: number = 0;
    let self: HTMLElement;

    const onMouseDown = (event: MouseEvent) => {
        if (draggable && event.button === 0) {
            $appState.lastMouseDown = Date.now();
            $appState.draggingTask = task;

            $appState.draggingTimeout = window.setTimeout(() => {
                const boundingBox = self.getBoundingClientRect();
                
                position = [predrag[0] - (boundingBox.width / 2), predrag[1] - (boundingBox.height / 2)];
                dragging = true;

                $appState.isDraggingTask = true;
                $appState.draggingTask = task;
                $appState.draggingTaskHeight = self.clientHeight + 2;
            }, 125);
        }
    }; 

    const onMouseMove = (event: MouseEvent) => {
        if (dragging) {
            position[0] += event.movementX;
            position[1] += event.movementY;

            rotation = event.movementX / 5;
        } else {
            predrag = [event.clientX, event.clientY];
        }
    };

    const onMouseUp = () => {
        rotation = 0;
        dragging = false;
        
        $appState.isDraggingTask = false;
        clearTimeout($appState.draggingTimeout);
    };

    const del = async () => {
        const list = $databaseState.lists.find(x => x.id === task.list_id)?.tasks;
        
        if (list)
            list.splice(list.findIndex(x => x.id === task.id), 1);
    
        $databaseState = $databaseState;

        $syncing = true;
        await supabase
            .from('tasks')
            .delete()
            .eq('id', task.id);
        $syncing = false;
    }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<ContextMenu.Root>
    <ContextMenu.Trigger>
        <main 
            bind:this={self}
            on:mousedown={onMouseDown}

            style:transform="rotateZ({rotation}deg)" 
            style:--x="{position[0]}px" 
            style:--y="{position[1]}px" 

            class="w-[306px] h-fit rounded-md border border-[#FFFFFF06] bg-[#313131] hover:bg-[#414141] px-3 py-[7px] cursor-pointer" 
            class:dragging={dragging}
            class:fill={fill}

            data-is-task
            data-is-dragging="{dragging}"
        >
            <p draggable="false" class="select-none w-full leading-5 text-xs text-white">{task.title}</p>
        </main>
    </ContextMenu.Trigger>
    <ContextMenu.Content class="w-32 h-fit outline outline-1 -outline-offset-1 outline-[#ffffff06] rounded-md bg-[#4C4C4C] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]">
        <ContextMenu.Item class="h-[25px] text-xs text-white px-2 leading-[25px] hover:bg-white/10 active:bg-white/15 outline-none !ring-0 !ring-transparent rounded-md select-none cursor-pointer">Copy</ContextMenu.Item>
        <ContextMenu.Item class="h-[25px] text-xs text-white px-2 leading-[25px] hover:bg-white/10 active:bg-white/15 outline-none !ring-0 !ring-transparent rounded-md select-none cursor-pointer">Paste here</ContextMenu.Item>
        <ContextMenu.Item on:click={() => del()} class="h-[25px] text-xs text-red-400 px-2 leading-[25px] hover:bg-white/10 active:bg-white/15 outline-none !ring-0 !ring-transparent rounded-md select-none cursor-pointer">Delete</ContextMenu.Item>
    </ContextMenu.Content>
</ContextMenu.Root>

<svelte:window on:mousemove={onMouseMove} on:mouseup={onMouseUp}></svelte:window>

<style>
    main {
        translate: color 75ms var(--ease);
    }

    @media (prefers-reduced-motion) {
        main {
            translate: color 75ms var(--ease), transform 75ms var(--ease);
        }
    }

    .dragging {
        top: var(--y);
        left: var(--x);
        
        @apply absolute pointer-events-none z-50 bg-[#414141];
    }

    .fill {
        @apply w-full;
    }
</style>