<script>
    import * as ExcelJS from 'exceljs';
    import fs from 'fs';

    const data = 
    {
        "blocks": {
            "b": {
            "accuracy": [
                1,
                1,
                1,
                1,
                1
            ],
            "guesses": [
                "H",
                "X",
                "W",
                "D",
                "H"
            ],
            "reactionTime": [
                615,
                1621,
                1082,
                792,
                665
            ],
            "targets": [
                "H",
                "X",
                "W",
                "D",
                "H"
            ],
            "trialType": "CC"
            },
            "n": {
            "accuracy": [
                1,
                0,
                1,
                1,
                1
            ],
            "guesses": [
                "Y",
                "W",
                "W",
                "M",
                "F"
            ],
            "reactionTime": [
                800,
                778,
                663,
                661,
                762
            ],
            "targets": [
                "Y",
                "K",
                "W",
                "M",
                "F"
            ],
            "trialType": "CC"
            },
            "test": {
            "accuracy": [
                1,
                1,
                1,
                1,
                0
            ],
            "guesses": [
                "L",
                "S",
                "D",
                "L",
                "T"
            ],
            "reactionTime": [
                634,
                644,
                633,
                581,
                1328
            ],
            "targets": [
                "L",
                "S",
                "D",
                "L",
                "D"
            ],
            "trialType": "CC"
            }
        }
    };

    function crunchData() {
        console.log("clicked!!");
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Blocks');

        // Add headers
        const headers = [
            'Trial Type',
            'Targets',
            'Guesses',
            'Accuracy',
            'Reaction Time',
        ];
        
        worksheet.addRow(headers);

        // Loop through the 'blocks' data
        for (const blockKey in data.blocks) {
            const block = data.blocks[blockKey];
            const newRow = [
                block.trialType,
                block.targets.join(', '),
                block.guesses.join(', '),
                block.accuracy.join(', '),
                block.reactionTime.join(', '),
            ];
            worksheet.addRow(newRow);
        }

        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const excelFilePath = 'blocks_data.xlsx'; // You can adjust the filename
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = excelFilePath;
            a.click();
            URL.revokeObjectURL(a.href);
            });
  }
</script>

<div class="flex flex-col items-center justify-center h-screen">
    <button class="px-4 py-2 font-semibold text-gray-600 -translate-y-24 bg-transparent border border-gray-500 rounded hover:bg-gray-500 hover:text-white hover:border-transparent" on:click={crunchData}>
        Export data
    </button> 
</div>
