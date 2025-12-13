import type { MarkdownHeading } from "astro";

export interface MarkdownHeadingWithSubheadings extends MarkdownHeading {
  subheadings: MarkdownHeadingWithSubheadings[];
}

const isParentViable = (heading: MarkdownHeadingWithSubheadings, parent: MarkdownHeadingWithSubheadings | undefined) => {
  return parent === undefined || parent.depth < heading.depth;
}

export const buildTableOfContents = (headings: MarkdownHeading[]) => {
  const contents: MarkdownHeadingWithSubheadings[] = [];
  const parentStack: MarkdownHeadingWithSubheadings[] = [];
  
  headings.forEach((h) => {
    const heading = { ...h, subheadings: [] };

    // Find the next eligible parent
    let parentCandidate = parentStack.pop();
    while (!isParentViable(heading, parentCandidate) ) {
      parentCandidate = parentStack.pop();
    }

    // If the parent exists, assign its subheadings
    if (parentCandidate !== undefined) {
      parentCandidate.subheadings.push(heading);
      parentStack.push(parentCandidate);
      parentStack.push(heading);
    }
    else {
      parentStack.push(heading);
      contents.push(heading);
    }
  });

  return contents;
};
