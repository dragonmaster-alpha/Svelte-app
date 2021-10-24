<script>
  import { link } from "svelte-routing";
  
  let collapseShow = "hidden";

  function toggleCollapseShow(classes) {
    collapseShow = classes;
  }
</script>
<!-- <nav 
  class="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-hidden md:h-full w-16"
>
  <div class="bg-gray-custom-1" style="height: calc(100% - 64px);display: flex; justify-content: space-between; align-items: center; flex-direction: column;">
    <div>
      <img class="set-icon-margin" src="../assets/img/logo.svg" />
      <hr style="border-color: rgba(142, 148, 154, 0.16);" >
      <img class="set-icon-margin" src="../assets/img/notification.svg" />
      <hr style="border-color: rgba(142, 148, 154, 0.16);" >
      <img class="set-icon-margin" src="../assets/img/games.svg" />
      <hr style="border-color: rgba(142, 148, 154, 0);" >
      <img class="set-icon-margin" src="../assets/img/dashboard.svg" />
      <hr style="border-color: rgba(142, 148, 154, 0);" >
      <img class="set-icon-margin" src="../assets/img/sessions.svg" />
      <hr style="border-color: rgba(142, 148, 154, 0);" >
      <img class="set-icon-margin" src="../assets/img/settings.svg" />
      <hr style="border-color: rgba(142, 148, 154, 0);" >
      <img class="set-icon-margin" src="../assets/img/feedback.svg" />
      <hr style="border-color: rgba(142, 148, 154, 0);" >
    </div>
    <div>
      <img class="set-icon-margin" src="../assets/img/expand.svg" />
    </div>
  </div>
  <div class="set-avatar-padding" style="width:64px; height: 64px; background: #21242A;">
    <img src="../assets/img/user-avatar.svg" style="width: 36px; height: 36px;"/>
  </div>
</nav> -->
<style>  

.avatar-bkg {
  background: #21242A;
}

.super-text {
  background: #792C2E;
  border-radius: 50%;
  text-align: center;
  padding: 0 3px 0 3px;
  line-height: 16px;
  font-size: 10px;
  color: red;
}

</style>
<nav 
  class="bg-gray-custom-1 text-white w-16 h-screen sticky top-0 flex flex-col justify-between items-center"
>
  <div class="w-full">
    <div class="system divide-y divide-gray-700 flex flex-col items-center">
      <a class="w-10 py-4 flex justify-center" href="/">
        <img src="../assets/img/logo.svg" alt="no image" />
      </a>
      <a class="w-10 py-4 flex justify-center" href="/notification">
        <img src="../assets/img/notification.svg" alt="no image" />
        <sup><span class="super-text">3</span></sup>
      </a>
      <a class="w-10 py-4 flex justify-center" href="/games" >
        <img src="../assets/img/games.svg" alt="no image" />
      </a>
      <a class="w-10 py-4 flex justify-center" href="/" hidden>
        <img src="../assets/img/dashboard.svg" alt="no image" />
      </a>
      <a class="w-10 py-4 flex justify-center" href="/" hidden>
        <img src="../assets/img/sessions.svg" alt="no image" />
      </a>
      <a class="w-10 py-4 flex justify-center" href="/" hidden>
        <img src="../assets/img/wallet.svg" alt="no image" />
      </a>
      <a class="w-10 py-4 flex justify-center" href="/" hidden>
        <img src="../assets/img/settings.svg" alt="no image" />
      </a>
      <a class="w-10 py-4 flex justify-center" href="/" hidden>
        <img src="../assets/img/feedback.svg" alt="no image" />
      </a>
    </div>
  </div>
  <div class="w-full flex flex-col items-center space-y-4">
    <a>
      <img src="../assets/img/expand.svg" alt="no image" />
    </a>
    <a class="flex w-full h-16 avatar-bkg items-center justify-center">
      <img src="../assets/img/user-avatar.svg" class="rounded-lg" alt="no image" />
    </a>
  </div>
</nav>