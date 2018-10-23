//Código para gerar as cartas do truco
//Código de qualidade duvidosa

var fs = require('fs')

function verificaEspecial(combinacao,combinacoes_especiais){
    return new Promise((resolve, reject) => {
        combinacoes_especiais.forEach((combinacao_especial) => {
            if (combinacao_especial[0] == combinacao[0] && combinacao_especial[1] == combinacao[1]){
                reject()
            }
        })
        resolve()
    })
}

function valoresComuns(){
    return new Promise((resolve, reject) => {
        const naipes = ["paus","copas","espadas","ouros"]
        const valores = ["4","5","6","7","Q","J","K","A","2","3"]
        const combinacoes_especiais = [["7", "ouros"], ["A", "espadas"], ["7", "copas"], ["4","paus"]]
        var baralho = []
        valores.forEach((valor, index) => {
            naipes.forEach((naipe) => {
                var combinacao = [valor,naipe]
                verificaEspecial(combinacao, combinacoes_especiais).then(() => {
                    baralho.push({
                        naipe,
                        valor,
                        peso:index
                    })
                }, () => {
                    console.log("rejected")
                })
            })
        })
        resolve(baralho)
    })
}

function valoresEspeciais(){
    return new Promise((resolve,reject) => {
        var baralho = []
        const combinacoes_especiais = [["7", "ouros"], ["A", "espadas"], ["7", "copas"], ["4","paus"]]
        combinacoes_especiais.forEach((combinacao, index) => {
            baralho.push({
                naipe: combinacao[1],
                valor: combinacao[0],
                peso: index + 10
            })
        })
        resolve(baralho)
    })
}

function escreveArquivo(baralho){
    var json = JSON.stringify(baralho)

    fs.writeFile('cartas.json', json, function(err, data){
        if (err) console.log(err);
        console.log("Escreveu no arquivo com sucesso!");
    });
}


function main(){
    var baralho = []
    valoresComuns().then((resultado) => {
        baralho = resultado
        valoresEspeciais().then((resultadoEspeciais) => {
            baralho = baralho.concat(resultadoEspeciais)
            escreveArquivo(baralho)
        })
    })
}

main()




