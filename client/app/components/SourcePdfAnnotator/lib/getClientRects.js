// @flow

const sort = rects =>
    rects.sort((A, B) => {
        const top = A.top - B.top;

        if (top === 0) {
            return A.left - B.left;
        }

        return top;
    });

const overlaps = (A, B) => A.left <= B.left && B.left <= A.left + A.width;

const sameLine = (A, B, yMargin = 5) =>
    Math.abs(A.top - B.top) < yMargin && Math.abs(A.height - B.height) < yMargin;

const inside = (A, B) =>
    A.top > B.top &&
        A.left > B.left &&
        A.top + A.height < B.top + B.height &&
        A.left + A.width < B.left + B.width;

const nextTo = (A, B, xMargin = 10) => {
    const Aright = A.left + A.width;
    const Bright = B.left + B.width;

    return A.left <= B.left && Aright <= Bright && B.left - Aright <= xMargin;
};

const extendWidth = (A, B) => {
    // extend width of A to cover B
    A.width = Math.max(B.width - A.left + B.left, A.width);
};

const optimizeClientRects = (clientRects: Array<T_LTWH>): Array<T_LTWH> => {
    const rects = sort(clientRects);

    const toRemove = new Set();

    const firstPass = rects.filter(rect => {
        return rects.every(otherRect => {
            return !inside(rect, otherRect);
        });
    });

    let passCount = 0;

    while (passCount <= 2) {
        firstPass.forEach(A => {
            firstPass.forEach(B => {
                if (A === B || toRemove.has(A) || toRemove.has(B)) {
                    return;
                }

                if (!sameLine(A, B)) {
                    return;
                }

                if (overlaps(A, B)) {
                    extendWidth(A, B);
                    A.height = Math.max(A.height, B.height);

                    toRemove.add(B);
                }

                if (nextTo(A, B)) {
                    extendWidth(A, B);

                    toRemove.add(B);
                }
            });
        });
        passCount += 1;
    }

    return firstPass.filter(rect => !toRemove.has(rect));
};

const getClientRects = (
    range: Range,
    containerEl: HTMLElement,
    shouldOptimize: boolean = true
): Array<T_LTWH> => {
    let clientRects = Array.from(range.getClientRects());

    const offset = containerEl.getBoundingClientRect();

    const rects = clientRects.map(rect => {
        return {
            top: rect.top + containerEl.scrollTop - offset.top,
            left: rect.left + containerEl.scrollLeft - offset.left,
            width: rect.width,
            height: rect.height
        };
    });

    return shouldOptimize ? optimizeClientRects(rects) : rects;
};

export default getClientRects;
