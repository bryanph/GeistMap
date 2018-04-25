export const findOrCreateContainerLayer = (
    container: HTMLElement,
    className: string
) => {
    let layer = container.querySelector(`.${className}`);

    if (!layer) {
        layer = document.createElement("div");
        layer.className = className;
        container.appendChild(layer);
    }

    return layer;
};
