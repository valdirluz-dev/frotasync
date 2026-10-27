export interface IDdadosPessoais {
    nome: string;
    cpf: string;
    telefone: string;
    cargo: string;
}

export async function mockValidarDadosPessoais(dados:IDdadosPessoais) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!dados.nome || !dados.cpf || !dados.telefone || !dados.cargo){
        return {success: false, message: "Preencha todos os dados."};
    }

    return {success: true, message: "Dados pessoais válidos!"};
    
}