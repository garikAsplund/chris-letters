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
		guessed,
		refreshRate
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
		// VAB: {}
	};

	async function fetchDataFromFirebase() {
		const dataAB = await dbController.readData('AB');
		const dataCC = await dbController.readData('CC');
		const dataSiB = await dbController.readData('SiB');
		// const dataVAB = await dbController.readData('VAB');

		excelData.AB = dataAB || {};
		excelData.CC = dataCC || {};
		excelData.SiB = dataSiB || {};
		// excelData.VAB = dataVAB || {};

		// console.log(excelData);
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
					bottom: { style: 'thin', color: { argb: 'FF000000' } },
					right: { style: 'thin', color: { argb: 'FF000000' } },
					left: { style: 'thin', color: { argb: 'FF000000' } }
				};
			});
		};

		const addRowsForAB = (worksheet, data) => {
			for (const uid in data) {
				const sessions = data[uid];

				for (const session in sessions) {
					const trials = sessions[session];

					const date = new Date(trials.time);

					for (const trial in trials) {
						if (trial === 'time') {
							continue;
						}

						const newRow = [
							uid,
							session,
							date.toLocaleString(),
							trial,
							'AB',
							trials[trial].RSVP,
							trials[trial].t1Position,
							trials[trial].t2Position,
							trials[trial].targetColor,
							trials[trial].targets,
							trials[trial].responses[0],
							trials[trial].responses[1],
							trials[trial].accuracy,
							trials[trial].reactionTime[0]
								? trials[trial].reactionTime[0]
								: trials[trial].reactionTime,
							trials[trial].reactionTime[1],
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
			'Date',
			'Trial ID',
			'Task',
			'RSVP',
			'T1 Position',
			'T2 Position',
			'Target color',
			'Targets',
			'T1 Response',
			'T2 Response',
			'Accuracy',
			'T1 Reaction Time',
			'T2 Reaction Time',
			'Stream Duration'
		];
		worksheetAB.addRow(headersAB);
		addRowsForAB(worksheetAB, excelData.AB);

		const addRowsForCC = (worksheet, data) => {
			for (const uid in data) {
				const sessions = data[uid];

				for (const session in sessions) {
					const blocks = sessions[session];

					const date = new Date(blocks.time);

					for (const block in blocks) {
						const trials = blocks[block];

						for (const trialID in trials) {
							if (trialID === 'time') {
								continue;
							}

							const trial = trials[trialID];

							const newRow = [
								uid,
								session,
								block,
								date.toLocaleString(),
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
			'Date',
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

		const addRowsForSiB = (worksheet, data) => {
			for (const uid in data) {
				const sessions = data[uid];

				for (const session in sessions) {
					const trials = sessions[session];

					const date = new Date(trials.time);

					for (const trialID in trials) {
						if (trialID === 'time') {
							continue;
						}

						const trial = trials[trialID];

						const newRow = [
							uid,
							session,
							date.toLocaleString(),
							trialID,
							'SiB',
							trial.RSVP,
							trial.surprise,
							trial.surprisePath,
							trial.targetPosition,
							trial.targetColor,
							trial.target,
							trial.targetResponse,
							trial.accuracy,
							trial.reactionTime,
							trial.streamDuration
						];

						worksheet.addRow(newRow);
					}
				}
			}
		};

		const worksheetSiB = workbook.addWorksheet('SiB');
		const headersSiB = [
			'User ID',
			'Session Number',
			'Date',
			'Trial ID',
			'Task',
			'RSVP',
			'Surprise Position',
			'Surprise Path',
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

		// const addRowsForVAB = (worksheet, data) => {
		// 	for (const uid in data) {
		// 		const sessions = data[uid];

		// 		for (const session in sessions) {
		// 			const blocks = sessions[session];

		// 			for (const block in blocks) {
		// 				const trials = blocks[block];

		// 				const date = new Date(trials.time);

		// 				for (const trialID in trials) {
		// 					if (trialID === 'time') {
		// 						continue;
		// 					}

		// 					const trial = trials[trialID];

		// 					const newRow = [
		// 						uid,
		// 						session,
		// 						block,
		// 						date.toLocaleString(),
		// 						trialID,
		// 						'VAB',
		// 						trial.RSVP,
		// 						trial.probe,
		// 						trial.probeAccuracy,
		// 						trial.probePosition,
		// 						trial.probeResponse,
		// 						trial.reactionTime,
		// 						trial.streamDuration,
		// 						trial.surprise,
		// 						trial.target,
		// 						trial.targetAccuracy,
		// 						trial.targetPosition,
		// 						trial.targetResponse
		// 					];

		// 					worksheet.addRow(newRow);
		// 				}
		// 			}
		// 		}
		// 	}
		// };

		// const worksheetVAB = workbook.addWorksheet('VAB');
		// const headersVAB = [
		// 	'User ID',
		// 	'Session Number',
		// 	'Block Number',
		// 	'Date',
		// 	'Trial ID',
		// 	'Task',
		// 	'RSVP',
		// 	'Probe',
		// 	'Probe Accuracy',
		// 	'Probe Position',
		// 	'Probe Response',
		// 	'Reaction Time',
		// 	'Stream Duration',
		// 	'Surprise',
		// 	'Target',
		// 	'Target Accuracy',
		// 	'Target Position',
		// 	'Target Response'
		// ];
		// worksheetVAB.addRow(headersVAB);
		// addRowsForVAB(worksheetVAB, excelData.VAB);

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
		// autoFitColumns(worksheetVAB);

		const setStyling = (worksheet, endColor = 'FFDB92FC') => {
			let currentSession = null;
			let currentBlock = null;
			let trialCount = 0;
			const maxTrials = 96;

			if (worksheet.getRow(1).getCell(3).value === 'Trial ID') {
				worksheet.eachRow({ includeEmpty: false }, (row) => {
					const session = row.getCell(2).value;

					if (session !== currentSession) {
						currentSession = session;
						trialCount = 0;
					}

					const transitionColor = getTransitionColor('FFFFFFFF', endColor, trialCount, maxTrials);

					row.fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: transitionColor }
					};

					row.border = {
						bottom: { style: 'thin', color: { argb: 'FF000000' } },
						right: { style: 'thin', color: { argb: 'FF000000' } },
						left: { style: 'thin', color: { argb: 'FF000000' } }
					};

					row.eachCell((cell) => {
						cell.alignment = { horizontal: 'right' };
					});

					trialCount++;
				});
			} else {
				worksheet.eachRow({ includeEmpty: false }, (row) => {
					const session = row.getCell(2).value;
					const block = row.getCell(3).value;

					if (session !== currentSession || block !== currentBlock) {
						currentSession = session;
						currentBlock = block;
						trialCount = 0;
					}

					const transitionColor = getTransitionColor('FFFFFFFF', endColor, trialCount, maxTrials);

					row.fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: transitionColor }
					};

					row.border = {
						bottom: { style: 'thin', color: { argb: 'FF000000' } },
						right: { style: 'thin', color: { argb: 'FF000000' } },
						left: { style: 'thin', color: { argb: 'FF000000' } }
					};

					row.eachCell((cell) => {
						cell.alignment = { horizontal: 'right' };
					});

					trialCount++;
				});
			}
		};

		function getTransitionColor(startColor, endColor, step, maxSteps) {
			const startRed = parseInt(startColor.substr(2, 2), 16);
			const startGreen = parseInt(startColor.substr(4, 2), 16);
			const startBlue = parseInt(startColor.substr(6, 2), 16);

			const endRed = parseInt(endColor.substr(2, 2), 16);
			const endGreen = parseInt(endColor.substr(4, 2), 16);
			const endBlue = parseInt(endColor.substr(6, 2), 16);

			const redDiff = endRed - startRed;
			const greenDiff = endGreen - startGreen;
			const blueDiff = endBlue - startBlue;

			const redStep = Math.floor((redDiff / maxSteps) * step);
			const greenStep = Math.floor((greenDiff / maxSteps) * step);
			const blueStep = Math.floor((blueDiff / maxSteps) * step);

			const red = (startRed + redStep).toString(16).padStart(2, '0');
			const green = (startGreen + greenStep).toString(16).padStart(2, '0');
			const blue = (startBlue + blueStep).toString(16).padStart(2, '0');

			return `FF${red}${green}${blue}`;
		}
		setStyling(worksheetAB);
		setStyling(worksheetCC);
		setStyling(worksheetSiB);
		// setStyling(worksheetVAB);

		setHeaderStyling(worksheetAB);
		setHeaderStyling(worksheetCC);
		setHeaderStyling(worksheetSiB);
		// setHeaderStyling(worksheetVAB);

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

	// 	async function getLastRefreshed() {

	// 	// https://vercel.com/docs/rest-api#endpoints/deployments/get-a-deployment-by-id-or-url
	// const deploymentId = 'https://chris-letters-hdpcgl987-garik-asplunds-projects.vercel.app' // replace with your own
	// // https://vercel.com/support/articles/how-do-i-use-a-vercel-api-access-token
	// const accessToken = import.meta.env.VERCEL_ACCESS_TOKEN
	// const result = await fetch(
	//     `https://api.vercel.com/v13/deployments/${deploymentId}`,
	//     {
	//         method: 'GET',
	//         headers: {
	//             Authorization: `Bearer ${accessToken}`,
	//         }
	//     }
	// );

	// // ms since epoch for when the deployment finished
	// const { ready } = await result.json() // 1650903484801
	// // convert to human-readable date
	// const lastDeployedTime = new Date(ready).toLocaleString() // 4/25/2022, 9:18:04 AM
	// console.log(lastDeployedTime);
	// return lastDeployedTime;
	// 	}

	// let lastRefreshed = new Date().toString();

	async function getLastDeploymentTime() {
		const projectId = 'prj_6FlC2PslQXROINoxpnJrgAMisFU1'; // Your project ID
		const token = import.meta.env.VITE_VERCEL_ACCESS_TOKEN;

		const response = await fetch(
			`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1`,
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);

		const data = await response.json();

		if (data.deployments && data.deployments.length > 0) {
			const lastDeployment = data.deployments[0];
			const deploymentTime = new Date(lastDeployment.created);
			return deploymentTime.toLocaleString();
		}

		return 'No deployments found';
	}

	// Usage
	getLastDeploymentTime().then((time) => {
		document.getElementById('last-deployment').textContent = `Last deployed: ${time}`;
	});
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
<p class="text-center">Displaying at {$refreshRate} FPS</p>
<p class="text-center" id="last-deployment">Last deployed OOPSiES</p>
