<script>
	import * as ExcelJS from 'exceljs';
	import { db as database } from '$lib/database/firebase';
	import { ref, get } from 'firebase/database';
	import { page } from '$app/stores';
	import {
		currentTrial,
		numberOfFlashes,
		targetLetter,
		currentLetter,
		started,
		guesses,
		inProgress,
		guessed
	} from '$lib/stores/GameStore';

	let excelData = {
		blocks: {}
	};

	async function fetchDataFromFirebase() {
		const dataRef = ref(database, 'blocks');
		const dataSnapshot = await get(dataRef);

		if (dataSnapshot.exists()) {
			excelData.blocks = dataSnapshot.val();
			console.log(excelData.blocks);
			crunchData();
		}
	}

	function crunchData() {
		const workbook = new ExcelJS.Workbook();
		const headers = [
			'User ID',
			'Trial ID',
			'Trial Type',
			'Targets',
			'Guesses',
			'Accuracy',
			'Reaction Time'
		];
		const worksheet = workbook.addWorksheet('Worksheet name');
		worksheet.addRow(headers);

		for (const uid in excelData.blocks) {
			const block = excelData.blocks[uid];

			console.log(block);

			for (const trial in block) {
				console.log(trial);
				const newRow = [
					uid,
					block[trial].trialType,
					block[trial].targets,
					block[trial].guesses,
					block[trial].accuracy,
					block[trial].reactionTime
				];
				worksheet.addRow(newRow);
			}
		}

		workbook.xlsx.writeBuffer().then((buffer) => {
			const blob = new Blob([buffer], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			});
			const excelFilePath = 'blocks_data.xlsx';
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = excelFilePath;
			a.click();
			URL.revokeObjectURL(a.href);
		});
	}

	function onGoToGameClicked() {
		$currentTrial = 0;
		$numberOfFlashes = 0;
		$started = false;
		$targetLetter = '';
		$guesses = [];
		$inProgress = true;
		$guessed = true;
		$currentLetter = '';
	}
</script>

<button class=" hover:text-gray-400" on:click={fetchDataFromFirebase}> Export data </button>
{#if $page.data.route.id !== '/admin'}
	<button class=" hover:text-gray-400">
		<a href="/admin">Go to admin panel</a>
	</button>
{:else}
	<button class=" hover:text-gray-400" on:click={onGoToGameClicked}>
		<a href="/">Go to game</a>
	</button>
{/if}
