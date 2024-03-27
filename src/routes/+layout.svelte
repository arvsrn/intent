<script lang="ts">
    import { databaseState } from "$lib";
    import { supabase } from "$lib/supabaseClient";
    import "../app.css";
    import Debug from "./Debug.svelte";
    import type { Task } from "$lib/schema";
    import { onMount } from "svelte";

    let mounted: boolean = false;
    onMount(() => mounted = true);

    
</script>

<slot />

<Debug />