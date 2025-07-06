import { visit, type Visitor} from "unist-util-visit";
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

  // 2. If you do not contain `[[foo]]`, bail
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