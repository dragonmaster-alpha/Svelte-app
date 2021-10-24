<script>
  export let location;
</script>
<style>
    .line {
        border-top-width: 40px;
        border-color: rgba(142, 148, 154, 0.24);
    }
</style>
<div class="confirm-step mt-12 ml-4 flex flex-col space-y-3">
    <div class="each-step flex items-center space-x-4">
        <img src="../assets/img/step1.svg" alt="no image" />
        <p class="text-lg text-blue-200">Choose Game</p>
    </div>
    <span class="ml-4">
        <hr width="2" class="line">
    </span>
    <div class="each-step flex items-center space-x-4">
        <img src="../assets/img/step2.svg" alt="no image" />
        <p class="text-lg text-gray-700">Session details</p>
    </div>
    <span class="ml-4">
        <hr width="2" class="line">
    </span>
    <div class="each-step flex items-center space-x-4">
        <img src="../assets/img/step3.svg" alt="no image" />
        <p class="text-lg text-gray-700">Payment</p>
    </div>
    <span class="ml-4">
        <hr width="2" class="line">
    </span>
    <div class="each-step flex items-center space-x-4">
        <img src="../assets/img/step4.svg" alt="no image" />
        <p class="text-lg text-gray-700">Confirmation</p>
    </div>
</div>