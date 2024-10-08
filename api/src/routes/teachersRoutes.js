const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
let teachersData = require('../db/teachers.json');

function teachersLoad() { //carrega os dados dos professores pelo arquivo JSON
    try {
        teachersData = JSON.parse(fs.readFileSync('./src/db/teachers.json', 'utf8'));
        console.log('Dados dos professores carregados com sucesso.');
    } catch (err) {
        console.log('Erro ao carregar os dados dos professores:', err);
    }
}

function teachersWrite(data) { //escreve novos dados no arquivo JSON dos professores
    try {
        fs.writeFileSync('./src/db/teachers.json', JSON.stringify(data, null, 2), 'utf8');
        console.log('Dados dos professores escritos com sucesso.');
    } catch (err) {
        console.error('Não foi possível escrever os dados dos professores:', err);
    }
}

router.get('/', (req, res) => { //método GET que lista todos os registros
    teachersLoad();
    res.json(teachersData);
});

router.get('/:id', (req, res) => { //método GET por ID que lista apenas um registro
    teachersLoad();
    const teacher = teachersData.find(teacher => teacher.id === req.params.id);
    if (!teacher) return res.status(404).send('Nenhum professor encontrado com o ID informado.');
    res.json(teacher);
});

router.get('/:name', (req, res) => { // método GET por nome
    teachersLoad();
    const { name } = req.query;
    let teachersFilter = teachersData;

    if (name) {
        teachersFilter = teachersFilter.filter(teacher => teacher.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (teachersFilter.length === 0) {
        return res.status(404).send('Nenhum professor encontrado com os critérios fornecidos.');
    }

    res.json(teachersFilter);
});

router.put('/:id', (req, res) => { //método PUT (Update) que atualiza um registro especificado por ID
    teachersLoad();
    const index = teachersData.findIndex(teacher => teacher.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhum professor encontrado com o ID informado.');

    teachersData[index] = { ...teachersData[index], ...req.body };
    teachersWrite(teachersData);
    res.json({ message: 'Professor atualizado com sucesso!', teacher: teachersData[index] });
});

router.post('/', (req, res) => { // método POST que cadastra um novo registro
    teachersLoad();
    const teacher = req.body;
    const id = uuidv4();
    const teacherWithId = { id, ...teacher };
    teachersData.push(teacherWithId);
    teachersWrite(teachersData);
    res.status(201).json({ message: 'Professor adicionado com sucesso!', teacher: teacherWithId });
});

router.delete('/:id', (req, res) => { // método DELETE que deleta um registro especificado por ID
    teachersLoad();
    const index = teachersData.findIndex(teacher => teacher.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhum professor encontrado com o ID informado.');

    teachersData.splice(index, 1);
    teachersWrite(teachersData);
    res.status(204).send({ message: 'Professor removido com sucesso!' });
});

module.exports = router;