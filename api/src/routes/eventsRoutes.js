const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
let eventsData = require('../db/events.json');

function eventsLoad() { //carrega os dados dos eventos pelo arquivo JSON
    try {
        eventsData = JSON.parse(fs.readFileSync('./src/db/events.json', 'utf8'));
        console.log('Dados dos eventos carregados com sucesso.');
    } catch (err) {
        console.log('Erro ao carregar os dados dos eventos:', err);
    }
}

function eventsWrite(data) { //escreve novos dados no arquivo JSON dos eventos
    try {
        fs.writeFileSync('./src/db/events.json', JSON.stringify(data, null, 2), 'utf8');
        console.log('Dados dos eventos escritos com sucesso.');
    } catch (err) {
        console.error('Não foi possível escrever os dados dos eventos:', err);
    }
}

router.get('/', (req, res) => { //método GET que lista todos os registros
    eventsLoad();
    res.json(eventsData);
});

router.get('/:id', (req, res) => { //método GET por ID que lista apenas um registro
    eventsLoad();
    const event = eventsData.find(event => event.id === req.params.id);
    if (!event) return res.status(404).send('Nenhum evento encontrado com o ID informado.');
    res.json(event);
});

router.get('/', (req, res) => { // método GET por data
    eventsLoad();
    const { date } = req.query;
    let eventsFilter = eventsData;

    if (date) {
        eventsFilter = eventsFilter.filter(event => event.date.toLowerCase().includes(date.toLowerCase()));
    }

    if (eventsFilter.length === 0) {
        return res.status(404).send('Nenhum evento encontrado com os critérios fornecidos.');
    }

    res.json(eventsFilter);
});

router.update('/:id', (req, res) => { //método PUT (Update) que atualiza um registro especificado por ID
    eventsLoad();
    const index = eventsData.findIndex(event => event.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhum evento encontrado com o ID informado.');

    eventsData[index] = { ...eventsData[index], ...req.body };
    eventsWrite(eventsData);
    res.json({ message: 'Evento atualizado com sucesso!', event: eventsData[index] });
});

router.post('/', (req, res) => { // método POST que cadastra um novo registro
    eventsLoad();
    const event = req.body;
    const id = uuidv4();
    const eventWithId = { id, ...event };
    eventsData.push(eventWithId);
    eventsWrite(eventsData);
    res.status(201).json({ message: 'Evento adicionado com sucesso!', event: eventWithId });
});

router.delete('/:id', (req, res) => { // método DELETE que deleta um registro especificado por ID
    eventsLoad();
    const index = eventsData.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhum evento encontrado com o ID informado.');

    eventsData.splice(index, 1);
    eventsWrite(eventsData);
    res.status(204).send({ message: 'Evento removido com sucesso!' });
});

module.exports = router;