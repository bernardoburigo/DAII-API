const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
let studentsData = require('../db/students.json');

function studentsLoad() { //carrega os dados dos estudantes pelo arquivo JSON
    try {
        studentsData = JSON.parse(fs.readFileSync('./src/db/students.json', 'utf8'));
        console.log('Dados dos estudantes carregados com sucesso.');
    } catch (err) {
        console.log('Erro ao carregar os dados dos estudantes:', err);
    }
}

function studentsWrite(data) { //escreve novos dados no arquivo JSON dos estudantes
    try {
        fs.writeFileSync('./src/db/students.json', JSON.stringify(data, null, 2), 'utf8');
        console.log('Dados dos estudantes escritos com sucesso.');
    } catch (err) {
        console.error('Não foi possível escrever os dados dos estudantes:', err);
    }
}

router.get('/', (req, res) => { //método GET que lista todos os registros
    studentsLoad();
    res.json(studentsData);
});

router.get('/:id', (req, res) => { //método GET por ID que lista apenas um registro
    studentsLoad();
    const student = studentsData.find(student => student.id === req.params.id);
    if (!student) return res.status(404).send('Nenhum estudante encontrado com o ID informado.');
    res.json(student);
});

router.get('/', (req, res) => { // método GET por nome
    studentsLoad();
    const { name } = req.query;
    let studentsFilter = studentsData;

    if (name) {
        studentsFilter = studentsFilter.filter(student => student.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (studentsFilter.length === 0) {
        return res.status(404).send('Nenhum estudante encontrado com os critérios fornecidos.');
    }

    res.json(studentsFilter);
});

router.update('/:id', (req, res) => { //método PUT (Update) que atualiza um registro especificado por ID
    studentsLoad();
    const index = studentsData.findIndex(student => student.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhum estudante encontrado com o ID informado.');

    studentsData[index] = { ...studentsData[index], ...req.body };
    studentsWrite(studentsData);
    res.json({ message: 'Estudante atualizado com sucesso!', student: studentsData[index] });
});

router.post('/', (req, res) => { // método POST que cadastra um novo registro
    studentsLoad();
    const student = req.body;
    const id = uuidv4();
    const studentWithId = { id, ...student };
    studentsData.push(studentWithId);
    studentsWrite(studentsData);
    res.status(201).json({ message: 'Estudante adicionado com sucesso!', student: studentWithId });
});

router.delete('/:id', (req, res) => { // método DELETE que deleta um registro especificado por ID
    studentsLoad();
    const index = studentsData.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhum estudante encontrado com o ID informado.');

    studentsData.splice(index, 1);
    studentsWrite(studentsData);
    res.status(204).send({ message: 'Estudante removido com sucesso!' });
});

module.exports = router;