const beautify = function (codeStr) {
  const process = (str) => {
    let div = document.createElement('div');
    div.innerHTML = str.trim();
    return format(div, 0).innerHTML.trim();
  }

  const format = (node, level) => {
    let indentBefore = new Array(level++ + 1).join('  '),
      indentAfter = new Array(level - 1).join('  '),
      textNode;

    for (let i = 0; i < node.children.length; i++) {
      textNode = document.createTextNode('\n' + indentBefore);
      node.insertBefore(textNode, node.children[i]);

      format(node.children[i], level);

      if (node.lastElementChild === node.children[i]) {
        textNode = document.createTextNode('\n' + indentAfter);
        node.appendChild(textNode);
      }
    }

    return node;
  }
  return process(codeStr).replace(/\s{1}[_]{2}(self|source)[=]["]\[object Object\]["]/g, '');
}

export { beautify as beautifyHTML };
export default beautify;
