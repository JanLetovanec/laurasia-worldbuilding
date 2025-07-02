import _ from 'lodash';


const getTopMostElement = (elements: Set<Element>) => {
  return _.minBy([...elements],
    (element: Element) => element.getBoundingClientRect().top)
    ?? null;
}

const getFirstPreviousHeading = (element: Element | null) => {
  const headings = ["H1", "H2", "H3", "H4", "H5"];
  while (element != null && !headings.includes(element.tagName)) {
    element = element.previousElementSibling;
  }

  return element;
}

const updateClasses = (tocLinks: Element[], oldElement: Element | null, newId: string, classToAdd: string): Element | null => {
  oldElement?.classList.remove(classToAdd);

  const hrefString = "#" + newId;
  const relevantElement = tocLinks.find(elem => elem.getAttribute("href") === hrefString);
  relevantElement?.classList.add(classToAdd);
  return relevantElement ?? null;
}

export const test = () => {
  const visibleSet = new Set<Element>();
  const observedElements = document.querySelectorAll<HTMLElement>(".content *");

  const tocLinks = [...document.querySelectorAll(".toc li a")];
  let currentHeader: Element | null = null;

  const callback = (entries: IntersectionObserverEntry[]) => {
    // Update the visible set
    entries.filter(entry => !entry.isIntersecting)
      .forEach(entry => visibleSet.delete(entry.target));

    entries.filter(entry => entry.isIntersecting)
      .forEach(entry => visibleSet.add(entry.target));

    // Get the top-most element
    const topVisibleElement = getTopMostElement(visibleSet);
    const relevantHeading = getFirstPreviousHeading(topVisibleElement);
    if (("#" + relevantHeading?.id) !== currentHeader?.getAttribute("href")) {
      currentHeader = updateClasses(tocLinks, currentHeader, relevantHeading?.id ?? "", "active-header")
    }

  }

  const observer = new IntersectionObserver(callback);
  observedElements?.forEach(elem => observer.observe(elem));
};

