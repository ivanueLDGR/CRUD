function validateFields(characterRequest){
    let statusArray = []
    let status = {status: "error", message: "statusMessageGenerator function not initialized"}
    const characterRequestDesconstructed = {...characterRequest}
    statusArray.push(validateName(characterRequestDesconstructed.name))
    statusArray.push(validateClasse(characterRequestDesconstructed.classe))
    statusArray.push(validateHabilidades(characterRequestDesconstructed.habilidades))
    statusArray.push(validateAge(characterRequestDesconstructed.age))
    statusArray.push(validateItens(characterRequestDesconstructed.itens))
    status = statusMessageGenerator(statusArray)
    return status
}

function statusMessageGenerator(statusArray){
    let status = {status: "ok", message: ""}
    for (var i in statusArray){
        if(statusArray[i].status != "ok"){
            status.status = "error"
            status.message = status.message + `your ${Object.values(statusArray[i])[1]} is ${Object.values(statusArray[i])[0]}, `
        }
    }
    return status
}

function validateName(name){
    const nameRegex = /^(?! )[A-Za-z]+(?: [A-Za-z]+)*$/
    if (!name){
        return {status: "missing", field: "name"};
    }else if (!verifyRegex(name, nameRegex)){
        return {status: "incorrect", field: "name"}
    }
    return {status: "ok", field: "name"}
}

function validateClasse(classe){
    const classeRegex = /^(?! )[A-Za-z]+$/
    if (!classe){
        return {status: "missing", field: "classe"};
    }else if (!verifyRegex(classe, classeRegex)){
        return {status: "incorrect", field: "classe"}
    }
    return {status: "ok", field: "classe"}
}

function validateHabilidades(habilidades){
    if (!habilidades){
        return {status: "missing", field: "habilidades"};
    }else if (!Array.isArray(habilidades)){
        return {status: "incorrect", field: "habilidades"}
    }
    return {status: "ok", field: "habilidades"}
}

function validateAge(age){
    const ageRegex = /^\d{1,100}$/
    if (!age){
        return {status: "missing", field: "age"};
    }else if (age < 1 || !verifyRegex(age.toString(), ageRegex)){   
        return {status: "incorrect", field: "age"}
    }
    return {status: "ok", field: "age"}
}

function validateItens(itens){
    if (!itens){
        return {status: "missing", field: "itens"};
    }else if (!Array.isArray(itens)){
        return {status: "incorrect", field: "itens"}
    }
    return {status: "ok", field: "itens"}
}

function verifyRegex(text, regex){
    return regex.test(text)
}

module.exports = {
    validateFields,
    statusMessageGenerator
}