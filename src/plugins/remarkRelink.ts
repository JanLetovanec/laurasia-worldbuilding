import { CONTINUE, visit, type Visitor } from "unist-util-visit";
import type { Root, Node , Text, Parent} from "mdast";

const isText = (node: Node) : node is Text => {
  return node.type == 'text';
};

const isParent = (node: Node | undefined) : node is Parent => {
  if (node === undefined) {
    return false;
  }

  const maybeParent = node as unknown as Parent;
  return maybeParent.children !== undefined;
}


const visitAndRelink : Visitor = (
  visitee: Node,
  index: number | undefined,
  parent: Node | undefined) => {
  if (!isText(visitee) || !isParent(parent) || index == null) {
    return;
  }

  const content = visitee.value;
  const leftIdx = content.indexOf("[[");

  if (leftIdx === -1) {
    return CONTINUE;
  }

  const rightIdx = content.indexOf("]]", leftIdx);
  if (rightIdx === -1) {
    return CONTINUE;
  }

  // 3. Otherwise "map" the node to "previous stuff" [foo](foo) "next stuff"
}


export default function remarkRelink() {
  /**
   * @param {Root} tree
   * @return {undefined}
   */
  return (tree: Root): undefined => {
    visit(tree, 'text', visitAndRelink);
  };
}