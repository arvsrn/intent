<script lang="ts">
    import { appState, clickOutside, colors, databaseState, sortTasks } from "$lib";
    import { getTasks } from "$lib/database";
    import type { StateList } from "$lib/schema";
    import { slide } from "svelte/transition";
    import Task from "./Task.svelte";
    import { onMount } from "svelte";
    import { supabase } from "$lib/supabaseClient";

    export let list: StateList;
    let addTaskSelected: boolean = false;
    let draggingHere: boolean = false;
    let self: HTMLElement;
    let dropPosition: number = 0;

    const onMouseMove = (event: MouseEvent) => {
        if (draggingHere && $appState.isDraggingTask) {
            dropPosition = 0;
            
            for (const child of self.querySelectorAll("[data-is-task]:not([data-is-dragging='true'])")) {
                const boundingBox = child.getBoundingClientRect();
                
                if (event.clientY > (boundingBox.bottom - boundingBox.height / 2)) {
                    dropPosition += 1;
                }
            }
        }
    }; 

    const onMouseUp = (event: MouseEvent) => {
        if (Date.now() - $appState.lastMouseDown < 125) {
            $appState.editingTask = $appState.draggingTask?.id ?? null;
        } else if ($appState.draggingTask) {
            // updating these updates $databaseState for some reason
            const originList = $databaseState.lists.find(x => x.id === $appState.draggingTask?.list_id)?.tasks;
            const finalList = $databaseState.lists.find(x => x.id === list.id)?.tasks;

            if (originList && finalList) {
                const task = originList.splice(originList.findIndex(x => x.id === $appState.draggingTask?.id), 1)[0];

                /* 
                    if element at dropPosition and dropPosition - 1, index should be average
                    if element at dropPosition but not at dropPosition - 1, index should be dropPosition.index - 64
                    if element at dropPosition - 1 but not at dropPosition, index should be dropPosition - 1.index + 64
                    if neither, index should be 0
                */
                task.index = finalList[dropPosition]?.index !== undefined ? 
                    finalList[dropPosition - 1]?.index !== undefined ? 
                        (finalList[dropPosition - 1].index + finalList[dropPosition].index) / 2
                        : finalList[dropPosition].index - 64
                    : finalList[dropPosition - 1]?.index !== undefined ? 
                        finalList[dropPosition - 1].index + 64
                        : 0;
                
                task.list_id = list.id;

                finalList.push(task);
                $databaseState = $databaseState;

                supabase
                    .from("tasks")
                    .update({
                        list_id: task.list_id,
                        index: task.index,
                    })
                    .eq('id', task.id)
                    .then(x => console.log(x));
            }

            $appState.draggingTask = null;
        }
    };
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<main 
    bind:this={self}
    class="w-80 rounded-xl border border-[#FFFFFF06] h-fit max-h-full overflow-auto bg-[#FFFFFF06] flex flex-col gap-1.5 p-1.5" 
    
    on:mouseenter={() => draggingHere = true} 
    on:mouseleave={() => draggingHere = false}
    on:mousemove={onMouseMove}
    on:mouseup={onMouseUp}
>
    <div class="w-full h-5 mt-1 px-3 flex flex-row gap-1.5 items-center">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="4" cy="4" r="4" fill="{colors[list.color]}"/>
        </svg>            
        <p class="leading-5 text-[11px] text-white select-none">{list.name}</p>
    </div>
    
    {#each sortTasks(list.tasks) as task, i}
        {#if i === dropPosition && !(dropPosition >= list.tasks.length - ($appState.draggingTask?.list_id === list.id ? 1 : 0)) && draggingHere && $appState.isDraggingTask}
            <div id="shadow" style:height="{$appState.draggingTaskHeight}px" class="w-[306px] h-9 border border-white/10 rounded-md bg-[#FFFFFF06] border-dashed flex-none"></div>
        {/if}

        <Task {task} draggable />
    {/each}
    
    {#if dropPosition >= list.tasks.length - ($appState.draggingTask?.list_id === list.id ? 1 : 0) && draggingHere && $appState.isDraggingTask}
        <div id="shadow" style:height="{$appState.draggingTaskHeight}px" class="w-[306px] h-9 border border-white/10 rounded-md bg-[#FFFFFF06] border-dashed flex-none"></div>
    {/if}
    
    <div class="w-[306px] h-fit sticky bottom-0 bg-[#252525] flex flex-col gap-1.5 input">
        <input on:click={() => addTaskSelected = true} use:clickOutside={() => addTaskSelected = false} class="placeholder:select-none flex-none w-full h-9 rounded-md border border-white/10 bg-transparent outline-none px-3 text-xs text-white placeholder:text-white/50" type="text" placeholder="Add task...">

        {#if addTaskSelected}
            <p class="text-[11px] ml-3 -mt-1 text-white/50 select-none flex-none" transition:slide={{ duration: 150 }}>↵ Enter to create</p>
        {/if}
    </div>
</main>

<style>
    main::-webkit-scrollbar {
        width: 6px;
        height: 0px;
    }

    main::-webkit-scrollbar-corner {
        background: transparent;
    }

    .input::before {
        content: '';
        width: 306px;
        height: 6px;
        background: #252525;
        position: absolute;
        bottom: -6px;
        left: 0px;
    }

    .input::after {
        content: '';
        width: 306px;
        height: 6px;
        background: #252525;
        position: absolute;
        top: -6px;
        left: 0px;
    }
</style>