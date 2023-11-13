<script>
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { isAdmin, things } from '$lib/stores/GameStore';
	import { dbController } from '$lib/database/dbController';

	if (!$isAdmin) {
		goto('/');
	}

	dbController.getAllUsers();
</script>

<h1 class="flex justify-center text-4xl font-bold text-center transform translate-y-16">
	Admin panel<i class="fa-solid fa-screwdriver-wrench fa-xl m-5" />
</h1>

<div class="flex justify-center translate-y-28">
	<div class="w-1/2 table-container">
		<table class="table table-hover">
			<thead>
				<tr>
					<th>Name</th>
					<th>Admin status</th>
				</tr>
			</thead>
			<tbody>
				{#each Object.entries($things) as [userId, user]}
					<tr>
						<td class="text-xl">{user.displayName}</td>
						<td class="table-cell-fit">
							<SlideToggle
								name="slide"
								size="sm"
								bind:checked={user.admin}
								on:click={() => dbController.changeAdminStatus(userId, user.admin)}
							/>
							{user.admin ? 'Admin' : 'Not admin'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
