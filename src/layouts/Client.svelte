<script>
  import { Router, Route } from "svelte-routing";

  // components for this layout
  import Sidebar from "components/Sidebar/Sidebar.svelte";
  import SidebarNext from "components/Sidebar/Sidebar-Next.svelte";
  import GamePanel from "components/Main/Panel.svelte";

  export let location;
  export let client = "";
</script>

<div class="flex min-h-screen w-full">
  <Sidebar location={location}/>
  <SidebarNext location={location}/>
  <GamePanel location={location} />
</div>
