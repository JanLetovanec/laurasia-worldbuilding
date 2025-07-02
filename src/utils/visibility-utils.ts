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

export const test = () => {
  console.log("Whoah");
  const visibleSet = new Set<Element>();
  const observedElements = document
    .querySelector<HTMLElement>(".content")
    ?.querySelectorAll("*");

  const callback = (entries: IntersectionObserverEntry[]) => {
    // Update the visible set
    entries.filter(entry => !entry.isIntersecting)
      .forEach(entry => visibleSet.delete(entry.target));

    entries.filter(entry => entry.isIntersecting)
      .forEach(entry => visibleSet.add(entry.target));

    // Get the top-most element
    const topVisibleElement = getTopMostElement(visibleSet);
    const relevantHeading = getFirstPreviousHeading(topVisibleElement);
    relevantHeading?.classList.add("hek");

  }

  const observer = new IntersectionObserver(callback);
  observedElements?.forEach(elem => observer.observe(elem));
};

