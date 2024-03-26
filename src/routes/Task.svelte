<script lang="ts">
    import { appState } from "$lib";
    import type { Task } from "$lib/schema";

    export let task: Task;
    export let fill: boolean = false;
    export let draggable: boolean = false;
    
    let dragging: boolean = false;
    let position: [number, number] = [0, 0];
    let rotation: number = 0;
    let self: HTMLElement;

    const onMouseDown = (event: MouseEvent) => {
        if (draggable) {
            $appState.lastMouseDown = Date.now();
            $appState.draggingTask = task;

            $appState.draggingTimeout = window.setTimeout(() => {
                const element = event.target as HTMLElement;
                const boundingBox = element.getBoundingClientRect();
                
                position = [boundingBox.left, boundingBox.top];
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
        }
    };

    const onMouseUp = () => {
        rotation = 0;
        dragging = false;
        
        $appState.isDraggingTask = false;
        clearTimeout($appState.draggingTimeout);
    }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
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