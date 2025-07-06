import { CONTINUE, visit, type Visitor } from "unist-util-visit";
import type { Root, Node, Text, Parent, RootContent } from "mdast";
import { u } from "unist-builder";

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



  // Left part is all before the [[foo]]
  const leftPart = content.slice(0, leftIdx);
  visitee.value = leftPart;
  const leftNode = visitee;

  // Middle bit is a link element, the `foo` in [[foo]]
  const middle = content.slice(leftIdx + 2, rightIdx);
  const middleNode = u('link', {url: middle}, [
    u('text', middle),
  ]);

  // Right bit is just the rest (after the [[foo]])
  const rightPart = content.slice(rightIdx +2);
  const rightNode = u('text', rightPart);

  // changeParent
  const newNodes: RootContent[] = [leftNode, middleNode, rightNode];
  parent.children.splice(index, 1, ...newNodes)

  return CONTINUE;
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