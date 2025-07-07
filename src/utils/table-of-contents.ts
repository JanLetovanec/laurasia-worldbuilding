import type { MarkdownHeading } from "astro";

export interface MarkdownHeadingWithSubheadings extends MarkdownHeading {
  subheadings: MarkdownHeadingWithSubheadings[];
}

export const buildTableOfContents = (headings: MarkdownHeading[]) => {
  const contents: MarkdownHeadingWithSubheadings[] = [];

  const topLevel = Math.min(...headings.map((heading) => heading.depth));

  const parentHeadings = new Map<number, MarkdownHeadingWithSubheadings>();

  headings.forEach((h) => {
    const heading = { ...h, subheadings: [] };

    parentHeadings.set(heading.depth, heading);

    if (heading.depth === topLevel) {
      contents.push(heading);
    } else {
      parentHeadings.get(heading.depth - 1)!.subheadings.push(heading);
    }
  });

  return contents;
};
