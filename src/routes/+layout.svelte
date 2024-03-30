<script lang="ts">
    import { databaseState } from "$lib";
    import { supabase } from "$lib/supabaseClient";
    import "../app.css";
    import Debug from "./Debug.svelte";
    import type { Task } from "$lib/schema";
    import { onMount } from "svelte";
    import Loader from "./Loader.svelte";

    let mounted: boolean = false;

    onMount(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user === null && !window.location.href.endsWith('/login')) {
            window.location.assign("/login");
        }

        const userData = await supabase.from("users").select().eq('id', user?.id);

        if (userData.data?.length === 0 && !window.location.href.endsWith('/create/account')) {
            window.location.assign('/create/account');
        }

        mounted = true;
    });
</script>

{#if mounted}
    <slot />
{:else}
    <main class="w-screen h-screen flex items-center justify-center">
        <Loader></Loader>
    </main>
{/if}

<Debug />