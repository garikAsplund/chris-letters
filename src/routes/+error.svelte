<script>
	import { page } from '$app/stores';
</script>

<div class="flex justify-center translate-y-16">
	<div class="text-center space-y-8">
		<h1 class="h1">{$page.status}</h1>
		<h3 class="h3">{$page.error.message}</h3>
		<img
			src="https://miro.medium.com/v2/resize:fit:850/1*Tlx5Zt83-Za_xvW7uCITbg.jpeg"
			width="500"
			alt="Hello!!"
		/>
	</div>
</div>
