type SelectTagHandler = (tag: string) => void;

export function delegateTagClicks(node: HTMLElement, onSelectTag: SelectTagHandler) {
  let currentHandler = onSelectTag;

  const handleClick = (event: MouseEvent) => {
    const target = event.target instanceof HTMLElement
      ? event.target.closest<HTMLElement>('.tag-link')
      : null;

    if (!target) {
      return;
    }

    const tag = target.dataset.tag;

    if (!tag) {
      return;
    }

    currentHandler(tag);
  };

  node.addEventListener('click', handleClick);

  return {
    update(nextHandler: SelectTagHandler) {
      currentHandler = nextHandler;
    },
    destroy() {
      node.removeEventListener('click', handleClick);
    }
  };
}

export function trackPointerPosition(node: HTMLElement) {
  const handleMouseMove = (event: MouseEvent) => {
    const rect = node.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    node.style.setProperty('--x', `${ x }px`);
    node.style.setProperty('--y', `${ y }px`);
  };

  node.addEventListener('mousemove', handleMouseMove);

  return {
    destroy() {
      node.removeEventListener('mousemove', handleMouseMove);
    }
  };
}
