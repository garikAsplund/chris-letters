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
		SiB: {},
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
							trials[trial].reactionTime[0],
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
