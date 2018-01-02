
export default function getTranslate(node) {
    const transs = node.attr("transform").split(' ');

    const translate = transs[0].substring(transs[0].indexOf("(")+1, transs[0].indexOf(")")).split(",").map(parseFloat);
    const scale = transs[1] ? parseFloat(transs[1].substring(transs[1].indexOf("(")+1, transs[1].indexOf(")"))) : 1

    return [
        ...translate,
        scale
    ]
}
