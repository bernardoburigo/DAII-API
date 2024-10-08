const express = require('express');
const app = express();
const routes = require('./routes');
const { v4: uuidv4 } = require('uuid');
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const cors = require("cors");
app.use(cors());

app.use(express.json());

const options = {

	definition: {

		openapi: "3.0.0",

		info: {
			title: "DAII-API",
			version: "1.0.0",
			description: `API para o trabalho 1 de Desenvolvimento de Aplicações II 2024.
                        Equipe: Bernardo Goulart Búrigo`,

            license: {
            name: 'Desenvolvimento de Aplicações II',
            },

            contact: {
            name: 'Bernardo Goulart Búrigo'
            },

	    },

		servers: [{
			url: "http://localhost:8080/",
            description: 'Development server',
		},],

	},

	apis: ["./routes/*.js"],

};
const specs = swaggerJsDoc(options);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
app.use('/', routes)

const PORT = 8080;
app.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`));