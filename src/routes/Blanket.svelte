<script lang="ts">
    import { blurInUpwards } from "$lib";

    export let onClick: () => void;
</script>

<main on:click={onClick} class="w-screen h-screen absolute left-0 top-0 z-50 bg-black/5 flex items-center justify-center">
    <slot></slot>
</main>