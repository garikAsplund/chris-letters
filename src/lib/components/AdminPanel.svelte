<script>
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { isAdmin, things } from '$lib/stores/GameStore';
	import { dbController } from '$lib/database/dbController';

	let expandedUser = null;

	function toggleAccordion(userId) {
		expandedUser = expandedUser === userId ? null : userId;
	}

	if (!$isAdmin) {
		goto('/');
	}

	dbController.getAllUsers();
</script>

<h1 class="flex justify-center text-4xl font-bold text-center transform translate-y-16">
	Admin panel<i class="m-5 fa-solid fa-screwdriver-wrench fa-xl" />
</h1>

<div class="flex justify-center translate-y-28">
	<div class="w-1/2 table-container">
		<table class="table table-hover">
			<thead>
				<tr>
					<th>Name</th>
					<th class="">Admin status</th>
				</tr>
			</thead>
			<tbody>
				{#each Object.entries($things) as [userId, user]}
					<tr class="table-row">
						{#if user.problemDescription}
							<td>
								<a href="#" class="text-blue-300" on:click={() => toggleAccordion(userId)}>
									{user.displayName}
								</a>
							</td>
						{:else}
							<td> {user.displayName}</td>
						{/if}

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
					{#if userId === expandedUser}
						<tr>
							<td colspan="2" class="text-xl bg-red-400">
								<p class="whitespace-pre-wrap">{user.problemDescription}</p>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
</div>
