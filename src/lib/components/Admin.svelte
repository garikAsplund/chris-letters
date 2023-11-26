<script>
	import * as ExcelJS from 'exceljs';
	import { page } from '$app/stores';
	import { dbController } from '$lib/database/dbController';
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

	let excelData = {
		AB: {},
		CC: {},
		SiB: {}
	};

	async function fetchDataFromFirebase() {
		const dataAB = await dbController.readData('AB');
		const dataCC = await dbController.readData('CC');
		const dataSiB = await dbController.readData('SiB');

		excelData.AB = dataAB || {};
		excelData.CC = dataCC || {};
		excelData.SiB = dataSiB || {};

		console.log(excelData);
		crunchData();
	}

	function crunchData() {
		const workbook = new ExcelJS.Workbook();

		const setHeaderStyling = (worksheet) => {
			const headerRow = worksheet.getRow(1);
			headerRow.height = 20;
			headerRow.eachCell((cell) => {
				cell.font = { bold: true };
				cell.alignment = { vertical: 'middle', horizontal: 'left', padding: { top: 3, bottom: 3 } };
				cell.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: 'FFDDDDDD' }
				};
				cell.border = {
					bottom: { style: 'thin', color: { argb: 'FF000000' } }
				};
			});
		};

		const addRowsForAB = (worksheet, data) => {
			for (const uid in data) {
				const sessions = data[uid];

				for (const session in sessions) {
					const trials = sessions[session];

					for (const trial in trials) {
						const newRow = [
							uid,
							session,
							trial,
							'AB',
							trials[trial].RSVP,
							trials[trial].t1Position,
							trials[trial].t2Position,
							trials[trial].targetColor,
							trials[trial].targets,
							trials[trial].responses,
							trials[trial].accuracy,
							trials[trial].reactionTime,
							trials[trial].streamDuration
						];
						worksheet.addRow(newRow);
					}
				}
			}
		};

		const worksheetAB = workbook.addWorksheet('AB');
		const headersAB = [
			'User ID',
			'Session Number',
			'Trial ID',
			'Task',
			'RSVP',
			'T1 Position',
			'T2 Position',
			'Target color',
			'Targets',
			'Responses',
			'Accuracy',
			'Reaction Time',
			'Stream Duration'
		];
		worksheetAB.addRow(headersAB);
		addRowsForAB(worksheetAB, excelData.AB);
		setHeaderStyling(worksheetAB);

		const addRowsForCC = (worksheet, data) => {
			for (const uid in data) {
				const sessions = data[uid];

				for (const session in sessions) {
					const blocks = sessions[session];

					for (const block in blocks) {
						const trials = blocks[block];

						for (const trialID in trials) {
							const trial = trials[trialID];

							const newRow = [
								uid,
								session,
								block,
								trialID,
								'CC',
								trial.RSVP,
								trial.targetPosition,
								trial.distractorPosition,
								trial.distractorColor,
								trial.targetColor,
								trial.target,
								trial.response,
								trial.accuracy,
								trial.reactionTime,
								trial.streamDuration
							];
							worksheet.addRow(newRow);
						}
					}
				}
			}
		};

		const worksheetCC = workbook.addWorksheet('CC');
		const headersCC = [
			'User ID',
			'Session Number',
			'Block Count',
			'Trial ID',
			'Task',
			'RSVP',
			'Target Position',
			'Distractor Position',
			'Distractor Color',
			'Target Color',
			'Target',
			'Response',
			'Accuracy',
			'Reaction Time',
			'Stream Duration'
		];
		worksheetCC.addRow(headersCC);
		addRowsForCC(worksheetCC, excelData.CC);
		setHeaderStyling(worksheetCC);

		const addRowsForSiB = (worksheet, data) => {
			for (const uid in data) {
				const sessions = data[uid];

				for (const session in sessions) {
					const blocks = sessions[session];

					for (const block in blocks) {
						const trials = blocks[block];

						for (const trialID in trials) {
							const trial = trials[trialID];

							const newRow = [
								uid,
								session,
								block,
								trialID,
								'SiB',
								trial.RSVP,
								trial.surprise,
								trial.targetPosition,
								trial.targetColor,
								trial.target,
								trial.response,
								trial.accuracy,
								trial.reactionTime,
								trial.streamDuration
							];

							worksheet.addRow(newRow);
						}
					}
				}
			}
		};

		const worksheetSiB = workbook.addWorksheet('SiB');
		const headersSiB = [
			'User ID',
			'Session Number',
			'Block Count',
			'Trial ID',
			'Task',
			'RSVP',
			'Surprise',
			'Target Position',
			'Target Color',
			'Target',
			'Response',
			'Accuracy',
			'Reaction Time',
			'Stream Duration'
		];
		worksheetSiB.addRow(headersSiB);
		addRowsForSiB(worksheetSiB, excelData.SiB);
		setHeaderStyling(worksheetSiB);

		const autoFitColumns = (worksheet) => {
			worksheet.columns.forEach((column) => {
				let maxColumnLength = 0;

				column.eachCell({ includeEmpty: true }, (cell) => {
					const textLength = cell.value ? String(cell.value).length : 0;
					maxColumnLength = Math.max(maxColumnLength, textLength);
				});

				column.width = maxColumnLength;
			});
		};

		autoFitColumns(worksheetAB);
		autoFitColumns(worksheetCC);
		autoFitColumns(worksheetSiB);

		const setStyling = (worksheet) => {
			const sessionColors = ['FFE4E1F3', 'FFD2CDEB', 'FFBFB8E3', 'FFADA4DA'];
			let currentSession = null;
			let currentBlock = null;
			let sessionColorIndex = 0;

			if (worksheet.getRow(1).getCell(3).value === 'Trial ID') {
				worksheet.eachRow({ includeEmpty: false }, (row) => {
					const session = row.getCell(2).value;

					if (session !== currentSession) {
						currentSession = session;
						sessionColorIndex = (sessionColorIndex + 1) % sessionColors.length;
					}

					row.fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: sessionColors[sessionColorIndex] }
					};

					row.border = {
						bottom: { style: 'thin', color: { argb: 'FF000000' } }
					};
				});
			} else {
				worksheet.eachRow({ includeEmpty: false }, (row) => {
					const session = row.getCell(2).value;
					const block = row.getCell(3).value;

					if (session !== currentSession || block !== currentBlock) {
						currentSession = session;
						currentBlock = block;
						sessionColorIndex = (sessionColorIndex + 1) % sessionColors.length;
					}

					row.fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: sessionColors[sessionColorIndex] }
					};

					row.border = {
						bottom: { style: 'thin', color: { argb: 'FF000000' } }
					};
				});
			}
		};

		setStyling(worksheetAB);
		setStyling(worksheetCC);
		setStyling(worksheetSiB);

		workbook.xlsx.writeBuffer().then((buffer) => {
			const blob = new Blob([buffer], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			});
			const excelFilePath = 'trial_data.xlsx';
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = excelFilePath;
			a.click();
			URL.revokeObjectURL(a.href);
		});
	}
</script>

<button class="hover:text-gray-400" on:click={fetchDataFromFirebase}>Export data</button>
{#if $page.data.route.id !== '/admin'}
	<button class="hover:text-gray-400">
		<a href="/admin">Go to admin panel</a>
	</button>
{:else}
	<button class="hover:text-gray-400" on:click={onGoToGameClicked}>
		<a href="/">Go to game</a>
	</button>
{/if}
