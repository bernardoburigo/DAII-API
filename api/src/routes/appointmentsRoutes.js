const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
let appointmentsData = require('../db/appointments.json');

function appointmentsLoad() { //carrega os dados das consultas pelo arquivo JSON
    try {
        appointmentsData = JSON.parse(fs.readFileSync('./src/db/appointments.json', 'utf8'));
        console.log('Dados das consultas carregados com sucesso.');
    } catch (err) {
        console.log('Erro ao carregar os dados das consultas:', err);
    }
}

function appointmentsWrite(data) { //escreve novos dados no arquivo JSON das consultas
    try {
        fs.writeFileSync('./src/db/appointments.json', JSON.stringify(data, null, 2), 'utf8');
        console.log('Dados das consultas escritos com sucesso.');
    } catch (err) {
        console.error('Não foi possível escrever os dados das consultas:', err);
    }
}

router.get('/', (req, res) => { //método GET que lista todos os registros
    appointmentsLoad();
    res.json(appointmentsData);
});

router.get('/:id', (req, res) => { //método GET por ID que lista apenas um registro
    appointmentsLoad();
    const appointment = appointmentsData.find(appointment => appointment.id === req.params.id);
    if (!appointment) return res.status(404).send('Nenhuma consulta encontrada com o ID informado.');
    res.json(appointment);
});

router.get('/:date', (req, res) => { // método GET por data
    appointmentsLoad();
    const { date } = req.query;
    let appointmentsFilter = appointmentsData;

    if (date) {
        appointmentsFilter = appointmentsFilter.filter(appointment => appointment.date.toLowerCase().includes(date.toLowerCase()));
    }

    if (appointmentsFilter.length === 0) {
        return res.status(404).send('Nenhuma consulta encontrada com os critérios fornecidos.');
    }

    res.json(appointmentsFilter);
});

router.put('/:id', (req, res) => { //método PUT (Update) que atualiza um registro especificado por ID
    appointmentsLoad();
    const index = appointmentsData.findIndex(appointment => appointment.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhuma consulta encontrada com o ID informado.');

    appointmentsData[index] = { ...appointmentsData[index], ...req.body };
    appointmentsWrite(appointmentsData);
    res.json({ message: 'Consulta atualizada com sucesso!', appointment: appointmentsData[index] });
});

router.post('/', (req, res) => { // método POST que cadastra um novo registro
    appointmentsLoad();
    const appointment = req.body;
    const id = uuidv4();
    const appointmentWithId = { id, ...appointment };
    appointmentsData.push(appointmentWithId);
    appointmentsWrite(appointmentsData);
    res.status(201).json({ message: 'Consulta adicionada com sucesso!', appointment: appointmentWithId });
});

router.delete('/:id', (req, res) => { // método DELETE que deleta um registro especificado por ID
    appointmentsLoad();
    const index = appointmentsData.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhuma consulta encontrada com o ID informado.');

    appointmentsData.splice(index, 1);
    appointmentsWrite(appointmentsData);
    res.status(204).send({ message: 'Consulta removida com sucesso!' });
});

module.exports = router;