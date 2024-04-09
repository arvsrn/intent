<script lang="ts">
    import { appState, clickOutside, databaseState } from "$lib";
    import type { Task } from "$lib/schema";
    import { ContextMenu } from "bits-ui";
    import { supabase } from "$lib/supabaseClient";
    import { syncing } from "$lib";
    import Pill from "./Tag.svelte";
    import Tag from "./Tag.svelte";

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

            {#if task && task.tags && task.tags.length > 0}
                <div class="w-full flex flex-row flex-wrap gap-1 mb-1 mt-2">
                    {#each task.tags as tag}
                        {@const realTag = $databaseState.tags.find(x => x.id === tag)}

                        {#if realTag}
                            <Tag tag={realTag}></Tag>
                        {/if}
                    {/each}
                </div>
            {/if}
        </main>
    
    </ContextMenu.Trigger>

    <ContextMenu.Content class="w-36 p-1 h-fit outline outline-1 -outline-offset-1 outline-[#ffffff06] rounded-lg bg-[#404040] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]">
        <ContextMenu.Item class="h-7 text-xs text-white px-2 leading-[25px] hover:bg-white/10 active:bg-white/15 outline-none !ring-0 !ring-transparent rounded select-none cursor-pointer flex items-center">Copy</ContextMenu.Item>
        <ContextMenu.Item class="h-7 text-xs text-white px-2 leading-[25px] hover:bg-white/10 active:bg-white/15 outline-none !ring-0 !ring-transparent rounded select-none cursor-pointer flex items-center">Paste here</ContextMenu.Item>
        <ContextMenu.Item on:click={() => del()} class="h-7 text-xs text-[#FF8A7B] px-2 leading-[25px] hover:bg-white/10 active:bg-white/15 outline-none !ring-0 !ring-transparent rounded select-none cursor-pointer flex items-center">Delete</ContextMenu.Item>
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