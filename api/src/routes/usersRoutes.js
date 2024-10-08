const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
let usersData = require('../db/users.json');

function usersLoad() { //carrega os dados dos usuários pelo arquivo JSON
    try {
        usersData = JSON.parse(fs.readFileSync('./src/db/users.json', 'utf8'));
        console.log('Dados dos usuários carregados com sucesso.');
    } catch (err) {
        console.log('Erro ao carregar os dados dos usuários:', err);
    }
}

function usersWrite(data) { //escreve novos dados no arquivo JSON dos usuários
    try {
        fs.writeFileSync('./src/db/users.json', JSON.stringify(data, null, 2), 'utf8');
        console.log('Dados dos usuários escritos com sucesso.');
    } catch (err) {
        console.error('Não foi possível escrever os dados dos usuários:', err);
    }
}

router.get('/', (req, res) => { // Método GET que lista todos os registros ou filtra por nome
    usersLoad();
    const { name } = req.query;
    let usersFilter = usersData;

    if (name) {
        usersFilter = usersFilter.filter(user => user.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (usersFilter.length === 0) {
        return res.status(404).send('Nenhuma consulta encontrada com os critérios fornecidos.');
    }

    res.json(usersFilter);
});

router.get('/:id', (req, res) => { //método GET por ID que lista apenas um registro
    usersLoad();
    const user = usersData.find(user => user.id === req.params.id);
    if (!user) return res.status(404).send('Nenhum usuário encontrado com o ID informado.');
    res.json(user);
});

router.put('/:id', (req, res) => { //método PUT (Update) que atualiza um registro especificado por ID
    usersLoad();
    const index = usersData.findIndex(user => user.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhum usuário encontrado com o ID informado.');

    usersData[index] = { ...usersData[index], ...req.body };
    usersWrite(usersData);
    res.json({ message: 'Usuário atualizado com sucesso!', user: usersData[index] });
});

router.post('/', (req, res) => { // método POST que cadastra um novo registro
    usersLoad();
    const user = req.body;
    const id = uuidv4();
    const userWithId = { id, ...user };
    usersData.push(userWithId);
    usersWrite(usersData);
    res.status(201).json({ message: 'Usuário adicionado com sucesso!', user: userWithId });
});

router.delete('/:id', (req, res) => { // método DELETE que deleta um registro especificado por ID
    usersLoad();
    const index = usersData.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhum usuário encontrado com o ID informado.');

    usersData.splice(index, 1);
    usersWrite(usersData);
    res.status(204).send({ message: 'Usuário removido com sucesso!' });
});

module.exports = router;