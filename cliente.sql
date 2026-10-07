CREATE TABLE cliente 
( 
 id INT PRIMARY KEY AUTO_INCREMENT,  
 nome VARCHAR(100) NOT NULL,  
 cpf CHAR(14) NOT NULL UNIQUE,  
 celular CHAR(14) NOT NULL,  
 email VARCHAR(100) NOT NULL UNIQUE,  
 senha VARCHAR(512) NOT NULL
); 
DROP TABLE cliente;

#CADASTRAR VOCÊ NO BANCO DE DADOS:
INSERT INTO cliente (
    nome, cpf, celular, email, senha
) VALUES (
    "Patrick", "111.222.333-44", 
    "(42)99999-4444", "patrick@gmail.com",
    "EAUHEAUISHEUIEAIS"
);

# Depois, pedir para a IA criar 10 clientes
# fictícios
INSERT INTO cliente (nome, cpf, celular, email, senha) VALUES 
('Lucas Silva', '222.333.444-55', '(42)99888-1111', 'lucas.silva@gmail.com', 'JSUAHSIDHAISUHD'),
('Mariana Costa', '333.444.555-66', '(41)99777-2222', 'mari.costa@hotmail.com', 'KASJDKAJSHDKAJS'),
('Carlos Eduardo', '444.555.666-77', '(11)99666-3333', 'carlos.edu@outlook.com', 'QWEOIUQWOIEUQWO'),
('Ana Beatriz', '555.666.777-88', '(21)99555-4444', 'ana.bia@gmail.com', 'ZMXNCBVMZNCBVZ'),
('Rodrigo Souza', '666.777.888-99', '(31)99444-5555', 'rodrigo.souza@yahoo.com', 'PLMOKNJBHIUYT'),
('Juliana Mendes', '777.888.999-00', '(42)99333-6666', 'ju.mendes@gmail.com', 'OEIUROYTIREUYT'),
('Fernando Dias', '888.999.000-11', '(43)99222-7777', 'fernando.dias@outlook.com', 'ASDFGHJKLPOIUY'),
('Beatriz Rocha', '999.000.111-22', '(41)99111-8888', 'bia.rocha@hotmail.com', 'MNBVCXZLKJHGFD'),
('Ricardo Alves', '000.111.222-33', '(11)99000-9999', 'ricardo.alves@gmail.com', 'POIUYTREWQASDF'),
('Patrício Antunes', '123.456.789-10', '(21)98999-0000', 'paty.antunes@gmail.com', 'ZXCVBNMASDFGHJ');


SELECT email, senha FROM cliente;

SELECT email, senha FROM cliente 
WHERE email = "ana.silva@email.com";

SELECT * FROM cliente WHERE id <= 30 AND LENGTH(senha) > 20;

SELECT * FROM cliente;

DELETE FROM cliente WHERE id = 37;

UPDATE cliente 
SET nome = "Patrick Staroin", email = "p@gmail.com" 
WHERE id = 35;