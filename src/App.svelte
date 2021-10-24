<!-- App.svelte -->
<script>
  import { Router, Route } from "svelte-routing";

  // Dashboard Layout
  import Client from "./layouts/Client.svelte";
  // Auth Layout
  import Auth from "./layouts/Auth.svelte";

  export let url = "";
</script>

<Router url="{url}">
  <!-- Dashboard layout -->
  <Route path="/*client" component="{Client}" />
  <!-- Dashboard layout -->
  <Route path="client/*client" component="{Client}" />
  <!-- auth layout -->
  <Route path="auth/*auth" component="{Auth}" />
</Router>
