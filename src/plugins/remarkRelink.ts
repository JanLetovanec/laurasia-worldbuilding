import { visit, type Visitor} from "unist-util-visit";
import type { Root, Node } from "mdast";

const visitAndRelink : Visitor = (
  visitee: Node,
  index: number | undefined,
  parent: Node | undefined) => {
  // 1. If you are text node bail
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