(function () {
    var config = {
        type: 'line',
        data: {
            labels: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
            datasets: [
//                {
//                    backgroundColor: 'rgb(54, 162, 235)',
//                    borderColor: 'rgb(54, 162, 235)',
//                    data: [],
//                    fill: false,
//                    label: 'Amy',
//                    lineTension: 0
//                },
//                {
//                    backgroundColor: 'rgb(75, 192, 192)',
//                    borderColor: 'rgb(75, 192, 192)',
//                    data: [],
//                    fill: false,
//                    label: 'Katy',
//                    lineTension: 0
//                },
//                {
//                    backgroundColor: 'rgb(255, 99, 132)',
//                    borderColor: 'rgb(255, 99, 132)',
//                    data: [],
//                    fill: false,
//                    label: 'Luke',
//                    lineTension: 0
//                }
            ]
        },
        options: {
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: false,
                        labelString: 'Month'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: false,
                        labelString: 'Value'
                    }
                }]
            }
        }
    };

    window.onload = function() {
        var ctx = document.getElementById('canvas').getContext('2d');
        console.log('ctx', ctx);
        window.myLine = new Chart(ctx, config);

        restoreInputs();
    };

    function restoreInputs() {
        const scores = getScores();

        if (!scores) {
            return;
        }

        Object.entries(scores).forEach(([name, score]) => {
            console.log('name, score', name, score);

            addPlayer(name);

            const inputs = getScoreInputs()
            const nameInputs = inputs.filter(input => input.name.split('-')[0] === name);

            Object.entries(score).forEach(([round, score]) => {
                const roundInput = nameInputs.filter(input => input.name.split('-')[1] === round)[0];

                roundInput.value = score;
            });
        });

        Object.entries(scores).forEach(([name, score]) => {
            config.data.datasets.forEach(dataset => {
                if (dataset.label === name) {
                    const orderedRoundScores = Object.entries(score).sort((a, b) => parseInt(b[0]) - parseInt(a[0])).map(a => a[1]);
                    let sum;
                    const roundSums = orderedRoundScores.map(elem => sum = (sum || 0) + elem);

                    dataset.data = roundSums;
                }
            });
        });

        window.myLine.update();
    }

    function getScoreInputs() {
        return [...document.querySelectorAll('input.score-input')];
    }

    function getRemovePlayerButtons() {
        return [...document.querySelectorAll('button[id*=btn-remove-player]')];
    }

    function addPlayerDataset(name) {
        const color = `
            rgb(
                ${Math.floor(Math.random() * 256)},
                ${Math.floor(Math.random() * 256)},
                ${Math.floor(Math.random() * 256)}
            )
        `;
        config.data.datasets.push({
            backgroundColor: color,
            borderColor: color,
            data: [],
            fill: false,
            label: name,
            lineTension: 0
        });
    }

    function createPlayerRowHtml(name) {
            return `
                <td>${name}</td>
                <td><input class="score-input" type="number" name="${name}-12"></td>
                <td><input class="score-input" type="number" name="${name}-11"></td>
                <td><input class="score-input" type="number" name="${name}-10"></td>
                <td><input class="score-input" type="number" name="${name}-9"></td>
                <td><input class="score-input" type="number" name="${name}-8"></td>
                <td><input class="score-input" type="number" name="${name}-7"></td>
                <td><input class="score-input" type="number" name="${name}-6"></td>
                <td><input class="score-input" type="number" name="${name}-5"></td>
                <td><input class="score-input" type="number" name="${name}-4"></td>
                <td><input class="score-input" type="number" name="${name}-3"></td>
                <td><input class="score-input" type="number" name="${name}-2"></td>
                <td><input class="score-input" type="number" name="${name}-1"></td>
                <td><input class="score-input" type="number" name="${name}-0"></td>
                <td><button id="btn-remove-player-${name}">Remove Player</button></td>
            `;
    }

    function getScores() {
        return JSON.parse(sessionStorage.getItem('scores'));
    }

    function saveScores(scores) {
        sessionStorage.setItem('scores', JSON.stringify(scores));
    }

    // Events

    document.getElementById('btn-new-game').addEventListener('click', () => {
        console.log('btn-new-game click');

        let scores = getScores();
        scores = scores || {};

        Object.keys(scores).forEach(name => {
            scores[name] = {};
        });

        saveScores(scores);

        const inputs = getScoreInputs();

        inputs.forEach(input => {
            input.value = undefined;
        });

        config.data.datasets.forEach(dataset => {
            dataset.data = [];
        });

        window.myLine.update();
    });

    document.getElementById('btn-add-player').addEventListener('click', () => {
        console.log('btn-add-player click');

        inputAddPlayer = document.getElementById('input-add-player');
        const newPlayer = inputAddPlayer.value;
        inputAddPlayer.value = '';

        addPlayer(newPlayer);
    });

    function addRemovePlayerButtonEventListener(button) {
        button.addEventListener('click', () => {
            console.log('btn-remove-player click');

            const name = button.id.split('-')[3];
            console.log('name', name);

            removePlayer(name);
        });
    }

    function addPlayer(name) {
        const tbody = document.getElementsByTagName('tbody')[0];
        const newRow = tbody.insertRow(tbody.rows.length);

        newRow.innerHTML = createPlayerRowHtml(name);

        addScoreInputEventListeners([...document.querySelectorAll(`input[name*=${name}]`)]);
        addRemovePlayerButtonEventListener(document.querySelector(`button#btn-remove-player-${name}`));

        addPlayerDataset(name);

        let scores = getScores();
        scores = scores || {};

        if (!scores[name]) {
            scores[name] = {};
        }

        saveScores(scores);

        window.myLine.update();
    }

    function removePlayer(name) {
        const tbody = document.getElementsByTagName('tbody')[0];

        const rowIndex = [...tbody.rows].findIndex(row => row.children[0].innerHTML === name);
        tbody.deleteRow(rowIndex);

        const dataSetIndex = config.data.datasets.findIndex(dataset => dataset.label === name);
        config.data.datasets.splice(dataSetIndex, 1);

        let scores = getScores();
        scores = scores || {};

        if (scores[name]) {
            delete scores[name];
        }

        saveScores(scores);

        window.myLine.update();
    }

    function addScoreInputEventListeners(inputs) {
        inputs.forEach(element => {
            element.addEventListener('change', function(e) {
                console.log('e', e);
                const [name, round] = e.target.name.split('-');
                const score = parseInt(e.target.value);
                
                let scores = getScores();
                console.log('scores', scores);
                scores = scores || {};

                let nameScore = scores[name];
                console.log('nameScore', nameScore);
                nameScore = nameScore || {};

                nameScore[round] = score;

                saveScores({...scores, [name]: nameScore});

                config.data.datasets.forEach(dataset => {
                    console.log('dataset', dataset);
                    if (dataset.label === name) {
                        const orderedRoundScores = Object.entries(nameScore).sort((a, b) => parseInt(b[0]) - parseInt(a[0])).map(a => a[1]);
                        let sum;
                        const roundSums = orderedRoundScores.map(elem => sum = (sum || 0) + elem);

                        dataset.data = roundSums;
                    }
                });

                window.myLine.update();
            });
        });
    }

    addScoreInputEventListeners(getScoreInputs());
})();
