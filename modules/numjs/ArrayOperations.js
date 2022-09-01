function formArray(length, element) {
    let ret = [];
    for (let i = 0; i < length; i++)
        ret.push(element);
    return ret;
}

export { formArray }