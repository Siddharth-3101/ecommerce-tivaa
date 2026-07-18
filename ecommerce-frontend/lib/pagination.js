/**
 * Generates an array representing the pagination layout with ellipses.
 * Example outputs:
 * getPaginationRange(1, 23) => [1, 2, 3, 4, 5, "...", 23]
 * getPaginationRange(10, 23) => [1, "...", 9, 10, 11, "...", 23]
 * getPaginationRange(23, 23) => [1, "...", 19, 20, 21, 22, 23]
 * 
 * @param {number} currentPage - The current active page
 * @param {number} totalPages - The total number of pages
 * @param {number} siblingCount - Number of page buttons to show on either side of the current page
 * @returns {(number|string)[]} - Array containing page numbers and '...' strings
 */
export function getPaginationRange(currentPage, totalPages, siblingCount = 1) {
    const totalPageNumbers = siblingCount * 2 + 5; // siblingCount*2 + current + first + last + 2*ellipses = 7

    // Case 1: If the number of pages is less than the page numbers we want to show
    if (totalPages <= totalPageNumbers - 2) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    // Case 2: No left dots, but right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
        let leftItemCount = 3 + 2 * siblingCount;
        let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
        return [...leftRange, '...', totalPages];
    }

    // Case 3: No right dots, but left dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
        let rightItemCount = 3 + 2 * siblingCount;
        let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
        return [1, '...', ...rightRange];
    }

    // Case 4: Both left and right dots
    if (shouldShowLeftDots && shouldShowRightDots) {
        let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
        return [1, '...', ...middleRange, '...', totalPages];
    }

    return Array.from({ length: totalPages }, (_, i) => i + 1);
}
