<script>
	import { child, get, set } from 'firebase/database';
	import { dbRef } from '$lib/firebase';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { isAdmin } from '$lib/stores/GameStore';

	let things = {};

	if (!$isAdmin) {
		goto('/');
	}

	get(child(dbRef, 'users'))
		.then((snapshot) => {
			if (snapshot.exists()) {
				things = snapshot.val();
			} else {
				console.log('No data available');
			}
		})
		.catch((error) => {
			console.error(error);
		});

	function changeAdminStatus(userId, adminStatus) {
		set(child(dbRef, `users/${userId}/admin`), !adminStatus)
			.then(() => {
				things[userId].admin = !adminStatus;
			})
			.catch((error) => {
				console.error(error);
			});
	}
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
				{#each Object.entries(things) as [userId, user]}
					<tr>
						<td class="text-xl">{user.displayName}</td>
						<td class="table-cell-fit">
							<SlideToggle
								name="slide"
								size="sm"
								bind:checked={user.admin}
								on:click={() => changeAdminStatus(userId, user.admin)}
							/>
							{user.admin ? 'Admin' : 'Not admin'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
